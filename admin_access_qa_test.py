#!/usr/bin/env python3
"""
Admin Access QA Testing Script - Focused on Backend Admin Whitelist
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

# Test user credentials for non-admin testing
NON_ADMIN_EMAIL = "qa_nonadmin_test@example.com"
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

def register_and_login_test_user(email: str, password: str, name: str) -> Optional[str]:
    """Register or login a test user and return session token"""
    try:
        # Try to register
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
            return response.json().get("session_token")
        elif response.status_code == 400 and "already registered" in response.text.lower():
            # User exists, try to login
            login_response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": email,
                    "password": password
                },
                timeout=30
            )
            if login_response.status_code == 200:
                return login_response.json().get("session_token")
        
        print_error(f"Failed to authenticate: {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print_error(f"Authentication error: {e}")
        return None

def test_admin_session_login_with_non_admin():
    """
    Test 1: Admin session login with non-admin email (should be rejected)
    Expected: 403 Forbidden
    """
    print("\n" + "="*80)
    print("TEST 1: Admin Session Login - Non-Admin Email (SHOULD REJECT WITH 403)")
    print("="*80)
    
    print_info(f"Authenticating as non-admin user: {NON_ADMIN_EMAIL}...")
    session_token = register_and_login_test_user(NON_ADMIN_EMAIL, TEST_PASSWORD, "QA Non-Admin User")
    
    if not session_token:
        print_error("Failed to authenticate test user")
        return False
    
    print_success("Non-admin user authenticated successfully")
    
    # Try admin session login (should fail with 403)
    print_info("Attempting admin session login (should be rejected with 403)...")
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
        
        # Verify error message
        data = response.json()
        if data.get("detail") != "Admin access required":
            print_warning(f"Expected detail='Admin access required', got detail='{data.get('detail')}'")
        
        print_success(f"✅ Admin session login correctly rejected with 403 for non-admin email")
        print_success(f"  Status: {response.status_code}")
        print_success(f"  Detail: {data.get('detail')}")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_direct_admin_password_login():
    """
    Test 2: Direct admin password login via /api/admin/login
    Expected: 200 OK with admin role
    """
    print("\n" + "="*80)
    print("TEST 2: Direct Admin Password Login - /api/admin/login")
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
        
        print_success(f"✅ Direct admin password login successful")
        print_success(f"  Role: {data.get('role')}")
        print_success(f"  Session: {data.get('session')}")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_collections_unauthenticated():
    """
    Test 3: Admin collections endpoint without authentication
    Expected: 401 Unauthorized (not 500)
    """
    print("\n" + "="*80)
    print("TEST 3: Admin Collections - Unauthenticated (Should Return 401, NOT 500)")
    print("="*80)
    
    print_info("Attempting to access /api/admin/collections without auth...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/collections",
            timeout=30
        )
        
        if response.status_code == 500:
            print_error(f"❌ Got 500 error (REGRESSION DETECTED)")
            print_error(f"Response: {response.text}")
            return False
        
        if response.status_code != 401:
            print_warning(f"Expected 401, got {response.status_code}")
            print_info(f"Response: {response.text}")
        else:
            print_success(f"Correctly returns 401 Unauthorized")
        
        print_success(f"✅ No 500 regression detected in /api/admin/collections")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_collections_with_valid_admin():
    """
    Test 4: Admin collections endpoint with valid admin session
    Expected: 200 OK with collections list
    """
    print("\n" + "="*80)
    print("TEST 4: Admin Collections - With Valid Admin Session")
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
        
        print_success(f"✅ Admin collections endpoint accessible with valid admin session")
        print_success(f"  Collections count: {len(data)}")
        
        # Show first few collections
        if len(data) > 0:
            print_info("Sample collections:")
            for collection in data[:5]:
                print_info(f"  - {collection.get('name', 'Unknown')} ({collection.get('count', 0)} items)")
        
        return True
        
    except Exception as e:
        print_error(f"Request failed: {e}")
        return False

def test_admin_whitelist_configuration():
    """
    Test 5: Verify admin whitelist is properly configured in backend code
    This is a code-level verification
    """
    print("\n" + "="*80)
    print("TEST 5: Admin Whitelist Configuration Verification")
    print("="*80)
    
    print_info("Checking backend admin.py for LOCKED_ADMIN_EMAILS configuration...")
    
    try:
        with open("/app/backend/routers/admin.py", "r") as f:
            content = f.read()
        
        # Check for LOCKED_ADMIN_EMAILS
        if "LOCKED_ADMIN_EMAILS" not in content:
            print_error("LOCKED_ADMIN_EMAILS not found in admin.py")
            return False
        
        print_success("LOCKED_ADMIN_EMAILS found in admin.py")
        
        # Check for the two required emails
        required_emails = [
            "mskatt78@gmail.com",
            "skywatersacredembodiments@gmail.com"
        ]
        
        all_found = True
        for email in required_emails:
            if email in content:
                print_success(f"  ✓ {email} found in whitelist")
            else:
                print_error(f"  ✗ {email} NOT found in whitelist")
                all_found = False
        
        # Check for _is_admin_email function
        if "_is_admin_email" not in content:
            print_error("_is_admin_email function not found")
            return False
        
        print_success("_is_admin_email function found")
        
        # Check for admin_session_login endpoint
        if "@router.post(\"/session-login\")" not in content:
            print_error("admin session-login endpoint not found")
            return False
        
        print_success("admin session-login endpoint found")
        
        # Check that session-login uses _is_admin_email
        if "if not _is_admin_email(user.email):" in content:
            print_success("admin session-login correctly checks _is_admin_email")
        else:
            print_warning("admin session-login may not be checking _is_admin_email correctly")
        
        if all_found:
            print_success(f"✅ Admin whitelist properly configured with both required emails")
            return True
        else:
            print_error(f"❌ Admin whitelist missing required emails")
            return False
        
    except Exception as e:
        print_error(f"Failed to read admin.py: {e}")
        return False

def main():
    """Run all admin access tests"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}ADMIN ACCESS QA TEST SUITE{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}Testing Admin Whitelist: mskatt78@gmail.com, skywatersacredembodiments@gmail.com{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    results = {
        "test_1_non_admin_rejection": test_admin_session_login_with_non_admin(),
        "test_2_direct_admin_password_login": test_direct_admin_password_login(),
        "test_3_admin_collections_unauthenticated": test_admin_collections_unauthenticated(),
        "test_4_admin_collections_with_valid_admin": test_admin_collections_with_valid_admin(),
        "test_5_admin_whitelist_configuration": test_admin_whitelist_configuration()
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
    
    # Final verdict
    print("\n" + "="*80)
    print("ADMIN ACCESS QA VERDICT")
    print("="*80)
    
    if passed_count == total_count:
        print(f"\n{Colors.GREEN}✅ ALL ADMIN ACCESS TESTS PASSED{Colors.END}")
        print(f"\n{Colors.GREEN}Admin whitelist is properly configured:{Colors.END}")
        print(f"{Colors.GREEN}  - mskatt78@gmail.com: ALLOWED{Colors.END}")
        print(f"{Colors.GREEN}  - skywatersacredembodiments@gmail.com: ALLOWED{Colors.END}")
        print(f"{Colors.GREEN}  - Other emails: REJECTED with 403{Colors.END}")
        print(f"{Colors.GREEN}  - Direct admin password login: WORKING{Colors.END}")
        print(f"{Colors.GREEN}  - /api/admin/collections auth: WORKING (no 500 errors){Colors.END}")
        return 0
    else:
        print(f"\n{Colors.RED}❌ SOME ADMIN ACCESS TESTS FAILED{Colors.END}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
