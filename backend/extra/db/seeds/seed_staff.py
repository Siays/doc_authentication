import uuid
from datetime import datetime
import sys
import os
from pathlib import Path

# Add backend root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from db.database import SessionLocal
from extra.db.model_staff import Staff, GenderEnum

mock_staff_data = [
    {
        "staff_id": "d3e1a731-1234-4567-b890-abcd12345678",
        "first_name": "Alice",
        "last_name": "Tan",
        "ic_no": "901231-14-5678",
        "email": "alice.tan@example.com",
        "date_of_birth": "1990-12-31",
        "gender": GenderEnum.female,
        "job_title": "HR Manager",
        "is_active": True
    },
    {
        "staff_id": "b9f219dc-2345-5678-c901-def456789012",
        "first_name": "Mohd",
        "last_name": "Ali",
        "ic_no": "850415-10-1234",
        "email": "mohd.ali@example.com",
        "date_of_birth": "1985-04-15",
        "gender": GenderEnum.male,
        "job_title": "IT Officer",
        "is_active": False
    },
    {
        "staff_id": "a7e3bd59-4567-7890-d123-aaaa99998888",
        "first_name": "Liyana",
        "last_name": "Kamal",
        "ic_no": "950210-08-4567",
        "email": "liyana.kamal@example.com",
        "date_of_birth": "1995-02-10",
        "gender": GenderEnum.female,
        "job_title": "Finance Executive",
        "is_active": True
    }
]

def seed():
    db = SessionLocal()
    try:
        for data in mock_staff_data:
            # Skip if email already exists
            if db.query(Staff).filter_by(email=data["email"]).first():
                print(f"Skipping {data['email']} - already exists")
                continue
            print(f"[DEBUG] Inserting staff: {data['email']}, gender: {data['gender']}")

            staff = Staff(
                staff_id=uuid.UUID(data["staff_id"]),
                first_name=data["first_name"],
                last_name=data["last_name"],
                ic_no=data["ic_no"],
                email=data["email"],
                date_of_birth=datetime.strptime(data["date_of_birth"], "%Y-%m-%d").date(),
                gender=data["gender"].value,
                job_title=data["job_title"],
                is_active=data["is_active"]
            )
            print(f"[DEBUG] gender: {data['gender'].value}")

            db.add(staff)
            print(f"Added {data['email']}")
        db.commit()
        print("✅ Seeded staff data successfully.")
    except Exception as e:
        db.rollback()
        print("❌ Error seeding staff data:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
