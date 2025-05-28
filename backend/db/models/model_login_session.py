from sqlalchemy import Column, BigInteger, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base
from .model_staff_system_acc import StaffSystemAcc


class LoginSession(Base):
    __tablename__ = "login_session"

    id = Column(BigInteger, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("staff_system_acc.account_id", ondelete="CASCADE"), nullable=False)
    session_token = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    account = relationship("StaffSystemAcc")
