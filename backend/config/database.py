from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings

from pathlib import Path

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///./") or db_url.startswith("sqlite:////"):
    # Resolve relative path from backend directory
    backend_dir = Path(__file__).resolve().parent.parent
    sqlite_rel = db_url.split("sqlite:///")[-1].lstrip("./")
    full_path = backend_dir / sqlite_rel
    db_url = f"sqlite:///{full_path.as_posix()}"

if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()