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
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".avi", ".mkv"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".aac"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS | ALLOWED_AUDIO_EXTENSIONS


def validate_file(filename: str) -> tuple[bool, str]:
    """Validate if file is an allowed type and return media type"""
    ext = os.path.splitext(filename)[1].lower()
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return True, "image"
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return True, "video"
    elif ext in ALLOWED_AUDIO_EXTENSIONS:
        return True, "audio"
    return False, None


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload a single image, video, or audio file (admin only)"""
    # Validate file type
    is_valid, media_type = validate_file(file.filename)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: Images ({', '.join(ALLOWED_IMAGE_EXTENSIONS)}), Videos ({', '.join(ALLOWED_VIDEO_EXTENSIONS)}), Audio ({', '.join(ALLOWED_AUDIO_EXTENSIONS)})"
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
        "filename": unique_filename,
        "media_type": media_type
    }


@router.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user = Depends(get_current_user)
):
    """Upload multiple images or videos (admin only)"""
    uploaded_files = []
    
    for file in files:
        # Validate file type
        is_valid, media_type = validate_file(file.filename)
        if not is_valid:
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
                "original_filename": file.filename,
                "media_type": media_type
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
