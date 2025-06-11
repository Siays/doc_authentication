from sqlalchemy import Column, String, Date, DateTime, LargeBinary, ForeignKey, BigInteger, Index, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..database import Base
from .model_staff_system_acc import StaffSystemAcc
from .model_owner import Owner

class DocumentRecord(Base):
    __tablename__ = "document_record"

    doc_record_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    doc_owner_name = Column(String, nullable=False)  # can be useful when doing grouping
    doc_owner_ic = Column(String, ForeignKey('owner.owner_ic_no'), nullable=False, index=True)  # can be useful when doing grouping
    document_type = Column(String, nullable=False)  # can be useful when doing grouping

    # Issuer relationship
    issuer_id = Column(BigInteger, ForeignKey('staff_system_acc.account_id'), nullable=False)
    issuer_name = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)

    hash = Column(LargeBinary, nullable=False)
    signature = Column(LargeBinary, nullable=False)
    verification_url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False)

    # soft delete
    is_deleted = Column(Boolean, default=False)
    deleted_by = Column(BigInteger, ForeignKey('staff_system_acc.account_id'), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    issuer = relationship("StaffSystemAcc", foreign_keys=[issuer_id])
    deleted_by_user = relationship("StaffSystemAcc", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("ix_document_records_doc_owner", "doc_owner_name", "doc_owner_ic"),
        Index("ix_document_record_is_deleted", "is_deleted"),
    )
