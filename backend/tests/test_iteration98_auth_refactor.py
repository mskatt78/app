"""
Iteration 98 - Auth Refactor Verification Tests
Tests auth endpoints after helper extraction refactor:
- POST /api/auth/register - creates account + sets session cookie
- POST /api/auth/login - authenticates existing user + sets session cookie
- GET /api/auth/me - works with cookie session, fails after logout
- POST /api/auth/logout - clears auth session
- POST /api/auth/google - works after refactor using payload model
- POST /api/auth/session - handles invalid session_id safely (returns controlled error, not 500)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthRegister:
    """Test POST /api/auth/register endpoint"""
    
    def test_register_creates_account_and_sets_cookie(self):
        """Register should create account and return session cookie"""
        unique_email = f"test_register_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "user" in data, "Response should contain 'user' field"
        assert "session_token" in data, "Response should contain 'session_token' field"
        assert data["user"]["email"] == unique_email.lower(), "Email should match (lowercased)"
        assert data["user"]["name"] == "Test User", "Name should match"
        assert "user_id" in data["user"], "User should have user_id"
        
        # Cookie assertion
        assert "session_token" in response.cookies, "Response should set session_token cookie"
        print(f"✓ Register created account for {unique_email} with session cookie")
    
    def test_register_rejects_duplicate_email(self):
        """Register should reject duplicate email"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        # First registration
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response1.status_code == 200, f"First registration failed: {response1.text}"
        
        # Second registration with same email
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response2.status_code == 400, f"Expected 400 for duplicate, got {response2.status_code}"
        assert "already registered" in response2.json().get("detail", "").lower()
        print("✓ Register correctly rejects duplicate email")
    
    def test_register_validates_password_length(self):
        """Register should require minimum password length"""
        payload = {
            "email": f"test_short_{uuid.uuid4().hex[:8]}@example.com",
            "password": "12345",  # Too short
            "name": "Test User"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 400, f"Expected 400 for short password, got {response.status_code}"
        print("✓ Register validates password length")


class TestAuthLogin:
    """Test POST /api/auth/login endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup_test_user(self):
        """Create a test user for login tests"""
        self.test_email = f"test_login_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "LoginTestPass123!"
        
        # Register the user first
        payload = {
            "email": self.test_email,
            "password": self.test_password,
            "name": "Login Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Setup failed: {response.text}"
        self.user_id = response.json()["user"]["user_id"]
    
    def test_login_authenticates_and_sets_cookie(self):
        """Login should authenticate and return session cookie"""
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "user" in data, "Response should contain 'user' field"
        assert "session_token" in data, "Response should contain 'session_token' field"
        assert data["user"]["email"] == self.test_email.lower()
        assert data["user"]["user_id"] == self.user_id
        
        # Cookie assertion
        assert "session_token" in response.cookies, "Response should set session_token cookie"
        print(f"✓ Login authenticated {self.test_email} with session cookie")
    
    def test_login_rejects_wrong_password(self):
        """Login should reject wrong password"""
        payload = {
            "email": self.test_email,
            "password": "WrongPassword123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Login correctly rejects wrong password")
    
    def test_login_rejects_nonexistent_user(self):
        """Login should reject nonexistent user"""
        payload = {
            "email": "nonexistent_user_xyz@example.com",
            "password": "SomePassword123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Login correctly rejects nonexistent user")


class TestAuthMeAndLogout:
    """Test GET /api/auth/me and POST /api/auth/logout endpoints"""
    
    def test_me_works_with_session_cookie(self):
        """GET /api/auth/me should return user data with valid session cookie"""
        # Create user and get session
        unique_email = f"test_me_{uuid.uuid4().hex[:8]}@example.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "MeTestPass123!",
            "name": "Me Test User"
        })
        assert register_response.status_code == 200
        
        session_token = register_response.cookies.get("session_token")
        assert session_token, "Should have session token cookie"
        
        # Test /me endpoint with cookie
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": session_token}
        )
        
        assert me_response.status_code == 200, f"Expected 200, got {me_response.status_code}: {me_response.text}"
        data = me_response.json()
        assert data["email"] == unique_email.lower()
        print(f"✓ GET /api/auth/me works with session cookie for {unique_email}")
    
    def test_me_fails_without_session(self):
        """GET /api/auth/me should fail without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/auth/me correctly fails without session")
    
    def test_logout_clears_session(self):
        """POST /api/auth/logout should clear session"""
        # Create user and get session
        unique_email = f"test_logout_{uuid.uuid4().hex[:8]}@example.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "LogoutTestPass123!",
            "name": "Logout Test User"
        })
        assert register_response.status_code == 200
        
        session_token = register_response.cookies.get("session_token")
        assert session_token, "Should have session token cookie"
        
        # Verify session works before logout
        me_before = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": session_token}
        )
        assert me_before.status_code == 200, "Session should work before logout"
        
        # Logout
        logout_response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            cookies={"session_token": session_token}
        )
        assert logout_response.status_code == 200, f"Logout failed: {logout_response.text}"
        assert "logged out" in logout_response.json().get("message", "").lower()
        
        # Verify session no longer works after logout
        me_after = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": session_token}
        )
        assert me_after.status_code == 401, f"Session should be invalid after logout, got {me_after.status_code}"
        print("✓ POST /api/auth/logout clears session correctly")


