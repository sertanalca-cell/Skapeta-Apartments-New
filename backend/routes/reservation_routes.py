from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from pydantic import BaseModel
from uuid import uuid4
from auth import get_current_user

router = APIRouter()

_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


class ReservationCreate(BaseModel):
    guest_name: str
    guest_email: Optional[str] = None
    guest_phone: str
    apartment_id: str
    apartment_name: str
    check_in: str
    check_out: str
    num_guests: int
    total_price: float
    notes: Optional[str] = None


class Reservation(ReservationCreate):
    id: str
    created_at: datetime
    status: str = "confirmed"


@router.post("/reservations", response_model=Reservation)
async def create_reservation(
    reservation: ReservationCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Create a manual reservation (admin only)"""
    reservation_data = {
        "id": str(uuid4()),
        **reservation.dict(),
        "created_at": datetime.now(timezone.utc),
        "status": "confirmed",
    }
    
    await db.reservations.insert_one(reservation_data)
    return {k: v for k, v in reservation_data.items() if k != "_id"}


@router.get("/reservations", response_model=List[Reservation])
async def get_reservations(
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get all reservations (admin only)"""
    query = {"status": status} if status else {}
    reservations = await db.reservations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reservations


@router.get("/reservations/{reservation_id}", response_model=Reservation)
async def get_reservation(
    reservation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get a single reservation"""
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@router.delete("/reservations/{reservation_id}")
async def delete_reservation(
    reservation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Delete a reservation"""
    result = await db.reservations.delete_one({"id": reservation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Reservation deleted"}
