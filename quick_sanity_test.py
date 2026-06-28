#!/usr/bin/env python3
"""
Quick backend regression sanity check after frontend-only social link changes.
Tests 4 endpoints for 200 status and valid non-empty JSON.
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_endpoint(endpoint_path, description):
    """Test a single endpoint for 200 status and valid non-empty JSON."""
    url = f"{BASE_URL}{endpoint_path}"
    try:
        response = requests.get(url, timeout=10)
        
        # Check status code
        if response.status_code != 200:
            return False, f"❌ {description}: Status {response.status_code} (expected 200)"
        
        # Check valid JSON
        try:
            data = response.json()
        except json.JSONDecodeError:
            return False, f"❌ {description}: Invalid JSON response"
        
        # Check non-empty
        if not data:
            return False, f"❌ {description}: Empty JSON response"
        
        # Success
        return True, f"✅ {description}: 200 OK, valid non-empty JSON"
        
    except requests.exceptions.RequestException as e:
        return False, f"❌ {description}: Request failed - {str(e)}"

def main():
    """Run all regression tests."""
    print("=" * 70)
    print("Backend Regression Sanity Check")
    print("Base URL:", BASE_URL)
    print("=" * 70)
    print()
    
    tests = [
        ("/meditations", "GET /meditations"),
        ("/sacred-ally-alchemy?ally_type=kundalini", "GET /sacred-ally-alchemy?ally_type=kundalini"),
        ("/oracle/archangels", "GET /oracle/archangels"),
        ("/payments/plans", "GET /payments/plans"),
    ]
    
    results = []
    for endpoint, description in tests:
        passed, message = test_endpoint(endpoint, description)
        results.append((passed, message))
        print(message)
    
    print()
    print("=" * 70)
    
    # Summary
    passed_count = sum(1 for passed, _ in results if passed)
    total_count = len(results)
    
    if passed_count == total_count:
        print(f"✅ ALL TESTS PASSED ({passed_count}/{total_count})")
        print("=" * 70)
        return 0
    else:
        print(f"❌ SOME TESTS FAILED ({passed_count}/{total_count} passed)")
        print("=" * 70)
        return 1

if __name__ == "__main__":
    sys.exit(main())
