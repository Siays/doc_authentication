"""staff_id type change UUID to bigint

Revision ID: 3efa05ef5bf3
Revises: add_staff_relationship
Create Date: 2025-05-26 16:25:36.239615

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3efa05ef5bf3'
down_revision: Union[str, None] = 'add_staff_relationship'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_constraint('fk_document_records_issuer', 'document_records', type_='foreignkey')
    op.drop_constraint('staff_pkey', 'staff', type_='primary')

    op.drop_column('staff', 'staff_id')
    op.add_column('staff', sa.Column('staff_id', sa.BigInteger(), autoincrement=True, nullable=False))
    op.create_primary_key('staff_pkey', 'staff', ['staff_id'])

    # ✅ Safely replace issuer_id with correct type
    op.drop_column('document_records', 'issuer_id')
    op.add_column('document_records', sa.Column('issuer_id', sa.BigInteger(), nullable=False))

    op.create_foreign_key(
        'fk_document_records_issuer',
        'document_records',
        'staff',
        ['issuer_id'],
        ['staff_id']
    )



def downgrade():
    op.drop_constraint('fk_document_records_issuer', 'document_records', type_='foreignkey')
    op.drop_constraint('staff_pkey', 'staff', type_='primary')
    op.drop_column('staff', 'staff_id')

    op.add_column('staff', sa.Column('staff_id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True))
    op.create_foreign_key(
        'fk_document_records_issuer',
        'document_records',
        'staff',
        ['issuer_id'],
        ['staff_id']
    )

