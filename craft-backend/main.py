from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routers
from routers import analytics, stores, artists, tutorials, calculator

# Create FastAPI app
app = FastAPI(
    title="CraftIQ Backend API",
    description="AI-powered business support for craft entrepreneurs",
    version="1.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (YOUR ROUTERS)
app.include_router(analytics.router)
app.include_router(calculator.router)
app.include_router(stores.router)
app.include_router(artists.router)
app.include_router(tutorials.router)

# TODO: Shivangi will add auth router here later
# from routers import auth
# app.include_router(auth.router)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "CraftIQ API is running",
        "status": "ok",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=True  # Auto-reload on file changes
    )