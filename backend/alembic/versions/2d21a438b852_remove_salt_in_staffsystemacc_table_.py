"""remove salt in staffsystemacc table (using argon2id)

Revision ID: 2d21a438b852
Revises: 177dd8111886
Create Date: 2025-05-26 19:37:52.581510

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d21a438b852'
down_revision: Union[str, None] = '177dd8111886'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('staff_system_acc', 'password_salt')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('staff_system_acc', sa.Column('password_salt', sa.VARCHAR(length=255), autoincrement=False, nullable=False))
    # ### end Alembic commands ###
