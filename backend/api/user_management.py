from typing import Optional
from fastapi import APIRouter, Form, Depends, File
from datetime import datetime
from sqlalchemy.orm import Session
from db.database import get_db
from password_processor import pw_processor
from db.models.model_staff_system_acc import StaffSystemAcc
from db.models.model_staff import Staff
from db.crud import create, get_filtered_column_values, get_by_column, update
from fastapi import UploadFile
from pathlib import Path
from db.data_validator.validator import (validate_email,
                                         validate_password,
                                         validate_profile_pic_ext)
UPLOAD_DIR = Path("uploads/user_profile_pic")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter()


@router.post("/create-user")
def create_user(
    staff_id: int = Form(...),
    account_holder_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    is_super: bool = Form(...),
    db: Session = Depends(get_db)
    ):

    result = {}

    if validate_password(password):
        result = pw_processor.hash_password(password)
    validate_email(email)

    record_data = {
        "staff_id": staff_id,
        "account_holder_name": account_holder_name,
        "email": email,
        "password_hash": result["hash"],
        "last_login_at": datetime.utcnow(),
        "is_super": is_super,
        "first_time_login": True
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


@router.post("/update-acc")
def update_acc(email: str = Form(...),
               password: str = Form(None),
               profile_picture: Optional[UploadFile] = File(None),

               db: Session = Depends(get_db)):

    user = get_by_column(db, StaffSystemAcc, "email", email)
    updated_data = {}

    if password is not None:
        result = pw_processor.hash_password(password)

        updated_data = {
            "password_hash": result["hash"],
        }

    if profile_picture:
        profile_picture_url = profile_pic_processing(file=profile_picture, acc_id=user.account_id)
        updated_data["profile_img"] = profile_picture_url

    if user.first_time_login:
        updated_data["first_time_login"] = False

    update(db, user, updated_data)

    return {
        "message": "Update successful"
    }


def profile_pic_processing(file: UploadFile, acc_id: int) -> str:
    ext = Path(file.filename).suffix
    filename = f"{acc_id}{ext}"
    file_path = UPLOAD_DIR / filename

    for old_file in UPLOAD_DIR.glob(f"{acc_id}.*"):
        # in case of the existing file is different ext,
        # which may result in failed to overwrite, then we delete it
        if old_file.name != filename:
            old_file.unlink()

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return f"/profile-pics/{filename}"
