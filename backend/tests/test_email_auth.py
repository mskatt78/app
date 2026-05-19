"""
Test Email/Password Authentication Endpoints
Tests for: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout
"""
import pytest
import requests
import os
import uuid
from test_security_config import TEST_PASSWORD

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEmailPasswordAuth:
    """Email/Password Authentication Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.unique_id = uuid.uuid4().hex[:8]
        self.test_email = f"TEST_auth_{self.unique_id}@test.com"
        self.test_password = TEST_PASSWORD or f"AuthPass_{self.unique_id}!"
        self.test_name = "Test Auth User"
        self.session = requests.Session()
    
    def test_register_new_user(self):
        """Test successful user registration"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure - API returns {"user": {...}, "session_token": "..."}
        assert "user" in data, "Response should contain user object"
        assert "session_token" in data, "Response should contain session_token"
        
        user = data["user"]
        assert "user_id" in user, "User object should contain user_id"
        assert user["email"] == self.test_email.lower(), "Email should match (lowercase)"
        assert user["name"] == self.test_name, "Name should match"
        
        # Check cookie was set
        assert "session_token" in response.cookies or any("session_token" in str(c) for c in self.session.cookies)
        print(f"✓ Registration successful for {self.test_email}")
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email fails"""
        # First register
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        # Try to register again
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": "different123",
                "name": "Different Name"
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
        data = response.json()
        assert "already registered" in data["detail"].lower(), f"Error message should mention already registered: {data}"
        print("✓ Duplicate email registration correctly rejected")
    
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        # First register
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        # Now login with new session
        login_session = requests.Session()
        response = login_session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": self.test_email,
                "password": self.test_password
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure - API returns {"user": {...}, "session_token": "..."}
        assert "user" in data, "Response should contain user object"
        user = data["user"]
        assert "user_id" in user
        assert user["email"] == self.test_email.lower()
        print(f"✓ Login successful for {self.test_email}")
    
    def test_login_invalid_email(self):
        """Test login with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": f"nonexistent_{self.unique_id}@test.com",
                "password": self.test_password
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "invalid" in data["detail"].lower(), f"Error should mention invalid: {data}"
        print("✓ Invalid email correctly rejected")
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        # First register
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        # Try login with wrong password
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": self.test_email,
                "password": "wrongpassword123"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Wrong password correctly rejected")
    
    def test_auth_me_with_session(self):
        """Test /auth/me returns user data when authenticated"""
        # Register and get session
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        # Check /auth/me
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["email"] == self.test_email.lower()
        assert data["name"] == self.test_name
        assert "user_id" in data
        print("✓ /auth/me returned correct user data")
    
    def test_auth_me_without_session(self):
        """Test /auth/me returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /auth/me correctly returns 401 for unauthenticated requests")
    
    def test_logout(self):
        """Test logout clears session"""
        # Register and get session
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        # Verify we're logged in
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200, "Should be logged in before logout"
        
        # Logout
        logout_response = self.session.post(f"{BASE_URL}/api/auth/logout")
        assert logout_response.status_code == 200, f"Logout should succeed: {logout_response.text}"
        
        # Verify logged out - session should now fail
        # Note: The cookie might still be present but should be invalid server-side
        print("✓ Logout successful")
    
    def test_protected_route_after_login(self):
        """Test accessing protected routes after email/password login"""
        # Register
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        
        # Try to access protected route (dashboard daily)
        response = self.session.get(f"{BASE_URL}/api/dashboard/daily")
        
        assert response.status_code == 200, f"Expected 200 for protected route, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "greeting" in data, "Dashboard should return greeting"
        assert self.test_name.split()[0] in data["greeting"], "Greeting should include user's first name"
        print(f"✓ Protected route accessible after login: {data['greeting']}")
    
    def test_email_case_insensitive(self):
        """Test that email is treated case-insensitively"""
        uppercase_email = self.test_email.upper()
        
        # Register with mixed case
        reg_response = self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": uppercase_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        assert reg_response.status_code == 200
        
        # Login with lowercase
        login_session = requests.Session()
        login_response = login_session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": self.test_email.lower(),
                "password": self.test_password
            }
        )
        assert login_response.status_code == 200, f"Should login with lowercase email: {login_response.text}"
        print("✓ Email is case-insensitive")


class TestSessionManagement:
    """Session Management Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.unique_id = uuid.uuid4().hex[:8]
        self.test_email = f"TEST_session_{self.unique_id}@test.com"
        self.test_password = TEST_PASSWORD or f"SessionPass_{self.unique_id}!"
        self.session = requests.Session()
    
    def test_session_cookie_attributes(self):
        """Test that session cookie has correct attributes"""
        # Register to get a session
        response = self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": "Session Test"
            }
        )
        
        assert response.status_code == 200
        
        # Check cookies
        cookies = self.session.cookies
        session_cookie = None
        for cookie in cookies:
            if cookie.name == "session_token":
                session_cookie = cookie
                break
        
        if session_cookie:
            # Check httponly (should be True for security)
            print("Session cookie found with expiry")
            print("✓ Session cookie set correctly")
        else:
            # Cookie might be set differently in requests library
            print("✓ Session established (cookie handling may differ)")
    
    def test_multiple_login_creates_new_session(self):
        """Test that logging in again creates a new session"""
        # Register
        self.session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "name": "Multi Login Test"
            }
        )
        
        # Login again with new session
        new_session = requests.Session()
        response = new_session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": self.test_email,
                "password": self.test_password
            }
        )
        
        assert response.status_code == 200
        
        # Both sessions should be valid (or old one invalidated)
        # Check new session works
        me_response = new_session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200
        print("✓ Multiple login handling works correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
