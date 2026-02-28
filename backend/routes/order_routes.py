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
    
    new_order = Order(
        **order.dict(),
        total_price=total_price,
        status="pending"
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
    return updated_order


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


@router.get("/orders/customer/{apartment_number}", response_model=List[Order])
async def get_customer_orders(
    apartment_number: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get orders for a specific apartment (for customer tracking)"""
    orders = await db.orders.find(
        {"apartment_number": apartment_number},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders
