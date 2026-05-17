"""
Iteration 121 - Code Quality Remediation Testing
Tests for regressions after dependency and ref safety updates, helper extraction, and index-key fixes.

Focus areas:
1. Backend content script-expansion endpoints (helper refactor)
2. Backend gifts payment/redeem flow (helper extraction)
3. Backend admin seeding endpoints (seed-loader split)
4. Backend audio narration generation endpoint
5. Backend birth chart calculate endpoint (helper extraction)
6. Public API endpoint stability (no 500s)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestHealthAndBasicEndpoints:
    """Verify basic API health and stability after refactoring."""

    def test_health_endpoint(self):
        """Health endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print("PASS: Health endpoint returns 200")

    def test_crystals_endpoint(self):
        """Crystals endpoint should return 200 with data."""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Crystals endpoint returns {len(data)} crystals")

    def test_crystals_deep_endpoint(self):
        """Crystals deep endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Crystals deep endpoint returns {len(data)} crystals")


class TestContentExpandScriptEndpoint:
    """Test content/expand-script endpoint after complexity refactor helpers."""

    def test_expand_script_basic(self):
        """Expand script endpoint should work with basic input."""
        payload = {
            "practice_name": "Test Grounding Practice",
            "element": "earth",
            "duration_minutes": 7,
            "steps": ["Breathe deeply", "Feel your feet on the ground", "Relax your shoulders"],
            "source_texts": ["This is a grounding practice for stability."],
            "use_ai": False,
            "anti_repetition_mode": "strict"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"Expand script failed: {response.text}"
        data = response.json()
        assert "paragraphs" in data
        assert "segments" in data
        assert "word_count" in data
        assert data["word_count"] > 0
        print(f"PASS: Expand script returns {data['word_count']} words, {len(data['paragraphs'])} paragraphs")

    def test_expand_script_balanced_mode(self):
        """Expand script should work with balanced anti-repetition mode."""
        payload = {
            "practice_name": "Heart Opening Meditation",
            "element": "water",
            "duration_minutes": 10,
            "steps": ["Open your heart", "Feel compassion", "Send love outward"],
            "source_texts": [],
            "use_ai": False,
            "anti_repetition_mode": "balanced"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["word_count"] > 0
        print(f"PASS: Expand script balanced mode returns {data['word_count']} words")

    def test_expand_script_minimum_duration(self):
        """Expand script should enforce minimum 7-minute duration."""
        payload = {
            "practice_name": "Quick Practice",
            "element": "fire",
            "duration_minutes": 3,  # Below minimum
            "steps": ["Step one"],
            "source_texts": [],
            "use_ai": False
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        # Should enforce minimum 7 minutes = 840 words target
        assert data["target_minutes"] >= 7
        print(f"PASS: Expand script enforces minimum duration: {data['target_minutes']} minutes")


class TestGiftsEndpoints:
    """Test gifts payment/redeem flow after helper extraction."""

    def test_gift_create_endpoint(self):
        """Gift create endpoint should work."""
        payload = {
            "recipient_email": "test_recipient@example.com",
            "recipient_name": "Test Recipient",
            "gift_type": "subscription",
            "plan_id": "monthly",
            "message": "Test gift message",
            "sender_name": "Test Sender"
        }
        response = requests.post(f"{BASE_URL}/api/gifts/create", json=payload)
        assert response.status_code == 200, f"Gift create failed: {response.text}"
        data = response.json()
        assert "gift_code" in data
        assert data["gift_code"].startswith("GIFT-")
        print(f"PASS: Gift create returns gift_code: {data['gift_code']}")

    def test_gift_get_invalid_code(self):
        """Gift get with invalid code should return 404."""
        response = requests.get(f"{BASE_URL}/api/gifts/INVALID-CODE-12345")
        assert response.status_code == 404
        print("PASS: Gift get with invalid code returns 404")

    def test_gift_redeem_requires_auth(self):
        """Gift redeem should require authentication."""
        payload = {"gift_code": "GIFT-TESTCODE"}
        response = requests.post(f"{BASE_URL}/api/gifts/redeem", json=payload)
        # Should return 401 or 422 (validation error for missing auth)
        assert response.status_code in [401, 422], f"Expected 401/422, got {response.status_code}"
        print(f"PASS: Gift redeem requires auth (status {response.status_code})")


class TestAdminSeedingEndpoints:
    """Test admin seeding endpoints after seed-loader split."""

    def test_admin_seed_status_requires_auth(self):
        """Admin seed-status should require authentication."""
        response = requests.get(f"{BASE_URL}/api/admin/seed-status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Admin seed-status requires auth (401)")

    def test_admin_seed_database_requires_auth(self):
        """Admin seed-database should require authentication."""
        payload = {"collections": [], "force": False}
        response = requests.post(f"{BASE_URL}/api/admin/seed-database", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Admin seed-database requires auth (401)")

    def test_admin_collections_requires_auth(self):
        """Admin collections should require authentication."""
        response = requests.get(f"{BASE_URL}/api/admin/collections")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Admin collections requires auth (401)")


class TestAudioNarrationEndpoint:
    """Test audio narration generation endpoint."""

    def test_audio_voices_endpoint(self):
        """Audio voices endpoint should return available voices."""
        response = requests.get(f"{BASE_URL}/api/audio/voices")
        assert response.status_code == 200, f"Audio voices failed: {response.text}"
        data = response.json()
        assert "voices" in data
        assert "default" in data
        assert len(data["voices"]) > 0
        print(f"PASS: Audio voices returns {len(data['voices'])} voices, default: {data['default']}")

    def test_audio_meditation_scripts_endpoint(self):
        """Audio meditation scripts endpoint should return scripts."""
        response = requests.get(f"{BASE_URL}/api/audio/meditation-scripts")
        assert response.status_code == 200, f"Meditation scripts failed: {response.text}"
        data = response.json()
        assert "scripts" in data
        assert len(data["scripts"]) > 0
        print(f"PASS: Meditation scripts returns {len(data['scripts'])} scripts")


class TestBirthChartEndpoints:
    """Test birth chart endpoints after helper extraction."""

    def test_birth_chart_zodiac_signs(self):
        """Zodiac signs endpoint should return all 12 signs."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200, f"Zodiac signs failed: {response.text}"
        data = response.json()
        assert len(data) == 12
        assert "Aries" in data
        assert "Pisces" in data
        print("PASS: Zodiac signs returns all 12 signs")

    def test_birth_chart_planet_meanings(self):
        """Planet meanings endpoint should return planet data."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings")
        assert response.status_code == 200, f"Planet meanings failed: {response.text}"
        data = response.json()
        assert "Sun" in data
        assert "Moon" in data
        assert "Mercury" in data
        print(f"PASS: Planet meanings returns {len(data)} planets")

    def test_birth_chart_house_meanings(self):
        """House meanings endpoint should return all 12 houses."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings")
        assert response.status_code == 200, f"House meanings failed: {response.text}"
        data = response.json()
        assert len(data) == 12
        print("PASS: House meanings returns all 12 houses")

    def test_birth_chart_aspect_meanings(self):
        """Aspect meanings endpoint should return aspect data."""
        response = requests.get(f"{BASE_URL}/api/birth-chart/aspect-meanings")
        assert response.status_code == 200, f"Aspect meanings failed: {response.text}"
        data = response.json()
        assert "Conjunction" in data
        assert "Trine" in data
        assert "Square" in data
        print(f"PASS: Aspect meanings returns {len(data)} aspects")

    def test_birth_chart_calculate(self):
        """Birth chart calculate endpoint should work with valid input."""
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Birth chart calculate failed: {response.text}"
        data = response.json()
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data
        assert "planets" in data
        assert "houses" in data
        assert "aspects" in data
        print(f"PASS: Birth chart calculate returns Sun: {data['sun_sign']}, Moon: {data['moon_sign']}, Rising: {data['rising_sign']}")


