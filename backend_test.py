#!/usr/bin/env python3
"""
Backend API Verification - Daily Guidance Enrichment
Test URL: https://breathwork-sanctuary.preview.emergentagent.com
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_daily_practice_endpoint():
    """Test 1: GET /api/daily-practice returns 200 with enriched schema"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/daily-practice")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"✓ Response is valid JSON")
        
        # Check required enriched keys
        required_keys = [
            "daily_ally",
            "daily_angel",
            "dragon_astrology_reflection",
            "daily_journal_prompts",
            "ceremonial_affirmation",
            "unified_daily_flow"
        ]
        
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            print(f"❌ FAIL: Missing required keys: {missing_keys}")
            print(f"Available keys: {list(data.keys())}")
            return False
        
        print(f"✓ All required enriched keys present: {required_keys}")
        
        # Verify unified_daily_flow structure
        unified_flow = data.get("unified_daily_flow", {})
        if not isinstance(unified_flow, dict):
            print(f"❌ FAIL: unified_daily_flow is not a dict, got {type(unified_flow)}")
            return False
        
        flow_required_keys = [
            "title",
            "opening_invocation",
            "ceremony_steps",
            "dragon_integration",
            "closing_benediction",
            "journal_prompt"
        ]
        
        missing_flow_keys = [key for key in flow_required_keys if key not in unified_flow]
        if missing_flow_keys:
            print(f"❌ FAIL: unified_daily_flow missing keys: {missing_flow_keys}")
            print(f"Available keys: {list(unified_flow.keys())}")
            return False
        
        print(f"✓ unified_daily_flow has all required keys: {flow_required_keys}")
        
        # Verify ceremony_steps is non-empty list
        ceremony_steps = unified_flow.get("ceremony_steps", [])
        if not isinstance(ceremony_steps, list):
            print(f"❌ FAIL: ceremony_steps is not a list, got {type(ceremony_steps)}")
            return False
        
        if len(ceremony_steps) == 0:
            print(f"❌ FAIL: ceremony_steps is empty")
            return False
        
        print(f"✓ ceremony_steps is non-empty list with {len(ceremony_steps)} steps")
        
        # Verify daily_ally and daily_angel are present
        if data.get("daily_ally") is None:
            print(f"⚠️  WARNING: daily_ally is null")
        else:
            print(f"✓ daily_ally present: {data['daily_ally'].get('name', 'N/A')}")
        
        if data.get("daily_angel") is None:
            print(f"⚠️  WARNING: daily_angel is null")
        else:
            print(f"✓ daily_angel present: {data['daily_angel'].get('name', 'N/A')}")
        
        # Verify dragon_astrology_reflection structure
        dragon_reflection = data.get("dragon_astrology_reflection", {})
        if not isinstance(dragon_reflection, dict):
            print(f"❌ FAIL: dragon_astrology_reflection is not a dict")
            return False
        
        print(f"✓ dragon_astrology_reflection is dict with keys: {list(dragon_reflection.keys())}")
        
        # Verify daily_journal_prompts is list
        journal_prompts = data.get("daily_journal_prompts", [])
        if not isinstance(journal_prompts, list):
            print(f"❌ FAIL: daily_journal_prompts is not a list")
            return False
        
        print(f"✓ daily_journal_prompts is list with {len(journal_prompts)} prompts")
        
        print("✅ PASS: GET /api/daily-practice returns 200 with all required enriched keys")
        return True
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_daily_practice_with_focus():
    """Test 2: GET /api/daily-practice?focus=dragon preserves enriched keys"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/daily-practice?focus=dragon")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/daily-practice?focus=dragon", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"✓ Response is valid JSON")
        
        # Check required enriched keys are still present with focus parameter
        required_keys = [
            "daily_ally",
            "daily_angel",
            "dragon_astrology_reflection",
            "daily_journal_prompts",
            "ceremonial_affirmation",
            "unified_daily_flow"
        ]
        
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            print(f"❌ FAIL: Missing required keys with focus parameter: {missing_keys}")
            return False
        
        print(f"✓ All required enriched keys preserved with focus parameter")
        
        # Verify unified_daily_flow structure still intact
        unified_flow = data.get("unified_daily_flow", {})
        flow_required_keys = [
            "title",
            "opening_invocation",
            "ceremony_steps",
            "dragon_integration",
            "closing_benediction",
            "journal_prompt"
        ]
        
        missing_flow_keys = [key for key in flow_required_keys if key not in unified_flow]
        if missing_flow_keys:
            print(f"❌ FAIL: unified_daily_flow missing keys with focus: {missing_flow_keys}")
            return False
        
        print(f"✓ unified_daily_flow structure preserved with focus parameter")
        
        print("✅ PASS: GET /api/daily-practice?focus=dragon preserves all enriched keys")
        return True
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_auth_login():
    """Test 3: POST /api/auth/login with test credentials"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/auth/login")
    print("="*80)
    
    try:
        payload = {
            "email": "demoqa_740fefc1@example.com",
            "password": "DemoPass123!"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=payload,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
        
        data = response.json()
        print(f"✓ Login successful")
        
        # Check for session_token in cookies
        session_token = response.cookies.get("session_token")
        if not session_token:
            print(f"❌ FAIL: No session_token cookie returned")
            print(f"Cookies: {response.cookies}")
            return False, None
        
        print(f"✓ session_token cookie received")
        
        # Verify user data in response
        if "user" not in data:
            print(f"⚠️  WARNING: No user object in response")
        else:
            print(f"✓ User data present: {data['user'].get('email', 'N/A')}")
        
        print("✅ PASS: POST /api/auth/login successful with session_token cookie")
        return True, session_token
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None


def test_dashboard_daily_authenticated(session_token):
    """Test 4: GET /api/dashboard/daily (authenticated) returns enriched schema"""
    print("\n" + "="*80)
    print("TEST 4: GET /api/dashboard/daily (authenticated)")
    print("="*80)
    
    if not session_token:
        print(f"❌ FAIL: No session_token provided, cannot test authenticated endpoint")
        return False
    
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
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✓ Response is valid JSON")
        
        # Check required enriched keys
        required_keys = [
            "daily_ally",
            "daily_angel",
            "dragon_astrology_reflection",
            "daily_journal_prompts",
            "ceremonial_affirmation",
            "unified_daily_flow"
        ]
        
        missing_keys = [key for key in required_keys if key not in data]
        if missing_keys:
            print(f"❌ FAIL: Missing required keys: {missing_keys}")
            print(f"Available keys: {list(data.keys())}")
            return False
        
        print(f"✓ All required enriched keys present: {required_keys}")
        
        # Verify unified_daily_flow structure
        unified_flow = data.get("unified_daily_flow", {})
        if not isinstance(unified_flow, dict):
            print(f"❌ FAIL: unified_daily_flow is not a dict")
            return False
        
        flow_required_keys = [
            "title",
            "opening_invocation",
            "ceremony_steps",
            "dragon_integration",
            "closing_benediction",
            "journal_prompt"
        ]
        
        missing_flow_keys = [key for key in flow_required_keys if key not in unified_flow]
        if missing_flow_keys:
            print(f"❌ FAIL: unified_daily_flow missing keys: {missing_flow_keys}")
            return False
        
        print(f"✓ unified_daily_flow has all required keys")
        
        # Verify ceremony_steps is non-empty
        ceremony_steps = unified_flow.get("ceremony_steps", [])
        if not isinstance(ceremony_steps, list) or len(ceremony_steps) == 0:
            print(f"❌ FAIL: ceremony_steps is not a non-empty list")
            return False
        
        print(f"✓ ceremony_steps is non-empty list with {len(ceremony_steps)} steps")
        
        print("✅ PASS: GET /api/dashboard/daily (authenticated) returns all enriched keys")
        return True
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_dashboard_daily_unauthenticated():
    """Test 5: GET /api/dashboard/daily (without auth) returns 401"""
    print("\n" + "="*80)
    print("TEST 5: GET /api/dashboard/daily (without auth)")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/daily", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 401:
            print(f"❌ FAIL: Expected 401, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"✓ Correctly returns 401 Unauthorized for unauthenticated request")
        
        print("✅ PASS: GET /api/dashboard/daily (without auth) returns 401")
        return True
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("\n" + "="*80)
    print("BACKEND API VERIFICATION - Daily Guidance Enrichment")
    print("="*80)
    print(f"Test URL: {BASE_URL}")
    print(f"Test Credentials: demoqa_740fefc1@example.com / DemoPass123!")
    
    results = []
    
    # Run all tests
    results.append(("GET /api/daily-practice", test_daily_practice_endpoint()))
    results.append(("GET /api/daily-practice?focus=dragon", test_daily_practice_with_focus()))
    
    # Auth flow
    auth_result, session_token = test_auth_login()
    results.append(("POST /api/auth/login", auth_result))
    
    # Authenticated dashboard endpoint
    results.append(("GET /api/dashboard/daily (authenticated)", test_dashboard_daily_authenticated(session_token)))
    
    # Unauthenticated dashboard endpoint
    results.append(("GET /api/dashboard/daily (unauthenticated)", test_dashboard_daily_unauthenticated()))
    
    # Summary
    print("\n" + "="*80)
    print("BACKEND TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL BACKEND API VERIFICATION TESTS PASSED")
        print("\nSCHEMA VERIFICATION COMPLETE:")
        print("  ✓ GET /api/daily-practice returns all enriched keys")
        print("  ✓ GET /api/daily-practice?focus=dragon preserves enriched keys")
        print("  ✓ unified_daily_flow includes all required fields")
        print("  ✓ ceremony_steps is non-empty list")
        print("  ✓ Auth flow working correctly")
        print("  ✓ GET /api/dashboard/daily (authenticated) returns enriched schema")
        print("  ✓ GET /api/dashboard/daily (unauthenticated) returns 401")
        return 0
    else:
        print(f"\n❌ {total - passed} BACKEND TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
