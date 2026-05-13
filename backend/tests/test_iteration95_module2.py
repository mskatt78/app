"""
Iteration 95 - Module 2 Maintainability Sprint Tests
Testing BirthChartComputation dataclass refactor in birth_chart.py

Tests:
1. Birth chart calculate endpoint returns full valid payload after dataclass refactor
2. Saved chart endpoints work when authenticated (/birth-chart/save, /birth-chart/my-chart)
3. Verify payload structure matches expected format
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestBirthChartCalculateEndpoint:
    """Test birth chart calculate endpoint after BirthChartComputation dataclass refactor"""
    
    def test_calculate_birth_chart_returns_valid_payload(self):
        """Test that /birth-chart/calculate returns full valid payload"""
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify core fields exist
        assert "id" in data, "Missing 'id' field"
        assert "calculation_method" in data, "Missing 'calculation_method' field"
        assert "precision" in data, "Missing 'precision' field"
        assert "birth_data" in data, "Missing 'birth_data' field"
        
        # Verify sun/moon/rising signs
        assert "sun_sign" in data, "Missing 'sun_sign' field"
        assert "moon_sign" in data, "Missing 'moon_sign' field"
        assert "rising_sign" in data, "Missing 'rising_sign' field"
        
        # Verify sign info objects
        assert "sun_sign_info" in data, "Missing 'sun_sign_info' field"
        assert "moon_sign_info" in data, "Missing 'moon_sign_info' field"
        assert "rising_sign_info" in data, "Missing 'rising_sign_info' field"
        
        # Verify ascendant and midheaven
        assert "ascendant" in data, "Missing 'ascendant' field"
        assert "midheaven" in data, "Missing 'midheaven' field"
        
        # Verify planets array
        assert "planets" in data, "Missing 'planets' field"
        assert isinstance(data["planets"], list), "planets should be a list"
        assert len(data["planets"]) >= 10, f"Expected at least 10 planets, got {len(data['planets'])}"
        
        # Verify houses
        assert "houses" in data, "Missing 'houses' field"
        
        # Verify aspects
        assert "aspects" in data, "Missing 'aspects' field"
        assert isinstance(data["aspects"], list), "aspects should be a list"
        
        # Verify elements and qualities
        assert "elements" in data, "Missing 'elements' field"
        assert "qualities" in data, "Missing 'qualities' field"
        
        # Verify big_three
        assert "big_three" in data, "Missing 'big_three' field"
        assert "sun" in data["big_three"], "Missing 'sun' in big_three"
        assert "moon" in data["big_three"], "Missing 'moon' in big_three"
        assert "rising" in data["big_three"], "Missing 'rising' in big_three"
        
        # Verify created_at timestamp
        assert "created_at" in data, "Missing 'created_at' field"
        
        print(f"PASSED: Birth chart calculate returns valid payload with {len(data['planets'])} planets, {len(data['aspects'])} aspects")
        print(f"  Sun: {data['sun_sign']}, Moon: {data['moon_sign']}, Rising: {data['rising_sign']}")
    
    def test_calculate_birth_chart_planet_structure(self):
        """Test that planet objects have correct structure after dataclass refactor"""
        payload = {
            "birth_date": "1985-03-21",
            "birth_time": "08:00",
            "birth_city": "Los Angeles",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check first planet structure
        planet = data["planets"][0]
        required_fields = ["name", "longitude", "sign", "sign_symbol", "sign_position", 
                          "degree", "minute", "retrograde", "symbol", "meaning", "keywords", "house"]
        
        for field in required_fields:
            assert field in planet, f"Planet missing '{field}' field"
        
        print(f"PASSED: Planet structure verified with all required fields")
        print(f"  First planet: {planet['name']} in {planet['sign']} at {planet['degree']}°{planet['minute']}'")
    
    def test_calculate_birth_chart_ascendant_structure(self):
        """Test that ascendant object has correct structure"""
        payload = {
            "birth_date": "2000-12-25",
            "birth_time": "00:00",
            "birth_city": "London",
            "birth_country": "UK"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        ascendant = data["ascendant"]
        required_fields = ["name", "longitude", "sign", "sign_symbol", "sign_position",
                          "degree", "minute", "symbol", "meaning", "keywords", "house"]
        
        for field in required_fields:
            assert field in ascendant, f"Ascendant missing '{field}' field"
        
        assert ascendant["name"] == "Ascendant", "Ascendant name should be 'Ascendant'"
        assert ascendant["house"] == 1, "Ascendant house should be 1"
        
        print(f"PASSED: Ascendant structure verified")
        print(f"  Ascendant: {ascendant['sign']} at {ascendant['degree']}°{ascendant['minute']}'")
    
    def test_calculate_birth_chart_elements_qualities(self):
        """Test that elements and qualities have correct structure"""
        payload = {
            "birth_date": "1995-07-04",
            "birth_time": "12:00",
            "birth_city": "Chicago",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check elements structure
        elements = data["elements"]
        assert "counts" in elements, "Elements missing 'counts'"
        assert "percentages" in elements, "Elements missing 'percentages'"
        assert "dominant" in elements, "Elements missing 'dominant'"
        assert "interpretation" in elements, "Elements missing 'interpretation'"
        
        # Check qualities structure
        qualities = data["qualities"]
        assert "counts" in qualities, "Qualities missing 'counts'"
        assert "percentages" in qualities, "Qualities missing 'percentages'"
        assert "dominant" in qualities, "Qualities missing 'dominant'"
        assert "interpretation" in qualities, "Qualities missing 'interpretation'"
        
        print(f"PASSED: Elements and qualities structure verified")
        print(f"  Dominant element: {elements['dominant']}, Dominant quality: {qualities['dominant']}")
    
    def test_calculate_birth_chart_with_coordinates(self):
        """Test birth chart calculation with explicit coordinates"""
        payload = {
            "birth_date": "1988-11-11",
            "birth_time": "11:11",
            "birth_city": "Custom Location",
            "birth_country": "Custom",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone_name": "America/New_York"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify birth_data contains the coordinates
        birth_data = data["birth_data"]
        assert birth_data["latitude"] == 40.7128, "Latitude not preserved"
        assert birth_data["longitude"] == -74.0060, "Longitude not preserved"
        assert birth_data["timezone"] == "America/New_York", "Timezone not preserved"
        
        print(f"PASSED: Birth chart with explicit coordinates works correctly")


class TestBirthChartAuthenticatedEndpoints:
    """Test authenticated birth chart endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for admin user"""
        login_payload = {
            "email": "mskatt78@gmail.com",
            "password": "ShamanicAdmin2026!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_save_birth_chart_requires_auth(self):
        """Test that /birth-chart/save requires authentication"""
        payload = {
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/save", json=payload)
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("PASSED: /birth-chart/save requires authentication")
    
    def test_my_chart_requires_auth(self):
        """Test that /birth-chart/my-chart requires authentication"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/my-chart")
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print("PASSED: /birth-chart/my-chart requires authentication")
    
    def test_save_and_retrieve_birth_chart(self, auth_token):
        """Test saving and retrieving birth chart when authenticated"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Save a birth chart
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        save_response = requests.post(
            f"{BASE_URL}/api/birth-chart/save", 
            json=payload,
            headers=headers
        )
        
        assert save_response.status_code == 200, f"Save failed: {save_response.status_code} - {save_response.text}"
        saved_data = save_response.json()
        
        # Verify saved data has all required fields
        assert "sun_sign" in saved_data, "Saved chart missing sun_sign"
        assert "moon_sign" in saved_data, "Saved chart missing moon_sign"
        assert "rising_sign" in saved_data, "Saved chart missing rising_sign"
        assert "planets" in saved_data, "Saved chart missing planets"
        assert "user_id" in saved_data, "Saved chart missing user_id"
        
        print(f"PASSED: Birth chart saved successfully")
        print(f"  Sun: {saved_data['sun_sign']}, Moon: {saved_data['moon_sign']}, Rising: {saved_data['rising_sign']}")
        
        # Retrieve the saved chart
        get_response = requests.get(
            f"{BASE_URL}/api/birth-chart/my-chart",
            headers=headers
        )
        
        assert get_response.status_code == 200, f"Get failed: {get_response.status_code} - {get_response.text}"
        retrieved_data = get_response.json()
        
        # Verify retrieved data matches saved data
        assert retrieved_data["sun_sign"] == saved_data["sun_sign"], "Sun sign mismatch"
        assert retrieved_data["moon_sign"] == saved_data["moon_sign"], "Moon sign mismatch"
        assert retrieved_data["rising_sign"] == saved_data["rising_sign"], "Rising sign mismatch"
        
        print("PASSED: Birth chart retrieved successfully and matches saved data")


class TestZodiacAndPlanetEndpoints:
    """Test supporting endpoints for birth chart"""
    
    def test_zodiac_signs_endpoint(self):
        """Test /birth-chart/zodiac-signs returns all 12 signs"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        
        assert response.status_code == 200
        data = response.json()
        
        expected_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        for sign in expected_signs:
            assert sign in data, f"Missing zodiac sign: {sign}"
            assert "element" in data[sign], f"{sign} missing element"
            assert "quality" in data[sign], f"{sign} missing quality"
            assert "ruler" in data[sign], f"{sign} missing ruler"
            assert "symbol" in data[sign], f"{sign} missing symbol"
        
        print(f"PASSED: All 12 zodiac signs returned with complete data")
    
    def test_planet_meanings_endpoint(self):
        """Test /birth-chart/planet-meanings returns planet data"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings")
        
        assert response.status_code == 200
        data = response.json()
        
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", 
                          "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
        
        for planet in expected_planets:
            assert planet in data, f"Missing planet: {planet}"
            assert "meaning" in data[planet], f"{planet} missing meaning"
            assert "symbol" in data[planet], f"{planet} missing symbol"
            assert "keywords" in data[planet], f"{planet} missing keywords"
        
        print(f"PASSED: All planet meanings returned with complete data")
    
    def test_house_meanings_endpoint(self):
        """Test /birth-chart/house-meanings returns all 12 houses"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings")
        
        assert response.status_code == 200
        data = response.json()
        
        # Houses are keyed by number (1-12)
        for i in range(1, 13):
            key = str(i)
            assert key in data or i in data, f"Missing house {i}"
        
        print(f"PASSED: All 12 house meanings returned")
    
    def test_aspect_meanings_endpoint(self):
        """Test /birth-chart/aspect-meanings returns aspect data"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/aspect-meanings")
        
        assert response.status_code == 200
        data = response.json()
        
        expected_aspects = ["Conjunction", "Sextile", "Square", "Trine", "Opposition"]
        
        for aspect in expected_aspects:
            assert aspect in data, f"Missing aspect: {aspect}"
            assert "degrees" in data[aspect], f"{aspect} missing degrees"
            assert "orb" in data[aspect], f"{aspect} missing orb"
            assert "symbol" in data[aspect], f"{aspect} missing symbol"
        
        print(f"PASSED: All major aspects returned with complete data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
