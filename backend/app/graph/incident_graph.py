from typing import Dict, Any, List
import networkx as nx
from app.analytics.correlation import correlation_engine

def generate_react_flow_graph(incident_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a high-fidelity React Flow compatible DAG structure with positions,
    node styling tokens, correlation badges, and propagation vectors.
    """
    events = incident_data.get("events", [])
    if not events:
        return {"nodes": [], "edges": []}
    
    # Sort events by timestamp
    sorted_events = sorted(events, key=lambda x: str(x.get("timestamp", "")))
    
    nodes = []
    edges = []
    
    origin_comp = incident_data.get("origin_component")
    
    # Hierarchical column/row positioning for clean visual layout
    # Layout strategy: horizontal timeline flow with vertical branching for parallel impacts
    component_layers: Dict[str, int] = {}
    current_x = 50
    x_gap = 260
    
    for idx, ev in enumerate(sorted_events):
        comp = ev.get("network_component", "UNKNOWN")
        is_root = (idx == 0) or (comp == origin_comp and ev.get("event_type") in ["CONFIG_CHANGE", "ROUTER_FAIL", "TRAFFIC_SURGE"])
        
        # Determine Y level based on component category
        y_pos = 180
        if "CELL" in comp:
            y_pos = 120 + (idx % 3) * 80
        elif "ROUTER" in comp:
            y_pos = 280 + (idx % 2) * 60
        elif "CORE" in comp or "UPF" in comp:
            y_pos = 420
        elif ev.get("event_type") in ["CALL_DROP_SURGE", "USER_COMPLAINT"]:
            y_pos = 520
            
        x_pos = current_x + (idx * x_gap)
        
        node_id = f"node-{ev['id']}"
        nodes.append({
            "id": node_id,
            "type": "forensicEventNode",
            "position": {"x": x_pos, "y": y_pos},
            "data": {
                "eventId": ev["id"],
                "eventType": ev.get("event_type"),
                "severity": ev.get("severity", "MEDIUM"),
                "timestamp": str(ev.get("timestamp", "")).split(".")[0],
                "component": comp,
                "description": ev.get("description", ""),
                "metricName": ev.get("metric_name"),
                "metricValue": ev.get("metric_value"),
                "metricUnit": ev.get("metric_unit"),
                "isRootCauseCandidate": is_root,
                "sequenceOrder": idx + 1,
                "source": ev.get("source", "TELECOM_BUS")
            }
        })
        
        # Link sequential and correlated events
        if idx > 0:
            prev_ev = sorted_events[idx - 1]
            score, rel = correlation_engine.compute_pairwise_correlation(prev_ev, ev)
            
            edge_id = f"edge-{prev_ev['id']}-{ev['id']}"
            edges.append({
                "id": edge_id,
                "source": f"node-{prev_ev['id']}",
                "target": node_id,
                "type": "forensicEdge",
                "animated": True,
                "data": {
                    "correlationScore": score,
                    "relationshipType": rel,
                    "label": f"{rel} ({int(score * 100)}%)",
                    "scorePercent": int(score * 100)
                }
            })
            
        # If there is a direct predecessor with same component earlier in the chain
        if idx >= 2:
            for past_idx in range(idx - 2, -1, -1):
                past_ev = sorted_events[past_idx]
                if past_ev.get("network_component") == comp:
                    score, rel = correlation_engine.compute_pairwise_correlation(past_ev, ev)
                    if score >= 0.70:
                        edges.append({
                            "id": f"edge-branch-{past_ev['id']}-{ev['id']}",
                            "source": f"node-{past_ev['id']}",
                            "target": node_id,
                            "type": "forensicEdge",
                            "animated": False,
                            "data": {
                                "correlationScore": score,
                                "relationshipType": "AFFECTS",
                                "label": f"Direct Component Flow ({int(score * 100)}%)",
                                "scorePercent": int(score * 100)
                            }
                        })
                        break
                        
    return {"nodes": nodes, "edges": edges}
