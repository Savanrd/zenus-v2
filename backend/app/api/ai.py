from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any

from app.models.ai import AIChatRequest, AIChatResponse
from app.ai.chat import ai_chat_service
from app.ai.forensic_engine import forensic_engine
from app.ai.sunny_rag import sunny_rag_service
from app.db.database import fetch_incident_details

router = APIRouter(prefix="/ai", tags=["AI Forensic Engine"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_investigator(request: AIChatRequest):
    return await ai_chat_service.chat(request)

@router.post("/sunny", response_model=Dict[str, Any])
async def chat_with_sunny(payload: Dict[str, Any] = Body(...)):
    query = payload.get("query", "")
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return sunny_rag_service.generate_sunny_response(query)

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_incident_ai(payload: Dict[str, Any]):
    incident_id = payload.get("incident_id")
    if not incident_id:
        raise HTTPException(status_code=400, detail="incident_id required")
    inc = await fetch_incident_details(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return await forensic_engine.analyze_incident(inc)
