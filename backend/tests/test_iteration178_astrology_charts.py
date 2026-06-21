"""
Iteration 178 - Astrology Birth Chart + Dragon Chart Tests
Tests for the new Astrology Charts Hub feature including:
- Full Birth Chart calculation
- Dragon Chart calculation (Chinese Dragon + Dragon Head/Tail)
- API endpoint validation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestBirthChartAPI:
    """Tests for the /api/birth-chart/calculate endpoint"""
    
    def test_birth_chart_calculate_returns_200(self):
        """Test that birth chart calculation returns 200"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: Birth chart calculate returns 200")
    
    def test_birth_chart_has_required_fields(self):
        """Test that birth chart response has all required fields"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        data = response.json()
        
        required_fields = [
            "id", "calculation_method", "precision", "birth_data",
            "sun_sign", "moon_sign", "rising_sign", "ascendant",
            "midheaven", "planets", "houses", "aspects", "elements",
            "qualities", "big_three"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print("PASSED: Birth chart has all required fields")
    
    def test_birth_chart_planets_count(self):
        """Test that birth chart has correct number of planets"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        data = response.json()
        
        # Should have at least 11 planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, South Node)
        assert len(data["planets"]) >= 11, f"Expected at least 11 planets, got {len(data['planets'])}"
        print(f"PASSED: Birth chart has {len(data['planets'])} planets")
    
    def test_birth_chart_houses_count(self):
        """Test that birth chart has 12 houses"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        data = response.json()
        
        assert len(data["houses"]) == 12, f"Expected 12 houses, got {len(data['houses'])}"
        print("PASSED: Birth chart has 12 houses")
    
    def test_birth_chart_big_three(self):
        """Test that birth chart has big three (sun, moon, rising)"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        data = response.json()
        
        big_three = data.get("big_three", {})
        assert "sun" in big_three, "Missing sun in big_three"
        assert "moon" in big_three, "Missing moon in big_three"
        assert "rising" in big_three, "Missing rising in big_three"
        
        # Verify each has sign and symbol
        for key in ["sun", "moon", "rising"]:
            assert "sign" in big_three[key], f"Missing sign in big_three.{key}"
            assert "symbol" in big_three[key], f"Missing symbol in big_three.{key}"
        
        print(f"PASSED: Big Three - Sun: {big_three['sun']['sign']}, Moon: {big_three['moon']['sign']}, Rising: {big_three['rising']['sign']}")


