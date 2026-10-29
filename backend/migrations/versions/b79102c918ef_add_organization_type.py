"""add_organization_type

Revision ID: b79102c918ef
Revises: a86995d23d6d
Create Date: 2026-10-29 16:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b79102c918ef'
down_revision: Union[str, None] = 'a86995d23d6d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('organization_type', sa.String(length=100), nullable=True))
    op.add_column('organizations', sa.Column('organization_type', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('organizations', 'organization_type')
    op.drop_column('users', 'organization_type')

