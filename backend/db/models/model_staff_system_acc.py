from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, BigInteger, func
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .model_staff import Staff

class StaffSystemAcc(Base):
    __tablename__ = "staff_system_acc"

    account_id = Column(BigInteger, primary_key=True, autoincrement=True)
    account_holder_name = Column(String(255), nullable=False)
    staff_id = Column(BigInteger, ForeignKey("staff.staff_id"), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=False)
    is_super = Column(Boolean, default=False, nullable=False)
    profile_img = Column(String(255), nullable=True)
    first_time_login = Column(Boolean, default=True, nullable=False)

    staff = relationship("Staff")

