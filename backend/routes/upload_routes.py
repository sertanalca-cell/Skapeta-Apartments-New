from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from typing import List
import os
import uuid
import shutil
from pathlib import Path
from auth import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])

# Upload directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def validate_image(filename: str) -> bool:
    """Validate if file is an allowed image type"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload a single image (admin only)"""
    # Validate file type
    if not validate_image(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return file URL
    file_url = f"/api/uploads/{unique_filename}"
    return {
        "url": file_url,
        "filename": unique_filename
    }


@router.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user = Depends(get_current_user)
):
    """Upload multiple images (admin only)"""
    uploaded_files = []
    
    for file in files:
        # Validate file type
        if not validate_image(file.filename):
            continue  # Skip invalid files
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append({
                "url": f"/api/uploads/{unique_filename}",
                "filename": unique_filename,
                "original_filename": file.filename
            })
        except Exception as e:
            print(f"Failed to save {file.filename}: {str(e)}")
            continue
    
    if not uploaded_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid images were uploaded"
        )
    
    return {"files": uploaded_files}


@router.delete("/image/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    filename: str,
    current_user = Depends(get_current_user)
):
    """Delete an uploaded image (admin only)"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        file_path.unlink()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )
    
    return None
