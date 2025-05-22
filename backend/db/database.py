from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:qwert@127.0.0.1:5432/doc_auth_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    print("Attempting DB connection...")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
