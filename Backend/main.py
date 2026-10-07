from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import chat, calculator, auth, profile

# Ensure database tables exist at application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CraftIQ Backend")

# CONTRACT: add your deployed frontend URL here too once you deploy (Vercel/Netlify).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(profile.router, tags=["profile"])
app.include_router(chat.router, tags=["chat"])
app.include_router(calculator.router, tags=["calculator"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "CraftIQ backend"}