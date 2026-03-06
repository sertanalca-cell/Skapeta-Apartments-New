from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from pydantic import BaseModel
from uuid import uuid4
from auth import get_current_user
import aiofiles
from pathlib import Path

router = APIRouter()

_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db

DOCUMENTS_DIR = Path("/app/backend/uploads/documents")
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)


class Document(BaseModel):
    id: str
    name: str
    filename: str
    file_url: str
    file_type: str
    category: str
    uploaded_at: datetime
    notes: Optional[str] = None


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = "general",
    notes: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Upload a business document (admin only)"""
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid4()}.{file_ext}"
    file_path = DOCUMENTS_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create document record
    document_data = {
        "id": str(uuid4()),
        "name": file.filename,
        "filename": unique_filename,
        "file_url": f"/api/uploads/documents/{unique_filename}",
        "file_type": file.content_type or "application/octet-stream",
        "category": category,
        "uploaded_at": datetime.now(timezone.utc),
        "notes": notes,
    }
    
    await db.documents.insert_one(document_data)
    return {k: v for k, v in document_data.items() if k != "_id"}


@router.get("/documents", response_model=List[Document])
async def get_documents(
    category: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get all documents (admin only)"""
    query = {"category": category} if category else {}
    documents = await db.documents.find(query, {"_id": 0}).sort("uploaded_at", -1).to_list(1000)
    return documents


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Delete a document"""
    document = await db.documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file
    file_path = DOCUMENTS_DIR / document["filename"]
    if file_path.exists():
        file_path.unlink()
    
    # Delete record
    await db.documents.delete_one({"id": document_id})
    return {"message": "Document deleted"}
