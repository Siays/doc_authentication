from datetime import datetime

from fastapi import APIRouter, Form, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db.database import get_db
from password_processor import pw_processor
from db.models.staff_system_acc import StaffSystemAcc
from db.crud import get_by_column, create, remove, get
from db.models.login_session import LoginSession
import uuid

router = APIRouter()


@router.post("/login")
def login(email: str = Form(...),
          password: str = Form(...),
          db: Session = Depends(get_db)):

    user = get_by_column(db, StaffSystemAcc, "email", email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Verify password using your pw_processor's verify function
    valid = pw_processor.verify_password(password, user.password_hash)
    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    session_token = uuid.uuid4()
    record_data = {
        "account_id": user.account_id,
        "session_token":session_token,
        "created_at": datetime.utcnow()
    }

    print("Input password:", password)
    print("Stored hash:", user.password_hash)
    print("Password valid?", pw_processor.verify_password(password, user.password_hash))

    create(db, LoginSession, record_data)

    response = JSONResponse(content={"success": True, "account_id": user.account_id})

    response.set_cookie(
        key="session_token",
        value=str(session_token),
        httponly=True,
    )

    return response


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")

    if token:
        session = get_by_column(db, LoginSession, "session_token", token)
        if session:
            remove(db, LoginSession, session.id)

    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("session_token")
    return response


@router.get("/user")
def get_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = get_by_column(db, LoginSession, "session_token", token)

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = get(db, StaffSystemAcc, session.account_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "account_id": user.account_id,
        "email": user.email,
        "account_holder_name": user.account_holder_name,
        "profile_picture": user.profile_img,
        "is_super": user.is_super
    }
