#!/usr/bin/env python3
"""
Admin Access QA Testing Script
Tests admin whitelist behavior and admin session authentication
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Base URL from frontend env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

# Admin credentials from test_credentials.md
ADMIN_PASSWORD = "ShamanicAdmin2026!"

# Test user credentials
ALLOWED_ADMIN_EMAIL_1 = "mskatt78@gmail.com"
ALLOWED_ADMIN_EMAIL_2 = "skywatersacredembodiments@gmail.com"
NON_ADMIN_EMAIL = "testuser_qa_admin@example.com"
TEST_PASSWORD = "TestPass123!"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def register_test_user(email: str, password: str, name: str) -> Optional[Dict[str, Any]]:
    """Register a test user and return session info"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": email,
                "password": password,
                "name": name
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 400 and "already exists" in response.text.lower():
            # User already exists, try to login
            return login_test_user(email, password)
        else:
            print_error(f"Registration failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_error(f"Registration error: {e}")
        return None

def login_test_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Login a test user and return session info"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": email,
                "password": password
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print_error(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_error(f"Login error: {e}")
        return None

def test_admin_session_login_allowed_email_1():
    """
    Test 1: Admin session login with mskatt78@gmail.com (allowed)
    Expected: 200 OK with admin session
    """
    print("\n" + "="*80)
    print("TEST 1: Admin Session Login - mskatt78@gmail.com (ALLOWED)")
    print("="*80)
    
    # Try to login first (email likely already exists)
    print_info(f"Attempting to login as {ALLOWED_ADMIN_EMAIL_1}...")
    auth_data = login_test_user(ALLOWED_ADMIN_EMAIL_1, TEST_PASSWORD)
    
    # If login fails, try to register
    if not auth_data:
        print_info(f"Login failed, attempting to register as {ALLOWED_ADMIN_EMAIL_1}...")
        auth_data = register_test_user(ALLOWED_ADMIN_EMAIL_1, TEST_PASSWORD, "Admin User 1")
    
    if not auth_data:
        print_error("Failed to authenticate user")
        return False
    
    session_token = auth_data.get("session_token")
    if not session_token:
        print_error("No session token received")
        return False
    
    print_success(f"User authenticated successfully")
    
    # Try admin session login
    print_info("Attempting admin session login...")
    try:
        response = requests.post(
            f"{BASE_URL}/admin/session-login",
            cookies={"session_token": session_token},
            timeout=30
        )
        
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Verify response structure
        if data.get("role") != "admin":
            print_error(f"Expected role='admin', got role='{data.get('role')}'")
            return False
        
        if data.get("email") != ALLOWED_ADMIN_EMAIL_1:
            print_error(f"Expected email='{ALLOWED_ADMIN_EMAIL_1}', got email='{data.get('email')}'")
            return False
        
        print_success(f"Admin session login successful for {ALLOWED_ADMIN_EMAIL_1}")
        print_success(f"  Role: {data.get('role')}")
        print_success(f"  Email: {data.get('email')}")
        print_success(f"  Session: {data.get('session')}")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_session_login_allowed_email_2():
    """
    Test 2: Admin session login with skywatersacredembodiments@gmail.com (allowed)
    Expected: 200 OK with admin session
    """
    print("\n" + "="*80)
    print("TEST 2: Admin Session Login - skywatersacredembodiments@gmail.com (ALLOWED)")
    print("="*80)
    
    # Register/login as allowed admin email
    print_info(f"Registering/logging in as {ALLOWED_ADMIN_EMAIL_2}...")
    auth_data = register_test_user(ALLOWED_ADMIN_EMAIL_2, TEST_PASSWORD, "Admin User 2")
    
    if not auth_data:
        print_error("Failed to authenticate user")
        return False
    
    session_token = auth_data.get("session_token")
    if not session_token:
        print_error("No session token received")
        return False
    
    print_success(f"User authenticated successfully")
    
    # Try admin session login
    print_info("Attempting admin session login...")
    try:
        response = requests.post(
            f"{BASE_URL}/admin/session-login",
            cookies={"session_token": session_token},
            timeout=30
        )
        
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Verify response structure
        if data.get("role") != "admin":
            print_error(f"Expected role='admin', got role='{data.get('role')}'")
            return False
        
        if data.get("email") != ALLOWED_ADMIN_EMAIL_2:
            print_error(f"Expected email='{ALLOWED_ADMIN_EMAIL_2}', got email='{data.get('email')}'")
            return False
        
        print_success(f"Admin session login successful for {ALLOWED_ADMIN_EMAIL_2}")
        print_success(f"  Role: {data.get('role')}")
        print_success(f"  Email: {data.get('email')}")
        print_success(f"  Session: {data.get('session')}")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_session_login_non_admin_email():
    """
    Test 3: Admin session login with non-admin email (should be rejected)
    Expected: 403 Forbidden
    """
    print("\n" + "="*80)
    print("TEST 3: Admin Session Login - Non-Admin Email (SHOULD REJECT)")
    print("="*80)
    
    # Register/login as non-admin email
    print_info(f"Registering/logging in as {NON_ADMIN_EMAIL}...")
    auth_data = register_test_user(NON_ADMIN_EMAIL, TEST_PASSWORD, "Regular User")
    
    if not auth_data:
        print_error("Failed to authenticate user")
        return False
    
    session_token = auth_data.get("session_token")
    if not session_token:
        print_error("No session token received")
        return False
    
    print_success(f"User authenticated successfully")
    
    # Try admin session login (should fail)
    print_info("Attempting admin session login (should be rejected)...")
    try:
        response = requests.post(
            f"{BASE_URL}/admin/session-login",
            cookies={"session_token": session_token},
            timeout=30
        )
        
        if response.status_code != 403:
            print_error(f"Expected 403 Forbidden, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        print_success(f"Admin session login correctly rejected with 403 for {NON_ADMIN_EMAIL}")
        print_success(f"  Status: {response.status_code}")
        print_success(f"  Response: {response.text}")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_direct_admin_password_login():
    """
    Test 4: Direct admin password login via /api/admin/login
    Expected: 200 OK with admin role
    """
    print("\n" + "="*80)
    print("TEST 4: Direct Admin Password Login - /api/admin/login")
    print("="*80)
    
    print_info("Attempting direct admin password login...")
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Verify response structure
        if data.get("role") != "admin":
            print_error(f"Expected role='admin', got role='{data.get('role')}'")
            return False
        
        if data.get("session") != "active":
            print_error(f"Expected session='active', got session='{data.get('session')}'")
            return False
        
        # Check if admin_session cookie is set
        cookies = response.cookies
        if "admin_session" not in cookies:
            print_warning("admin_session cookie not found in response")
        else:
            print_success(f"admin_session cookie set: {cookies['admin_session'][:20]}...")
        
        print_success(f"Direct admin password login successful")
        print_success(f"  Role: {data.get('role')}")
        print_success(f"  Session: {data.get('session')}")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_collections_unauthenticated():
    """
    Test 5: Admin collections endpoint without authentication
    Expected: 401 Unauthorized (not 500)
    """
    print("\n" + "="*80)
    print("TEST 5: Admin Collections - Unauthenticated (Should Return 401)")
    print("="*80)
    
    print_info("Attempting to access /api/admin/collections without auth...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/collections",
            timeout=30
        )
        
        if response.status_code == 500:
            print_error(f"Got 500 error (regression detected)")
            print_error(f"Response: {response.text}")
            return False
        
        if response.status_code != 401:
            print_warning(f"Expected 401, got {response.status_code}")
            print_info(f"Response: {response.text}")
        else:
            print_success(f"Correctly returns 401 Unauthorized")
        
        print_success(f"No 500 regression detected")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_collections_with_valid_admin():
    """
    Test 6: Admin collections endpoint with valid admin session
    Expected: 200 OK with collections list
    """
    print("\n" + "="*80)
    print("TEST 6: Admin Collections - With Valid Admin Session")
    print("="*80)
    
    # First, login with admin password
    print_info("Logging in with admin password...")
    try:
        login_response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=30
        )
        
        if login_response.status_code != 200:
            print_error(f"Admin login failed: {login_response.status_code}")
            return False
        
        # Get admin_session cookie
        admin_session = login_response.cookies.get("admin_session")
        if not admin_session:
            print_error("No admin_session cookie received")
            return False
        
        print_success("Admin login successful")
        
        # Now try to access collections
        print_info("Accessing /api/admin/collections with admin session...")
        collections_response = requests.get(
            f"{BASE_URL}/admin/collections",
            cookies={"admin_session": admin_session},
            timeout=30
        )
        
        if collections_response.status_code != 200:
            print_error(f"Expected 200, got {collections_response.status_code}")
            print_error(f"Response: {collections_response.text}")
            return False
        
        data = collections_response.json()
        
        # Verify response is a list
        if not isinstance(data, list):
            print_error(f"Expected list, got {type(data).__name__}")
            return False
        
        print_success(f"Admin collections endpoint accessible")
        print_success(f"  Collections count: {len(data)}")
        
        # Show first few collections
        if len(data) > 0:
            print_info("Sample collections:")
            for collection in data[:3]:
                print_info(f"  - {collection.get('name', 'Unknown')} ({collection.get('count', 0)} items)")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def main():
    """Run all admin access tests"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}ADMIN ACCESS QA TEST SUITE{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    results = {
        "test_1_admin_session_allowed_email_1": test_admin_session_login_allowed_email_1(),
        "test_2_admin_session_allowed_email_2": test_admin_session_login_allowed_email_2(),
        "test_3_admin_session_non_admin_email": test_admin_session_login_non_admin_email(),
        "test_4_direct_admin_password_login": test_direct_admin_password_login(),
        "test_5_admin_collections_unauthenticated": test_admin_collections_unauthenticated(),
        "test_6_admin_collections_with_valid_admin": test_admin_collections_with_valid_admin()
    }
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    
    for test_name, passed in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if passed else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test_name}: {status}")
    
    print(f"\n{Colors.BLUE}Total: {passed_count}/{total_count} tests passed{Colors.END}")
    
    if passed_count == total_count:
        print(f"\n{Colors.GREEN}✅ ALL ADMIN ACCESS TESTS PASSED{Colors.END}")
        return 0
    else:
        print(f"\n{Colors.RED}❌ SOME ADMIN ACCESS TESTS FAILED{Colors.END}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
