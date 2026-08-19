import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from redis.exceptions import RedisError

from api.routes import router
from config.database import engine
from models.db_models import Base
from config.logging_config import logger
import structlog
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from config.arq_client import create_arq_pool, close_arq_pool
from config.settings import settings
from config.rate_limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_arq_pool()
    except Exception as e:
        logger.warning(f"ARQ pool startup warning: {e}")
    yield
    await close_arq_pool()

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

class TraceIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        structlog.contextvars.clear_contextvars()
        trace_id = str(uuid.uuid4())
        structlog.contextvars.bind_contextvars(trace_id=trace_id)
        
        logger.info("request_started", path=request.url.path, method=request.method)
        response = await call_next(request)
        logger.info("request_finished", status_code=response.status_code)
        
        return response

app.add_middleware(TraceIDMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
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