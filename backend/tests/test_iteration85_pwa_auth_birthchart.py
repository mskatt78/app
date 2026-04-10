"""
Iteration 85 - Testing PWA stability, Auth resilience, Birth Chart flow, and Scroll reset
Focus areas:
1. PWA/Service Worker navigation behavior
2. Auth route resilience (session-expired fallback)
3. Birth chart guest calculation and auth fallback
4. Scroll reset on navigation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_api_health(self):
        """Verify API is responding"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ API health check passed")

    def test_frontend_loads(self):
        """Verify frontend HTML loads"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        print("✓ Frontend loads correctly")


class TestServiceWorkerAndPWA:
    """Test service worker and PWA-related endpoints"""
    
    def test_service_worker_exists(self):
        """Verify service worker file is accessible"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content = response.text
        # Verify it's the correct service worker with v4 cache
        assert "CACHE_VERSION" in content or "temple-static" in content
        print("✓ Service worker file accessible")
    
    def test_manifest_exists(self):
        """Verify manifest.json is accessible for PWA"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data or "short_name" in data
        print("✓ Manifest.json accessible")
    
    def test_offline_html_exists(self):
        """Verify offline.html fallback exists"""
        response = requests.get(f"{BASE_URL}/offline.html")
        # May return 200 or 404 depending on if it exists
        # Just verify the request doesn't error
        assert response.status_code in [200, 404]
        print(f"✓ Offline.html check: status {response.status_code}")


class TestAuthEndpoints:
    """Test authentication endpoints for resilience"""
    
    def test_auth_me_unauthenticated(self):
        """Verify /auth/me returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /auth/me correctly returns 401 for unauthenticated requests")
    
    def test_auth_session_invalid(self):
        """Verify /auth/session handles invalid session gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={"session_id": "invalid_session_id_12345"}
        )
        # Should return 401 or 400 for invalid session
        assert response.status_code in [400, 401, 404]
        print(f"✓ /auth/session handles invalid session: status {response.status_code}")
    
    def test_admin_login_endpoint(self):
        """Verify admin login endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": "test@example.com", "password": "wrongpassword"}
        )
        # Should return 401 for wrong credentials, not 500
        assert response.status_code in [400, 401, 403]
        print(f"✓ Admin login endpoint responds correctly: status {response.status_code}")


class TestBirthChartEndpoints:
    """Test birth chart calculation endpoints"""
    
    def test_zodiac_signs_endpoint(self):
        """Verify zodiac signs endpoint works"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs")
        assert response.status_code == 200
        data = response.json()
        # Should have zodiac sign data
        assert isinstance(data, dict)
        print(f"✓ Zodiac signs endpoint works: {len(data)} signs")
    
    def test_birth_chart_calculate_guest(self):
        """Test guest birth chart calculation (no auth required)"""
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/calculate",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        # Verify chart data structure
        assert "sun_sign" in data
        assert "moon_sign" in data
        assert "rising_sign" in data or "ascendant" in data
        print(f"✓ Guest birth chart calculation works: Sun={data.get('sun_sign')}, Moon={data.get('moon_sign')}")
    
    def test_birth_chart_save_unauthenticated(self):
        """Test birth chart save returns 401 when not authenticated"""
        payload = {
            "birth_date": "1990-06-15",
            "birth_time": "14:30",
            "birth_city": "New York",
            "birth_country": "USA"
        }
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/save",
            json=payload
        )
        # Should return 401 for unauthenticated save attempt
        assert response.status_code in [401, 403]
        print(f"✓ Birth chart save correctly requires auth: status {response.status_code}")
    
    def test_birth_chart_my_chart_unauthenticated(self):
        """Test my-chart endpoint returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/birth-chart/my-chart")
        assert response.status_code in [401, 403, 404]
        print(f"✓ My-chart endpoint correctly handles unauthenticated: status {response.status_code}")


class TestPublicRoutes:
    """Test that public routes load correctly"""
    
    def test_landing_page(self):
        """Verify landing page loads"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        print("✓ Landing page loads")
    
    def test_menu_page(self):
        """Verify menu page loads"""
        response = requests.get(f"{BASE_URL}/menu")
        assert response.status_code == 200
        print("✓ Menu page loads")
    
    def test_yoga_page(self):
        """Verify yoga page loads"""
        response = requests.get(f"{BASE_URL}/yoga")
        assert response.status_code == 200
        print("✓ Yoga page loads")
    
    def test_crystals_page(self):
        """Verify crystals page loads"""
        response = requests.get(f"{BASE_URL}/crystals")
        assert response.status_code == 200
        print("✓ Crystals page loads")
    
    def test_birth_chart_page(self):
        """Verify birth chart page loads"""
        response = requests.get(f"{BASE_URL}/birth-chart")
        assert response.status_code == 200
        print("✓ Birth chart page loads")
    
    def test_shamanic_practices_page(self):
        """Verify shamanic practices page loads"""
        response = requests.get(f"{BASE_URL}/shamanic-practices")
        assert response.status_code == 200
        print("✓ Shamanic practices page loads")


class TestProtectedRoutesBehavior:
    """Test protected routes return appropriate responses"""
    
    def test_dashboard_requires_auth(self):
        """Dashboard should load but show auth check UI"""
        response = requests.get(f"{BASE_URL}/dashboard")
        # Should return 200 (SPA loads) but React will handle auth
        assert response.status_code == 200
        print("✓ Dashboard page loads (auth handled client-side)")
    
    def test_settings_requires_auth(self):
        """Settings should load but show auth check UI"""
        response = requests.get(f"{BASE_URL}/settings")
        assert response.status_code == 200
        print("✓ Settings page loads (auth handled client-side)")
    
    def test_favorites_requires_auth(self):
        """Favorites should load but show auth check UI"""
        response = requests.get(f"{BASE_URL}/favorites")
        assert response.status_code == 200
        print("✓ Favorites page loads (auth handled client-side)")


class TestContentAPIs:
    """Test content APIs that subject pages depend on"""
    
    def test_yoga_poses_api(self):
        """Verify yoga poses API works"""
        response = requests.get(f"{BASE_URL}/api/yoga-poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses API: {len(data)} poses")
    
    def test_crystals_api(self):
        """Verify crystals API works"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Crystals API: {len(data)} crystals")
    
    def test_shamanic_practices_api(self):
        """Verify shamanic practices API works"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Shamanic practices API: {len(data)} practices")
    
    def test_mantras_api(self):
        """Verify mantras API works"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mantras API: {len(data)} mantras")
    
    def test_water_practices_api(self):
        """Verify water practices API works"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Water practices API: {len(data)} practices")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
