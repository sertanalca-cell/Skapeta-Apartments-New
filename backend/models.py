from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


# User/Admin Models
class UserBase(BaseModel):
    email: str
    role: str = "admin"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    hashed_password: str


# Apartment Models
class ApartmentBase(BaseModel):
    name: str
    description: str
    price: float
    price_unit: str = "per night"
    capacity: str
    available: bool = True

class ApartmentCreate(ApartmentBase):
    images: List[str] = []

class Apartment(ApartmentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ApartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_unit: Optional[str] = None
    capacity: Optional[str] = None
    available: Optional[bool] = None
    images: Optional[List[str]] = None


# Gallery Models
class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: Optional[str] = None
    category: str = "general"  # general, apartment, food, sightseeing
    media_type: str = "image"  # image or video
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Food Menu Models
class FoodMenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: str = "meal"  # breakfast, lunch, dinner, dessert, meal
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Sightseeing Models
class SightseeingPlace(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    image_url: str
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SightseeingPlaceCreate(BaseModel):
    name: str
    description: str
    image_url: str
    order: int = 0

class SightseeingPlaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None


# Settings Models
class CustomLink(BaseModel):
    name: str
    url: str
    icon: str = "link"  # lucide icon name

class Settings(BaseModel):
    id: str = "settings"
    logo_url: Optional[str] = None
    instagram_url: str = "https://www.instagram.com/skapeta_apartments"
    booking_url: str = "https://www.booking.com/hotel/al/pirro-39-s-vacation-home.html"
    whatsapp_number: str = "+355693227207"
    google_maps_url: str = "https://maps.google.com/?q=Saranda,Albania"
    phone: str = "+355 69 322 7207"
    address: str = "Saranda, Albania"
    sponsored_by_text: str = "sponsored by @albaniatourism_"
    sponsored_by_url: str = "https://www.instagram.com/albaniatourism_"
    footer_custom_text: str = "This website was created by Sertan Nalça and for any support, please contact 00355692033673"
    hero_background_url: Optional[str] = None
    hero_background_type: str = "none"  # none, image, video
    about_image_url: Optional[str] = None
    star_rating: int = 3
    # Content sections
    hero_title: str = "Skapeta Apartments"
    hero_subtitle: str = "3-star apartments in Saranda.\nLocated 8–10 minutes walk to the city center,\n3–5 minutes walk to the beach."
    about_title: str = "Welcome to Skapeta Apartments"
    about_description: str = "Experience comfort and hospitality in the heart of Saranda. Our recently renovated 3-star apartments offer modern amenities, stunning mountain views, and a perfect location just minutes from the beach and city center."
    food_service_title: str = "Food Service"
    food_service_description: str = "We also offer breakfast, lunch, and dinner service for our guests."
    food_service_subtitle: str = "All meals are prepared with love, care, and quality ingredients."
    # Custom contact links
    custom_contact_links: List[dict] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    instagram_url: Optional[str] = None
    booking_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    google_maps_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    sponsored_by_text: Optional[str] = None
    sponsored_by_url: Optional[str] = None
    footer_custom_text: Optional[str] = None
    hero_background_url: Optional[str] = None
    hero_background_type: Optional[str] = None
    about_image_url: Optional[str] = None
    star_rating: Optional[int] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    about_title: Optional[str] = None
    about_description: Optional[str] = None
    food_service_title: Optional[str] = None
    food_service_description: Optional[str] = None
    food_service_subtitle: Optional[str] = None
    custom_contact_links: Optional[List[dict]] = None


# Customer Authentication
class CustomerRegister(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomerLogin(BaseModel):
    first_name: str
    last_name: str

# Food Ordering Models
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str = "General"
    image: Optional[str] = None
    available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItem(MenuItemBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    available: Optional[bool] = None


class OrderItem(BaseModel):
    menu_item_id: str
    menu_item_name: str
    quantity: int
    price: float

class OrderBase(BaseModel):
    customer_name: str
    apartment_number: str
    items: List[OrderItem]
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending, accepted, preparing, on_the_way, delivered, cancelled
    estimated_time: Optional[int] = None  # in minutes
    total_price: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    estimated_time: Optional[int] = None


# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
