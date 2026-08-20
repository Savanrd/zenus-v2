from fastapi import APIRouter, HTTPException, Path
from typing import List, Dict, Any, Optional

from app.db.database import fetch_all_incidents, fetch_incident_details
from app.ai.forensic_engine import forensic_engine
from app.graph.incident_graph import generate_react_flow_graph

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None
):
    incidents = await fetch_all_incidents()
    if severity:
        incidents = [i for i in incidents if i.get("severity") == severity]
    if status:
        incidents = [i for i in incidents if i.get("status") == status]
    if region:
        incidents = [i for i in incidents if region.lower() in str(i.get("region", "")).lower()]
    return incidents

@router.get("/{incident_id}", response_model=Dict[str, Any])
async def get_incident(incident_id: str = Path(...)):
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/{incident_id}/investigate", response_model=Dict[str, Any])
async def trigger_investigation(incident_id: str = Path(...)):
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    result = await forensic_engine.analyze_incident(inc)
    return result

@router.get("/{incident_id}/graph", response_model=Dict[str, Any])
async def get_incident_graph(incident_id: str = Path(...)):
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return generate_react_flow_graph(inc)

@router.get("/{incident_id}/timeline", response_model=List[Dict[str, Any]])
async def get_incident_timeline(incident_id: str = Path(...)):
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    events = inc.get("events", [])
    sorted_events = sorted(events, key=lambda x: str(x.get("timestamp", "")))
    return sorted_events

@router.get("/{incident_id}/evidence", response_model=List[Dict[str, Any]])
async def get_incident_evidence(incident_id: str = Path(...)):
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc.get("evidence", [])

@router.get("/{incident_id}/hypotheses", response_model=List[Dict[str, Any]])
async def get_incident_hypotheses(incident_id: str = Path(...)):
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc.get("hypotheses", [])
