from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import route modules
from routes import auth_routes, apartment_routes, upload_routes, gallery_routes, settings_routes, sightseeing_routes, menu_routes, order_routes, customer_auth_routes, analytics_routes, websocket_routes, reservation_routes, document_routes, expense_routes, notification_routes, booking_reservation_routes, reports_routes


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db_instance = client[os.environ['DB_NAME']]

# Inject database into route modules
auth_routes.set_db(db_instance)
apartment_routes.set_db(db_instance)
gallery_routes.set_db(db_instance)
settings_routes.set_db(db_instance)
sightseeing_routes.set_db(db_instance)
menu_routes.set_db(db_instance)
order_routes.set_db(db_instance)
customer_auth_routes.set_db(db_instance)
analytics_routes.set_db(db_instance)
websocket_routes.set_db(db_instance)
reservation_routes.set_db(db_instance)
document_routes.set_db(db_instance)
expense_routes.set_db(db_instance)
notification_routes.set_db(db_instance)
booking_reservation_routes.set_db(db_instance)
reports_routes.set_db(db_instance)

# Connect WebSocket manager to order routes
order_routes.set_websocket_manager(websocket_routes.manager)

# Create the main app
app = FastAPI(title="Skapeta Apartments API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include routers
api_router.include_router(auth_routes.router)
api_router.include_router(apartment_routes.router)
api_router.include_router(upload_routes.router)
api_router.include_router(gallery_routes.router)
api_router.include_router(settings_routes.router)
api_router.include_router(sightseeing_routes.router)
api_router.include_router(menu_routes.router)
api_router.include_router(order_routes.router)
api_router.include_router(customer_auth_routes.router)
api_router.include_router(analytics_routes.router)
api_router.include_router(websocket_routes.router)
api_router.include_router(reservation_routes.router)
api_router.include_router(document_routes.router)
api_router.include_router(expense_routes.router)
api_router.include_router(notification_routes.router)
api_router.include_router(booking_reservation_routes.router)
api_router.include_router(reports_routes.router)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Skapeta Apartments API", "status": "running"}

# Include the main API router
app.include_router(api_router)

# Serve uploaded files
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
