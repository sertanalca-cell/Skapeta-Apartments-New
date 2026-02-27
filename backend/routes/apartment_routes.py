from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from models import Apartment, ApartmentCreate, ApartmentUpdate
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/apartments", tags=["Apartments"])


@router.get("", response_model=List[Apartment])
async def get_apartments(db: AsyncIOMotorDatabase):
    """Get all apartments (public)"""
    apartments = await db.apartments.find().to_list(100)
    return [Apartment(**apt) for apt in apartments]


@router.get("/{apartment_id}", response_model=Apartment)
async def get_apartment(apartment_id: str, db: AsyncIOMotorDatabase):
    """Get a specific apartment (public)"""
    apartment = await db.apartments.find_one({"id": apartment_id})
    if not apartment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Apartment not found"
        )
    return Apartment(**apartment)


@router.post("", response_model=Apartment, status_code=status.HTTP_201_CREATED)
async def create_apartment(
    apartment_data: ApartmentCreate,
    db: AsyncIOMotorDatabase,
    current_user = Depends(get_current_user)
):
    """Create a new apartment (admin only)"""
    apartment = Apartment(**apartment_data.dict())
    await db.apartments.insert_one(apartment.dict())
    return apartment


@router.put("/{apartment_id}", response_model=Apartment)
async def update_apartment(
    apartment_id: str,
    apartment_data: ApartmentUpdate,
    db: AsyncIOMotorDatabase,
    current_user = Depends(get_current_user)
):
    """Update an apartment (admin only)"""
    # Check if apartment exists
    existing = await db.apartments.find_one({"id": apartment_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Apartment not found"
        )
    
    # Update only provided fields
    update_data = {k: v for k, v in apartment_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.apartments.update_one(
        {"id": apartment_id},
        {"$set": update_data}
    )
    
    # Get updated apartment
    updated = await db.apartments.find_one({"id": apartment_id})
    return Apartment(**updated)


@router.delete("/{apartment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_apartment(
    apartment_id: str,
    db: AsyncIOMotorDatabase,
    current_user = Depends(get_current_user)
):
    """Delete an apartment (admin only)"""
    result = await db.apartments.delete_one({"id": apartment_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Apartment not found"
        )
    return None
