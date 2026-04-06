from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from models import Order, OrderCreate, OrderUpdate
from auth import get_current_user
from utils.timezone import now_albania, get_today_range_albania, albania_to_utc
import os

router = APIRouter()

# Database dependency
_db = None
_websocket_manager = None

def set_db(db):
    global _db
    _db = db

def set_websocket_manager(manager):
    global _websocket_manager
    _websocket_manager = manager

def get_database():
    return _db

# Owner's WhatsApp number (from environment or settings)
OWNER_WHATSAPP = os.getenv("OWNER_WHATSAPP", "355691234567")  # Default Albanian number


@router.get("/orders", response_model=List[Order])
async def get_orders(
    status: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get all orders (admin only) - excludes closed orders"""
    query = {"closed_at": None}  # Get orders where closed_at is null
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders


@router.get("/orders/closed")
async def get_closed_orders(
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get recently closed orders (for Last Orders view)"""
    orders = await db.orders.find(
        {"closed_at": {"$ne": None}},  # Get orders where closed_at is not null
        {"_id": 0}
    ).sort("closed_at", -1).limit(limit).to_list(limit)
    return orders


@router.get("/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a single order (public for customer tracking)"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/orders", response_model=Order)
async def create_order(
    order: OrderCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new order (public endpoint for customers)"""
    # Calculate total price
    total_price = sum(item.price * item.quantity for item in order.items)
    
    # Get the next order number (sequential)
    last_order = await db.orders.find_one(
        {},
        {"_id": 0, "order_number": 1},
        sort=[("order_number", -1)]
    )
    next_order_number = (last_order["order_number"] + 1) if last_order and "order_number" in last_order else 1001
    
    new_order = Order(
        **order.dict(),
        total_price=total_price,
        status="pending",
        order_number=next_order_number,
        closed_at=None  # Explicitly set to None for admin query to work
    )
    
    await db.orders.insert_one(new_order.dict())
    
    # Broadcast to all connected admins via WebSocket
    try:
        from routes.websocket_routes import broadcast_to_admins
        await broadcast_to_admins({
            "type": "new_order",
            "order": new_order.dict()
        })
    except Exception as e:
        print(f"WebSocket broadcast failed: {e}")
    
    # Note: WhatsApp notification is handled on frontend automatically
    # when order is successfully placed
    
    return new_order


async def send_whatsapp_notification(order: dict):
    """Send order details to WhatsApp"""
    # Format order details for WhatsApp
    order_number = order.get("order_number", "N/A")
    customer_name = f"{order['first_name']} {order['last_name']}"
    phone = order.get("phone", "N/A")
    apartment = order.get("apartment_number", "N/A")
    notes = order.get("notes", "None")
    
    # Format items
    items_text = "\n".join([
        f"  • {item['quantity']}x {item['menu_item_name']} - €{item['price'] * item['quantity']:.2f}"
        for item in order['items']
    ])
    
    # Create message
    message = f"""🔔 *NEW ORDER RECEIVED*

📋 Order #*{order_number}*
👤 Customer: *{customer_name}*
📞 Phone: {phone}
🏠 Apartment: *{apartment}*

🍽️ *Order Items:*
{items_text}

💰 *Total: €{order['total_price']:.2f}*

📝 Notes: {notes}

⏰ Time: {order['created_at']}
"""
    
    # Store WhatsApp notification data
    whatsapp_data = {
        "order_id": order["id"],
        "order_number": order_number,
        "message": message,
        "phone_number": "355693227207",
        "created_at": datetime.now(timezone.utc),
        "type": "new_order"
    }
    
    # Log the WhatsApp notification (will be picked up by frontend)
    print(f"📱 WhatsApp notification prepared for order #{order_number}")
    print(f"Message: {message[:100]}...")  # Log first 100 chars
    
    # Note: This creates the data structure. The actual WhatsApp send
    # will be triggered from frontend using WhatsApp Web API
    # whatsapp_data is prepared for future use if needed
    return whatsapp_data


@router.put("/orders/{order_id}", response_model=Order)
async def update_order(
    order_id: str,
    order_update: OrderUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Update order status (admin only)"""
    existing_order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {k: v for k, v in order_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    updated_order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    # Send WebSocket notification to customer (using user_id)
    try:
        from routes.websocket_routes import manager
        user_id = existing_order.get("user_id")
        if user_id:
            await manager.broadcast_to_customer(user_id, updated_order)
            print(f"📡 WebSocket: Sent order update to customer {user_id}")
    except Exception as e:
        print(f"⚠️ Failed to send WebSocket notification: {e}")
    
    # Send phone notification when order is accepted with estimated time
    if order_update.status == "accepted" and order_update.estimated_time:
        await send_order_notification(updated_order, db)
    
    return updated_order


async def send_order_notification(order: dict, db: AsyncIOMotorDatabase):
    """Send notification to customer when order is accepted"""
    # Get customer phone number
    phone = order.get("phone")
    estimated_time = order.get("estimated_time")
    order_number = order.get("order_number")
    customer_name = order.get("first_name")
    
    if not phone:
        return  # No phone number, skip notification
    
    # TODO: Implement SMS notification here
    # Example using Twilio (you'll need to install twilio package and configure)
    # from twilio.rest import Client
    # client = Client(account_sid, auth_token)
    # message = client.messages.create(
    #     body=f"Hi {customer_name}! Your order #{order_number} has been accepted. It will be ready in approximately {estimated_time} minutes.",
    #     from_='+1234567890',  # Your Twilio number
    #     to=phone
    # )
    
    # For now, just log it
    print(f"📱 SMS Notification: Order #{order_number} accepted - Ready in {estimated_time} min - Sent to {phone}")
    
    # Store notification in database for tracking
    notification = {
        "order_id": order["id"],
        "order_number": order_number,
        "phone": phone,
        "message": f"Hi {customer_name}! Your order #{order_number} has been accepted. It will be ready in approximately {estimated_time} minutes.",
        "sent_at": datetime.now(timezone.utc),
        "type": "order_accepted"
    }
    await db.notifications.insert_one(notification)


@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Delete an order (admin only)"""
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}


@router.get("/orders/user/{user_id}", response_model=List[Order])
async def get_user_orders(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get orders for a specific user (for customer tracking by user_id)"""
    orders = await db.orders.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders


@router.post("/orders/close-day")
async def close_day(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Close all today's orders (mark them as closed for the day)
    Uses Albania timezone (Europe/Tirane)
    """
    # Get today's date range in Albania timezone
    today_start_utc, today_end_utc = get_today_range_albania()
    now_utc = albania_to_utc(now_albania())
    
    # Find all orders from today that haven't been closed yet and are not cancelled
    result = await db.orders.update_many(
        {
            "created_at": {"$gte": today_start_utc, "$lte": today_end_utc},
            "closed_at": None,  # ✅ FIXED: Check for None instead of $exists
            "status": {"$ne": "cancelled"}
        },
        {
            "$set": {
                "closed_at": now_utc
            }
        }
    )
    
    return {
        "message": "Day closed successfully",
        "orders_closed": result.modified_count,
        "closed_at": now_albania().isoformat(),  # Return in Albania time
        "timezone": "Europe/Tirane (Albania)"
    }

