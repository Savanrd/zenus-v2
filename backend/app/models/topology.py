from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid

class NetworkSite(BaseModel):
    id: str
    site_name: str
    region: str
    latitude: float
    longitude: float
    status: str = "HEALTHY" # HEALTHY, DEGRADED, CRITICAL, OFFLINE
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NetworkCell(BaseModel):
    id: str
    site_id: str
    cell_name: str
    technology: str = "5G NR"
    frequency_band: str = "n78 (3.5GHz)"
    azimuth: int = 0
    status: str = "HEALTHY"
    latitude: float
    longitude: float
    neighbor_cell_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NetworkNode(BaseModel):
    id: str
    site_id: Optional[str] = None
    node_name: str
    node_type: str # EDGE_ROUTER, CORE_SWITCH, UPF_GATEWAY, AMF_CONTROLLER
    ip_address: str
    status: str = "HEALTHY"
    connected_node_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TopologyLink(BaseModel):
    id: str
    source: str
    target: str
    link_type: str # RADIO_NEIGHBOR, FIBER_BACKHAUL, CORE_TRUNK
    bandwidth_gbps: float = 10.0
    status: str = "HEALTHY"

class NetworkTopologyResponse(BaseModel):
    sites: List[NetworkSite]
    cells: List[NetworkCell]
    nodes: List[NetworkNode]
    links: List[TopologyLink]
    active_alarms_by_component: dict = Field(default_factory=dict)
