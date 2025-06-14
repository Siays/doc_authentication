"""Add default to login_session.created_at

Revision ID: b9dac970a2a4
Revises: cb30fa148b7b
Create Date: 2025-06-11 15:06:08.625335

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9dac970a2a4'
down_revision: Union[str, None] = 'cb30fa148b7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_deleted_document_doc_owner', table_name='deleted_document')
    op.create_index('ix_deleted_document_doc_owner', 'deleted_document', ['deleted_by'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_deleted_document_doc_owner', table_name='deleted_document')
    op.create_index('ix_deleted_document_doc_owner', 'deleted_document', ['doc_owner_ic'], unique=False)
    # ### end Alembic commands ###
