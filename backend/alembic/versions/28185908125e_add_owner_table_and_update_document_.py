"""add owner table and update document_record table v2

Revision ID: [GENERATED_ID]
Revises: 3e11df918699
Create Date: [GENERATED_DATE]

"""
from typing import Sequence, Union
from sqlalchemy.dialects.postgresql import ENUM
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '[GENERATED_ID]'  # This will be auto-generated
down_revision: Union[str, None] = '3e11df918699'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum only if it doesn't exist
    connection = op.get_bind()

    # Check if enum exists
    enum_exists = connection.execute(
        sa.text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum')")
    ).scalar()

    if not enum_exists:
        gender_enum = ENUM('Male', 'Female', name='gender_enum')
        gender_enum.create(connection)

    op.create_table('owner',
        sa.Column('owner_ic_no', sa.String(length=14), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('gender', postgresql.ENUM('Male', 'Female', name='gender_enum', create_type=False), nullable=False),
        sa.Column('nationality', sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint('owner_ic_no'),
        sa.UniqueConstraint('email')
    )

    op.create_table('document_record',
        sa.Column('doc_record_id', sa.UUID(), nullable=False),
        sa.Column('doc_owner_name', sa.String(), nullable=False),
        sa.Column('doc_owner_ic', sa.String(), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('issuer_id', sa.BigInteger(), nullable=False),
        sa.Column('issuer_name', sa.String(), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('hash', sa.LargeBinary(), nullable=False),
        sa.Column('signature', sa.LargeBinary(), nullable=False),
        sa.Column('verification_url', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['doc_owner_ic'], ['owner.owner_ic_no']),
        sa.ForeignKeyConstraint(['issuer_id'], ['staff_system_acc.account_id']),
        sa.PrimaryKeyConstraint('doc_record_id')
    )

    # Drop old table and indexes first (if they exist)
    try:
        op.drop_index('ix_document_records_doc_owner', table_name='document_records')
    except Exception:
        pass  # Index might not exist

    try:
        op.drop_index('ix_document_records_id', table_name='document_records')
    except Exception:
        pass  # Index might not exist

    try:
        op.drop_table('document_records')
    except Exception:
        pass  # Table might not exist

    # Create new indexes (check if they don't already exist)
    connection = op.get_bind()

    # Check and create indexes only if they don't exist
    existing_indexes = connection.execute(
        sa.text("SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'document_record'")
    ).fetchall()
    existing_index_names = [row[0] for row in existing_indexes]

    if 'ix_document_record_doc_owner_ic' not in existing_index_names:
        op.create_index(op.f('ix_document_record_doc_owner_ic'), 'document_record', ['doc_owner_ic'], unique=False)

    if 'ix_document_record_doc_record_id' not in existing_index_names:
        op.create_index(op.f('ix_document_record_doc_record_id'), 'document_record', ['doc_record_id'], unique=False)

    if 'ix_document_records_doc_owner' not in existing_index_names:
        op.create_index('ix_document_records_doc_owner', 'document_record', ['doc_owner_name', 'doc_owner_ic'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.create_table('document_records',
        sa.Column('id', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column('doc_owner_name', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('doc_owner_ic', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('document_type', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('issuer_name', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('issue_date', sa.DATE(), autoincrement=False, nullable=False),
        sa.Column('hash', postgresql.BYTEA(), autoincrement=False, nullable=False),
        sa.Column('signature', postgresql.BYTEA(), autoincrement=False, nullable=False),
        sa.Column('verification_url', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.Column('updated_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.Column('issuer_id', sa.BIGINT(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['issuer_id'], ['staff_system_acc.account_id'], name='document_records_issuer_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='document_records_pkey')
    )
    op.create_index('ix_document_records_id', 'document_records', ['id'], unique=False)
    op.create_index('ix_document_records_doc_owner', 'document_records', ['doc_owner_name', 'doc_owner_ic'], unique=False)
    op.drop_index('ix_document_records_doc_owner', table_name='document_record')
    op.drop_index(op.f('ix_document_record_doc_record_id'), table_name='document_record')
    op.drop_index(op.f('ix_document_record_doc_owner_ic'), table_name='document_record')
    op.drop_table('document_record')
    op.drop_table('owner')
    # Note: Not dropping the gender_enum type since it might be used by other tables