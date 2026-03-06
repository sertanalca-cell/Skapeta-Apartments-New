from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db

# Store active WebSocket connections
# Key: customer_id, Value: Set of WebSocket connections
active_connections: Dict[str, Set[WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, customer_id: str):
        await websocket.accept()
        if customer_id not in self.active_connections:
            self.active_connections[customer_id] = set()
        self.active_connections[customer_id].add(websocket)
        logger.info(f"Customer {customer_id} connected. Total connections: {len(self.active_connections[customer_id])}")

    def disconnect(self, websocket: WebSocket, customer_id: str):
        if customer_id in self.active_connections:
            self.active_connections[customer_id].discard(websocket)
            if not self.active_connections[customer_id]:
                del self.active_connections[customer_id]
        logger.info(f"Customer {customer_id} disconnected")

    async def send_personal_message(self, message: dict, customer_id: str):
        if customer_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[customer_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {customer_id}: {e}")
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.active_connections[customer_id].discard(conn)

    async def broadcast_to_customer(self, customer_id: str, order_data: dict):
        """Broadcast order update to all connections of a customer"""
        await self.send_personal_message({
            "type": "order_update",
            "data": order_data
        }, customer_id)

manager = ConnectionManager()


@router.websocket("/ws/orders/{customer_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    customer_id: str,
):
    await manager.connect(websocket, customer_id)
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to order updates"
        })
        
        # Keep connection alive and listen for messages
        while True:
            data = await websocket.receive_text()
            # Echo back for ping/pong
            await websocket.send_json({"type": "pong", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket, customer_id)
    except Exception as e:
        logger.error(f"WebSocket error for customer {customer_id}: {e}")
        manager.disconnect(websocket, customer_id)


async def notify_order_update(customer_id: str, order_data: dict):
    """Helper function to notify customers about order updates"""
    await manager.broadcast_to_customer(customer_id, order_data)