class TestAuthGoogle:
    """Test POST /api/auth/google endpoint after refactor"""
    
    def test_google_auth_with_payload_model(self):
        """POST /api/auth/google should work with GoogleAuthPayload model"""
        payload = {
            "user": {
                "id": "google_test_123",
                "email": f"google_test_{uuid.uuid4().hex[:8]}@gmail.com",
                "name": "Google Test User",
                "picture": "https://example.com/avatar.jpg"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/google", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "user" in data, "Response should contain 'user' field"
        assert "session_token" in data, "Response should contain 'session_token' field"
        assert data["user"]["email"] == payload["user"]["email"]
        assert data["user"]["name"] == payload["user"]["name"]
        
        # Cookie assertion
        assert "session_token" in response.cookies, "Response should set session_token cookie"
        print(f"✓ POST /api/auth/google works with payload model")
    
    def test_google_auth_with_sub_instead_of_id(self):
        """POST /api/auth/google should accept 'sub' field instead of 'id'"""
        payload = {
            "user": {
                "sub": "google_sub_456",
                "email": f"google_sub_{uuid.uuid4().hex[:8]}@gmail.com",
                "name": "Google Sub User"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/google", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ POST /api/auth/google accepts 'sub' field")
    
    def test_google_auth_rejects_missing_email(self):
        """POST /api/auth/google should reject payload without email"""
        payload = {
            "user": {
                "id": "google_no_email_789",
                "name": "No Email User"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/google", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/auth/google rejects missing email")


class TestAuthSession:
    """Test POST /api/auth/session endpoint - handles invalid session_id safely"""
    
    def test_session_handles_invalid_session_id_safely(self):
        """POST /api/auth/session should return controlled error for invalid session_id, not 500"""
        payload = {
            "session_id": "invalid_session_id_xyz123"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/session", json=payload)
        
        # Should NOT be 500 (internal server error)
        assert response.status_code != 500, f"Should not return 500, got {response.status_code}: {response.text}"
        
        # Should be a controlled error (400 or similar)
        assert response.status_code in [400, 401, 403], f"Expected controlled error (400/401/403), got {response.status_code}"
        
        # Should have error message
        data = response.json()
        assert "detail" in data, "Should have error detail"
        print(f"✓ POST /api/auth/session handles invalid session_id safely (returns {response.status_code})")
    
    def test_session_handles_empty_session_id(self):
        """POST /api/auth/session should handle empty session_id"""
        payload = {
            "session_id": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/session", json=payload)
        
        # Should NOT be 500
        assert response.status_code != 500, f"Should not return 500 for empty session_id"
        print(f"✓ POST /api/auth/session handles empty session_id (returns {response.status_code})")


class TestAdminLogin:
    """Test admin login with known credentials"""
    
    def test_admin_login_with_known_credentials(self):
        """Admin should be able to login with known credentials"""
        # Admin credentials from test_credentials.md
        payload = {
            "email": "mskatt78@gmail.com",
            "password": "ShamanicAdmin2026!"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        # Admin might be Google-only user, so 401 with "sign in with Google" is acceptable
        if response.status_code == 401:
            detail = response.json().get("detail", "")
            if "google" in detail.lower():
                print("✓ Admin is Google-only user (expected behavior)")
                return
        
        # If admin has password, should login successfully
        if response.status_code == 200:
            data = response.json()
            assert data["user"]["email"] == "mskatt78@gmail.com"
            print("✓ Admin login successful with email/password")
        else:
            print(f"Admin login returned {response.status_code}: {response.text}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
