from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import MenuItem, MenuItemCreate, MenuItemUpdate
from auth import get_current_user

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.get("/menu-items", response_model=List[MenuItem])
async def get_menu_items(
    available_only: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all menu items (public endpoint)"""
    query = {"available": True} if available_only else {}
    items = await db.menu_items.find(query, {"_id": 0}).to_list(1000)
    return items


@router.get("/menu-items/{item_id}", response_model=MenuItem)
async def get_menu_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a single menu item"""
    item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


@router.post("/menu-items", response_model=MenuItem)
async def create_menu_item(
    item: MenuItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Create a new menu item (admin only)"""
    new_item = MenuItem(**item.dict())
    await db.menu_items.insert_one(new_item.dict())
    return new_item


@router.put("/menu-items/{item_id}", response_model=MenuItem)
async def update_menu_item(
    item_id: str,
    item_update: MenuItemUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Update a menu item (admin only)"""
    existing_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not existing_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = {k: v for k, v in item_update.dict().items() if v is not None}
    if update_data:
        await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return updated_item


@router.delete("/menu-items/{item_id}")
async def delete_menu_item(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Delete a menu item (admin only)"""
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}
