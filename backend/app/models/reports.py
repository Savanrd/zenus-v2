from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.models.incidents import Incident, HypothesisModel, EvidenceModel, PropagationStep

class InvestigationReport(BaseModel):
    report_id: str
    incident_number: str
    title: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_by: str = "AI Network Forensic Investigator"
    executive_summary: str
    severity: str
    status: str
    duration_str: str
    start_time: str
    end_time: Optional[str] = None
    region: str
    affected_components: List[str]
    root_cause: str
    confidence: float
    confidence_tier: str
    reasoning: str
    supporting_evidence: List[EvidenceModel]
    contradicting_evidence: List[EvidenceModel]
    hypotheses: List[HypothesisModel]
    propagation_path: List[PropagationStep]
    timeline_events: List[Dict[str, Any]]
    recommended_actions: List[str]
    historical_matches: List[Dict[str, Any]]
