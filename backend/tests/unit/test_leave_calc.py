"""The working-days calculator: AC-011, AC-012."""

from datetime import date

from app.leave_calc import working_days_between


def test_ac011_weekend_spanning_range_excludes_saturday_and_sunday() -> None:
    # Monday 2026-11-23 .. Sunday 2026-11-29: 5 weekdays, 2 weekend days excluded.
    assert working_days_between(date(2026, 11, 23), date(2026, 11, 29)) == 5


def test_ac011_single_weekday_counts_as_one() -> None:
    # A single Wednesday.
    assert working_days_between(date(2026, 11, 18), date(2026, 11, 18)) == 1


def test_ac011_saturday_to_sunday_range_has_no_weekday() -> None:
    assert working_days_between(date(2026, 11, 21), date(2026, 11, 22)) == 0


def test_ac012_full_week_counts_five_regardless_of_start_day() -> None:
    # Any 7 consecutive days contain exactly 5 weekdays.
    assert working_days_between(date(2026, 11, 19), date(2026, 11, 25)) == 5


def test_end_before_start_counts_zero() -> None:
    assert working_days_between(date(2026, 11, 20), date(2026, 11, 18)) == 0
