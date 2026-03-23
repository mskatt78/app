"""
Final App Store Submission Tests - Shamanic Elements Temple Of The Soul
Tests all critical features before app store submission.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://womb-work-test.preview.emergentagent.com')

class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Shamanic Elements" in data["app"]
        print(f"✓ Health check passed: {data}")


class TestYogaLibrary:
    """Yoga Library - Should have 78 poses including Chair Yoga"""
    
    def test_yoga_poses_count(self):
        """Test yoga library has 78 poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        assert len(poses) == 78, f"Expected 78 poses, got {len(poses)}"
        print(f"✓ Yoga library has {len(poses)} poses")
    
    def test_yoga_has_chair_yoga(self):
        """Test yoga library includes Chair Yoga poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        chair_poses = [p for p in poses if 'chair' in p.get('name', '').lower()]
        assert len(chair_poses) > 0, "No Chair Yoga poses found"
        print(f"✓ Found {len(chair_poses)} Chair Yoga poses: {[p['name'] for p in chair_poses]}")


class TestSomaticMovement:
    """Somatic Movement - Should have 39 practices with Tai Chi and Qigong"""
    
    def test_somatic_practices_count(self):
        """Test somatic has 39 practices"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        assert len(practices) == 39, f"Expected 39 practices, got {len(practices)}"
        print(f"✓ Somatic has {len(practices)} practices")
    
    def test_somatic_has_tai_chi(self):
        """Test somatic includes Tai Chi practices"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        tai_chi = [p for p in practices if p.get('category') == 'Tai Chi']
        assert len(tai_chi) > 0, "No Tai Chi practices found"
        print(f"✓ Found {len(tai_chi)} Tai Chi practices")
    
    def test_somatic_has_qigong(self):
        """Test somatic includes Qigong practices"""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        practices = response.json()
        qigong = [p for p in practices if p.get('category') == 'Qigong']
        assert len(qigong) > 0, "No Qigong practices found"
        print(f"✓ Found {len(qigong)} Qigong practices")


class TestOracleReadings:
    """Oracle Readings - Guest endpoint should work without login"""
    
    def test_oracle_guest_reading(self):
        """Test oracle reading works without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading/guest",
            json={"question": "What guidance do I need today?", "spread_type": "single"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert "interpretation" in data
        assert len(data["cards"]) >= 1
        print(f"✓ Oracle guest reading works - got {len(data['cards'])} card(s)")
    
    def test_oracle_cards_list(self):
        """Test oracle cards endpoint"""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        cards = response.json()
        assert len(cards) > 0
        print(f"✓ Oracle has {len(cards)} cards available")


class TestBirthChart:
    """Birth Chart - Should calculate with city/country input"""
    
    def test_birth_chart_calculate(self):
        """Test birth chart calculation with city/country"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/calculate",
            json={
                "birth_date": "1990-06-15",
                "birth_time": "14:30",
                "birth_city": "Sydney",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data
        assert "planets" in data
        print(f"✓ Birth chart calculated: Sun={data['sun_sign']}, Moon={data['moon_sign']}, Rising={data['rising_sign']}")
    
    def test_zodiac_signs_endpoint(self):
        """Test zodiac signs reference data"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200
        signs = response.json()
        assert len(signs) == 12
        print(f"✓ Zodiac signs endpoint returns {len(signs)} signs")


class TestNumerology:
    """Numerology - Should calculate life path number"""
    
    def test_numerology_calculate(self):
        """Test numerology calculation returns life path number"""
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json={"birth_date": "1990-06-15"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "life_path" in data
        assert "number" in data["life_path"]
        print(f"✓ Numerology calculated: Life Path {data['life_path']['number']} - {data['life_path']['name']}")
    
    def test_life_paths_reference(self):
        """Test life paths reference data"""
        response = requests.get(f"{BASE_URL}/api/numerology/life-paths")
        assert response.status_code == 200
        paths = response.json()
        assert len(paths) >= 9  # At least 1-9
        print(f"✓ Life paths endpoint returns {len(paths)} paths")


class TestBreathwork:
    """Breathwork - Should have sessions with Hz frequencies"""
    
    def test_breathwork_sessions(self):
        """Test breathwork sessions endpoint"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        sessions = response.json()
        assert len(sessions) > 0
        # Check for frequency field
        sessions_with_freq = [s for s in sessions if s.get('frequency')]
        print(f"✓ Breathwork has {len(sessions)} sessions, {len(sessions_with_freq)} with Hz frequencies")


class TestMeditations:
    """Meditations - Should have meditations and TTS endpoint"""
    
    def test_meditations_list(self):
        """Test meditations list endpoint"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        meditations = response.json()
        assert len(meditations) > 0
        print(f"✓ Meditations has {len(meditations)} guided meditations")


class TestMoonCalendar:
    """Moon Calendar - Should have months and current moon"""
    
    def test_astrology_months(self):
        """Test 13-moon calendar months"""
        response = requests.get(f"{BASE_URL}/api/astrology/months")
        assert response.status_code == 200
        months = response.json()
        assert len(months) == 13, f"Expected 13 months, got {len(months)}"
        # Check for hemisphere descriptions
        has_south = any(m.get('description_south') for m in months)
        has_north = any(m.get('description_north') for m in months)
        print(f"✓ Moon calendar has {len(months)} months, hemisphere support: north={has_north}, south={has_south}")
    
    def test_current_moon(self):
        """Test current moon endpoint"""
        response = requests.get(f"{BASE_URL}/api/astrology/current")
        assert response.status_code == 200
        current = response.json()
        assert "name" in current
        print(f"✓ Current moon: {current['name']}")


class TestContentPages:
    """Test all public content pages load without authentication"""
    
    def test_crystals_endpoint(self):
        """Test crystals guide"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Crystals: {len(data)} crystals")
    
    def test_mantras_endpoint(self):
        """Test mantras library"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Mantras: {len(data)} mantras")
    
    def test_mudras_endpoint(self):
        """Test mudras library"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Mudras: {len(data)} mudras")
    
    def test_grounding_endpoint(self):
        """Test grounding practices"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Grounding: {len(data)} practices")
    
    def test_mindfulness_endpoint(self):
        """Test mindfulness practices"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Mindfulness: {len(data)} practices")
    
    def test_shamanic_endpoint(self):
        """Test shamanic practices"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Shamanic: {len(data)} practices")
    
    def test_elemental_endpoint(self):
        """Test elemental practices"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Elemental: {len(data)} practices")
    
    def test_creative_endpoint(self):
        """Test creative processes"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Creative: {len(data)} processes")
    
    def test_heart_practices_endpoint(self):
        """Test heart practices"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Heart Practices: {len(data)} practices")


class TestEmailAuth:
    """Test email authentication endpoints"""
    
    def test_register_endpoint_exists(self):
        """Test register endpoint responds (even with invalid data)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": "", "password": "", "name": ""}
        )
        # Should return 400 or 422 for validation error, not 404
        assert response.status_code in [400, 422], f"Register endpoint returned {response.status_code}"
        print(f"✓ Register endpoint exists and validates input")
    
    def test_login_endpoint_exists(self):
        """Test login endpoint responds"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "wrongpassword"}
        )
        # Should return 401 for invalid credentials, not 404
        assert response.status_code in [401, 400, 422], f"Login endpoint returned {response.status_code}"
        print(f"✓ Login endpoint exists and validates credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
