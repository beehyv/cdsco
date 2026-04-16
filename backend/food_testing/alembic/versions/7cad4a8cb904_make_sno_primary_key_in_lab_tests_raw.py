"""make sno primary key in lab_tests_raw

Revision ID: 7cad4a8cb904
Revises: b491ac9135a3
Create Date: 2025-08-30 15:18:40.153933

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7cad4a8cb904'
down_revision: Union[str, Sequence[str], None] = 'b491ac9135a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # drop old primary key on index
    op.drop_constraint('lab_tests_raw_pkey', 'lab_tests_raw', type_='primary')
    # set sno as primary key
    op.create_primary_key('lab_tests_raw_pkey', 'lab_tests_raw', ['sno'])

def downgrade():
    # revert back to index as primary key
    op.drop_constraint('lab_tests_raw_pkey', 'lab_tests_raw', type_='primary')
    op.create_primary_key('lab_tests_raw_pkey', 'lab_tests_raw', ['index'])