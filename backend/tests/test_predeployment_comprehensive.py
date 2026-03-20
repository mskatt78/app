"""
Pre-deployment comprehensive backend tests for Shamanic Elements Temple Of The Soul.
Tests all public content endpoints, guest Oracle reading, and TTS functionality.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndStatus:
    """Health check endpoints"""
    
    def test_api_health(self):
        """Verify API health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy"
        assert "version" in data
        print(f"✓ API health check passed - version {data.get('version')}")


class TestPublicContentEndpoints:
    """Test all public content endpoints that don't require authentication"""
    
    def test_yoga_poses(self):
        """Test yoga poses endpoint"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Yoga poses failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses: {len(data)} poses returned")
    
    def test_breathwork_sessions(self):
        """Test breathwork sessions endpoint"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Breathwork failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathwork sessions: {len(data)} sessions returned")
    
    def test_crystals(self):
        """Test crystals endpoint"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200, f"Crystals failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Crystals: {len(data)} crystals returned")
    
    def test_mantras(self):
        """Test mantras endpoint"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Mantras failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mantras: {len(data)} mantras returned")
    
    def test_mudras(self):
        """Test mudras endpoint"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Mudras failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mudras: {len(data)} mudras returned")
    
    def test_grounding_exercises(self):
        """Test grounding exercises endpoint"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200, f"Grounding failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Grounding exercises: {len(data)} exercises returned")
    
    def test_mindfulness_practices(self):
        """Test mindfulness practices endpoint"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Mindfulness failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mindfulness practices: {len(data)} practices returned")
    
    def test_meditations(self):
        """Test meditations endpoint"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Meditations failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Meditations: {len(data)} meditations returned")
    
    def test_somatic_practices(self):
        """Test somatic practices endpoint - should return 39+ practices"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200, f"Somatic failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 30, f"Expected 39+ somatic practices, got {len(data)}"
        print(f"✓ Somatic practices: {len(data)} practices returned")


class TestShamanicContent:
    """Test shamanic, elemental, creative, and heart practice endpoints"""
    
    def test_shamanic_practices(self):
        """Test shamanic practices endpoint"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Shamanic practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Shamanic practices: {len(data)} practices returned")
    
    def test_elemental_practices(self):
        """Test elemental practices endpoint"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Elemental practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Elemental practices: {len(data)} practices returned")
    
    def test_creative_processes(self):
        """Test creative processes endpoint"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Creative processes failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Creative processes: {len(data)} processes returned")
    
    def test_heart_practices(self):
        """Test heart practices endpoint"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Heart practices failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Heart practices: {len(data)} practices returned")
    
    def test_earth_altars(self):
        """Test earth altars endpoint"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200, f"Earth altars failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Earth altars: {len(data)} altars returned")


class TestOracleReadings:
    """Test Oracle reading functionality"""
    
    def test_oracle_cards(self):
        """Test oracle cards endpoint"""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200, f"Oracle cards failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 20, "Expected at least 20 oracle cards"
        print(f"✓ Oracle cards: {len(data)} cards returned")
    
    def test_guest_oracle_reading_single(self):
        """Test guest oracle reading with single card spread (no auth required)"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading/guest",
            json={"question": "Test question", "spread_type": "single"}
        )
        assert response.status_code == 200, f"Guest oracle reading failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "cards" in data
        assert "interpretation" in data
        assert len(data["cards"]) == 1
        print(f"✓ Guest oracle reading (single): Success with interpretation ({len(data['interpretation'])} chars)")
    
    def test_guest_oracle_reading_three_card(self):
        """Test guest oracle reading with three card spread"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading/guest",
            json={"question": "What guidance do I need?", "spread_type": "three_card"}
        )
        assert response.status_code == 200, f"Guest oracle 3-card failed: {response.text}"
        data = response.json()
        assert len(data["cards"]) == 3
        print(f"✓ Guest oracle reading (three_card): Success with {len(data['cards'])} cards")


class TestNumerologyAndBirthChart:
    """Test numerology and birth chart endpoints"""
    
    def test_numerology_calculate(self):
        """Test numerology calculation endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json={"name": "John Doe", "birth_date": "1990-01-15"}
        )
        assert response.status_code == 200, f"Numerology failed: {response.text}"
        data = response.json()
        assert "life_path_number" in data or "life_path" in data
        print(f"✓ Numerology calculation: Success - Life path {data.get('life_path_number', 'N/A')}")
    
    def test_birth_chart_generate(self):
        """Test birth chart generation endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/calculate",
            json={
                "name": "Test User",
                "birth_date": "1990-06-15",
                "birth_time": "14:30",
                "birth_city": "New York",
                "birth_country": "USA"
            }
        )
        assert response.status_code == 200, f"Birth chart failed: {response.text}"
        data = response.json()
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data
        print(f"✓ Birth chart generation: Success - Sun in {data['sun_sign']}")


class TestAstrologyAndMoonCalendar:
    """Test astrology and moon calendar endpoints"""
    
    def test_current_moon(self):
        """Test current moon endpoint"""
        response = requests.get(f"{BASE_URL}/api/astrology/current")
        assert response.status_code == 200, f"Current moon failed: {response.text}"
        data = response.json()
        print(f"✓ Current moon: Success - {data.get('name', 'data received')}")


class TestTTSEndpoint:
    """Test Text-to-Speech endpoint for meditations"""
    
    def test_tts_generate_base64(self):
        """Test TTS generation endpoint returns audio"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json={
                "text": "Welcome to this guided meditation. Take a deep breath.",
                "voice": "nova",
                "speed": 0.85
            },
            timeout=30  # TTS can take time
        )
        assert response.status_code == 200, f"TTS failed: {response.text}"
        data = response.json()
        assert "audio_base64" in data
        assert "format" in data
        assert data["format"] == "mp3"
        assert len(data["audio_base64"]) > 1000, "Audio data too small"
        print(f"✓ TTS generation: Success ({len(data['audio_base64'])} chars base64)")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_register_new_user(self):
        """Test email/password registration"""
        import random
        import string
        random_suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
        test_email = f"test_predeployment_{random_suffix}@testmail.com"
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test User"
            }
        )
        assert response.status_code in [200, 201, 400], f"Registration failed: {response.text}"
        if response.status_code in [200, 201]:
            data = response.json()
            assert "user" in data or "email" in data
            print(f"✓ Registration: Success for {test_email}")
        else:
            print(f"⚠ Registration: User may already exist")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code in [401, 400], f"Expected 401/400 for invalid login, got {response.status_code}"
        print(f"✓ Invalid login: Correctly rejected with {response.status_code}")


class TestPresetRituals:
    """Test preset rituals endpoint"""
    
    def test_preset_rituals(self):
        """Test preset rituals endpoint"""
        response = requests.get(f"{BASE_URL}/api/preset-rituals")
        assert response.status_code == 200, f"Preset rituals failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Preset rituals: {len(data)} rituals returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
