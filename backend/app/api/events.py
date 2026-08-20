from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.models.events import NetworkEvent, NetworkEventCreate
from app.db.database import insert_event, fetch_recent_events, fetch_incident_details
from app.analytics.incident_detector import incident_detector
from app.ai.forensic_engine import forensic_engine
from app.graph.incident_graph import generate_react_flow_graph
from app.realtime.broadcaster import broadcaster

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_events(
    limit: int = Query(100, ge=1, le=500),
    severity: Optional[str] = None,
    component: Optional[str] = None
):
    events = await fetch_recent_events(limit=limit)
    if severity:
        events = [e for e in events if e.get("severity") == severity]
    if component:
        events = [e for e in events if component.lower() in str(e.get("network_component", "")).lower()]
    return events

@router.post("", response_model=Dict[str, Any])
async def ingest_event(event_in: NetworkEventCreate):
    event_dict = event_in.model_dump()
    event_dict["id"] = str(uuid.uuid4())
    if not event_dict.get("timestamp"):
        event_dict["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    else:
        if isinstance(event_dict["timestamp"], datetime):
            event_dict["timestamp"] = event_dict["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            
    # 1. Insert to real-time database
    await insert_event(event_dict)
    
    # 2. Broadcast insertion
    await broadcaster.broadcast("EVENT_INSERTED", event_dict)
    
    # 3. Correlate with incidents
    matched_inc = await incident_detector.evaluate_new_event(event_dict)
    if matched_inc:
        full_inc = await fetch_incident_details(matched_inc["id"])
        if full_inc:
            inv = await forensic_engine.analyze_incident(full_inc)
            graph_data = generate_react_flow_graph(full_inc)
            await broadcaster.broadcast("INCIDENT_UPDATED", {
                "incident": full_inc,
                "investigation": inv,
                "graph": graph_data
            })
            
    return {"status": "ingested", "event_id": event_dict["id"], "correlated_incident": matched_inc.get("id") if matched_inc else None}
