from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from models import Order, OrderCreate, OrderUpdate
from auth import get_current_user

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.get("/orders", response_model=List[Order])
async def get_orders(
    status: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get all orders (admin only)"""
    query = {"status": status} if status else {}
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
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
        order_number=next_order_number
    )
    
    await db.orders.insert_one(new_order.dict())
    return new_order


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
