"""
Test Daily Guidance Enriched Fields - Iteration 184
Tests for enriched daily guidance fields: daily_ally, daily_angel, dragon_astrology_reflection,
daily_journal_prompts, ceremonial_affirmation, unified_daily_flow
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials from test_credentials.md
QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def authenticated_client(api_client):
    """Session with auth cookie for authenticated endpoints"""
    response = api_client.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": QA_EMAIL, "password": QA_PASSWORD},
    )
    if response.status_code != 200:
        pytest.skip("Authentication failed - skipping authenticated tests")
    return api_client


class TestPublicDailyPracticeEndpoint:
    """Tests for GET /api/daily-practice (public endpoint)"""

    def test_daily_practice_returns_200(self, api_client):
        """Verify /api/daily-practice returns 200"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: /api/daily-practice returns 200")

    def test_daily_practice_has_daily_ally(self, api_client):
        """Verify daily_ally field is present with name"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        assert "daily_ally" in data, "daily_ally field missing"
        assert data["daily_ally"] is not None, "daily_ally is None"
        assert "name" in data["daily_ally"], "daily_ally.name missing"
        print(f"PASSED: daily_ally present - {data['daily_ally']['name']}")

    def test_daily_practice_has_daily_angel(self, api_client):
        """Verify daily_angel field is present with name"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        assert "daily_angel" in data, "daily_angel field missing"
        assert data["daily_angel"] is not None, "daily_angel is None"
        assert "name" in data["daily_angel"], "daily_angel.name missing"
        print(f"PASSED: daily_angel present - {data['daily_angel']['name']}")

    def test_daily_practice_has_dragon_astrology_reflection(self, api_client):
        """Verify dragon_astrology_reflection field is present"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        assert "dragon_astrology_reflection" in data, "dragon_astrology_reflection missing"
        reflection = data["dragon_astrology_reflection"]
        assert reflection is not None, "dragon_astrology_reflection is None"
        assert "title" in reflection, "dragon_astrology_reflection.title missing"
        assert "summary" in reflection, "dragon_astrology_reflection.summary missing"
        assert "integration_prompt" in reflection, "dragon_astrology_reflection.integration_prompt missing"
        print(f"PASSED: dragon_astrology_reflection present - {reflection['title']}")

    def test_daily_practice_has_daily_journal_prompts(self, api_client):
        """Verify daily_journal_prompts is a non-empty list"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        assert "daily_journal_prompts" in data, "daily_journal_prompts missing"
        prompts = data["daily_journal_prompts"]
        assert isinstance(prompts, list), "daily_journal_prompts should be a list"
        assert len(prompts) >= 3, f"Expected at least 3 prompts, got {len(prompts)}"
        print(f"PASSED: daily_journal_prompts has {len(prompts)} prompts")

    def test_daily_practice_has_ceremonial_affirmation(self, api_client):
        """Verify ceremonial_affirmation is present and non-empty"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        assert "ceremonial_affirmation" in data, "ceremonial_affirmation missing"
        affirmation = data["ceremonial_affirmation"]
        assert affirmation, "ceremonial_affirmation is empty"
        assert len(affirmation) > 10, "ceremonial_affirmation too short"
        print(f"PASSED: ceremonial_affirmation present - {affirmation[:50]}...")

    def test_daily_practice_has_unified_daily_flow(self, api_client):
        """Verify unified_daily_flow is present with ceremony_steps"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        assert "unified_daily_flow" in data, "unified_daily_flow missing"
        flow = data["unified_daily_flow"]
        assert flow is not None, "unified_daily_flow is None"
        assert "title" in flow, "unified_daily_flow.title missing"
        assert "ceremony_steps" in flow, "unified_daily_flow.ceremony_steps missing"
        steps = flow["ceremony_steps"]
        assert isinstance(steps, list), "ceremony_steps should be a list"
        assert len(steps) >= 3, f"Expected at least 3 ceremony steps, got {len(steps)}"
        print(f"PASSED: unified_daily_flow has {len(steps)} ceremony steps")

    def test_daily_practice_unified_flow_structure(self, api_client):
        """Verify unified_daily_flow has all required fields"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice")
        data = response.json()
        flow = data.get("unified_daily_flow", {})
        
        required_fields = ["title", "opening_invocation", "ceremony_steps", "dragon_integration", "closing_benediction", "journal_prompt"]
        for field in required_fields:
            assert field in flow, f"unified_daily_flow.{field} missing"
        
        # Check ceremony step structure
        for step in flow.get("ceremony_steps", []):
            assert "step_id" in step, "ceremony step missing step_id"
            assert "title" in step, "ceremony step missing title"
            assert "instruction" in step, "ceremony step missing instruction"
            assert "duration_minutes" in step, "ceremony step missing duration_minutes"
        
        print("PASSED: unified_daily_flow has complete structure")

    def test_daily_practice_focus_refresh(self, api_client):
        """Verify focus parameter works for filtering"""
        response = api_client.get(f"{BASE_URL}/api/daily-practice", params={"focus": "heart"})
        assert response.status_code == 200, f"Focus filter failed with {response.status_code}"
        data = response.json()
        # Should still have all enriched fields
        assert "daily_ally" in data
        assert "unified_daily_flow" in data
        print("PASSED: Focus refresh works with enriched fields")


class TestAuthenticatedDashboardDaily:
    """Tests for GET /api/dashboard/daily (authenticated endpoint)"""

    def test_dashboard_daily_returns_200(self, authenticated_client):
        """Verify /api/dashboard/daily returns 200 for authenticated user"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: /api/dashboard/daily returns 200")

    def test_dashboard_daily_has_greeting(self, authenticated_client):
        """Verify personalized greeting is present"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "greeting" in data, "greeting field missing"
        assert "Blessed day" in data["greeting"], "greeting should contain 'Blessed day'"
        print(f"PASSED: greeting present - {data['greeting']}")

    def test_dashboard_daily_has_daily_ally(self, authenticated_client):
        """Verify daily_ally field is present"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "daily_ally" in data, "daily_ally field missing"
        if data["daily_ally"]:
            assert "name" in data["daily_ally"], "daily_ally.name missing"
            print(f"PASSED: daily_ally present - {data['daily_ally']['name']}")
        else:
            print("PASSED: daily_ally field present (None - may be expected)")

    def test_dashboard_daily_has_daily_angel(self, authenticated_client):
        """Verify daily_angel field is present"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "daily_angel" in data, "daily_angel field missing"
        if data["daily_angel"]:
            assert "name" in data["daily_angel"], "daily_angel.name missing"
            print(f"PASSED: daily_angel present - {data['daily_angel']['name']}")
        else:
            print("PASSED: daily_angel field present (None - may be expected)")

    def test_dashboard_daily_has_dragon_astrology_reflection(self, authenticated_client):
        """Verify dragon_astrology_reflection field is present"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "dragon_astrology_reflection" in data, "dragon_astrology_reflection missing"
        reflection = data["dragon_astrology_reflection"]
        assert reflection is not None, "dragon_astrology_reflection is None"
        assert "title" in reflection, "dragon_astrology_reflection.title missing"
        print(f"PASSED: dragon_astrology_reflection present - {reflection['title']}")

    def test_dashboard_daily_has_daily_journal_prompts(self, authenticated_client):
        """Verify daily_journal_prompts is present"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "daily_journal_prompts" in data, "daily_journal_prompts missing"
        prompts = data["daily_journal_prompts"]
        assert isinstance(prompts, list), "daily_journal_prompts should be a list"
        assert len(prompts) >= 3, f"Expected at least 3 prompts, got {len(prompts)}"
        print(f"PASSED: daily_journal_prompts has {len(prompts)} prompts")

    def test_dashboard_daily_has_ceremonial_affirmation(self, authenticated_client):
        """Verify ceremonial_affirmation is present"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "ceremonial_affirmation" in data, "ceremonial_affirmation missing"
        assert data["ceremonial_affirmation"], "ceremonial_affirmation is empty"
        print(f"PASSED: ceremonial_affirmation present")

    def test_dashboard_daily_has_unified_daily_flow(self, authenticated_client):
        """Verify unified_daily_flow is present with ceremony_steps"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/daily")
        data = response.json()
        assert "unified_daily_flow" in data, "unified_daily_flow missing"
        flow = data["unified_daily_flow"]
        assert flow is not None, "unified_daily_flow is None"
        assert "title" in flow, "unified_daily_flow.title missing"
        assert "ceremony_steps" in flow, "unified_daily_flow.ceremony_steps missing"
        steps = flow["ceremony_steps"]
        assert len(steps) >= 3, f"Expected at least 3 ceremony steps, got {len(steps)}"
        print(f"PASSED: unified_daily_flow has {len(steps)} ceremony steps")

    def test_dashboard_daily_unauthenticated_returns_401(self, api_client):
        """Verify /api/dashboard/daily returns 401 without auth"""
        # Use a fresh session without cookies
        fresh_session = requests.Session()
        response = fresh_session.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASSED: /api/dashboard/daily returns 401 without auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
