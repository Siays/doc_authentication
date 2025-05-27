from sqlalchemy import Column, String, Date, DateTime, LargeBinary, ForeignKey, BigInteger, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..database import Base
from .staff_system_acc import StaffSystemAcc

class DocumentRecord(Base):
    __tablename__ = "document_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    doc_owner_name = Column(String, nullable=False) # can be useful when doing grouping
    doc_owner_ic = Column(String, nullable=False) # can be useful when doing grouping
    document_type = Column(String, nullable=False) # can be useful when doing grouping

    # Issuer relationship
    issuer_id = Column(BigInteger, ForeignKey('staff_system_acc.account_id'), nullable=False)
    issuer_name = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)

    hash = Column(LargeBinary, nullable=False)
    signature = Column(LargeBinary, nullable=False)
    verification_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    issuer = relationship("StaffSystemAcc")

    __table_args__ = (
        Index("ix_document_records_doc_owner", "doc_owner_name", "doc_owner_ic"),
    )