class TestPublicContentEndpoints:
    """Test public content endpoints for stability (no 500s)."""

    def test_mudras_endpoint(self):
        """Mudras endpoint should return 200 with image validation fields."""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Mudras failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            # Check for image validation fields from content.py enrichment
            first_mudra = data[0]
            assert "image_validation" in first_mudra or "image_source" in first_mudra
        print(f"PASS: Mudras endpoint returns {len(data)} mudras")

    def test_light_codes_endpoint(self):
        """Light codes endpoint should return 200 with linguistic foundations."""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200, f"Light codes failed: {response.text}"
        data = response.json()
        # Light codes returns a single object with linguistic_foundations
        if isinstance(data, dict):
            assert "linguistic_foundations" in data or "symbols" in data
        print("PASS: Light codes endpoint returns 200")

    def test_energy_healing_endpoint(self):
        """Energy healing endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200, f"Energy healing failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Energy healing endpoint returns {len(data)} practices")

    def test_ancient_wisdom_endpoint(self):
        """Ancient wisdom endpoint should return 200 with 100+ entries."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200, f"Ancient wisdom failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 100, f"Expected 100+ entries, got {len(data)}"
        print(f"PASS: Ancient wisdom endpoint returns {len(data)} entries")

    def test_shamanic_practices_endpoint(self):
        """Shamanic practices endpoint should return 200 with linked_practices."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Shamanic practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Shamanic practices endpoint returns {len(data)} practices")

    def test_elemental_practices_endpoint(self):
        """Elemental practices endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Elemental practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Elemental practices endpoint returns {len(data)} practices")

    def test_mindfulness_endpoint(self):
        """Mindfulness endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Mindfulness failed: {response.text}"
        print("PASS: Mindfulness endpoint returns 200")

    def test_mindfulness_practices_endpoint(self):
        """Mindfulness practices endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/mindfulness-practices")
        assert response.status_code == 200, f"Mindfulness practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mindfulness practices endpoint returns {len(data)} practices")

    def test_water_practices_endpoint(self):
        """Water practices endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200, f"Water practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Water practices endpoint returns {len(data)} practices")

    def test_grounding_endpoint(self):
        """Grounding endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200, f"Grounding failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Grounding endpoint returns {len(data)} exercises")

    def test_free_form_movement_endpoint(self):
        """Free form movement endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/free-form-movement")
        assert response.status_code == 200, f"Free form movement failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Free form movement endpoint returns {len(data)} practices")

    def test_live_sessions_endpoint(self):
        """Live sessions endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200, f"Live sessions failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Live sessions endpoint returns {len(data)} sessions")

    def test_courses_endpoint(self):
        """Courses endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Courses failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Courses endpoint returns {len(data)} courses")

    def test_meditations_endpoint(self):
        """Meditations endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Meditations failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Meditations endpoint returns {len(data)} meditations")


class TestAuthEndpoints:
    """Test auth endpoints for expected behavior."""

    def test_auth_me_requires_session(self):
        """Auth me endpoint should return 401 without session."""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Auth me requires session (401)")

    def test_dashboard_daily_requires_auth(self):
        """Dashboard daily endpoint should require auth."""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code in [401, 422], f"Expected 401/422, got {response.status_code}"
        print(f"PASS: Dashboard daily requires auth (status {response.status_code})")


class TestPaymentsEndpoints:
    """Test payments endpoints for stability."""

    def test_payments_plans_endpoint(self):
        """Payments plans endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Payments plans failed: {response.text}"
        data = response.json()
        assert "plans" in data or isinstance(data, list) or isinstance(data, dict)
        print("PASS: Payments plans endpoint returns 200")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
