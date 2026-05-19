"""
Test suite for Stripe Payment Integration and Extended Course Content - Iteration 49
Tests: Course prices, payment endpoints, course access, extended rituals
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCoursesWithPrices:
    """Test courses page loads all 3 Sacred Rites with correct prices"""
    
    def test_courses_endpoint_returns_3_courses(self):
        """Verify /api/courses returns exactly 3 sacred rites courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3, f"Expected 3 courses, got {len(data)}"
        print(f"SUCCESS: Found {len(data)} courses")
    
    def test_munay_ki_course_price(self):
        """Verify Munay Ki course has correct price $197"""
        response = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert response.status_code == 200
        data = response.json()
        assert data.get("price") == 197.0, f"Expected price 197.0, got {data.get('price')}"
        assert data.get("is_premium")
        print(f"SUCCESS: Munay Ki price is ${data.get('price')}")
    
    def test_nusta_karpay_course_price(self):
        """Verify Nusta Karpay course has correct price $177"""
        response = requests.get(f"{BASE_URL}/api/courses/nusta-karpay")
        assert response.status_code == 200
        data = response.json()
        assert data.get("price") == 177.0, f"Expected price 177.0, got {data.get('price')}"
        assert data.get("is_premium")
        print(f"SUCCESS: Nusta Karpay price is ${data.get('price')}")
    
    def test_13th_rite_womb_course_price(self):
        """Verify 13th Rite of the Womb course has correct price $147"""
        response = requests.get(f"{BASE_URL}/api/courses/13th-rite-womb")
        assert response.status_code == 200
        data = response.json()
        assert data.get("price") == 147.0, f"Expected price 147.0, got {data.get('price')}"
        assert data.get("is_premium")
        print(f"SUCCESS: 13th Rite of the Womb price is ${data.get('price')}")


class TestCourseContent:
    """Test course content structure - tabs and rituals"""
    
    def test_munay_ki_has_7_tabs_content(self):
        """Verify Munay Ki has content for all 7 tabs"""
        response = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert response.status_code == 200
        data = response.json()
        
        # Check for all tab content
        assert len(data.get("rites", [])) > 0, "Missing rites content"
        assert len(data.get("rituals", [])) > 0, "Missing rituals content"
        assert len(data.get("embodiment_practices", [])) > 0, "Missing embodiment practices"
        assert data.get("preparation") is not None, "Missing preparation content"
        assert data.get("daily_practice") is not None, "Missing daily practice"
        assert data.get("forty_day_integration") is not None, "Missing 40-day integration"
        assert data.get("safety_precautions") is not None, "Missing safety precautions"
        
        print("SUCCESS: Munay Ki has all 7 tabs content")
    
    def test_munay_ki_has_5_rituals_including_new_ones(self):
        """Verify Munay Ki has 5 rituals including Fire Ceremony and Lineage Healing"""
        response = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert response.status_code == 200
        data = response.json()
        
        rituals = data.get("rituals", [])
        assert len(rituals) == 5, f"Expected 5 rituals, got {len(rituals)}"
        
        ritual_names = [r.get("name") for r in rituals]
        assert "Fire Ceremony — Releasing What No Longer Serves" in ritual_names, "Missing Fire Ceremony ritual"
        assert "Lineage Healing Ceremony" in ritual_names, "Missing Lineage Healing ritual"
        
        print(f"SUCCESS: Found {len(rituals)} rituals including new Fire Ceremony and Lineage Healing")
    
    def test_munay_ki_has_9_rites(self):
        """Verify Munay Ki has all 9 rites"""
        response = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert response.status_code == 200
        data = response.json()
        
        rites = data.get("rites", [])
        assert len(rites) == 9, f"Expected 9 rites, got {len(rites)}"
        
        # Verify rite names
        expected_rites = [
            "Bands of Power", "Healer's Rite", "Harmony Rite", "Seer's Rite",
            "Daykeeper's Rite", "Wisdomkeeper's Rite", "Earthkeeper's Rite",
            "Starkeeper's Rite", "Creator Rite"
        ]
        actual_rites = [r.get("name") for r in rites]
        for expected in expected_rites:
            assert expected in actual_rites, f"Missing rite: {expected}"
        
        print("SUCCESS: Found all 9 rites")


