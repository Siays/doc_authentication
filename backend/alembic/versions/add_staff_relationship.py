"""add staff relationship

Revision ID: add_staff_relationship
Revises: update_gender_enum
Create Date: 2024-03-26

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_staff_relationship'
down_revision: Union[str, None] = 'update_gender_enum'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add issuer_id column
    op.add_column('document_records',
        sa.Column('issuer_id', postgresql.UUID(as_uuid=True), nullable=True)
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_document_records_issuer',
        'document_records', 'staff',
        ['issuer_id'], ['staff_id']
    )
    
    # Make issuer_id not nullable after adding the constraint
    op.alter_column('document_records', 'issuer_id',
        nullable=False,
    )


def downgrade() -> None:
    # Remove foreign key constraint
    op.drop_constraint(
        'fk_document_records_issuer',
        'document_records',
        type_='foreignkey'
    )
    
    # Remove issuer_id column
    op.drop_column('document_records', 'issuer_id') 