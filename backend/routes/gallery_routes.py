from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from models import GalleryImage
from auth import get_current_user

router = APIRouter(prefix="/gallery", tags=["Gallery"])

# Database will be injected by server.py
_db = None

def set_db(database):
    """Set database instance"""
    global _db
    _db = database


@router.get("", response_model=List[GalleryImage])
async def get_gallery_images(category: Optional[str] = None):
    """Get all gallery images (public)"""
    query = {"category": category} if category else {}
    images = await _db.gallery.find(query).to_list(200)
    return [GalleryImage(**img) for img in images]


@router.post("", response_model=GalleryImage, status_code=status.HTTP_201_CREATED)
async def add_gallery_image(
    image_data: GalleryImage,
    current_user = Depends(get_current_user)
):
    """Add a new gallery image (admin only)"""
    await _db.gallery.insert_one(image_data.dict())
    return image_data


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(
    image_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a gallery image (admin only)"""
    result = await _db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    return None
