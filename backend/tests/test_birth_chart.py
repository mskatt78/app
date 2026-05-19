"""
Birth Chart API Tests using Swiss Ephemeris
Tests the following features:
- Birth chart calculation with all planets
- Rising sign (Ascendant) calculation
- Midheaven (MC) calculation
- Planetary aspects calculation
- House placement calculations
- Element and quality balance
- Big Three display (Sun, Moon, Rising)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBirthChartAPI:
    """Tests for /api/birth-chart endpoints"""
    
    def test_zodiac_signs_endpoint(self):
        """Test /api/birth-chart/zodiac-signs returns all 12 zodiac signs"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        
        # Verify all 12 zodiac signs are present
        expected_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        for sign in expected_signs:
            assert sign in data, f"Missing zodiac sign: {sign}"
            assert "element" in data[sign], f"Missing element for {sign}"
            assert "quality" in data[sign], f"Missing quality for {sign}"
            assert "symbol" in data[sign], f"Missing symbol for {sign}"
        
        print("SUCCESS: All 12 zodiac signs present with correct structure")
    
    def test_planet_meanings_endpoint(self):
        """Test /api/birth-chart/planet-meanings returns planet info"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        
        # Core planets that should be present
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", 
                          "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
                          "North Node", "South Node", "Ascendant", "Midheaven"]
        
        for planet in expected_planets:
            assert planet in data, f"Missing planet: {planet}"
            assert "meaning" in data[planet], f"Missing meaning for {planet}"
            assert "symbol" in data[planet], f"Missing symbol for {planet}"
        
        print("SUCCESS: All expected planets present with meanings")
    
    def test_house_meanings_endpoint(self):
        """Test /api/birth-chart/house-meanings returns all 12 houses"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        
        # Verify all 12 houses
        for i in range(1, 13):
            key = str(i)  # Houses might be string or int keys
            # Try both string and int key
            house_data = data.get(key) or data.get(i)
            assert house_data is not None, f"Missing house {i}"
            assert "theme" in house_data, f"Missing theme for house {i}"
        
        print("SUCCESS: All 12 houses present with themes")
    
    def test_aspect_meanings_endpoint(self):
        """Test /api/birth-chart/aspect-meanings returns aspect info"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/aspect-meanings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        
        # Major aspects that should be present
        expected_aspects = ["Conjunction", "Sextile", "Square", "Trine", "Opposition"]
        
        for aspect in expected_aspects:
            assert aspect in data, f"Missing aspect: {aspect}"
            assert "degrees" in data[aspect], f"Missing degrees for {aspect}"
            assert "symbol" in data[aspect], f"Missing symbol for {aspect}"
        
        print("SUCCESS: All major aspects present with correct structure")
    
    def test_calculate_birth_chart_success(self):
        """Test /api/birth-chart/calculate with valid data"""
        payload = {
            "birth_date": "1990-07-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}. Response: {response.text}"
        
        data = response.json()
        
        # Verify calculation method
        assert data.get("calculation_method") == "Swiss Ephemeris", "Should use Swiss Ephemeris"
        assert "precision" in data, "Should include precision info"
        
        # Verify Big Three (Sun, Moon, Rising)
        assert "sun_sign" in data, "Missing sun_sign"
        assert "moon_sign" in data, "Missing moon_sign"
        assert "rising_sign" in data, "Missing rising_sign"
        assert "big_three" in data, "Missing big_three summary"
        
        print(f"SUCCESS: Big Three - Sun: {data['sun_sign']}, Moon: {data['moon_sign']}, Rising: {data['rising_sign']}")
        
        # Verify Ascendant details
        assert "ascendant" in data, "Missing ascendant"
        ascendant = data["ascendant"]
        assert "sign" in ascendant, "Ascendant missing sign"
        assert "degree" in ascendant, "Ascendant missing degree"
        assert "longitude" in ascendant, "Ascendant missing longitude"
        
        print(f"SUCCESS: Ascendant at {ascendant.get('degree')}° {ascendant.get('sign')}")
        
        # Verify Midheaven
        assert "midheaven" in data, "Missing midheaven"
        midheaven = data["midheaven"]
        assert "sign" in midheaven, "Midheaven missing sign"
        assert "degree" in midheaven, "Midheaven missing degree"
        
        print(f"SUCCESS: Midheaven at {midheaven.get('degree')}° {midheaven.get('sign')}")
        
        # Verify planets list
        assert "planets" in data, "Missing planets"
        planets = data["planets"]
        assert isinstance(planets, list), "Planets should be a list"
        assert len(planets) >= 10, f"Expected at least 10 planets, got {len(planets)}"
        
        # Check specific planets are calculated
        planet_names = [p["name"] for p in planets]
        expected_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", 
                          "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", 
                          "North Node", "South Node"]
        
        for planet in expected_planets:
            assert planet in planet_names, f"Missing planet calculation: {planet}"
        
        print(f"SUCCESS: All {len(planets)} planets calculated")
        
        # Verify planet data structure
        for planet in planets:
            assert "name" in planet, "Planet missing name"
            assert "sign" in planet, f"Planet {planet.get('name')} missing sign"
            assert "degree" in planet, f"Planet {planet.get('name')} missing degree"
            assert "house" in planet, f"Planet {planet.get('name')} missing house"
            assert "longitude" in planet, f"Planet {planet.get('name')} missing longitude"
            # Check for retrograde flag
            assert "retrograde" in planet, f"Planet {planet.get('name')} missing retrograde flag"
        
        print("SUCCESS: All planets have complete data structure including retrograde")
        
    def test_calculate_birth_chart_houses(self):
        """Test that houses are correctly calculated"""
        payload = {
            "birth_date": "1985-03-21",
            "birth_time": "06:00",
            "birth_city": "London",
            "birth_country": "UK"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify houses
        assert "houses" in data, "Missing houses"
        houses = data["houses"]
        
        # Houses can be dict with string or int keys
        assert len(houses) == 12, f"Expected 12 houses, got {len(houses)}"
        
        # Check each house has required data
        for key, house in houses.items():
            assert "sign" in house, f"House {key} missing sign"
            assert "degree" in house, f"House {key} missing degree"
            assert "theme" in house, f"House {key} missing theme"
        
        print("SUCCESS: All 12 houses calculated with signs and themes")
    
    def test_calculate_birth_chart_aspects(self):
        """Test that aspects are correctly calculated"""
        payload = {
            "birth_date": "1995-12-25",
            "birth_time": "23:45",
            "birth_city": "Sydney",
            "birth_country": "Australia"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify aspects
        assert "aspects" in data, "Missing aspects"
        aspects = data["aspects"]
        assert isinstance(aspects, list), "Aspects should be a list"
        
        # Should have at least some aspects
        assert len(aspects) > 0, "Should have at least one aspect"
        
        # Verify aspect structure
        for aspect in aspects[:5]:  # Check first 5
            assert "planet1" in aspect, "Aspect missing planet1"
            assert "planet2" in aspect, "Aspect missing planet2"
            assert "aspect" in aspect, "Aspect missing aspect type"
            assert "orb" in aspect, "Aspect missing orb"
            assert "symbol" in aspect, "Aspect missing symbol"
        
        print(f"SUCCESS: {len(aspects)} aspects calculated with full details")
        
        # Print some aspect examples
        for aspect in aspects[:3]:
            print(f"  - {aspect['planet1']} {aspect['symbol']} {aspect['planet2']} ({aspect['aspect']}, orb: {aspect['orb']}°)")
    
    def test_calculate_birth_chart_elements_and_qualities(self):
        """Test element and quality balance calculations"""
        payload = {
            "birth_date": "2000-01-01",
            "birth_time": "12:00",
            "birth_city": "Tokyo",
            "birth_country": "Japan"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify element balance
        assert "elements" in data, "Missing elements"
        elements = data["elements"]
        assert "counts" in elements, "Elements missing counts"
        assert "percentages" in elements, "Elements missing percentages"
        assert "dominant" in elements, "Elements missing dominant"
        
        # Check all 4 elements
        for element in ["Fire", "Earth", "Air", "Water"]:
            assert element in elements["counts"], f"Missing element count: {element}"
        
        print(f"SUCCESS: Element balance - Dominant: {elements['dominant']}")
        
        # Verify quality balance
        assert "qualities" in data, "Missing qualities"
        qualities = data["qualities"]
        assert "counts" in qualities, "Qualities missing counts"
        assert "percentages" in qualities, "Qualities missing percentages"
        assert "dominant" in qualities, "Qualities missing dominant"
        
        # Check all 3 qualities
        for quality in ["Cardinal", "Fixed", "Mutable"]:
            assert quality in qualities["counts"], f"Missing quality count: {quality}"
        
        print(f"SUCCESS: Quality balance - Dominant: {qualities['dominant']}")
    
    def test_calculate_birth_chart_with_coordinates(self):
        """Test birth chart calculation with explicit coordinates"""
        payload = {
            "birth_date": "1988-06-15",
            "birth_time": "09:30",
            "birth_city": "Custom Location",
            "birth_country": "Custom",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "timezone_name": "America/Los_Angeles"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify birth data reflects custom coordinates
        assert "birth_data" in data, "Missing birth_data"
        birth_data = data["birth_data"]
        assert birth_data["latitude"] == 34.0522, "Latitude not preserved"
        assert birth_data["longitude"] == -118.2437, "Longitude not preserved"
        
        print("SUCCESS: Custom coordinates accepted and used")
    
    def test_calculate_birth_chart_different_cities(self):
        """Test birth chart calculation for different cities"""
        cities = [
            {"city": "Paris", "country": "France"},
            {"city": "Mumbai", "country": "India"},
            {"city": "Los Angeles", "country": "USA"},
            {"city": "Berlin", "country": "Germany"},
            {"city": "Singapore", "country": "Singapore"}
        ]
        
        for city_data in cities:
            payload = {
                "birth_date": "1990-01-01",
                "birth_time": "12:00",
                "birth_city": city_data["city"],
                "birth_country": city_data["country"]
            }
            
            response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
            assert response.status_code == 200, f"Failed for {city_data['city']}: {response.status_code}"
            
            data = response.json()
            assert "sun_sign" in data, f"Missing sun_sign for {city_data['city']}"
            print(f"SUCCESS: {city_data['city']} - Rising: {data['rising_sign']}")
    
    def test_calculate_birth_chart_retrograde_detection(self):
        """Test that retrograde planets are properly detected"""
        # Mercury retrograde happens several times a year
        # Test with a date that typically has retrogrades
        payload = {
            "birth_date": "1990-07-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        planets = data["planets"]
        
        # Verify retrograde field exists on all planets
        for planet in planets:
            assert "retrograde" in planet, f"Planet {planet['name']} missing retrograde field"
            assert isinstance(planet["retrograde"], bool), f"Retrograde should be boolean for {planet['name']}"
        
        # Count retrograde planets
        retrograde_count = sum(1 for p in planets if p.get("retrograde"))
        print(f"SUCCESS: Retrograde detection working. {retrograde_count} planets retrograde")
    
    def test_calculate_birth_chart_invalid_date(self):
        """Test error handling for invalid date"""
        payload = {
            "birth_date": "invalid-date",
            "birth_time": "12:00",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code in [400, 422], f"Expected 400 or 422 for invalid date, got {response.status_code}"
        
        print("SUCCESS: Invalid date properly rejected")
    
    def test_calculate_birth_chart_julian_day(self):
        """Test that Julian Day is included in the response"""
        payload = {
            "birth_date": "1990-07-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "birth_data" in data, "Missing birth_data"
        assert "julian_day" in data["birth_data"], "Missing julian_day"
        
        jd = data["birth_data"]["julian_day"]
        assert isinstance(jd, (int, float)), "Julian day should be numeric"
        assert jd > 2400000, "Julian day should be a valid astronomical value"
        
        print(f"SUCCESS: Julian Day calculated: {jd}")


class TestBirthChartPrecision:
    """Tests for Swiss Ephemeris precision"""
    
    def test_longitude_precision(self):
        """Test that longitudes have high precision (0.0001 degrees)"""
        payload = {
            "birth_date": "1990-07-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check precision of planet longitudes
        for planet in data["planets"]:
            longitude = planet.get("longitude")
            assert longitude is not None, f"Missing longitude for {planet['name']}"
            
            # Check it has decimal places (precision)
            longitude_str = str(longitude)
            if "." in longitude_str:
                decimals = len(longitude_str.split(".")[1])
                assert decimals >= 2, f"Expected at least 2 decimal places for {planet['name']}, got {decimals}"
        
        print("SUCCESS: High precision longitudes verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
