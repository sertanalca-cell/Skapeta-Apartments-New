#!/usr/bin/env python3
"""Fix admin user hashed_password field"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def fix_admin():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'skapeta_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔧 Fixing admin user...")
    
    # Find admin user
    admin = await db.users.find_one({"email": "admin@skapeta.com"})
    
    if admin:
        print(f"Found admin user: {admin}")
        
        # Check if hashed_password exists
        if 'hashed_password' not in admin:
            print("❌ Missing hashed_password field!")
            # Update with hashed password
            result = await db.users.update_one(
                {"email": "admin@skapeta.com"},
                {"$set": {"hashed_password": pwd_context.hash("admin123")}}
            )
            print(f"✅ Updated admin user: {result.modified_count} document(s) modified")
        else:
            print("✅ Admin user has hashed_password field")
    else:
        print("❌ Admin user not found!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_admin())
