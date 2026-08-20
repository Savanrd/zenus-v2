import pytest
import asyncio
from datetime import datetime, timedelta

from app.analytics.correlation import correlation_engine
from app.simulation.scenarios import get_scenario_events
from app.graph.incident_graph import generate_react_flow_graph

def test_correlation_calculation():
    t1 = datetime.utcnow()
    t2 = t1 + timedelta(seconds=5)
    
    # Event 1: Config change on CELL-A17
    e1 = {
        "id": "ev-1",
        "event_type": "CONFIG_CHANGE",
        "severity": "INFO",
        "timestamp": t1,
        "network_component": "CELL-A17",
        "site_id": "SITE-METRO-01"
    }
    
    # Event 2: CPU spike on CELL-A17
    e2 = {
        "id": "ev-2",
        "event_type": "CPU_SPIKE",
        "severity": "HIGH",
        "timestamp": t2,
        "network_component": "CELL-A17",
        "site_id": "SITE-METRO-01"
    }
    
    score, rel = correlation_engine.compute_pairwise_correlation(e1, e2)
    assert score >= 0.70
    assert rel in ["TRIGGER", "AFFECTS", "CORRELATED"]

def test_scenario_events_generation():
    events = get_scenario_events("config_failure")
    assert len(events) >= 5
    assert events[0]["event_type"] == "CONFIG_CHANGE"
    assert events[0]["network_component"] == "CELL-A17"
    
    router_events = get_scenario_events("router_failure")
    assert len(router_events) >= 4
    assert router_events[0]["event_type"] == "ROUTER_FAIL"

def test_react_flow_graph_generator():
    mock_incident = {
        "id": "INC-TEST-01",
        "origin_component": "CELL-A17",
        "events": [
            {
                "id": "ev-1",
                "event_type": "CONFIG_CHANGE",
                "severity": "INFO",
                "timestamp": "2026-08-20 10:31:04",
                "network_component": "CELL-A17",
                "description": "Config change pushed"
            },
            {
                "id": "ev-2",
                "event_type": "CPU_SPIKE",
                "severity": "HIGH",
                "timestamp": "2026-08-20 10:31:09",
                "network_component": "CELL-A17",
                "description": "CPU spike detected"
            }
        ]
    }
    
    graph = generate_react_flow_graph(mock_incident)
    assert len(graph["nodes"]) == 2
    assert len(graph["edges"]) == 1
    assert graph["nodes"][0]["data"]["isRootCauseCandidate"] is True
