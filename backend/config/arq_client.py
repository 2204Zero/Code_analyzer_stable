from typing import Optional
from arq.connections import RedisSettings, create_pool, ArqRedis
from config.settings import settings
from config.logging_config import logger

# Ensure compatibility if from_url is referenced
if not hasattr(RedisSettings, "from_url"):
    RedisSettings.from_url = RedisSettings.from_dsn

arq_pool: Optional[ArqRedis] = None


def get_redis_settings() -> RedisSettings:
    """Return ARQ RedisSettings parsed from app configuration URL."""
    if hasattr(RedisSettings, "from_dsn"):
        return RedisSettings.from_dsn(settings.REDIS_URL)
    return RedisSettings.from_url(settings.REDIS_URL)


async def create_arq_pool() -> ArqRedis:
    """Create and return a shared ARQ Redis pool."""
    global arq_pool
    if arq_pool is None:
        try:
            redis_settings = get_redis_settings()
            arq_pool = await create_pool(redis_settings)
            logger.info(f"Initialized ARQ Redis pool at {settings.REDIS_URL}")
        except Exception as e:
            logger.error(f"Failed to initialize ARQ Redis pool at {settings.REDIS_URL}: {e}")
            raise e
    return arq_pool


async def close_arq_pool() -> None:
    """Close the shared ARQ Redis pool if open."""
    global arq_pool
    if arq_pool is not None:
        try:
            await arq_pool.close()
            logger.info("Closed ARQ Redis pool")
        except Exception as e:
            logger.warning(f"Error closing ARQ Redis pool: {e}")
        finally:
            arq_pool = None


async def get_arq_pool() -> ArqRedis:
    """
    FastAPI dependency that provides the active ARQ Redis connection pool.
    """
    global arq_pool
    if arq_pool is None:
        arq_pool = await create_arq_pool()
    return arq_pool
