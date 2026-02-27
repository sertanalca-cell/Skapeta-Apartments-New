from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Settings, SettingsUpdate
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=Settings)
async def get_settings(db: AsyncIOMotorDatabase):
    """Get website settings (public)"""
    settings = await db.settings.find_one({"id": "settings"})
    if not settings:
        # Create default settings if not exists
        default_settings = Settings()
        await db.settings.insert_one(default_settings.dict())
        return default_settings
    return Settings(**settings)


@router.put("", response_model=Settings)
async def update_settings(
    settings_data: SettingsUpdate,
    db: AsyncIOMotorDatabase,
    current_user = Depends(get_current_user)
):
    """Update website settings (admin only)"""
    # Update only provided fields
    update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.settings.update_one(
        {"id": "settings"},
        {"$set": update_data},
        upsert=True
    )
    
    # Get updated settings
    updated = await db.settings.find_one({"id": "settings"})
    return Settings(**updated)
