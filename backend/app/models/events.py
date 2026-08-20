from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

from app.models.enums import Severity, EventType

class NetworkEventBase(BaseModel):
    event_type: EventType
    severity: Severity = Severity.MEDIUM
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    site_id: Optional[str] = None
    cell_id: Optional[str] = None
    network_component: str
    description: str
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    metric_unit: Optional[str] = None
    source: str = "TELECOM_TELEMETRY_BUS"
    metadata: Optional[Dict[str, Any]] = None

class NetworkEventCreate(NetworkEventBase):
    pass

class NetworkEvent(NetworkEventBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class EventFilterParams(BaseModel):
    severity: Optional[Severity] = None
    event_type: Optional[EventType] = None
    network_component: Optional[str] = None
    limit: int = 100
    offset: int = 0
