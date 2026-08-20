from fastapi import APIRouter, Body
from typing import Dict, Any, Optional

from app.simulation.simulator import simulator

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

@router.post("/start", response_model=Dict[str, Any])
async def start_sim(
    scenario_id: str = Body("config_failure", embed=True),
    speed: float = Body(1.0, embed=True)
):
    return await simulator.start_simulation(scenario_id, speed)

@router.post("/stop", response_model=Dict[str, Any])
async def stop_sim():
    return simulator.stop_simulation()

@router.post("/reset", response_model=Dict[str, Any])
async def reset_sim():
    return await simulator.reset_simulation()

@router.get("/status", response_model=Dict[str, Any])
async def get_sim_status():
    return {
        "is_running": simulator.is_running,
        "current_scenario": simulator.current_scenario,
        "speed_multiplier": simulator.speed_multiplier
    }
