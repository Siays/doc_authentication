"""initial schema

Revision ID: initial_schema
Revises: 
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create staff table
    op.create_table(
        'staff',
        sa.Column('staff_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('ic_no', sa.String(20), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('gender', sa.Enum('Male', 'Female', 'Other', name='gender_enum'), nullable=False),
        sa.Column('job_title', sa.String(100), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
    )
    op.create_index(op.f('ix_staff_email'), 'staff', ['email'], unique=True)

    # Create document_records table
    op.create_table(
        'document_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('doc_owner_name', sa.String(), nullable=False),
        sa.Column('doc_owner_ic', sa.String(), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('issuer_name', sa.String(), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('hash', sa.LargeBinary(), nullable=False),
        sa.Column('signature', sa.LargeBinary(), nullable=False),
        sa.Column('verification_url', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    op.create_index(op.f('ix_document_records_id'), 'document_records', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_document_records_id'), table_name='document_records')
    op.drop_table('document_records')
    op.drop_index(op.f('ix_staff_email'), table_name='staff')
    op.drop_table('staff')
    op.execute('DROP TYPE gender_enum') 