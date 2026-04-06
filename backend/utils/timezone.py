"""
Timezone utilities for Skapeta Apartments (Albania)
"""
from datetime import datetime, timezone
import pytz

# Albania timezone (Europe/Tirane) - UTC+1 (UTC+2 during DST)
ALBANIA_TZ = pytz.timezone('Europe/Tirane')

def now_albania():
    """Get current time in Albania timezone"""
    return datetime.now(ALBANIA_TZ)

def utc_to_albania(utc_dt):
    """Convert UTC datetime to Albania timezone"""
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    return utc_dt.astimezone(ALBANIA_TZ)

def albania_to_utc(albania_dt):
    """Convert Albania timezone to UTC"""
    return albania_dt.astimezone(timezone.utc)

def get_today_range_albania():
    """Get today's date range in Albania timezone (for daily reports)"""
    now = now_albania()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    return albania_to_utc(today_start), albania_to_utc(today_end)
