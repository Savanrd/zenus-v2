import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.db.database import init_db, fetch_all_incidents, fetch_recent_events
from app.realtime.broadcaster import broadcaster
from app.api.events import router as events_router
from app.api.incidents import router as incidents_router
from app.api.topology import router as topology_router
from app.api.ai import router as ai_router
from app.api.simulation import router as simulation_router
from app.api.reports import router as reports_router
from app.api.data import router as data_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seeds
    print("[Main] Initializing database...")
    await init_db()
    print("[Main] Database ready. Network Investigator backend online.")
    yield
    # Shutdown
    print("[Main] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Telecom Incident Investigation & Forensic Reconstruction API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(events_router, prefix=settings.API_PREFIX)
app.include_router(incidents_router, prefix=settings.API_PREFIX)
app.include_router(topology_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(data_router, prefix=settings.API_PREFIX)

# WebSocket Endpoint for Live Real-Time Events & Database Synchronization
@app.websocket("/ws/realtime")
async def realtime_websocket_endpoint(websocket: WebSocket):
    await broadcaster.connect(websocket)
    try:
        while True:
            # Keepalive / handle client pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        broadcaster.disconnect(websocket)
    except Exception as e:
        broadcaster.disconnect(websocket)

# Metrics / Health Endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "Network Investigator Backend",
        "version": settings.VERSION,
        "database": "CONNECTED",
        "active_ws_clients": len(broadcaster.active_connections)
    }

@app.get("/api/stats")
async def get_system_stats():
    incidents = await fetch_all_incidents()
    events = await fetch_recent_events(limit=500)
    
    active_incidents = [i for i in incidents if i.get("status") in ["INVESTIGATING", "CONFIRMED"]]
    critical_incidents = [i for i in incidents if i.get("severity") == "CRITICAL"]
    affected_components = list(set([e.get("network_component") for e in events if e.get("network_component")]))
    
    return {
        "active_incidents": len(active_incidents) if active_incidents else (len(incidents) if incidents else 0),
        "critical_incidents": len(critical_incidents),
        "live_events": len(events),
        "investigations": len(incidents),
        "components_affected": len(affected_components),
        "avg_resolution_time": "18m"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
