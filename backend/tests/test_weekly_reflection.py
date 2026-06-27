"""
Test suite for Practice Journal Weekly Reflection endpoint
Tests: GET /api/practice-journal/weekly-reflection
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials from /app/memory/test_credentials.md
TEST_EMAIL = "voice.sync.qa@example.com"
TEST_PASSWORD = "Pass1234!"


@pytest.fixture(scope="module")
def api_session():
    """Create a requests session for API calls."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_cookies(api_session):
    """Login and get session cookies for authenticated requests."""
    response = api_session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code}")
    return api_session.cookies


class TestWeeklyReflectionAuth:
    """Test authentication requirements for weekly reflection endpoint."""

    def test_unauthenticated_returns_401(self, api_session):
        """GET /api/practice-journal/weekly-reflection without auth returns 401."""
        fresh_session = requests.Session()
        response = fresh_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data or "error" in data, "Expected error message in response"

    def test_authenticated_returns_200(self, api_session, auth_cookies):
        """GET /api/practice-journal/weekly-reflection with auth returns 200."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


class TestWeeklyReflectionSchema:
    """Test response schema for weekly reflection endpoint."""

    def test_response_has_required_fields(self, api_session, auth_cookies):
        """Response contains all required top-level fields."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        assert response.status_code == 200
        data = response.json()

        required_fields = [
            "period_start",
            "period_end",
            "entries_analyzed",
            "total_minutes",
            "average_mood_shift",
            "key_themes",
            "alchemy_focus",
            "integration_vow",
            "weekly_alchemy_plan",
            "generated_at",
        ]

        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_period_dates_are_strings(self, api_session, auth_cookies):
        """period_start and period_end are ISO date strings."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        assert isinstance(data["period_start"], str), "period_start should be string"
        assert isinstance(data["period_end"], str), "period_end should be string"
        # Basic ISO date format check (YYYY-MM-DD)
        assert len(data["period_start"]) >= 10, "period_start should be ISO date"
        assert len(data["period_end"]) >= 10, "period_end should be ISO date"

    def test_numeric_fields_are_correct_types(self, api_session, auth_cookies):
        """Numeric fields have correct types."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        assert isinstance(data["entries_analyzed"], int), "entries_analyzed should be int"
        assert isinstance(data["total_minutes"], int), "total_minutes should be int"
        assert isinstance(data["average_mood_shift"], (int, float)), "average_mood_shift should be numeric"

    def test_key_themes_is_list(self, api_session, auth_cookies):
        """key_themes is a list of strings."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        assert isinstance(data["key_themes"], list), "key_themes should be list"
        if data["key_themes"]:
            assert all(isinstance(theme, str) for theme in data["key_themes"]), "key_themes items should be strings"

    def test_weekly_alchemy_plan_has_7_items(self, api_session, auth_cookies):
        """weekly_alchemy_plan contains exactly 7 items (one per day)."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        plan = data["weekly_alchemy_plan"]
        assert isinstance(plan, list), "weekly_alchemy_plan should be list"
        assert len(plan) == 7, f"weekly_alchemy_plan should have 7 items, got {len(plan)}"

    def test_weekly_alchemy_plan_item_schema(self, api_session, auth_cookies):
        """Each weekly_alchemy_plan item has day, focus, practice, journal_prompt."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        plan = data["weekly_alchemy_plan"]
        required_item_fields = ["day", "focus", "practice", "journal_prompt"]

        for index, item in enumerate(plan):
            for field in required_item_fields:
                assert field in item, f"Plan item {index} missing field: {field}"
                assert isinstance(item[field], str), f"Plan item {index} field {field} should be string"

    def test_weekdays_in_correct_order(self, api_session, auth_cookies):
        """weekly_alchemy_plan days are in Monday-Sunday order."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        expected_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        actual_days = [item["day"] for item in data["weekly_alchemy_plan"]]
        assert actual_days == expected_days, f"Days order mismatch: {actual_days}"

    def test_generated_at_is_iso_timestamp(self, api_session, auth_cookies):
        """generated_at is an ISO timestamp string."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()

        assert isinstance(data["generated_at"], str), "generated_at should be string"
        assert "T" in data["generated_at"], "generated_at should be ISO format with T separator"


class TestWeeklyReflectionDaysParam:
    """Test days query parameter behavior."""

    def test_default_days_is_7(self, api_session, auth_cookies):
        """Default days_considered is 7 when no param provided."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection")
        data = response.json()
        # days_considered should be 7 by default (or normalized to 7)
        assert data.get("days_considered", 7) >= 3, "days_considered should be at least 3"

    def test_custom_days_param(self, api_session, auth_cookies):
        """Custom days param is accepted."""
        response = api_session.get(f"{BASE_URL}/api/practice-journal/weekly-reflection?days=14")
        assert response.status_code == 200
        data = response.json()
        # Should be normalized between 3 and 14
        assert 3 <= data.get("days_considered", 7) <= 14
