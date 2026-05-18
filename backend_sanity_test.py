#!/usr/bin/env python3
"""Quick backend sanity check for /api/health and /api/content/expand-script"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_health_endpoint():
    """Test GET /api/health returns 200"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ /api/health: PASS (200 OK)")
            return True
        else:
            print(f"❌ /api/health: FAIL (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ /api/health: FAIL (Error: {str(e)})")
        return False

def test_expand_script_endpoint():
    """Test POST /api/content/expand-script returns 200"""
    try:
        payload = {
            "practice_name": "Test Practice",
            "base_script": "Take a deep breath and relax.",
            "target_minutes": 10,
            "use_ai": False
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ /api/content/expand-script: PASS (200 OK)")
            return True
        else:
            print(f"❌ /api/content/expand-script: FAIL (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ /api/content/expand-script: FAIL (Error: {str(e)})")
        return False

if __name__ == "__main__":
    print("=== Backend Sanity Check ===\n")
    
    health_pass = test_health_endpoint()
    expand_pass = test_expand_script_endpoint()
    
    print("\n=== Results ===")
    if health_pass and expand_pass:
        print("✅ ALL TESTS PASSED (2/2)")
    else:
        print(f"❌ TESTS FAILED ({sum([health_pass, expand_pass])}/2 passed)")
