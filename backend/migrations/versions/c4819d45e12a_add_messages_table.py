"""add_messages_table

Revision ID: c4819d45e12a
Revises: b79102c918ef
Create Date: 2026-10-29 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4819d45e12a'
down_revision: Union[str, None] = 'b79102c918ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('booking_id', sa.String(length=36), sa.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_messages_booking_id', 'messages', ['booking_id'])
    op.create_index('ix_messages_sender_id', 'messages', ['sender_id'])


def downgrade() -> None:
    op.drop_index('ix_messages_sender_id', table_name='messages')
    op.drop_index('ix_messages_booking_id', table_name='messages')
    op.drop_table('messages')
