
from fastapi import APIRouter, Form, Depends
from datetime import datetime
from sqlalchemy.orm import Session
from db.database import get_db
from password_processor import pw_processor
from db.models.staff_system_acc import StaffSystemAcc
from db.crud import create

router = APIRouter()


@router.post("/create-user")
def create_user(password:str = Form(...),
                        db: Session = Depends(get_db)):
    result = pw_processor.hash_password(password)

    print("Hash:", result["hash"])

    record_data = {
        "staff_id": "1",
        "account_holder_name" : "Alice Tan",
        "email": "alice.tan@example.com",
        "password_hash": result["hash"],
        "last_login_at": datetime.utcnow(),
        "is_super": True
    }

    new_account = create(db, StaffSystemAcc, record_data)

    return {
        "account_id": new_account.account_id,
        "staff_id": new_account.staff_id,
        "email": new_account.email,
        "is_super": new_account.is_super,
        "last_login_at": new_account.last_login_at.isoformat(),  # make datetime JSON serializable
    }