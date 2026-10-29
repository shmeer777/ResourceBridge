from datetime import datetime, timezone
from typing import Tuple

def now_utc() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)

def ensure_utc(dt: datetime) -> datetime:
    """Ensure datetime has UTC timezone."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def is_overlapping(start1: datetime, end1: datetime, start2: datetime, end2: datetime) -> bool:
    """Check if two time intervals overlap (start1 < end2 and end1 > start2)."""
    return start1 < end2 and end1 > start2

def format_iso(dt: datetime) -> str:
    """Format datetime as ISO string."""
    return dt.isoformat()
