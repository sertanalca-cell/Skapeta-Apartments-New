"""
Seed script to initialize database with default data
Run this once to create the first admin user
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_password_hash
from models import UserInDB, Settings
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


async def seed_database():
    """Seed the database with initial data"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding database...")
    
    # 1. Create default admin user
    admin_email = "admin@skapeta.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_user = UserInDB(
            email=admin_email,
            role="admin",
            hashed_password=get_password_hash("admin123")  # Change this password!
        )
        await db.users.insert_one(admin_user.dict())
        print(f"✅ Created admin user: {admin_email}")
        print(f"   Password: admin123 (CHANGE THIS IMMEDIATELY!)")
    else:
        print(f"ℹ️  Admin user already exists: {admin_email}")
    
    # 2. Create default settings
    existing_settings = await db.settings.find_one({"id": "settings"})
    if not existing_settings:
        default_settings = Settings()
        await db.settings.insert_one(default_settings.dict())
        print("✅ Created default settings")
    else:
        print("ℹ️  Settings already exist")
    
    # 3. Optional: Seed sample apartments
    apartment_count = await db.apartments.count_documents({})
    if apartment_count == 0:
        print("\n💡 No apartments found. You can add them through the admin panel.")
    else:
        print(f"\nℹ️  Database has {apartment_count} apartments")
    
    client.close()
    print("\n✅ Database seeding completed!")
    print("\n🔐 Login credentials:")
    print(f"   Email: {admin_email}")
    print(f"   Password: admin123")
    print(f"\n⚠️  IMPORTANT: Change the admin password immediately after first login!")


if __name__ == "__main__":
    asyncio.run(seed_database())
