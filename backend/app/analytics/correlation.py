import math
from datetime import datetime
from typing import Dict, Any, List, Tuple
import networkx as nx

# Causal rule matrix with domain priors (from_event -> to_event : base_causal_prob)
CAUSAL_TRANSITION_MATRIX = {
    ("CONFIG_CHANGE", "CPU_SPIKE"): 0.94,
    ("CONFIG_CHANGE", "PACKET_LOSS"): 0.88,
    ("CONFIG_CHANGE", "SIGNAL_DEGRADATION"): 0.92,
    ("CPU_SPIKE", "PACKET_LOSS"): 0.91,
    ("CPU_SPIKE", "LATENCY_INCREASE"): 0.89,
    ("PACKET_LOSS", "HANDOVER_FAILURE"): 0.88,
    ("PACKET_LOSS", "CALL_DROP_SURGE"): 0.86,
    ("HANDOVER_FAILURE", "CALL_DROP_SURGE"): 0.95,
    ("CALL_DROP_SURGE", "USER_COMPLAINT"): 0.96,
    ("TRAFFIC_SURGE", "CPU_SPIKE"): 0.90,
    ("TRAFFIC_SURGE", "THROUGHPUT_SATURATION"): 0.97,
    ("THROUGHPUT_SATURATION", "LATENCY_INCREASE"): 0.93,
    ("LATENCY_INCREASE", "BUFFER_OVERFLOW"): 0.89,
    ("BUFFER_OVERFLOW", "PACKET_LOSS"): 0.92,
    ("ROUTER_FAIL", "BGP_FLAP"): 0.96,
    ("BGP_FLAP", "LATENCY_INCREASE"): 0.91,
    ("ROUTER_FAIL", "PACKET_LOSS"): 0.94,
    ("ROUTER_FAIL", "HANDOVER_FAILURE"): 0.87,
    ("AUTH_FAIL", "USER_COMPLAINT"): 0.85,
    ("SIGNAL_DEGRADATION", "HANDOVER_FAILURE"): 0.90,
    ("SIGNAL_DEGRADATION", "CALL_DROP_SURGE"): 0.89
}

class EventCorrelationEngine:
    def __init__(self):
        self.topology_graph = nx.Graph()
        self._build_default_topology()

    def _build_default_topology(self):
        # Default node graph for hop distance calculation
        edges = [
            ("CELL-A17", "ROUTER-A"),
            ("CELL-B12", "ROUTER-A"),
            ("CELL-C04", "ROUTER-A"),
            ("CELL-D09", "ROUTER-NORTH-01"),
            ("CELL-E21", "ROUTER-NORTH-01"),
            ("CELL-F08", "ROUTER-WEST-01"),
            ("CELL-G15", "ROUTER-WEST-01"),
            ("ROUTER-A", "CORE-NODE-01"),
            ("ROUTER-NORTH-01", "CORE-NODE-01"),
            ("ROUTER-WEST-01", "CORE-NODE-01"),
            ("CORE-NODE-01", "UPF-GATEWAY-01"),
            # Radio neighbor adjacencies
            ("CELL-A17", "CELL-B12"),
            ("CELL-B12", "CELL-C04"),
            ("CELL-A17", "CELL-D09"),
            ("CELL-D09", "CELL-E21"),
            ("CELL-F08", "CELL-G15"),
            ("CELL-F08", "CELL-C04")
        ]
        self.topology_graph.add_edges_from(edges)

    def calculate_temporal_score(self, t1: datetime, t2: datetime, half_life_seconds: float = 120.0) -> float:
        """Computes exponential temporal decay score based on delta seconds"""
        dt = abs((t2 - t1).total_seconds())
        # e^(-ln(2) * dt / half_life)
        decay = math.exp(-0.693 * (dt / half_life_seconds))
        return max(0.05, min(1.0, decay))

    def calculate_spatial_score(self, comp1: str, comp2: str, site1: str = None, site2: str = None) -> float:
        """Computes spatial/topological distance score"""
        if comp1 == comp2:
            return 1.0
        
        # Check network graph hop distance
        if self.topology_graph.has_node(comp1) and self.topology_graph.has_node(comp2):
            try:
                shortest_path_len = nx.shortest_path_length(self.topology_graph, comp1, comp2)
                if shortest_path_len == 1:
                    return 0.88 # Directly adjacent
                elif shortest_path_len == 2:
                    return 0.72 # 2 hops
                elif shortest_path_len == 3:
                    return 0.55 # 3 hops
                else:
                    return 0.35
            except nx.NetworkXNoPath:
                pass
        
        # Fallback to site matching
        if site1 and site2 and site1 == site2:
            return 0.75
            
        return 0.30

    def calculate_causal_score(self, type1: str, type2: str) -> float:
        """Looks up causal likelihood from domain transition matrix"""
        if (type1, type2) in CAUSAL_TRANSITION_MATRIX:
            return CAUSAL_TRANSITION_MATRIX[(type1, type2)]
        if type1 == type2:
            return 0.65 # Sibling repeated alerts
        return 0.40 # Baseline unmapped relation

    def calculate_severity_weight(self, sev1: str, sev2: str) -> float:
        weights = {"CRITICAL": 1.0, "HIGH": 0.85, "MEDIUM": 0.65, "LOW": 0.45, "INFO": 0.30}
        w1 = weights.get(sev1, 0.5)
        w2 = weights.get(sev2, 0.5)
        return (w1 + w2) / 2.0

    def compute_pairwise_correlation(self, e1: Dict[str, Any], e2: Dict[str, Any]) -> Tuple[float, str]:
        """
        Computes composite correlation score (0.0 to 1.0) and relationship type between 2 events.
        Formula:
        Composite = 0.30 * Temporal + 0.35 * Causal + 0.25 * Spatial + 0.10 * Severity
        """
        t1 = e1["timestamp"] if isinstance(e1["timestamp"], datetime) else datetime.fromisoformat(str(e1["timestamp"]).replace("Z", ""))
        t2 = e2["timestamp"] if isinstance(e2["timestamp"], datetime) else datetime.fromisoformat(str(e2["timestamp"]).replace("Z", ""))
        
        temporal_score = self.calculate_temporal_score(t1, t2)
        causal_score = self.calculate_causal_score(e1["event_type"], e2["event_type"])
        spatial_score = self.calculate_spatial_score(
            e1["network_component"], e2["network_component"],
            e1.get("site_id"), e2.get("site_id")
        )
        severity_weight = self.calculate_severity_weight(e1["severity"], e2["severity"])
        
        composite = (0.30 * temporal_score) + (0.35 * causal_score) + (0.25 * spatial_score) + (0.10 * severity_weight)
        composite = round(min(0.99, max(0.10, composite)), 3)
        
        # Determine relationship type
        if e1["event_type"] in ["CONFIG_CHANGE", "ROUTER_FAIL", "TRAFFIC_SURGE"] and t1 <= t2:
            rel_type = "TRIGGER"
        elif e1["network_component"] != e2["network_component"] and t1 <= t2:
            rel_type = "PROPAGATES_TO"
        elif e2["event_type"] in ["CALL_DROP_SURGE", "USER_COMPLAINT"]:
            rel_type = "IMPACT"
        elif e1["network_component"] == e2["network_component"]:
            rel_type = "AFFECTS"
        else:
            rel_type = "CORRELATED"
            
        return composite, rel_type

correlation_engine = EventCorrelationEngine()
