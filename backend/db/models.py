from sqlalchemy import Column, String, Date, DateTime, LargeBinary, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .database import Base

class DocumentRecord(Base):
    __tablename__ = "document_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    doc_owner_name = Column(String, nullable=False) # can be useful when doing grouping
    doc_owner_ic = Column(String, nullable=False) # can be useful when doing grouping
    document_type = Column(String, nullable=False) # can be useful when doing grouping
    
    # Issuer relationship
    issuer_id = Column(UUID(as_uuid=True), ForeignKey('staff.staff_id'), nullable=False)
    issuer_name = Column(String, nullable=False)  # Denormalized field for historical record
    issuer = relationship("Staff", back_populates="issued_documents")
    
    issue_date = Column(Date, nullable=False)
    hash = Column(LargeBinary, nullable=False)
    signature = Column(LargeBinary, nullable=False)
    verification_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
