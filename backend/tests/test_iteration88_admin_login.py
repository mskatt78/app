"""
Iteration 88 - Admin Login Flow Tests
Tests the critical bug fix: password-based admin login sets cookie, 
AdminDashboard should NOT fail with session-login error.

Key test scenarios:
1. Password-only admin login flow
2. Admin cookie session validation via /api/admin/collections
3. AdminSection manage pages with existing admin cookie
4. Session-login fallback for signed-in admin account
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAdminPasswordLogin:
    """Test password-based admin login flow"""
    
    def test_admin_login_with_correct_password(self):
        """POST /api/admin/login with correct password should set cookie and return success"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("session") == "active", "Expected session to be active"
        assert data.get("role") == "admin", "Expected role to be admin"
        
        # Verify cookie was set
        assert "admin_session" in response.cookies, "Expected admin_session cookie to be set"
        print(f"SUCCESS: Admin login returned: {data}")
    
    def test_admin_login_with_wrong_password(self):
        """POST /api/admin/login with wrong password should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "WrongPassword123!"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Wrong password correctly rejected with 401")
    
    def test_admin_login_empty_password(self):
        """POST /api/admin/login with empty password should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ""},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Empty password correctly rejected with 401")


class TestAdminCookieSession:
    """Test admin cookie session validation - the critical fix"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session cookie via password login"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, "Failed to login as admin"
        return response.cookies
    
    def test_collections_with_admin_cookie(self, admin_session):
        """GET /api/admin/collections with valid admin cookie should return collections"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            cookies=admin_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of collections"
        assert len(data) > 0, "Expected at least one collection"
        
        # Verify collection structure
        first_collection = data[0]
        assert "id" in first_collection, "Collection should have id"
        assert "name" in first_collection, "Collection should have name"
        assert "count" in first_collection, "Collection should have count"
        
        print(f"SUCCESS: Got {len(data)} collections with admin cookie")
    
    def test_collections_without_cookie_returns_401(self):
        """GET /api/admin/collections without cookie should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/collections")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Collections endpoint correctly requires auth")
    
    def test_collection_items_with_admin_cookie(self, admin_session):
        """GET /api/admin/{collection}/items with valid admin cookie should return items"""
        response = requests.get(
            f"{BASE_URL}/api/admin/courses/items",
            cookies=admin_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "items" in data, "Expected items in response"
        assert "total" in data, "Expected total in response"
        
        print(f"SUCCESS: Got {data['total']} courses with admin cookie")


class TestAdminSectionPages:
    """Test AdminSection manage pages work with admin cookie"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session cookie via password login"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, "Failed to login as admin"
        return response.cookies
    
    def test_yoga_poses_items(self, admin_session):
        """GET /api/admin/yoga_poses/items should return yoga poses"""
        response = requests.get(
            f"{BASE_URL}/api/admin/yoga_poses/items",
            cookies=admin_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["total"] > 0, "Expected yoga poses to exist"
        print(f"SUCCESS: Got {data['total']} yoga poses")
    
    def test_astrology_months_items(self, admin_session):
        """GET /api/admin/astrology_months/items should return 13 moon paths"""
        response = requests.get(
            f"{BASE_URL}/api/admin/astrology_months/items",
            cookies=admin_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["total"] > 0, "Expected astrology months to exist"
        print(f"SUCCESS: Got {data['total']} astrology months")
    
    def test_live_sessions_items(self, admin_session):
        """GET /api/admin/live_sessions/items should return live sessions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/live_sessions/items",
            cookies=admin_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        print(f"SUCCESS: Got {data['total']} live sessions")
    
    def test_videos_items(self, admin_session):
        """GET /api/admin/videos/items should return videos"""
        response = requests.get(
            f"{BASE_URL}/api/admin/videos/items",
            cookies=admin_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["total"] > 0, "Expected videos to exist"
        print(f"SUCCESS: Got {data['total']} videos")


class TestAdminLogout:
    """Test admin logout functionality"""
    
    def test_admin_logout(self):
        """POST /api/admin/logout should clear admin cookie"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"},
            headers={"Content-Type": "application/json"}
        )
        assert login_response.status_code == 200
        admin_cookies = login_response.cookies
        
        # Then logout
        logout_response = requests.post(
            f"{BASE_URL}/api/admin/logout",
            cookies=admin_cookies
        )
        
        assert logout_response.status_code == 200, f"Expected 200, got {logout_response.status_code}"
        
        data = logout_response.json()
        assert data.get("logged_out"), "Expected logged_out to be True"
        
        print("SUCCESS: Admin logout completed")


class TestSessionLoginFallback:
    """Test session-login fallback for signed-in admin account"""
    
    def test_session_login_without_user_returns_401(self):
        """POST /api/admin/session-login without user session should return 401"""
        response = requests.post(f"{BASE_URL}/api/admin/session-login")
        
        # Should fail because no user session
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Session-login correctly requires user session")


class TestHealthCheck:
    """Basic health checks"""
    
    def test_api_health(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: API health check passed")
    
    def test_frontend_loads(self):
        """GET / should return 200"""
        response = requests.get(BASE_URL)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Frontend loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
