"""add synthetic id PK to lab_tests_raw

Revision ID: 7647971da67d
Revises: 7cad4a8cb904
Create Date: 2025-08-30 15:44:19.393238

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7647971da67d'
down_revision: Union[str, Sequence[str], None] = '7cad4a8cb904'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_constraint('lab_tests_raw_pkey', 'lab_tests_raw', type_='primary')
    # Add new column 'id' as BIGSERIAL
    # op.add_column('lab_tests_raw', sa.Column('id', sa.BigInteger(), nullable=False))
    op.execute("ALTER TABLE lab_tests_raw ADD COLUMN id BIGSERIAL PRIMARY KEY;")

def downgrade():
    op.drop_column('lab_tests_raw', 'id')