class TestDragonChartAPI:
    """Tests for the /api/birth-chart/dragon-chart/calculate endpoint"""
    
    def test_dragon_chart_calculate_returns_200(self):
        """Test that dragon chart calculation returns 200"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/dragon-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: Dragon chart calculate returns 200")
    
    def test_dragon_chart_has_required_sections(self):
        """Test that dragon chart response has all required sections"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/dragon-chart/calculate", json=payload)
        data = response.json()
        
        required_sections = ["natal_chart", "dragon_head_tail_chart", "chinese_dragon_chart", "generated_at"]
        
        for section in required_sections:
            assert section in data, f"Missing required section: {section}"
        
        print("PASSED: Dragon chart has all required sections")
    
    def test_chinese_dragon_chart_fields(self):
        """Test that Chinese dragon chart has all required fields"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/dragon-chart/calculate", json=payload)
        data = response.json()
        
        chinese_chart = data.get("chinese_dragon_chart", {})
        required_fields = ["birth_year", "zodiac_animal", "zodiac_element", "polarity", "is_dragon_year", "dragon_cycle_message"]
        
        for field in required_fields:
            assert field in chinese_chart, f"Missing field in chinese_dragon_chart: {field}"
        
        # Verify 1990 is Year of the Horse
        assert chinese_chart["zodiac_animal"] == "Horse", f"Expected Horse for 1990, got {chinese_chart['zodiac_animal']}"
        assert chinese_chart["zodiac_element"] == "Metal", f"Expected Metal for 1990, got {chinese_chart['zodiac_element']}"
        
        print(f"PASSED: Chinese Dragon Chart - {chinese_chart['zodiac_element']} {chinese_chart['zodiac_animal']}")
    
    def test_dragon_head_tail_chart_fields(self):
        """Test that Dragon Head/Tail chart has all required fields"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/dragon-chart/calculate", json=payload)
        data = response.json()
        
        head_tail = data.get("dragon_head_tail_chart", {})
        
        # Check dragon_head
        assert "dragon_head" in head_tail, "Missing dragon_head"
        dragon_head = head_tail["dragon_head"]
        head_fields = ["name", "symbol", "sign", "house", "degree", "minute", "message"]
        for field in head_fields:
            assert field in dragon_head, f"Missing field in dragon_head: {field}"
        
        # Check dragon_tail
        assert "dragon_tail" in head_tail, "Missing dragon_tail"
        dragon_tail = head_tail["dragon_tail"]
        for field in head_fields:
            assert field in dragon_tail, f"Missing field in dragon_tail: {field}"
        
        # Check karmic axis
        assert "karmic_axis" in head_tail, "Missing karmic_axis"
        assert "axis_message" in head_tail, "Missing axis_message"
        
        print(f"PASSED: Dragon Head in {dragon_head['sign']}, Dragon Tail in {dragon_tail['sign']}")
    
    def test_dragon_chart_for_dragon_year(self):
        """Test dragon chart for someone born in a Dragon year (2000)"""
        payload = {
            "birth_date": "2000-03-15",
            "birth_time": "10:00",
            "birth_city": "London",
            "birth_country": "UK"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/dragon-chart/calculate", json=payload)
        data = response.json()
        
        chinese_chart = data.get("chinese_dragon_chart", {})
        
        # 2000 is Year of the Dragon
        assert chinese_chart["zodiac_animal"] == "Dragon", f"Expected Dragon for 2000, got {chinese_chart['zodiac_animal']}"
        assert chinese_chart["is_dragon_year"] == True, "Expected is_dragon_year to be True for 2000"
        assert "Dragon year" in chinese_chart["dragon_cycle_message"], "Expected Dragon year message"
        
        print(f"PASSED: Dragon Year (2000) - {chinese_chart['zodiac_element']} {chinese_chart['zodiac_animal']}")
    
    def test_dragon_chart_natal_chart_included(self):
        """Test that dragon chart includes full natal chart"""
        payload = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/dragon-chart/calculate", json=payload)
        data = response.json()
        
        natal_chart = data.get("natal_chart", {})
        
        # Verify natal chart has key fields
        assert "sun_sign" in natal_chart, "Missing sun_sign in natal_chart"
        assert "moon_sign" in natal_chart, "Missing moon_sign in natal_chart"
        assert "rising_sign" in natal_chart, "Missing rising_sign in natal_chart"
        assert "planets" in natal_chart, "Missing planets in natal_chart"
        
        print(f"PASSED: Natal chart included - Sun: {natal_chart['sun_sign']}, Moon: {natal_chart['moon_sign']}, Rising: {natal_chart['rising_sign']}")


class TestZodiacReferenceEndpoints:
    """Tests for zodiac reference data endpoints"""
    
    def test_zodiac_signs_endpoint(self):
        """Test /api/birth-chart/zodiac-signs endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) == 12, f"Expected 12 zodiac signs, got {len(data)}"
        
        expected_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        for sign in expected_signs:
            assert sign in data, f"Missing zodiac sign: {sign}"
        
        print("PASSED: Zodiac signs endpoint returns all 12 signs")
    
    def test_planet_meanings_endpoint(self):
        """Test /api/birth-chart/planet-meanings endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", 
                          "Saturn", "Uranus", "Neptune", "Pluto", "North Node", "South Node"]
        
        for planet in expected_planets:
            assert planet in data, f"Missing planet: {planet}"
        
        print(f"PASSED: Planet meanings endpoint returns {len(data)} planets")
    
    def test_house_meanings_endpoint(self):
        """Test /api/birth-chart/house-meanings endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Houses are keyed by number (1-12)
        assert len(data) == 12, f"Expected 12 houses, got {len(data)}"
        
        print("PASSED: House meanings endpoint returns all 12 houses")
    
    def test_aspect_meanings_endpoint(self):
        """Test /api/birth-chart/aspect-meanings endpoint"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/aspect-meanings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        expected_aspects = ["Conjunction", "Sextile", "Square", "Trine", "Opposition"]
        
        for aspect in expected_aspects:
            assert aspect in data, f"Missing aspect: {aspect}"
        
        print(f"PASSED: Aspect meanings endpoint returns {len(data)} aspects")


class TestEdgeCases:
    """Tests for edge cases and error handling"""
    
    def test_birth_chart_missing_required_fields(self):
        """Test that missing required fields returns error"""
        payload = {
            "birth_date": "1990-05-15"
            # Missing birth_time, birth_city, birth_country
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        # Should still work with defaults or return validation error
        assert response.status_code in [200, 400, 422], f"Unexpected status: {response.status_code}"
        print(f"PASSED: Missing fields handled (status: {response.status_code})")
    
    def test_birth_chart_invalid_date(self):
        """Test that invalid date returns error"""
        payload = {
            "birth_date": "invalid-date",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code in [400, 422], f"Expected 400/422 for invalid date, got {response.status_code}"
        print("PASSED: Invalid date returns error")
    
    def test_birth_chart_different_cities(self):
        """Test birth chart calculation for different cities"""
        cities = [
            ("London", "UK"),
            ("Tokyo", "Japan"),
            ("Sydney", "Australia"),
            ("Mumbai", "India")
        ]
        
        for city, country in cities:
            payload = {
                "birth_date": "1990-05-15",
                "birth_time": "14:30",
                "birth_city": city,
                "birth_country": country
            }
            response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
            assert response.status_code == 200, f"Failed for {city}, {country}: {response.status_code}"
        
        print(f"PASSED: Birth chart works for {len(cities)} different cities")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
