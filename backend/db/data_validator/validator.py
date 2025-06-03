from email_validator import validate_email as email_validator, EmailNotValidError
from fastapi import HTTPException, UploadFile
from pathlib import Path


def validate_email(email: str) -> bool:
    try:
        valid = email_validator(email)
        if not valid.normalized.endswith("@example.com"):
            raise ValueError()
    except (EmailNotValidError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid email. Must end with '@example.com'.")

    return True


def validate_password(password: str) -> bool:
    if len(password) <= 4:
        raise HTTPException(status_code=400, detail="Password must be longer than 4 characters.")
    return True


def validate_profile_pic_ext(file: UploadFile) -> bool:
    allowed_file_ext = {".png", ".jpeg", ".jpg"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_file_ext:
        raise HTTPException(status_code=400, detail="Only PNG and JPG files are allowed.")

    return True


def validate_name(name: str) -> bool:
    return name.isalpha()

