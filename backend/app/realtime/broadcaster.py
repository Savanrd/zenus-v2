import asyncio
import json
from typing import Set, Dict, Any
from fastapi import WebSocket

class RealtimeBroadcaster:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"[Realtime] Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        print(f"[Realtime] Client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message_type: str, data: Any):
        """Broadcasts a JSON payload to all connected frontend clients"""
        if not self.active_connections:
            return

        payload = json.dumps({
            "type": message_type,
            "data": data
        }, default=str)

        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                print(f"[Realtime] Error broadcasting to client: {e}")
                disconnected.add(connection)

        for dead in disconnected:
            self.active_connections.discard(dead)

broadcaster = RealtimeBroadcaster()
