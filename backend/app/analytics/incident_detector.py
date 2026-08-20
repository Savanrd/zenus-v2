import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import networkx as nx

from app.analytics.correlation import correlation_engine
from app.db.database import (
    fetch_recent_events, fetch_all_incidents, fetch_incident_details,
    save_or_update_incident
)

class IncidentDetector:
    def __init__(self):
        pass

    async def evaluate_new_event(self, event_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Evaluates an incoming event against active incidents and recent unassigned events.
        Attaches event to an existing incident or triggers a new incident cluster.
        """
        active_incidents = await fetch_all_incidents()
        investigating_incidents = [i for i in active_incidents if i["status"] in ["INVESTIGATING", "CONFIRMED"]]
        
        # 1. Check if event belongs to an existing active incident
        for inc_summary in investigating_incidents:
            inc_full = await fetch_incident_details(inc_summary["id"])
            if not inc_full or not inc_full.get("events"):
                continue
            
            # Check correlation against the incident's key events
            high_corr_count = 0
            best_score = 0.0
            best_rel = "CORRELATED"
            
            for past_ev in inc_full["events"][-10:]: # check against recent events of incident
                score, rel = correlation_engine.compute_pairwise_correlation(past_ev, event_dict)
                if score > best_score:
                    best_score = score
                    best_rel = rel
                if score >= 0.65:
                    high_corr_count += 1
            
            # If correlated with at least one event with score >= 0.70 or spatial/temporal overlap
            if best_score >= 0.70 or high_corr_count >= 1:
                print(f"[IncidentDetector] Attaching event {event_dict['id']} to incident {inc_full['incident_number']} (Score: {best_score:.2f})")
                
                # Append to incident_events
                inc_events = inc_full.get("incident_events", [])
                inc_events.append({
                    "id": str(uuid.uuid4()),
                    "incident_id": inc_full["id"],
                    "event_id": event_dict["id"],
                    "relationship_type": best_rel,
                    "correlation_score": best_score,
                    "sequence_order": len(inc_events) + 1,
                    "causal_explanation": f"Correlated with {best_score*100:.0f}% confidence ({best_rel})"
                })
                inc_full["incident_events"] = inc_events
                
                # Upgrade severity if critical
                if event_dict.get("severity") == "CRITICAL" and inc_full["severity"] != "CRITICAL":
                    inc_full["severity"] = "CRITICAL"
                    
                await save_or_update_incident(inc_full)
                return inc_full

        # 2. Check recent unassigned events to form a new incident cluster
        recent_events = await fetch_recent_events(limit=25)
        # Filter events in past 10 minutes
        cluster_candidates = [e for e in recent_events if e["id"] != event_dict["id"]]
        
        correlated_events = []
        for e in cluster_candidates:
            score, rel = correlation_engine.compute_pairwise_correlation(e, event_dict)
            if score >= 0.65:
                correlated_events.append((e, score, rel))
                
        # If we have at least 2 other correlated events (forming a cluster of 3+)
        if len(correlated_events) >= 2 or event_dict.get("severity") == "CRITICAL":
            print(f"[IncidentDetector] New incident cluster detected with {len(correlated_events) + 1} correlated events!")
            
            all_cluster_events = [e[0] for e in correlated_events] + [event_dict]
            # Sort by timestamp
            all_cluster_events.sort(key=lambda x: str(x["timestamp"]))
            
            first_event = all_cluster_events[0]
            inc_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
            inc_num = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
            
            # Find origin component (usually the first event or root trigger)
            origin_comp = first_event["network_component"]
            for ev in all_cluster_events:
                if ev["event_type"] in ["CONFIG_CHANGE", "ROUTER_FAIL", "TRAFFIC_SURGE"]:
                    origin_comp = ev["network_component"]
                    break
                    
            title = f"{first_event['event_type'].replace('_', ' ').title()} Cascade on {origin_comp}"
            
            new_incident = {
                "id": inc_id,
                "incident_number": inc_num,
                "title": title,
                "severity": "CRITICAL" if any(e.get("severity") == "CRITICAL" for e in all_cluster_events) else "HIGH",
                "status": "INVESTIGATING",
                "start_time": str(first_event["timestamp"]),
                "region": event_dict.get("site_id", "Metro Central"),
                "origin_component": origin_comp,
                "root_cause": f"Suspected anomaly originated on {origin_comp} ({first_event['event_type']})",
                "root_cause_confidence": 0.75,
                "confidence_tier": "HIGH",
                "summary": f"Incident originated with {first_event['event_type']} at {first_event['timestamp']} on {origin_comp}, cascading to {len(all_cluster_events)} network anomalies.",
                "propagation_path": [],
                "incident_events": [
                    {
                        "id": str(uuid.uuid4()),
                        "incident_id": inc_id,
                        "event_id": ev["id"],
                        "relationship_type": "TRIGGER" if idx == 0 else "PROPAGATION",
                        "correlation_score": 0.90 if idx == 0 else 0.80,
                        "sequence_order": idx + 1,
                        "causal_explanation": f"Step {idx+1}: {ev['description']}"
                    }
                    for idx, ev in enumerate(all_cluster_events)
                ],
                "hypotheses": [],
                "evidence": []
            }
            
            await save_or_update_incident(new_incident)
            return new_incident
            
        return None

incident_detector = IncidentDetector()
