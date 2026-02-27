"""
Sync script to add real apartments from Booking.com
This will populate the database with Skapeta Apartments' actual listings
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from models import Apartment
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Real apartment data from Booking.com
APARTMENTS_DATA = [
    {
        "name": "Apartment with Balcony - 1 Bedroom",
        "description": "Comfortable apartment with stunning mountain views and city views. Features a full bed in the bedroom and a sofa bed in the living room. Includes balcony, air conditioning, free WiFi, fully equipped kitchen with microwave, toaster, tea/coffee facilities. Private bathroom with free toiletries, satellite flat-screen TV, washing machine, and ironing facilities.",
        "price": 45.0,
        "price_unit": "per night",
        "capacity": "2-4 guests",
        "available": True,
        "images": [
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/754775082.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max500/754776098.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max500/742466232.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max300/754770987.jpg"
        ]
    },
    {
        "name": "Apartment with Balcony - 2 Bedrooms",
        "description": "Spacious two-bedroom apartment perfect for families. Master bedroom with queen bed, second bedroom with 2 twin beds, plus sofa bed in living room. Features balcony with panoramic views, modern amenities including air conditioning, free WiFi, fully equipped kitchen, washing machine, and flat-screen TV.",
        "price": 65.0,
        "price_unit": "per night",
        "capacity": "4-6 guests",
        "available": True,
        "images": [
            "https://cf.bstatic.com/xdata/images/hotel/max300/753150379.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max300/754770456.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max300/754774258.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max300/754770577.jpg"
        ]
    },
    {
        "name": "Standard Apartment - 2 Bedrooms",
        "description": "Well-appointed apartment with two bedrooms and spacious living area. Queen bed in first bedroom, 2 twin beds in second bedroom, and 2 sofa beds in living room. All modern amenities including kitchen, bathroom, WiFi, and air conditioning. Recently renovated with attention to detail.",
        "price": 60.0,
        "price_unit": "per night",
        "capacity": "4-8 guests",
        "available": True,
        "images": [
            "https://cf.bstatic.com/xdata/images/hotel/max500/754776098.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max500/742466232.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/754775082.jpg"
        ]
    },
    {
        "name": "Deluxe Apartment with Balcony",
        "description": "Our premium apartment featuring 1 twin bed and 1 queen bed in the bedroom, plus sofa bed in living room. Enjoy stunning views from the private balcony. Fully equipped with modern kitchen, washing machine, air conditioning, free WiFi, and all the comforts of home. Located on the 5th floor with elevator access.",
        "price": 55.0,
        "price_unit": "per night",
        "capacity": "3-5 guests",
        "available": True,
        "images": [
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/754775082.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max300/754770987.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max300/753150379.jpg",
            "https://cf.bstatic.com/xdata/images/hotel/max500/742466232.jpg"
        ]
    }
]


async def sync_apartments():
    """Sync apartments from Booking.com data"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🏠 Syncing apartments from Booking.com...")
    
    # Clear existing apartments
    result = await db.apartments.delete_many({})
    print(f"✓ Cleared {result.deleted_count} old apartments")
    
    # Add new apartments
    added_count = 0
    for apt_data in APARTMENTS_DATA:
        apartment = Apartment(
            id=str(uuid.uuid4()),
            **apt_data
        )
        
        await db.apartments.insert_one(apartment.dict())
        print(f"✓ Added: {apartment.name} - €{apartment.price}/{apartment.price_unit}")
        added_count += 1
    
    client.close()
    print(f"\n✅ Successfully synced {added_count} apartments from Booking.com!")
    print("\n📍 Visit your website to see the real apartments with photos!")


if __name__ == "__main__":
    asyncio.run(sync_apartments())
