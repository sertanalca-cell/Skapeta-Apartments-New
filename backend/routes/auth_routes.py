from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import LoginRequest, Token, User, UserCreate, UserInDB
from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str):
    """Get user by email"""
    user = await db.users.find_one({"email": email})
    if user:
        return UserInDB(**user)
    return None


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase):
    """Register a new admin user"""
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = UserInDB(
        email=user_data.email,
        role=user_data.role,
        hashed_password=get_password_hash(user_data.password)
    )
    
    await db.users.insert_one(user.dict())
    
    return User(**user.dict())


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase):
    """Login and get access token"""
    # Get user
    user = await get_user_by_email(db, login_data.email)
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=60 * 24)  # 24 hours
    )
    
    return Token(access_token=access_token)


@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: UserInDB = Depends(get_current_user)
):
    """Get current user information"""
    return User(**current_user.dict())
