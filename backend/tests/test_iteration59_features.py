"""
Iteration 59 Backend Tests
Tests for: Demo page, Support page, Settings account tools, Admin collections, Live sessions
"""
import pytest
import requests
from test_security_config import BASE_URL, ADMIN_PASSWORD, QA_USER_EMAIL, QA_USER_PASSWORD



class TestPublicEndpoints:
    """Test public API endpoints used by demo and support pages"""
    
    def test_courses_endpoint(self):
        """Test /api/courses returns list"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/courses returns {len(data)} courses")
    
    def test_live_sessions_endpoint(self):
        """Test /api/live-sessions returns list"""
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/live-sessions returns {len(data)} sessions")
    
    def test_videos_endpoint(self):
        """Test /api/videos returns list"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/videos returns {len(data)} videos")
    
    def test_crystals_endpoint(self):
        """Test /api/crystals returns list"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: /api/crystals returns {len(data)} crystals")
    
    def test_light_codes_endpoint(self):
        """Test /api/light-codes returns data"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print("PASS: /api/light-codes returns data")


class TestAdminLogin:
    """Test admin authentication flows"""
    
    def test_admin_fallback_login_success(self):
        """Test admin login with fallback password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("role") == "admin"
        print("PASS: Admin fallback login works with password")
        return data["token"]
    
    def test_admin_fallback_login_wrong_password(self):
        """Test admin login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("PASS: Admin login correctly rejects wrong password")


class TestAdminCollections:
    """Test admin collections endpoint includes new collections"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    def test_admin_collections_endpoint(self, admin_token):
        """Test /api/admin/collections returns all collections"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Check for required collections
        collection_ids = [c["id"] for c in data]
        assert "live_sessions" in collection_ids, "live_sessions collection missing"
        assert "astrology_months" in collection_ids, "astrology_months collection missing"
        assert "account_deletion_requests" in collection_ids, "account_deletion_requests collection missing"
        
        print("PASS: Admin collections includes live_sessions, astrology_months, account_deletion_requests")
        print(f"Total collections: {len(data)}")
    
    def test_admin_live_sessions_items(self, admin_token):
        """Test admin can list live sessions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/live_sessions/items",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"PASS: Admin live_sessions items endpoint works, {data['total']} items")
    
    def test_admin_astrology_months_items(self, admin_token):
        """Test admin can list astrology months"""
        response = requests.get(
            f"{BASE_URL}/api/admin/astrology_months/items",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"PASS: Admin astrology_months items endpoint works, {data['total']} items")
    
    def test_admin_account_deletion_requests_items(self, admin_token):
        """Test admin can list account deletion requests"""
        response = requests.get(
            f"{BASE_URL}/api/admin/account_deletion_requests/items",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"PASS: Admin account_deletion_requests items endpoint works, {data['total']} items")


class TestUserAccountEndpoints:
    """Test user account management endpoints (export, deletion request, status)"""
    
    @pytest.fixture
    def user_session(self):
        """Login as QA user and get session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": QA_USER_EMAIL, "password": QA_USER_PASSWORD}
        )
        if response.status_code == 200:
            return session
        pytest.skip(f"QA user login failed: {response.status_code} - {response.text}")
    
    def test_account_export_endpoint(self, user_session):
        """Test /api/account/export returns user data"""
        response = user_session.get(f"{BASE_URL}/api/account/export")
        assert response.status_code == 200
        data = response.json()
        
        # Verify export structure
        assert "exported_at" in data
        assert "profile" in data
        assert "reminder_settings" in data
        assert "favorites" in data
        assert "practice_history" in data
        assert "rituals" in data
        assert "journal_entries" in data
        
        print("PASS: Account export returns complete data structure")
        print(f"Profile email: {data['profile'].get('email')}")
    
    def test_account_deletion_status_endpoint(self, user_session):
        """Test /api/account/deletion-status returns status"""
        response = user_session.get(f"{BASE_URL}/api/account/deletion-status")
        assert response.status_code == 200
        data = response.json()
        
        # Should return either existing request or "none" status
        assert "status" in data or "message" in data
        print("PASS: Account deletion status endpoint works")
        print(f"Status: {data.get('status', 'none')}")
    
    def test_account_delete_request_endpoint(self, user_session):
        """Test /api/account/delete-request creates deletion request"""
        response = user_session.post(
            f"{BASE_URL}/api/account/delete-request",
            json={"reason": "Testing deletion request flow"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") or data.get("status") == "requested"
        print("PASS: Account deletion request endpoint works")
        print(f"Response: {data}")


class TestLiveSessionsPublic:
    """Test public live sessions endpoints"""
    
    def test_live_sessions_list(self):
        """Test public live sessions list"""
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            session = data[0]
            # Verify session structure
            assert "id" in session
            assert "title" in session or "name" in session
            print(f"PASS: Live sessions list returns {len(data)} sessions")
        else:
            print("PASS: Live sessions list returns empty (no sessions created)")
    
    def test_live_session_rsvp(self):
        """Test RSVP to a live session"""
        # First get a session
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        if response.status_code != 200:
            pytest.skip("Could not get live sessions")
        
        sessions = response.json()
        if not sessions:
            pytest.skip("No live sessions available for RSVP test")
        
        session_id = sessions[0]["id"]
        
        # RSVP to the session
        rsvp_response = requests.post(
            f"{BASE_URL}/api/live-sessions/{session_id}/rsvp",
            json={
                "display_name": "Test User",
                "email": "test@example.com"
            }
        )
        assert rsvp_response.status_code == 200
        data = rsvp_response.json()
        assert data.get("success")
        print("PASS: RSVP to live session works")
    
    def test_live_session_messages(self):
        """Test posting messages to a live session"""
        # First get a session
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        if response.status_code != 200:
            pytest.skip("Could not get live sessions")
        
        sessions = response.json()
        if not sessions:
            pytest.skip("No live sessions available for message test")
        
        session_id = sessions[0]["id"]
        
        # Post a chat message
        msg_response = requests.post(
            f"{BASE_URL}/api/live-sessions/{session_id}/messages",
            json={
                "display_name": "Test User",
                "message": "Test message from iteration 59",
                "kind": "chat"
            }
        )
        assert msg_response.status_code == 200
        data = msg_response.json()
        assert "id" in data
        assert data.get("message") == "Test message from iteration 59"
        print("PASS: Posting messages to live session works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
