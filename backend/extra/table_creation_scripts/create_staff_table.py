import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from db.database import engine, Base
from extra.db.model_staff import Staff

print("🔍 Creating staff table (if not already present)...")
Base.metadata.create_all(bind=engine)
print("✅ Done.")
