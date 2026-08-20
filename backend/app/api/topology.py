from fastapi import APIRouter
from typing import Dict, Any
from app.db.database import fetch_network_topology, fetch_recent_events

router = APIRouter(prefix="/network", tags=["Network Topology"])

@router.get("/topology", response_model=Dict[str, Any])
async def get_topology():
    topology = await fetch_network_topology()
    recent_events = await fetch_recent_events(limit=50)
    
    # Calculate component health state based on recent alarms
    alarm_counts = {}
    for ev in recent_events:
        comp = ev.get("network_component")
        sev = ev.get("severity", "MEDIUM")
        if comp:
            if comp not in alarm_counts:
                alarm_counts[comp] = {"critical": 0, "high": 0, "medium": 0, "total": 0}
            alarm_counts[comp]["total"] += 1
            if sev == "CRITICAL":
                alarm_counts[comp]["critical"] += 1
            elif sev == "HIGH":
                alarm_counts[comp]["high"] += 1
            else:
                alarm_counts[comp]["medium"] += 1

    # Augment cells and nodes with live health status
    for c in topology.get("cells", []):
        comp_id = c["id"]
        if comp_id in alarm_counts:
            if alarm_counts[comp_id]["critical"] > 0:
                c["status"] = "CRITICAL"
            elif alarm_counts[comp_id]["high"] > 0:
                c["status"] = "DEGRADED"
            else:
                c["status"] = "WARNING"
                
    for n in topology.get("nodes", []):
        comp_id = n["id"]
        if comp_id in alarm_counts:
            if alarm_counts[comp_id]["critical"] > 0:
                n["status"] = "CRITICAL"
            elif alarm_counts[comp_id]["high"] > 0:
                n["status"] = "DEGRADED"
                
    topology["active_alarms_by_component"] = alarm_counts
    return topology
