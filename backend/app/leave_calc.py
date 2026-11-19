"""The working-days calculator: every Monday-to-Friday date in an inclusive range.

No public-holiday calendar and no half-days: every weekday counts as one whole
day, weekends are excluded entirely. Kept as a pure function so it is computed
once at submission and never recomputed from a later, possibly different,
calendar.
"""

from datetime import date, timedelta


def working_days_between(start: date, end: date) -> int:
    """Count Mon-Fri dates in [start, end]. 0 when end is before start or the
    range contains no weekday."""
    if end < start:
        return 0
    total_days = (end - start).days + 1
    full_weeks, remainder = divmod(total_days, 7)
    # Any 7 consecutive calendar days contain exactly 5 weekdays, whichever day
    # they start on.
    count = full_weeks * 5
    cursor = start + timedelta(days=full_weeks * 7)
    for _ in range(remainder):
        if cursor.weekday() < 5:  # Monday=0 .. Sunday=6
            count += 1
        cursor += timedelta(days=1)
    return count
