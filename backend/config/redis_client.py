import redis
from config.settings import settings
from config.logging_config import logger

try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(f"Could not connect to Redis at {settings.REDIS_URL}: {e}")
    redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)