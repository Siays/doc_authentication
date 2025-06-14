from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Form, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db.database import get_db
from password_processor import pw_processor
from db.models.model_staff_system_acc import StaffSystemAcc
from db.crud import get_by_column, create, remove, get
from db.models.model_login_session import LoginSession
import uuid

router = APIRouter()


@router.post("/login")
def login(email: str = Form(...),
          password: str = Form(...),
          remember_me: bool = Form(...),
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
    }

    print("Input password:", password)
    print("Stored hash:", user.password_hash)
    print("Password valid?", pw_processor.verify_password(password, user.password_hash))

    create(db, LoginSession, record_data)

    response = JSONResponse(content={"success": True, "account_id": user.account_id})

    max_age = None

    if remember_me:
        max_age = 60*60*10

    response.set_cookie(
        key="session_token",
        value=str(session_token),
        max_age = max_age,
        samesite="lax",
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

    profile_picture = user.profile_img
    if profile_picture:
        filepath = Path("uploads/users_profile_pic") / Path(profile_picture).name
        """
        Appending a timestamp to force the browser to reload the latest version of the
        profile picture rather than using a cached one. This is needed because when a user
        uploads a new profile picture, it replaces the old one at the same URL.
        Without the timestamp, the browser may continue using the cached version,
        causing the user to see the old picture.
        
        const profilePictureURL = user?.profile_picture
            ? `${user.profile_picture}?t=${new Date().getTime()}`
            : null;
        
        This was previously done in the frontend, however if it is done in frontend, on every navigation
        to other route, it keep repeatedly fetch the profile pic, can cause inefficient below:
            1. Unnecessary Network Traffic
            2. Increased Backend Load 
            3. Memory & Resource Waste in Browser
        """
        version = int(filepath.stat().st_mtime) if filepath.exists() else 0
        profile_picture = f"{profile_picture}?v={version}"



    return {
        "account_id": user.account_id,
        "first_time_login":user.first_time_login,
        "email": user.email,
        "account_holder_name": user.account_holder_name,
        "profile_picture": profile_picture,
        "is_super": user.is_super
    }


@router.post("/check-old-password")
def get_old_password(email: str = Form(...),
                     password: str = Form(...),
                     db: Session = Depends(get_db)):
    user = get_by_column(db, StaffSystemAcc, "email", email)

    if not pw_processor.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect"
        )

