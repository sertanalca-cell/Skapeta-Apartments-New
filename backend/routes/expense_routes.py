from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from pydantic import BaseModel
from uuid import uuid4
from auth import get_current_user

router = APIRouter()

_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


class ExpenseCreate(BaseModel):
    title: str
    category: str  # energy, water, rent, credit, supplies, maintenance, other
    amount: float
    payment_date: str
    payment_method: Optional[str] = "cash"  # cash, card, transfer, other
    notes: Optional[str] = None
    receipt_url: Optional[str] = None


class Expense(ExpenseCreate):
    id: str
    created_at: datetime
    created_by: str


@router.post("/expenses", response_model=Expense)
async def create_expense(
    expense: ExpenseCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Create a new expense record (admin only)"""
    expense_data = {
        "id": str(uuid4()),
        **expense.dict(),
        "created_at": datetime.now(timezone.utc),
        "created_by": current_user["email"],
    }
    
    await db.expenses.insert_one(expense_data)
    return {k: v for k, v in expense_data.items() if k != "_id"}


@router.get("/expenses", response_model=List[Expense])
async def get_expenses(
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get all expenses with optional filters (admin only)"""
    query = {}
    
    if category:
        query["category"] = category
    
    if start_date and end_date:
        query["payment_date"] = {"$gte": start_date, "$lte": end_date}
    
    expenses = await db.expenses.find(query, {"_id": 0}).sort("payment_date", -1).to_list(1000)
    return expenses


@router.get("/expenses/stats")
async def get_expense_stats(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Get expense statistics (admin only)"""
    expenses = await db.expenses.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate totals
    total = sum(e["amount"] for e in expenses)
    
    # Current month
    now = datetime.now(timezone.utc)
    current_month = now.strftime("%Y-%m")
    month_expenses = [e for e in expenses if e["payment_date"].startswith(current_month)]
    month_total = sum(e["amount"] for e in month_expenses)
    
    # By category
    by_category = {}
    for expense in expenses:
        cat = expense["category"]
        by_category[cat] = by_category.get(cat, 0) + expense["amount"]
    
    return {
        "total_expenses": total,
        "month_expenses": month_total,
        "total_count": len(expenses),
        "month_count": len(month_expenses),
        "by_category": by_category,
    }


@router.delete("/expenses/{expense_id}")
async def delete_expense(
    expense_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Delete an expense record"""
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}


@router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: str,
    expense_update: ExpenseCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """Update an expense record"""
    existing = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = expense_update.dict()
    await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
    
    updated = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    return updated
