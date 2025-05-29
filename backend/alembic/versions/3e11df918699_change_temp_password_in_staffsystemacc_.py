"""change temp_password in StaffSystemAcc to first_time_login

Revision ID: 3e11df918699
Revises: 95553a31a5c7
Create Date: 2025-05-29 22:04:39.950300

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e11df918699'
down_revision: Union[str, None] = '95553a31a5c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op

def upgrade():
    op.alter_column('staff_system_acc', 'temp_password', new_column_name='first_time_login')

def downgrade():
    op.alter_column('staff_system_acc', 'first_time_login', new_column_name='temp_password')

