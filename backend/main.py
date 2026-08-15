import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from redis.exceptions import RedisError

from api.routes import router
from config.database import engine
from models.db_models import Base
from config.logging_config import logger

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error (Database)"},
    )

@app.exception_handler(RedisError)
async def redis_exception_handler(request: Request, exc: RedisError):
    logger.exception(f"Redis error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error (Cache)"},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

app.include_router(router, prefix="/api/v1")

@app.get("/")
def home():
    return {"message": "Server running"}