from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from functools import wraps

# Import route modules
from routes import auth_routes, apartment_routes, upload_routes, gallery_routes, settings_routes


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db_instance = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Skapeta Apartments API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Monkey patch routes to inject database
def inject_db_into_routes(router_module):
    """Inject database into route functions"""
    original_routes = []
    for route in router_module.router.routes:
        if hasattr(route, 'endpoint'):
            original_endpoint = route.endpoint
            
            # Create wrapper that injects db
            @wraps(original_endpoint)
            async def wrapped_endpoint(*args, **kwargs):
                # Inject db if not already present
                if 'db' not in kwargs or kwargs['db'] is None:
                    kwargs['db'] = db_instance
                return await original_endpoint(*args, **kwargs)
            
            route.endpoint = wrapped_endpoint

# Inject DB into all route modules
inject_db_into_routes(auth_routes)
inject_db_into_routes(apartment_routes)
inject_db_into_routes(gallery_routes)
inject_db_into_routes(settings_routes)

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
