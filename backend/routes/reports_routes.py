from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import MonthlyRevenue
from auth import get_current_user
from datetime import datetime

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.get("/reports/monthly-revenue", response_model=MonthlyRevenue)
async def get_monthly_revenue(
    month: str,  # Format: YYYY-MM (e.g., "2026-03")
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Get monthly revenue report for a specific month
    Includes: Food orders, Manual reservations, Booking.com reservations
    """
    # Parse month
    try:
        year, month_num = month.split('-')
        start_date = datetime(int(year), int(month_num), 1)
        
        # Get last day of month
        if int(month_num) == 12:
            end_date = datetime(int(year) + 1, 1, 1)
        else:
            end_date = datetime(int(year), int(month_num) + 1, 1)
    except:
        start_date = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = datetime.utcnow()
    
    # Food Orders
    food_orders = await db.orders.find(
        {
            "created_at": {"$gte": start_date, "$lt": end_date},
            "status": {"$ne": "cancelled"}
        },
        {"_id": 0, "total_price": 1}
    ).to_list(10000)
    
    food_orders_count = len(food_orders)
    food_orders_total = sum(order.get('total_price', 0) for order in food_orders)
    
    # Manual Reservations
    manual_reservations = await db.reservations.find(
        {
            "check_in": {
                "$gte": start_date.strftime("%Y-%m-%d"),
                "$lt": end_date.strftime("%Y-%m-%d")
            }
        },
        {"_id": 0, "total_price": 1}
    ).to_list(10000)
    
    manual_reservations_count = len(manual_reservations)
    manual_reservations_total = sum(res.get('total_price', 0) for res in manual_reservations)
    
    # Booking.com Reservations
    booking_reservations = await db.booking_reservations.find(
        {
            "check_in": {
                "$gte": start_date.strftime("%Y-%m-%d"),
                "$lt": end_date.strftime("%Y-%m-%d")
            }
        },
        {"_id": 0, "price": 1}
    ).to_list(10000)
    
    booking_reservations_count = len(booking_reservations)
    booking_reservations_total = sum(res.get('price', 0) for res in booking_reservations)
    
    # Total
    total_revenue = food_orders_total + manual_reservations_total + booking_reservations_total
    
    return MonthlyRevenue(
        month=month,
        food_orders_count=food_orders_count,
        food_orders_total=food_orders_total,
        manual_reservations_count=manual_reservations_count,
        manual_reservations_total=manual_reservations_total,
        booking_reservations_count=booking_reservations_count,
        booking_reservations_total=booking_reservations_total,
        total_revenue=total_revenue
    )
