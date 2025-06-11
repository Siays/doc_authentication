from sqlalchemy import Column, String, Date, DateTime, ForeignKey, BigInteger, Index
from sqlalchemy.sql import func
from datetime import datetime
from ..database import Base
from .model_staff_system_acc import StaffSystemAcc
from .model_owner import Owner

class DeletedDocument(Base):
    __tablename__ = "deleted_document"

    deleted_doc_id = Column(BigInteger, primary_key=True)
    doc_owner_ic = Column(String, ForeignKey('owner.owner_ic_no'), nullable=False, index=True)
    document_type = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)
    # Issuer relationship
    deleted_by = Column(BigInteger, ForeignKey('staff_system_acc.account_id'), nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_deleted_document_doc_owner_ic", "doc_owner_ic"),
        Index("ix_deleted_document_deleted_by", "deleted_by"),
    )

