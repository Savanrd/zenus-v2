import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

from app.db.database import (
    insert_event, fetch_recent_events, fetch_all_incidents,
    fetch_incident_details, clear_simulation_data
)
from app.simulation.scenarios import get_scenario_events
from app.analytics.incident_detector import incident_detector
from app.ai.forensic_engine import forensic_engine
from app.graph.incident_graph import generate_react_flow_graph
from app.realtime.broadcaster import broadcaster

class NetworkSimulator:
    def __init__(self):
        self.is_running = False
        self.current_scenario = "config_failure"
        self.speed_multiplier = 1.0
        self.sim_task: Optional[asyncio.Task] = None
        self.step_index = 0

    async def start_simulation(self, scenario_id: str = "config_failure", speed: float = 1.0) -> Dict[str, Any]:
        """Starts a live simulation run"""
        if self.is_running and self.sim_task and not self.sim_task.done():
            self.stop_simulation()

        self.is_running = True
        self.current_scenario = scenario_id
        self.speed_multiplier = max(0.2, min(10.0, speed))
        self.step_index = 0
        
        self.sim_task = asyncio.create_task(self._run_simulation_loop(scenario_id))
        
        await broadcaster.broadcast("SIMULATION_STATUS", {
            "is_running": True,
            "scenario": scenario_id,
            "speed": self.speed_multiplier
        })
        
        return {
            "status": "started",
            "scenario": scenario_id,
            "speed": self.speed_multiplier
        }

    def stop_simulation(self) -> Dict[str, Any]:
        """Stops the active simulation"""
        self.is_running = False
        if self.sim_task and not self.sim_task.done():
            self.sim_task.cancel()
            
        asyncio.create_task(broadcaster.broadcast("SIMULATION_STATUS", {
            "is_running": False,
            "scenario": self.current_scenario,
            "speed": self.speed_multiplier
        }))
        
        return {"status": "stopped"}

    async def reset_simulation(self) -> Dict[str, Any]:
        """Stops simulation and cleans up simulation event/incident state"""
        self.stop_simulation()
        await clear_simulation_data()
        
        await broadcaster.broadcast("SIMULATION_RESET", {"status": "reset"})
        await broadcaster.broadcast("DASHBOARD_METRICS_UPDATED", {
            "active_incidents": 0,
            "critical_incidents": 0,
            "live_events": 0,
            "investigations": 0,
            "components_affected": 0,
            "avg_resolution_time": "0m"
        })
        
        return {"status": "reset"}

    async def _run_simulation_loop(self, scenario_id: str):
        """Asynchronously plays scenario events into the database and triggers forensic processing"""
        try:
            base_time = datetime.utcnow()
            events = get_scenario_events(scenario_id, base_time)
            print(f"[Simulator] Running scenario '{scenario_id}' with {len(events)} events (Speed: {self.speed_multiplier}x)")

            base_delay = 2.5 / self.speed_multiplier

            for idx, event in enumerate(events):
                if not self.is_running:
                    break

                # Adjust timestamp to current simulation clock
                event["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                
                # 1. Store event in real-time PostgreSQL / SQLite database
                await insert_event(event)
                print(f"[Simulator] Ingested event {idx+1}/{len(events)}: {event['description']} ({event['network_component']})")
                
                # 2. Broadcast raw event insertion to all clients
                await broadcaster.broadcast("EVENT_INSERTED", event)

                # 3. Trigger correlation and incident detection
                matched_incident = await incident_detector.evaluate_new_event(event)
                
                if matched_incident:
                    # 4. Fetch full incident details including all joined events
                    full_inc = await fetch_incident_details(matched_incident["id"])
                    
                    if full_inc:
                        # 5. Run AI Forensic Investigation
                        investigation = await forensic_engine.analyze_incident(full_inc)
                        
                        # 6. Generate React Flow Graph
                        graph_data = generate_react_flow_graph(full_inc)
                        
                        # 7. Broadcast updated incident, investigation, and graph
                        await broadcaster.broadcast("INCIDENT_UPDATED", {
                            "incident": full_inc,
                            "investigation": investigation,
                            "graph": graph_data
                        })

                # Sleep until next event in timeline
                await asyncio.sleep(base_delay)

            print(f"[Simulator] Scenario '{scenario_id}' simulation complete.")
            self.is_running = False
            await broadcaster.broadcast("SIMULATION_STATUS", {
                "is_running": False,
                "scenario": scenario_id,
                "completed": True
            })

        except asyncio.CancelledError:
            print("[Simulator] Simulation task cancelled.")
        except Exception as e:
            print(f"[Simulator] Simulation error: {e}")
            self.is_running = False

simulator = NetworkSimulator()
