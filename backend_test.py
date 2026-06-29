#!/usr/bin/env python3
"""
Quick backend sanity check for healing portals after frontend-only resilience patch.
Tests:
1. GET /healing-portals returns 200 + non-empty JSON
2. GET /payments/premium-products returns 200 + valid JSON
"""

import requests
import sys
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_healing_portals():
    """Test GET /healing-portals endpoint."""
    url = f"{BASE_URL}/healing-portals"
    print(f"\n🔍 Testing: GET {url}")
    
    try:
        response = requests.get(url, timeout=10)
        status = response.status_code
        print(f"   Status: {status}")
        
        if status != 200:
            print(f"   ❌ FAIL: Expected 200, got {status}")
            return False
        
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print(f"   ❌ FAIL: Invalid JSON response - {e}")
            return False
        
        if not data:
            print(f"   ❌ FAIL: Empty response (expected non-empty JSON)")
            return False
        
        if not isinstance(data, list):
            print(f"   ❌ FAIL: Expected list, got {type(data).__name__}")
            return False
        
        count = len(data)
        print(f"   ✅ PASS: Returns 200 with {count} healing portals")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAIL: Request error - {e}")
        return False


def test_premium_products():
    """Test GET /payments/premium-products endpoint."""
    url = f"{BASE_URL}/payments/premium-products"
    print(f"\n🔍 Testing: GET {url}")
    
    try:
        response = requests.get(url, timeout=10)
        status = response.status_code
        print(f"   Status: {status}")
        
        if status != 200:
            print(f"   ❌ FAIL: Expected 200, got {status}")
            return False
        
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print(f"   ❌ FAIL: Invalid JSON response - {e}")
            return False
        
        if not isinstance(data, dict):
            print(f"   ❌ FAIL: Expected dict, got {type(data).__name__}")
            return False
        
        print(f"   ✅ PASS: Returns 200 with valid JSON (keys: {list(data.keys())})")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAIL: Request error - {e}")
        return False


def main():
    """Run all tests and report results."""
    print("=" * 70)
    print("BACKEND SANITY CHECK - Healing Portals")
    print(f"Base URL: {BASE_URL}")
    print("=" * 70)
    
    results = {
        "healing_portals": test_healing_portals(),
        "premium_products": test_premium_products(),
    }
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_flag in results.items():
        status = "✅ PASS" if passed_flag else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nResult: {passed}/{total} tests passed")
    print("=" * 70)
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
