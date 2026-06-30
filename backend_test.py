#!/usr/bin/env python3
"""
Quick backend sanity check after frontend body-map rollout.
Verify 4 endpoints return 200 + non-empty JSON.
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

ENDPOINTS = [
    "/fascia-stretching",
    "/yoga/poses",
    "/healing-portals",
    "/energy-healing"
]

def test_endpoint(endpoint):
    """Test single endpoint for 200 status and non-empty JSON."""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.get(url, timeout=10)
        status = response.status_code
        
        # Check status code
        if status != 200:
            return {
                "endpoint": endpoint,
                "status": status,
                "passed": False,
                "error": f"Expected 200, got {status}"
            }
        
        # Check JSON response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            return {
                "endpoint": endpoint,
                "status": status,
                "passed": False,
                "error": f"Invalid JSON: {str(e)}"
            }
        
        # Check non-empty
        if not data:
            return {
                "endpoint": endpoint,
                "status": status,
                "passed": False,
                "error": "Empty JSON response"
            }
        
        # Determine data size
        data_size = len(data) if isinstance(data, list) else "dict"
        
        return {
            "endpoint": endpoint,
            "status": status,
            "passed": True,
            "data_size": data_size,
            "data_type": type(data).__name__
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "endpoint": endpoint,
            "status": "N/A",
            "passed": False,
            "error": f"Request failed: {str(e)}"
        }

def main():
    """Run all endpoint tests."""
    print("=" * 70)
    print("BACKEND SANITY CHECK - Body Map Rollout")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print()
    
    results = []
    all_passed = True
    
    for endpoint in ENDPOINTS:
        print(f"Testing {endpoint}...", end=" ")
        result = test_endpoint(endpoint)
        results.append(result)
        
        if result["passed"]:
            print(f"✅ PASS (status={result['status']}, type={result['data_type']}, size={result['data_size']})")
        else:
            print(f"❌ FAIL")
            print(f"   Error: {result['error']}")
            all_passed = False
    
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    
    print(f"Passed: {passed_count}/{total_count}")
    
    if all_passed:
        print("\n✅ ALL TESTS PASSED - No backend regressions detected")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED - Backend issues detected")
        print("\nFailed endpoints:")
        for r in results:
            if not r["passed"]:
                print(f"  - {r['endpoint']}: {r['error']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