class TestPaymentEndpoints:
    """Test payment-related endpoints"""
    
    def test_course_access_requires_auth(self):
        """Verify /api/payments/course-access requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/course-access")
        assert response.status_code == 401 or response.status_code == 403
        print("SUCCESS: course-access endpoint requires authentication")
    
    def test_subscription_status_requires_auth(self):
        """Verify /api/payments/subscription-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/subscription-status")
        assert response.status_code == 401 or response.status_code == 403
        print("SUCCESS: subscription-status endpoint requires authentication")
    
    def test_create_checkout_requires_auth(self):
        """Verify /api/payments/create-checkout requires authentication"""
        response = requests.post(f"{BASE_URL}/api/payments/create-checkout", json={
            "product_type": "course",
            "product_id": "munay-ki",
            "origin_url": "https://example.com",
            "payment_method": "stripe"
        })
        assert response.status_code == 401 or response.status_code == 403
        print("SUCCESS: create-checkout endpoint requires authentication")
    
    def test_plans_endpoint_public(self):
        """Verify /api/payments/plans is publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert "plans" in data
        assert "payment_methods" in data
        assert len(data["plans"]) == 2  # monthly and yearly
        assert "stripe" in data["payment_methods"]
        
        print("SUCCESS: plans endpoint is public and returns correct data")
    
    def test_check_access_requires_auth(self):
        """Verify /api/payments/check-access/{type}/{id} requires authentication"""
        response = requests.get(f"{BASE_URL}/api/payments/check-access/course/munay-ki")
        assert response.status_code == 401 or response.status_code == 403
        print("SUCCESS: check-access endpoint requires authentication")


class TestAllCoursesHaveRequiredFields:
    """Test all courses have required fields for payment integration"""
    
    def test_all_courses_have_price(self):
        """Verify all courses have price field"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        
        for course in courses:
            assert course.get("price") is not None, f"Course {course.get('id')} missing price"
            assert course.get("price") > 0, f"Course {course.get('id')} has invalid price"
        
        print(f"SUCCESS: All {len(courses)} courses have valid prices")
    
    def test_all_courses_are_premium(self):
        """Verify all courses are marked as premium"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        
        for course in courses:
            assert course.get("is_premium"), f"Course {course.get('id')} not marked as premium"
        
        print(f"SUCCESS: All {len(courses)} courses are marked as premium")
    
    def test_all_courses_have_id(self):
        """Verify all courses have id field for payment integration"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        
        expected_ids = ["munay-ki", "nusta-karpay", "13th-rite-womb"]
        actual_ids = [c.get("id") for c in courses]
        
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing course with id: {expected_id}"
        
        print("SUCCESS: All expected course IDs present")


class TestNustaKarpayContent:
    """Test Nusta Karpay course content"""
    
    def test_nusta_karpay_has_7_rites(self):
        """Verify Nusta Karpay has 7 goddess rites"""
        response = requests.get(f"{BASE_URL}/api/courses/nusta-karpay")
        assert response.status_code == 200
        data = response.json()
        
        rites = data.get("rites", [])
        assert len(rites) == 7, f"Expected 7 rites, got {len(rites)}"
        print(f"SUCCESS: Nusta Karpay has {len(rites)} goddess rites")
    
    def test_nusta_karpay_has_rituals(self):
        """Verify Nusta Karpay has rituals"""
        response = requests.get(f"{BASE_URL}/api/courses/nusta-karpay")
        assert response.status_code == 200
        data = response.json()
        
        rituals = data.get("rituals", [])
        assert len(rituals) >= 3, f"Expected at least 3 rituals, got {len(rituals)}"
        print(f"SUCCESS: Nusta Karpay has {len(rituals)} rituals")


class TestWombRiteContent:
    """Test 13th Rite of the Womb course content"""
    
    def test_womb_rite_has_content(self):
        """Verify 13th Rite of the Womb has required content"""
        response = requests.get(f"{BASE_URL}/api/courses/13th-rite-womb")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("is_premium")
        assert data.get("price") == 147.0
        assert data.get("rites") is not None or data.get("rituals") is not None
        
        print("SUCCESS: 13th Rite of the Womb has required content")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
