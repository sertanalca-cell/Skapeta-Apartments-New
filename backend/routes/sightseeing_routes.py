from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import SightseeingPlace, SightseeingPlaceCreate, SightseeingPlaceUpdate
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/sightseeing", tags=["Sightseeing"])

# Database will be injected by server.py
_db = None

def set_db(database):
    """Set database instance"""
    global _db
    _db = database


@router.get("", response_model=List[SightseeingPlace])
async def get_sightseeing_places():
    """Get all sightseeing places (public)"""
    places = await _db.sightseeing.find().sort("order", 1).to_list(100)
    return [SightseeingPlace(**place) for place in places]


@router.get("/{place_id}", response_model=SightseeingPlace)
async def get_sightseeing_place(place_id: str):
    """Get a specific sightseeing place (public)"""
    place = await _db.sightseeing.find_one({"id": place_id})
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )
    return SightseeingPlace(**place)


@router.post("", response_model=SightseeingPlace, status_code=status.HTTP_201_CREATED)
async def create_sightseeing_place(
    place_data: SightseeingPlaceCreate,
    current_user = Depends(get_current_user)
):
    """Create a new sightseeing place (admin only)"""
    place = SightseeingPlace(**place_data.dict())
    await _db.sightseeing.insert_one(place.dict())
    return place


@router.put("/{place_id}", response_model=SightseeingPlace)
async def update_sightseeing_place(
    place_id: str,
    place_data: SightseeingPlaceUpdate,
    current_user = Depends(get_current_user)
):
    """Update a sightseeing place (admin only)"""
    # Check if place exists
    existing = await _db.sightseeing.find_one({"id": place_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )
    
    # Update only provided fields
    update_data = {k: v for k, v in place_data.dict().items() if v is not None}
    
    await _db.sightseeing.update_one(
        {"id": place_id},
        {"$set": update_data}
    )
    
    # Get updated place
    updated = await _db.sightseeing.find_one({"id": place_id})
    return SightseeingPlace(**updated)


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sightseeing_place(
    place_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a sightseeing place (admin only)"""
    result = await _db.sightseeing.delete_one({"id": place_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )
    return None
