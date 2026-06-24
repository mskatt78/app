#!/usr/bin/env python3
"""
Quick backend sanity check - no feature-specific changes
Tests:
1) GET /api/health returns 200
2) GET /api/dashboard/daily reachable (auth constraints acceptable if 401)
3) Confirm no 500 errors
"""

import requests
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_health_endpoint():
    """Test GET /api/health returns 200"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            print(f"✅ GET /api/health: {response.status_code} - PASS")
            return True
        else:
            print(f"❌ GET /api/health: {response.status_code} - FAIL (expected 200)")
            return False
    except Exception as e:
        print(f"❌ GET /api/health: ERROR - {str(e)}")
        return False

def test_dashboard_daily_endpoint():
    """Test GET /api/dashboard/daily reachable (401 acceptable)"""
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/daily", timeout=10)
        # 401 is acceptable for auth-protected route
        if response.status_code in [200, 401]:
            print(f"✅ GET /api/dashboard/daily: {response.status_code} - PASS (reachable, auth behavior acceptable)")
            return True
        elif response.status_code == 500:
            print(f"❌ GET /api/dashboard/daily: {response.status_code} - FAIL (500 error)")
            return False
        else:
            print(f"⚠️  GET /api/dashboard/daily: {response.status_code} - PASS (reachable, non-500)")
            return True
    except Exception as e:
        print(f"❌ GET /api/dashboard/daily: ERROR - {str(e)}")
        return False

def main():
    print("=" * 60)
    print("Backend Sanity Check")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print()
    
    results = []
    
    # Test 1: Health endpoint
    results.append(test_health_endpoint())
    
    # Test 2: Dashboard daily endpoint
    results.append(test_dashboard_daily_endpoint())
    
    print()
    print("=" * 60)
    if all(results):
        print("✅ SANITY CHECK PASSED - No 500 errors detected")
        print("=" * 60)
        sys.exit(0)
    else:
        print("❌ SANITY CHECK FAILED - See errors above")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
