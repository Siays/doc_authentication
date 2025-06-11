from sqlalchemy import Column, DateTime, BigInteger, String, func
from ..database import Base


class Notification(Base):
    __tablename__ = "notification"

    notification_id = Column(BigInteger, primary_key=True, autoincrement=True)
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
