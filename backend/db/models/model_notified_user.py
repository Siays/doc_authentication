from sqlalchemy import Column, DateTime, ForeignKey, BigInteger, Boolean
from datetime import datetime
from ..database import Base


class NotifiedUser(Base):
    __tablename__ = "notified_user"

    notified_id = Column(BigInteger, primary_key=True, autoincrement=True)
    account_id = Column(BigInteger, ForeignKey('staff_system_acc.account_id'), nullable=False)
    notification_id = Column(BigInteger, ForeignKey('notification.notification_id'), nullable=False)
    has_read = Column(Boolean, default=False)
    notified_at = Column(DateTime(timezone=True), default=datetime.utcnow)