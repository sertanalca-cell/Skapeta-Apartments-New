from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Customer, CustomerRegister, CustomerLogin

router = APIRouter()

# Database dependency
_db = None

def set_db(db):
    global _db
    _db = db

def get_database():
    return _db


@router.post("/customer/register", response_model=Customer)
async def register_customer(
    customer_data: CustomerRegister,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Register a new customer (simple registration with name and phone)"""
    # Check if customer with same name exists
    existing = await db.customers.find_one(
        {
            "first_name": customer_data.first_name,
            "last_name": customer_data.last_name
        },
        {"_id": 0}
    )
    
    if existing:
        # Return existing customer
        return existing
    
    # Create new customer
    new_customer = Customer(**customer_data.dict())
    await db.customers.insert_one(new_customer.dict())
    return new_customer


@router.post("/customer/login", response_model=Customer)
async def login_customer(
    login_data: CustomerLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Login customer (find by first and last name)"""
    customer = await db.customers.find_one(
        {
            "first_name": login_data.first_name,
            "last_name": login_data.last_name
        },
        {"_id": 0}
    )
    
    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found. Please register first."
        )
    
    return customer
