from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, timedelta
from typing import Optional

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.post("/analytics/visit")
async def track_visit(
    request: Request,
    page: Optional[str] = "/",
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Track a page visit"""
    # Get visitor info
    visitor_ip = request.client.host
    user_agent = request.headers.get("user-agent", "Unknown")
    
    # Create visit record
    visit = {
        "timestamp": datetime.now(timezone.utc),
        "page": page,
        "ip": visitor_ip,
        "user_agent": user_agent,
    }
    
    await db.analytics.insert_one(visit)
    return {"status": "tracked"}


@router.get("/analytics/stats")
async def get_analytics_stats(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get visitor statistics"""
    
    # Get total visits
    total_visits = await db.analytics.count_documents({})
    
    # Get today's visits
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_visits = await db.analytics.count_documents({
        "timestamp": {"$gte": today_start}
    })
    
    # Get this week's visits
    week_start = today_start - timedelta(days=today_start.weekday())
    week_visits = await db.analytics.count_documents({
        "timestamp": {"$gte": week_start}
    })
    
    # Get this month's visits
    month_start = today_start.replace(day=1)
    month_visits = await db.analytics.count_documents({
        "timestamp": {"$gte": month_start}
    })
    
    # Get unique visitors (by IP)
    unique_visitors = await db.analytics.distinct("ip")
    unique_count = len(unique_visitors)
    
    # Get unique visitors today
    today_unique_ips = await db.analytics.distinct("ip", {
        "timestamp": {"$gte": today_start}
    })
    today_unique = len(today_unique_ips)
    
    return {
        "total_visits": total_visits,
        "today_visits": today_visits,
        "week_visits": week_visits,
        "month_visits": month_visits,
        "unique_visitors": unique_count,
        "today_unique_visitors": today_unique,
    }
