#!/usr/bin/env python3
"""
Database seed script for Skapeta Apartments
Creates initial admin user and sample data
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
from uuid import uuid4

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    # Database connection
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'skapeta_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("\n🌱 Seeding database...\n")
    
    # 1. Create admin user
    admin_exists = await db.users.find_one({"email": "admin@skapeta.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid4()),
            "email": "admin@skapeta.com",
            "password": pwd_context.hash("admin123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(admin_user)
        print("✅ Admin user created")
        print("   Email: admin@skapeta.com")
        print("   Password: admin123")
    else:
        print("✅ Admin user already exists")
    
    # 2. Create settings
    settings_exists = await db.settings.find_one({})
    if not settings_exists:
        settings = {
            "company_name": "Skapeta Apartments",
            "whatsapp_number": "355693227207",
            "tax_number": "L12345678A",
            "logo_url": "https://via.placeholder.com/200x60?text=Skapeta",
            "updated_at": datetime.now(timezone.utc)
        }
        await db.settings.insert_one(settings)
        print("✅ Settings created")
    else:
        print("✅ Settings already exist")
    
    # 3. Create sample menu items
    menu_count = await db.menu_items.count_documents({})
    if menu_count == 0:
        sample_menu = [
            {
                "id": str(uuid4()),
                "name": "Margherita Pizza",
                "description": "Fresh tomato sauce, mozzarella, and basil",
                "price": 12.50,
                "category": "Main Course",
                "available": True,
                "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid4()),
                "name": "Caesar Salad",
                "description": "Romaine lettuce, croutons, parmesan, Caesar dressing",
                "price": 8.50,
                "category": "Salad",
                "available": True,
                "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid4()),
                "name": "Tiramisu",
                "description": "Classic Italian dessert with coffee and mascarpone",
                "price": 6.50,
                "category": "Dessert",
                "available": True,
                "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
                "created_at": datetime.now(timezone.utc)
            }
        ]
        await db.menu_items.insert_many(sample_menu)
        print(f"✅ Created {len(sample_menu)} sample menu items")
    else:
        print(f"✅ Menu already has {menu_count} items")
    
    # 4. Create indexes for better performance
    await db.users.create_index("email", unique=True)
    await db.orders.create_index("created_at")
    await db.orders.create_index("status")
    await db.menu_items.create_index("category")
    print("✅ Database indexes created")
    
    client.close()
    print("\n✅ Database seeding completed!\n")

if __name__ == "__main__":
    asyncio.run(seed_database())
