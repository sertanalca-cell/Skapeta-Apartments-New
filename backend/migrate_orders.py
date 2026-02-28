"""
Migration script to add order_number to existing orders
Run this once to fix existing orders
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def migrate_orders():
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.getenv('DB_NAME', 'skapeta_db')]
    
    # Get all orders without order_number
    orders = await db.orders.find({"order_number": {"$exists": False}}).to_list(1000)
    
    print(f"Found {len(orders)} orders without order_number")
    
    # Assign order numbers starting from 1001
    start_number = 1001
    
    for i, order in enumerate(orders):
        order_number = start_number + i
        await db.orders.update_one(
            {"id": order["id"]},
            {"$set": {"order_number": order_number}}
        )
        print(f"Updated order {order['id']} with order_number {order_number}")
    
    print(f"Migration complete! Updated {len(orders)} orders")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_orders())
