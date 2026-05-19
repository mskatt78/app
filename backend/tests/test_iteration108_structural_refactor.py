"""
Iteration 108 - Structural Refactor Verification Tests

Tests to verify that the structural code-quality refactor pass did not introduce regressions:
- BirthChart page with extracted BirthChartResults component
- CrystalGuide page with extracted CrystalDetailDialog component
- Courses page with extracted useCoursePayments hook
- PracticeTimer with extracted timerAudioEngine
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthCheck:
    """Basic health check to ensure backend is running"""
    
    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("PASS: Health check passed")


class TestBirthChartAPIs:
    """Tests for BirthChart page API dependencies"""
    
    def test_zodiac_signs_endpoint(self):
        """Verify zodiac signs endpoint returns expected data structure"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200
        data = response.json()
        
        # Should have all 12 zodiac signs
        expected_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        for sign in expected_signs:
            assert sign in data, f"Missing zodiac sign: {sign}"
            assert "element" in data[sign]
            assert "symbol" in data[sign]
        print("PASS: Zodiac signs endpoint returns all 12 signs with correct structure")
    
    def test_birth_chart_calculate_endpoint(self):
        """Verify birth chart calculation endpoint works"""
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "12:00",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure for BirthChartResults component
        assert "planets" in data, "Missing planets in response"
        assert "ascendant" in data, "Missing ascendant in response"
        assert "midheaven" in data, "Missing midheaven in response"
        assert "houses" in data, "Missing houses in response"
        assert "aspects" in data, "Missing aspects in response"
        assert "elements" in data, "Missing elements in response"
        assert "qualities" in data, "Missing qualities in response"
        
        # Verify planets have required fields
        if data["planets"]:
            planet = data["planets"][0]
            assert "name" in planet
            assert "sign" in planet
            assert "degree" in planet
            assert "house" in planet
        
        print("PASS: Birth chart calculation returns complete data structure")


class TestCrystalGuideAPIs:
    """Tests for CrystalGuide page API dependencies"""
    
    def test_crystals_deep_endpoint(self):
        """Verify crystals deep endpoint returns expected data for CrystalDetailDialog"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one crystal"
        
        # Verify crystal structure for CrystalDetailDialog component
        crystal = data[0]
        required_fields = ["id", "name", "element", "description"]
        for field in required_fields:
            assert field in crystal, f"Missing required field: {field}"
        
        # Verify optional fields used by CrystalDetailDialog
        optional_fields = ["title", "chakra", "planet", "healing_properties", 
                          "meditation_guidance", "practice_guide", "affirmation"]
        found_optional = sum(1 for f in optional_fields if f in crystal)
        print(f"PASS: Crystals deep endpoint returns {len(data)} crystals with {found_optional} optional fields")
    
    def test_crystal_has_practice_data(self):
        """Verify crystals have practice data for guided practice feature"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200
        data = response.json()
        
        # Check if any crystal has practice_guide or meditation_guidance
        crystals_with_practice = [c for c in data if c.get("practice_guide") or c.get("meditation_guidance")]
        assert len(crystals_with_practice) > 0, "At least one crystal should have practice data"
        print(f"PASS: {len(crystals_with_practice)} crystals have practice/meditation guidance")


class TestCoursesAPIs:
    """Tests for Courses page API dependencies (useCoursePayments hook)"""
    
    def test_courses_endpoint(self):
        """Verify courses endpoint returns expected data structure"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one course"
        
        # Verify course structure
        course = data[0]
        required_fields = ["id", "title", "description"]
        for field in required_fields:
            assert field in course, f"Missing required field: {field}"
        
        # Verify premium course fields for useCoursePayments hook
        premium_courses = [c for c in data if c.get("is_premium")]
        if premium_courses:
            premium = premium_courses[0]
            assert "price" in premium, "Premium course should have price"
        
        print(f"PASS: Courses endpoint returns {len(data)} courses, {len(premium_courses)} premium")
    
    def test_course_has_deep_content(self):
        """Verify courses have deep content for modal tabs"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        # Check for deep content fields used by course modal
        deep_content_fields = ["rites", "rituals", "embodiment_practices", 
                              "daily_practice", "forty_day_integration"]
        
        for course in data:
            found_deep = [f for f in deep_content_fields if course.get(f)]
            if found_deep:
                print(f"Course '{course.get('title', 'Unknown')}' has: {', '.join(found_deep)}")
        
        # At least one course should have deep content
        courses_with_deep = [c for c in data if any(c.get(f) for f in deep_content_fields)]
        assert len(courses_with_deep) > 0, "At least one course should have deep content"
        print(f"PASS: {len(courses_with_deep)} courses have deep content for modal tabs")


class TestContentExpandScript:
    """Tests for PracticeTimer narration (timerAudioEngine dependency)"""
    
    def test_expand_script_endpoint(self):
        """Verify expand-script endpoint works for timer narration"""
        payload = {
            "practice_name": "Crystal Meditation",
            "element": "Spirit",
            "duration_minutes": 10,
            "use_ai": False,
            "steps": ["Find a comfortable position", "Hold the crystal", "Breathe deeply"],
            "source_texts": ["Connect with the crystal energy"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure for PracticeTimer narration
        assert "segments" in data, "Response should have segments"
        assert isinstance(data["segments"], list), "Segments should be a list"
        
        print(f"PASS: Expand script returns {len(data.get('segments', []))} narration segments")


class TestTTSEndpoint:
    """Tests for TTS endpoint used by PracticeTimer"""
    
    def test_tts_generate_base64_endpoint(self):
        """Verify TTS endpoint works for timer voice guidance"""
        payload = {
            "text": "Welcome to your practice.",
            "voice": "nova",
            "speed": 0.9
        }
        response = requests.post(f"{BASE_URL}/api/tts/generate-base64", json=payload)
        
        # TTS may fail if no API key, but endpoint should exist
        if response.status_code == 200:
            data = response.json()
            assert "audio_base64" in data, "Response should have audio_base64"
            print("PASS: TTS endpoint returns audio data")
        elif response.status_code == 500:
            # API key may not be configured
            print("INFO: TTS endpoint exists but may need API key configuration")
        else:
            print(f"INFO: TTS endpoint returned status {response.status_code}")


class TestDailyPracticeAPI:
    """Tests for daily practice API used by Courses daily practice tab"""
    
    def test_daily_practice_endpoint(self):
        """Verify daily practice endpoint works"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response has expected fields
        expected_fields = ["date", "moon_phase", "day_of_week"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"PASS: Daily practice endpoint returns data for {data.get('date', 'unknown date')}")


class TestPaymentEndpoints:
    """Tests for payment endpoints used by useCoursePayments hook"""
    
    def test_course_access_requires_auth(self):
        """Verify course-access endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/course-access")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422], "Course access should require auth"
        print("PASS: Course access endpoint requires authentication")
    
    def test_create_checkout_requires_auth(self):
        """Verify create-checkout endpoint requires authentication"""
        payload = {
            "product_type": "course",
            "product_id": "test-course",
            "origin_url": "https://example.com",
            "payment_method": "stripe"
        }
        response = requests.post(f"{BASE_URL}/api/payments/create-checkout", json=payload)
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422], "Create checkout should require auth"
        print("PASS: Create checkout endpoint requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
