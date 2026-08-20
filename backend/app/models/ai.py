from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AIChatMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    citations: Optional[List[Dict[str, Any]]] = None

class AIChatRequest(BaseModel):
    incident_id: Optional[str] = None
    query: str
    history: List[AIChatMessage] = Field(default_factory=list)

class AIChatResponse(BaseModel):
    answer: str
    confidence: Optional[float] = None
    supporting_events: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)

class RootCauseAnalysisResult(BaseModel):
    incident_id: str
    root_cause: str
    origin_component: str
    confidence: float
    confidence_tier: str
    reasoning: str
    key_evidence: List[str]
    alternative_hypotheses: List[Dict[str, Any]]
    blast_radius: List[str]
    remediation_steps: List[str]
