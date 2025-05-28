from fastapi import APIRouter, Form, Depends
from datetime import datetime
from sqlalchemy.orm import Session
from db.database import get_db
from password_processor import pw_processor
from db.models.model_staff_system_acc import StaffSystemAcc
from db.models.model_staff import Staff
from db.crud import create, get_filtered_column_values, get_by_column

router = APIRouter()

# @router.post("/create-user")
# def create_user(email: str = Form(...),
#                 password:str = Form(...),
#                 db: Session = Depends(get_db)):
#     result = pw_processor.hash_password(password)
#
#     print("Hash:", result["hash"])
#
#     record_data = {
#         "staff_id": "1",
#         "account_holder_name" : "Alice Tan",
#         "email": "alice.tan@example.com",
#         "password_hash": result["hash"],
#         "last_login_at": datetime.utcnow(),
#         "is_super": True
#     }
#
#     new_account = create(db, StaffSystemAcc, record_data)
#
#     return {
#         "account_id": new_account.account_id,
#         "staff_id": new_account.staff_id,
#         "email": new_account.email,
#         "is_super": new_account.is_super,
#         "last_login_at": new_account.last_login_at.isoformat(),  # make datetime JSON serializable
#     }


@router.post("/create-user")
def create_user(
    staff_id: int = Form(...),
    account_holder_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    is_super: bool = Form(...),
    db: Session = Depends(get_db)
    ):

    result = pw_processor.hash_password(password)

    record_data = {
        "staff_id": staff_id,
        "account_holder_name": account_holder_name,
        "email": email,
        "password_hash": result["hash"],
        "last_login_at": datetime.utcnow(),
        "is_super": is_super,
        "temp_password": True
    }

    new_account = create(db, StaffSystemAcc, record_data)

    return {
        "account_id": new_account.account_id,
        "email": new_account.email,
        "is_super": new_account.is_super
    }


@router.get("/available-staff-emails")
def get_available_staff_emails(search: str = "", db: Session = Depends(get_db)):
    used_emails_subquery = db.query(StaffSystemAcc.email).subquery()

    return get_filtered_column_values(
        db=db,
        model=Staff,
        column=Staff.email,
        exclude_subquery=used_emails_subquery,
        search=search,
        limit=10
    )


@router.get("/staff-info")
def get_staff_info(email: str, db: Session = Depends(get_db)):
    staff = get_by_column(db, Staff, "email", email)

    return {
        "staff_id": staff.staff_id,
        "full_name": f"{staff.first_name} {staff.last_name}",
        "job_title": staff.job_title
    }


