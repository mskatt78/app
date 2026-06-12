#!/usr/bin/env python3
"""
Backend API Verification Test Suite
Tests quality-hardening batch endpoints
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_health_endpoint():
    """Test GET /api/health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: GET /api/health")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify it's valid JSON and has expected structure
            if isinstance(data, dict) and 'status' in data:
                print("✅ PASS: Health endpoint returns 200 with valid JSON")
                return True
            else:
                print("❌ FAIL: Response missing expected 'status' field")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_i_ching_endpoint():
    """Test GET /api/i-ching endpoint"""
    print("\n" + "="*60)
    print("TEST 2: GET /api/i-ching")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/i-ching", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            print(f"Response preview: {json.dumps(data, indent=2)[:500]}...")
            
            # Verify it's valid JSON
            if data:
                print("✅ PASS: I-Ching endpoint returns 200 with valid JSON")
                return True
            else:
                print("❌ FAIL: Empty response")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_journal_entries_endpoint():
    """Test GET /api/journal endpoint (corrected path)"""
    print("\n" + "="*60)
    print("TEST 3: GET /api/journal (journal entries)")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/journal", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        # This endpoint requires auth, so 401 is expected
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Response preview: {json.dumps(data, indent=2)[:500]}...")
            print("✅ PASS: Journal entries endpoint returns 200 with valid JSON")
            return True
        elif response.status_code == 401:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            print("⚠️  Expected auth behavior: Returns 401 (authentication required)")
            print("✅ PASS: Auth-protected endpoint behaves correctly (401, not 500)")
            return True
        elif response.status_code == 403:
            print("⚠️  Expected auth behavior: Returns 403 (forbidden)")
            print("✅ PASS: Auth-protected endpoint behaves correctly (403, not 500)")
            return True
        else:
            print(f"❌ FAIL: Unexpected status code {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_menu_journal_lightweight_endpoints():
    """Test lightweight endpoints used by menu/journal flows"""
    print("\n" + "="*60)
    print("TEST 4: Lightweight endpoints for menu/journal flows")
    print("="*60)
    
    endpoints = [
        "/api/courses",
        "/api/meditations",
        "/api/breathwork/sessions"
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print(f"\n{endpoint}: Status {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                item_count = len(data) if isinstance(data, list) else "N/A"
                print(f"  ✅ Returns 200 with {item_count} items")
            else:
                print(f"  ❌ Unexpected status: {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print(f"  ❌ Exception: {str(e)}")
            all_passed = False
    
    return all_passed


def main():
    """Run all backend verification tests"""
    print("\n" + "="*60)
    print("BACKEND VERIFICATION - Quality Hardening Batch")
    print("="*60)
    print(f"Target: {BASE_URL}")
    
    results = []
    
    # Run all tests
    results.append(("Health endpoint", test_health_endpoint()))
    results.append(("I-Ching endpoint", test_i_ching_endpoint()))
    results.append(("Journal entries endpoint", test_journal_entries_endpoint()))
    results.append(("Menu/Journal lightweight endpoints", test_menu_journal_lightweight_endpoints()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED - Backend verification successful")
        return 0
    else:
        print(f"\n❌ {total - passed} TEST(S) FAILED - Review failures above")
        return 1


if __name__ == "__main__":
    sys.exit(main())
