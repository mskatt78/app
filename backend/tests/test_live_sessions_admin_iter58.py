"""
Test Live Sessions and Admin endpoints for iteration 58.
Tests:
- Admin password login
- Admin collections endpoint (includes live_sessions, astrology_months)
- Live sessions CRUD endpoints
- RSVP and message posting (no ObjectId serialization issues)
"""
import pytest
import requests
from test_security_config import BASE_URL, ADMIN_PASSWORD


def _require_admin_password():
    if not ADMIN_PASSWORD:
        pytest.skip("Set ADMIN_PASSWORD to run admin-authenticated tests")


class TestAdminLogin:
    """Test admin password login flow"""

    def test_admin_login_success(self):
        """Admin login with correct password returns token"""
        _require_admin_password()
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert data.get("role") == "admin", "Role should be admin"
        print("✓ Admin login successful, token received")

    def test_admin_login_wrong_password(self):
        """Admin login with wrong password returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrongpassword"},
            timeout=10
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Wrong password correctly rejected with 401")


class TestAdminCollections:
    """Test admin collections endpoint"""

    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        _require_admin_password()
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        assert response.status_code == 200
        return response.json()["token"]

    def test_admin_collections_returns_list(self, admin_token):
        """Admin collections endpoint returns list of collections"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Admin collections returned {len(data)} collections")

    def test_admin_collections_includes_live_sessions(self, admin_token):
        """Admin collections includes live_sessions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        collection_ids = [c["id"] for c in data]
        assert "live_sessions" in collection_ids, f"live_sessions not in collections: {collection_ids}"
        print("✓ live_sessions found in admin collections")

    def test_admin_collections_includes_astrology_months(self, admin_token):
        """Admin collections includes astrology_months"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        collection_ids = [c["id"] for c in data]
        assert "astrology_months" in collection_ids, f"astrology_months not in collections: {collection_ids}"
        print("✓ astrology_months found in admin collections")

    def test_admin_collections_unauthorized(self):
        """Admin collections without token returns 401/403"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            timeout=10
        )
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print("✓ Unauthorized request correctly rejected")


class TestLiveSessionsPublicEndpoints:
    """Test public live sessions endpoints"""

    def test_get_live_sessions_list(self):
        """GET /api/live-sessions returns list"""
        response = requests.get(f"{BASE_URL}/api/live-sessions", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/live-sessions returned {len(data)} sessions")
        return data

    def test_get_live_session_by_id(self):
        """GET /api/live-sessions/{id} returns session details"""
        # First get list to find a session ID
        list_response = requests.get(f"{BASE_URL}/api/live-sessions", timeout=10)
        sessions = list_response.json()
        
        if not sessions:
            pytest.skip("No live sessions in database to test")
        
        session_id = sessions[0]["id"]
        response = requests.get(f"{BASE_URL}/api/live-sessions/{session_id}", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["id"] == session_id, "Session ID should match"
        assert "title" in data, "Session should have title"
        # Check no ObjectId serialization issues
        assert "_id" not in data, "Response should not contain _id (ObjectId)"
        print(f"✓ GET /api/live-sessions/{session_id} returned session: {data.get('title')}")

    def test_get_live_session_not_found(self):
        """GET /api/live-sessions/{id} returns 404 for non-existent session"""
        response = requests.get(f"{BASE_URL}/api/live-sessions/nonexistent123", timeout=10)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent session correctly returns 404")


class TestLiveSessionRSVP:
    """Test live session RSVP functionality"""

    def test_rsvp_to_session(self):
        """POST /api/live-sessions/{id}/rsvp creates RSVP"""
        # First get a session ID
        list_response = requests.get(f"{BASE_URL}/api/live-sessions", timeout=10)
        sessions = list_response.json()
        
        if not sessions:
            pytest.skip("No live sessions in database to test RSVP")
        
        session_id = sessions[0]["id"]
        rsvp_data = {
            "display_name": "Test Client",
            "email": "testclient@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/live-sessions/{session_id}/rsvp",
            json=rsvp_data,
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success"), "RSVP should succeed"
        assert "attendee_count" in data, "Response should include attendee_count"
        # Check no ObjectId serialization issues (check for actual _id key, not substring)
        assert "_id" not in data.keys(), "Response should not contain _id key"
        print(f"✓ RSVP successful, attendee_count: {data.get('attendee_count')}")

    def test_rsvp_to_nonexistent_session(self):
        """POST /api/live-sessions/{id}/rsvp returns 404 for non-existent session"""
        rsvp_data = {
            "display_name": "Test Client",
            "email": "testclient@example.com"
        }
        response = requests.post(
            f"{BASE_URL}/api/live-sessions/nonexistent123/rsvp",
            json=rsvp_data,
            timeout=10
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ RSVP to non-existent session correctly returns 404")


class TestLiveSessionMessages:
    """Test live session chat/Q&A messages"""

    def test_post_chat_message(self):
        """POST /api/live-sessions/{id}/messages creates chat message"""
        # First get a session ID
        list_response = requests.get(f"{BASE_URL}/api/live-sessions", timeout=10)
        sessions = list_response.json()
        
        if not sessions:
            pytest.skip("No live sessions in database to test messages")
        
        session_id = sessions[0]["id"]
        message_data = {
            "display_name": "Test User",
            "email": "testuser@example.com",
            "message": "This is a test chat message from pytest",
            "kind": "chat"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/live-sessions/{session_id}/messages",
            json=message_data,
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Response should include message id"
        assert data.get("kind") == "chat", "Message kind should be chat"
        assert data.get("message") == message_data["message"], "Message content should match"
        # Check no ObjectId serialization issues (check for actual _id key, not substring)
        assert "_id" not in data.keys(), "Response should not contain _id key"
        print(f"✓ Chat message posted successfully, id: {data.get('id')}")

    def test_post_question_message(self):
        """POST /api/live-sessions/{id}/messages creates question message"""
        # First get a session ID
        list_response = requests.get(f"{BASE_URL}/api/live-sessions", timeout=10)
        sessions = list_response.json()
        
        if not sessions:
            pytest.skip("No live sessions in database to test messages")
        
        session_id = sessions[0]["id"]
        message_data = {
            "display_name": "Question Asker",
            "message": "Is there a replay available for this session?",
            "kind": "question"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/live-sessions/{session_id}/messages",
            json=message_data,
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("kind") == "question", "Message kind should be question"
        # Check no ObjectId serialization issues (check for actual _id key, not substring)
        assert "_id" not in data.keys(), "Response should not contain _id key"
        print("✓ Question message posted successfully")

    def test_get_session_messages(self):
        """GET /api/live-sessions/{id}/messages returns messages"""
        # First get a session ID
        list_response = requests.get(f"{BASE_URL}/api/live-sessions", timeout=10)
        sessions = list_response.json()
        
        if not sessions:
            pytest.skip("No live sessions in database to test messages")
        
        session_id = sessions[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/live-sessions/{session_id}/messages",
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Check no ObjectId serialization issues
        for msg in data:
            assert "_id" not in msg, "Messages should not contain _id"
        print(f"✓ GET messages returned {len(data)} messages")


class TestAdminLiveSessionsManagement:
    """Test admin management of live sessions"""

    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        assert response.status_code == 200
        return response.json()["token"]

    def test_admin_list_live_sessions(self, admin_token):
        """Admin can list live sessions via /api/admin/live_sessions/items"""
        response = requests.get(
            f"{BASE_URL}/api/admin/live_sessions/items",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "items" in data, "Response should have items key"
        assert "total" in data, "Response should have total key"
        print(f"✓ Admin list live_sessions: {data.get('total')} items")

    def test_admin_list_astrology_months(self, admin_token):
        """Admin can list astrology_months via /api/admin/astrology_months/items"""
        response = requests.get(
            f"{BASE_URL}/api/admin/astrology_months/items",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "items" in data, "Response should have items key"
        assert "total" in data, "Response should have total key"
        print(f"✓ Admin list astrology_months: {data.get('total')} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
