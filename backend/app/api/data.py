import json
import csv
import io
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any, List

from app.db.database import insert_event, fetch_incident_details
from app.analytics.incident_detector import incident_detector
from app.ai.forensic_engine import forensic_engine
from app.graph.incident_graph import generate_react_flow_graph
from app.realtime.broadcaster import broadcaster

router = APIRouter(prefix="/data", tags=["Data Ingestion & Sources"])

@router.get("/sources", response_model=List[Dict[str, Any]])
async def get_data_sources():
    return [
        {"id": "SRC-ALARM", "name": "Network Alarms (SNMP Traps / Netconf)", "status": "CONNECTED", "protocol": "SNMPv3 / gNMI", "events_per_sec": 42, "latency_ms": 12},
        {"id": "SRC-METRIC", "name": "Performance Telemetry (Prometheus / Influx)", "status": "CONNECTED", "protocol": "gRPC Streaming", "events_per_sec": 128, "latency_ms": 8},
        {"id": "SRC-TRAFFIC", "name": "Traffic & Flow Analytics (IPFIX / sFlow)", "status": "CONNECTED", "protocol": "IPFIX UDP", "events_per_sec": 310, "latency_ms": 15},
        {"id": "SRC-HANDOVER", "name": "RAN Handover & Mobility Logs (X2/Xn)", "status": "CONNECTED", "protocol": "Kafka Bus", "events_per_sec": 84, "latency_ms": 18},
        {"id": "SRC-SYSLOG", "name": "Core & Edge Syslogs (RFC 5424)", "status": "CONNECTED", "protocol": "Syslog TLS", "events_per_sec": 65, "latency_ms": 5},
        {"id": "SRC-CRM", "name": "User Complaints & CRM Gateway", "status": "CONNECTED", "protocol": "REST Webhook", "events_per_sec": 6, "latency_ms": 45},
        {"id": "SRC-HIST", "name": "Historical Incident Knowledge Base", "status": "CONNECTED", "protocol": "PostgreSQL Vector", "events_per_sec": 0, "latency_ms": 2}
    ]

@router.post("/upload")
async def upload_network_data(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content = await file.read()
    
    parsed_events = []
    
    try:
        if filename.endswith(".json"):
            json_data = json.loads(content.decode("utf-8"))
            if isinstance(json_data, list):
                parsed_events = json_data
            elif isinstance(json_data, dict) and "events" in json_data:
                parsed_events = json_data["events"]
            else:
                parsed_events = [json_data]
                
        elif filename.endswith(".csv"):
            text = content.decode("utf-8")
            reader = csv.DictReader(io.StringIO(text))
            for row in reader:
                parsed_events.append(row)
                
        else: # Syslog / line-based log file
            text = content.decode("utf-8")
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for l in lines:
                parsed_events.append({
                    "event_type": "SYSLOG_EVENT",
                    "severity": "HIGH" if any(w in l.upper() for w in ["ERR", "FAIL", "CRIT", "DROP"]) else "MEDIUM",
                    "network_component": "CELL-A17" if "A17" in l else "ROUTER-A" if "ROUTER" in l else "CORE-NODE-01",
                    "description": l,
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                })
                
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
        
    ingested_count = 0
    detected_incidents = []
    
    for ev in parsed_events:
        ev_id = ev.get("id") or str(uuid.uuid4())
        event_dict = {
            "id": ev_id,
            "event_type": ev.get("event_type", "ANOMALY_DETECTED"),
            "severity": ev.get("severity", "MEDIUM"),
            "timestamp": ev.get("timestamp") or datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "site_id": ev.get("site_id", "SITE-METRO-01"),
            "cell_id": ev.get("cell_id"),
            "network_component": ev.get("network_component", "CELL-A17"),
            "description": ev.get("description", "Ingested log telemetry event"),
            "metric_name": ev.get("metric_name"),
            "metric_value": float(ev["metric_value"]) if ev.get("metric_value") is not None else None,
            "metric_unit": ev.get("metric_unit"),
            "source": f"FILE_UPLOAD:{file.filename}",
            "metadata": ev.get("metadata")
        }
        
        await insert_event(event_dict)
        await broadcaster.broadcast("EVENT_INSERTED", event_dict)
        
        matched_inc = await incident_detector.evaluate_new_event(event_dict)
        if matched_inc and matched_inc["id"] not in detected_incidents:
            detected_incidents.append(matched_inc["id"])
            full_inc = await fetch_incident_details(matched_inc["id"])
            if full_inc:
                inv = await forensic_engine.analyze_incident(full_inc)
                graph_data = generate_react_flow_graph(full_inc)
                await broadcaster.broadcast("INCIDENT_UPDATED", {
                    "incident": full_inc,
                    "investigation": inv,
                    "graph": graph_data
                })
                
        ingested_count += 1
        
    return {
        "status": "success",
        "filename": file.filename,
        "events_ingested": ingested_count,
        "incidents_detected": len(detected_incidents),
        "incident_ids": detected_incidents
    }
