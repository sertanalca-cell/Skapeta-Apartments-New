from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import route modules
from routes import auth_routes, apartment_routes, upload_routes, gallery_routes, settings_routes


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
