from fastapi import APIRouter, HTTPException, status, Depends
from models import Settings, SettingsUpdate
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/settings", tags=["Settings"])

# Database will be injected by server.py
_db = None

def set_db(database):
    """Set database instance"""
    global _db
    _db = database


@router.get("", response_model=Settings)
async def get_settings():
    """Get website settings (public)"""
    settings = await _db.settings.find_one({"id": "settings"})
    if not settings:
        # Create default settings if not exists
        default_settings = Settings()
        await _db.settings.insert_one(default_settings.dict())
        return default_settings
    return Settings(**settings)


@router.put("", response_model=Settings)
async def update_settings(
    settings_data: SettingsUpdate,
    current_user = Depends(get_current_user)
):
    """Update website settings (admin only)"""
    # Update only provided fields
    update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await _db.settings.update_one(
        {"id": "settings"},
        {"$set": update_data},
        upsert=True
    )
    
    # Get updated settings
    updated = await _db.settings.find_one({"id": "settings"})
    return Settings(**updated)
