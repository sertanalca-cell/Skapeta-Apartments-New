from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import BookingReservation, BookingReservationCreate, BookingReservationUpdate
from auth import get_current_user

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.get("/booking-reservations", response_model=List[BookingReservation])
async def get_booking_reservations(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get all booking.com reservations (admin only)"""
    reservations = await db.booking_reservations.find({}, {"_id": 0}).sort("check_in", -1).to_list(1000)
    return reservations


@router.get("/booking-reservations/{reservation_id}", response_model=BookingReservation)
async def get_booking_reservation(
    reservation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get a single booking reservation"""
    reservation = await db.booking_reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Booking reservation not found")
    return reservation


@router.post("/booking-reservations", response_model=BookingReservation)
async def create_booking_reservation(
    reservation: BookingReservationCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Create a new booking reservation (admin only)"""
    new_reservation = BookingReservation(**reservation.dict())
    await db.booking_reservations.insert_one(new_reservation.dict())
    return new_reservation


@router.put("/booking-reservations/{reservation_id}", response_model=BookingReservation)
async def update_booking_reservation(
    reservation_id: str,
    reservation_update: BookingReservationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Update a booking reservation (admin only)"""
    update_data = {k: v for k, v in reservation_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.booking_reservations.update_one(
        {"id": reservation_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking reservation not found")
    
    updated_reservation = await db.booking_reservations.find_one({"id": reservation_id}, {"_id": 0})
    return BookingReservation(**updated_reservation)


@router.delete("/booking-reservations/{reservation_id}")
async def delete_booking_reservation(
    reservation_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Delete a booking reservation (admin only)"""
    result = await db.booking_reservations.delete_one({"id": reservation_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking reservation not found")
    
    return {"message": "Booking reservation deleted successfully"}
