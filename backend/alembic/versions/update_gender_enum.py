"""update gender enum values

Revision ID: update_gender_enum
Revises: 5bc2094d55de
Create Date: 2024-03-26

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'update_gender_enum'
down_revision: Union[str, None] = '5bc2094d55de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Update gender_enum values to use proper capitalization."""
    # Create a new enum type
    op.execute("ALTER TYPE gender_enum RENAME TO gender_enum_old")
    op.execute("CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other')")
    
    # Update the column to use the new type
    op.execute("ALTER TABLE staff ALTER COLUMN gender TYPE gender_enum USING gender::text::gender_enum")
    
    # Drop the old type
    op.execute("DROP TYPE gender_enum_old")


def downgrade() -> None:
    """Revert gender_enum values back to uppercase."""
    # Create a new enum type
    op.execute("ALTER TYPE gender_enum RENAME TO gender_enum_old")
    op.execute("CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER')")
    
    # Update the column to use the new type
    op.execute("ALTER TABLE staff ALTER COLUMN gender TYPE gender_enum USING gender::text::gender_enum")
    
    # Drop the old type
    op.execute("DROP TYPE gender_enum_old") 