from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import uuid

from app.models.enums import Severity, IncidentStatus, ConfidenceTier, RelationshipType, EvidenceType
from app.models.events import NetworkEvent

class IncidentEventRel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_id: str
    event_id: str
    relationship_type: RelationshipType = RelationshipType.CORRELATED
    correlation_score: float = 0.5
    sequence_order: int = 1
    causal_explanation: Optional[str] = None
    event: Optional[NetworkEvent] = None

class HypothesisModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_id: str
    title: str
    description: str
    confidence: float
    confidence_tier: ConfidenceTier
    supporting_evidence: List[str] = Field(default_factory=list)
    contradicting_evidence: List[str] = Field(default_factory=list)
    status: str = "PRIMARY_CANDIDATE" # PRIMARY_CANDIDATE, PLAUSIBLE_ALTERNATIVE, RULED_OUT
    reasoning: Optional[str] = None

class EvidenceModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_id: str
    event_id: Optional[str] = None
    evidence_type: EvidenceType
    description: str
    strength: str = "HIGH" # VERY_HIGH, HIGH, MEDIUM, LOW
    strength_score: float = 0.8
    direction: str = "SUPPORTING" # SUPPORTING, CONTRADICTING
    source_component: Optional[str] = None
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class PropagationStep(BaseModel):
    step_number: int
    component: str
    component_type: str # CELL, ROUTER, SWITCH, UPF, SERVICE
    event_type: str
    timestamp: str
    description: str
    impact_level: str
    correlation_score: float

class IncidentBase(BaseModel):
    incident_number: str
    title: str
    severity: Severity
    status: IncidentStatus = IncidentStatus.INVESTIGATING
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    region: str
    origin_component: Optional[str] = None
    root_cause: Optional[str] = None
    root_cause_confidence: float = 0.0
    confidence_tier: ConfidenceTier = ConfidenceTier.MODERATE
    summary: Optional[str] = None

class Incident(IncidentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    propagation_path: List[PropagationStep] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Nested lists
    events: List[NetworkEvent] = Field(default_factory=list)
    incident_events: List[IncidentEventRel] = Field(default_factory=list)
    hypotheses: List[HypothesisModel] = Field(default_factory=list)
    evidence: List[EvidenceModel] = Field(default_factory=list)

    class Config:
        from_attributes = True

class IncidentInvestigationResponse(BaseModel):
    incident: Incident
    root_cause: str
    confidence: float
    confidence_tier: ConfidenceTier
    reasoning: str
    supporting_evidence: List[EvidenceModel]
    contradicting_evidence: List[EvidenceModel]
    hypotheses: List[HypothesisModel]
    propagation_path: List[PropagationStep]
    recommended_actions: List[str]
    historical_matches: List[Dict[str, Any]] = Field(default_factory=list)
