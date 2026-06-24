#!/usr/bin/env python3
"""
Backend release validation test for astrology hemisphere and daily guidance tweak
Tests:
1. GET /api/astrology/current returns hemisphere-ready fields (north/south descriptions)
2. GET /api/astrology/months returns hemisphere-ready fields (north/south descriptions)
3. GET /api/dashboard/daily includes guidance_tweak.practical and guidance_tweak.spiritual arrays
4. GET /api/health returns 200
"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"
TEST_EMAIL = "demoqa_740fefc1@example.com"
TEST_PASSWORD = "DemoPass123!"

def get_user_session():
    """Get user session by logging in with test credentials"""
    print("\n=== Getting User Session ===")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: User login failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        # Get the session_token cookie
        cookies = response.cookies
        session_token = cookies.get("session_token")
        
        if not session_token:
            print(f"❌ FAIL: No session_token cookie returned")
            return None
        
        print(f"✅ SUCCESS: Got user session token")
        return session_token
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return None

def test_health_endpoint():
    """Test 4: GET /api/health returns 200"""
    print("\n=== Test 4: Health Endpoint ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        print(f"✅ PASS: Health endpoint returns 200")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_astrology_current():
    """Test 1: GET /api/astrology/current returns hemisphere-ready fields"""
    print("\n=== Test 1: Astrology Current Endpoint ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/astrology/current", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Check for hemisphere-ready fields (north/south descriptions)
        has_hemisphere_fields = False
        
        # Check if response has description_north and description_south fields
        if "description_north" in data and "description_south" in data:
            has_hemisphere_fields = True
            print(f"✅ Found hemisphere description fields: description_north and description_south present")
            print(f"   description_north: {data['description_north'][:80]}...")
            print(f"   description_south: {data['description_south'][:80]}...")
        
        # Check if response has north/south specific fields
        elif "north" in data or "south" in data:
            has_hemisphere_fields = True
            print(f"✅ Found hemisphere fields: north/south keys present")
        
        # Check if response has hemisphere-aware descriptions
        elif "northern_description" in data or "southern_description" in data:
            has_hemisphere_fields = True
            print(f"✅ Found hemisphere descriptions: northern_description/southern_description present")
        
        # Check if any field contains hemisphere-specific data
        else:
            for key, value in data.items():
                if isinstance(value, dict):
                    if "north" in value or "south" in value:
                        has_hemisphere_fields = True
                        print(f"✅ Found hemisphere data in field '{key}': {list(value.keys())}")
                    if "northern" in value or "southern" in value:
                        has_hemisphere_fields = True
                        print(f"✅ Found hemisphere data in field '{key}': {list(value.keys())}")
        
        if not has_hemisphere_fields:
            print(f"❌ FAIL: No hemisphere-ready fields found")
            print(f"Full response: {json.dumps(data, indent=2)}")
            return False
        
        print(f"✅ PASS: Astrology current endpoint returns hemisphere-ready fields")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_astrology_months():
    """Test 2: GET /api/astrology/months returns hemisphere-ready fields"""
    print("\n=== Test 2: Astrology Months Endpoint ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/astrology/months", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check if response is a list
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list response, got {type(data)}")
            return False
        
        if len(data) == 0:
            print(f"❌ FAIL: Empty list returned")
            return False
        
        print(f"Response: {len(data)} months returned")
        
        # Check first month for hemisphere-ready fields
        first_month = data[0]
        print(f"First month keys: {list(first_month.keys())}")
        
        has_hemisphere_fields = False
        
        # Check if month has description_north and description_south fields
        if "description_north" in first_month and "description_south" in first_month:
            has_hemisphere_fields = True
            print(f"✅ Found hemisphere description fields: description_north and description_south present")
            print(f"   description_north: {first_month['description_north'][:80]}...")
            print(f"   description_south: {first_month['description_south'][:80]}...")
        
        # Check if month has north/south specific fields
        elif "north" in first_month or "south" in first_month:
            has_hemisphere_fields = True
            print(f"✅ Found hemisphere fields: north/south keys present")
        
        # Check if month has hemisphere-aware descriptions
        elif "northern_description" in first_month or "southern_description" in first_month:
            has_hemisphere_fields = True
            print(f"✅ Found hemisphere descriptions: northern_description/southern_description present")
        
        # Check if any field contains hemisphere-specific data
        else:
            for key, value in first_month.items():
                if isinstance(value, dict):
                    if "north" in value or "south" in value:
                        has_hemisphere_fields = True
                        print(f"✅ Found hemisphere data in field '{key}': {list(value.keys())}")
                    if "northern" in value or "southern" in value:
                        has_hemisphere_fields = True
                        print(f"✅ Found hemisphere data in field '{key}': {list(value.keys())}")
        
        if not has_hemisphere_fields:
            print(f"❌ FAIL: No hemisphere-ready fields found in months")
            print(f"First month sample: {json.dumps(first_month, indent=2)}")
            return False
        
        print(f"✅ PASS: Astrology months endpoint returns hemisphere-ready fields")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_dashboard_daily_guidance_tweak(session_token):
    """Test 3: GET /api/dashboard/daily includes guidance_tweak.practical and guidance_tweak.spiritual arrays"""
    print("\n=== Test 3: Dashboard Daily Guidance Tweak ===")
    
    try:
        cookies = {"session_token": session_token}
        response = requests.get(
            f"{BASE_URL}/api/dashboard/daily",
            cookies=cookies,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Check for guidance_tweak field
        if "guidance_tweak" not in data:
            print(f"❌ FAIL: guidance_tweak field not found in response")
            print(f"Available keys: {list(data.keys())}")
            return False
        
        guidance_tweak = data["guidance_tweak"]
        print(f"guidance_tweak keys: {list(guidance_tweak.keys())}")
        
        # Check for practical array
        if "practical" not in guidance_tweak:
            print(f"❌ FAIL: guidance_tweak.practical not found")
            return False
        
        if not isinstance(guidance_tweak["practical"], list):
            print(f"❌ FAIL: guidance_tweak.practical is not an array")
            return False
        
        print(f"✅ guidance_tweak.practical found: {len(guidance_tweak['practical'])} items")
        
        # Check for spiritual array
        if "spiritual" not in guidance_tweak:
            print(f"❌ FAIL: guidance_tweak.spiritual not found")
            return False
        
        if not isinstance(guidance_tweak["spiritual"], list):
            print(f"❌ FAIL: guidance_tweak.spiritual is not an array")
            return False
        
        print(f"✅ guidance_tweak.spiritual found: {len(guidance_tweak['spiritual'])} items")
        
        print(f"✅ PASS: Dashboard daily includes guidance_tweak.practical and guidance_tweak.spiritual arrays")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def main():
    print("=" * 80)
    print("BACKEND RELEASE VALIDATION - ASTROLOGY HEMISPHERE + DAILY GUIDANCE TWEAK")
    print("=" * 80)
    
    # Test health endpoint first (no auth required)
    health_result = test_health_endpoint()
    
    # Test astrology endpoints (no auth required)
    astrology_current_result = test_astrology_current()
    astrology_months_result = test_astrology_months()
    
    # Get user session for dashboard endpoint
    session_token = get_user_session()
    if not session_token:
        print("\n❌ CRITICAL: Could not get user session, skipping dashboard test")
        dashboard_result = False
    else:
        dashboard_result = test_dashboard_daily_guidance_tweak(session_token)
    
    # Summary
    results = {
        "Health Endpoint": health_result,
        "Astrology Current": astrology_current_result,
        "Astrology Months": astrology_months_result,
        "Dashboard Daily Guidance Tweak": dashboard_result,
    }
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL BACKEND RELEASE VALIDATION TESTS PASSED")
    else:
        print("❌ SOME BACKEND RELEASE VALIDATION TESTS FAILED")
    print("=" * 80)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
