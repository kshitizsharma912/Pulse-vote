from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.connection import engine, Base
from app.routers.api import router as api_router
from app.models.tables import User, Poll, PollOption, Vote

app = FastAPI(
    title="PulseVote API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "PulseVote API is running",
    }