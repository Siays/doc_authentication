from sqlalchemy import Column, String, Date, DateTime, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from .database import Base

class Credential(Base):
    __tablename__ = "credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    doc_owner_name = Column(String, nullable=False) # can be useful when doing grouping
    doc_owner_ic = Column(String, nullable=False) # can be useful when doing grouping
    document_type = Column(String, nullable=False) # can be useful when doing grouping
    issuer_name = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)
    hash = Column(LargeBinary, nullable=False)
    signature = Column(LargeBinary, nullable=False)
    verification_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
