from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from auth import get_current_user
from datetime import datetime, timezone
from urllib.parse import quote

router = APIRouter()

_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.post("/notifications/send-whatsapp")
async def send_whatsapp(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Generate WhatsApp URL for sending notification"""
    # Get notification
    notification = await db.notifications.find_one(
        {"order_id": order_id, "type": "new_order"},
        {"_id": 0},
        sort=[("sent_at", -1)]
    )
    
    if not notification:
        return {"success": False, "error": "Notification not found"}
    
    # Get settings for owner phone
    settings = await db.settings.find_one({}, {"_id": 0})
    owner_phone = settings.get("owner_phone", "355691234567") if settings else "355691234567"
    
    # Clean phone number
    phone = owner_phone.replace("+", "").replace(" ", "").replace("-", "")
    
    # Create WhatsApp URL
    message = notification["message"]
    encoded_message = quote(message)
    whatsapp_url = f"https://wa.me/{phone}?text={encoded_message}"
    
    return {
        "success": True,
        "whatsapp_url": whatsapp_url,
        "phone": phone
    }


@router.get("/notifications/latest/{order_id}")
async def get_latest_notification(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get latest notification for an order"""
    notification = await db.notifications.find_one(
        {"order_id": order_id},
        {"_id": 0},
        sort=[("sent_at", -1)]
    )
    
    if not notification:
        return {"success": False, "error": "No notification found"}
    
    # Get settings for owner phone
    settings = await db.settings.find_one({}, {"_id": 0})
    owner_phone = settings.get("owner_phone", "355691234567") if settings else "355691234567"
    
    # Clean phone number
    phone = owner_phone.replace("+", "").replace(" ", "").replace("-", "")
    
    # Create WhatsApp URL
    message = notification["message"]
    encoded_message = quote(message)
    whatsapp_url = f"https://wa.me/{phone}?text={encoded_message}"
    
    return {
        "success": True,
        "notification": notification,
        "whatsapp_url": whatsapp_url,
        "phone": phone
    }
