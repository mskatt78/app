#!/usr/bin/env python3
"""
Backend verification test for latest fixes
Testing:
1. Kundalini aliases (kundalini and kundulini typo)
2. Archangels endpoint (15 cards, no ObjectId errors)
3. Angelic alchemy endpoint (200 response, non-empty list)
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_kundalini_aliases():
    """Test 1: Kundalini aliases should not be empty"""
    print("\n" + "="*80)
    print("TEST 1: KUNDALINI ALIASES")
    print("="*80)
    
    results = {
        "kundalini": {"passed": False, "count": 0, "status": None, "error": None},
        "kundulini": {"passed": False, "count": 0, "status": None, "error": None}
    }
    
    for ally_type in ["kundalini", "kundulini"]:
        url = f"{BASE_URL}/sacred-ally-alchemy?ally_type={ally_type}"
        print(f"\nTesting: GET {url}")
        
        try:
            response = requests.get(url, timeout=10)
            results[ally_type]["status"] = response.status_code
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 500:
                print(f"❌ FAIL: Got 500 error")
                results[ally_type]["error"] = "500 Internal Server Error"
                continue
            
            if response.status_code != 200:
                print(f"❌ FAIL: Expected 200, got {response.status_code}")
                results[ally_type]["error"] = f"Unexpected status code: {response.status_code}"
                continue
            
            data = response.json()
            
            if not isinstance(data, list):
                print(f"❌ FAIL: Response is not a list, got {type(data)}")
                results[ally_type]["error"] = f"Response is not a list: {type(data)}"
                continue
            
            results[ally_type]["count"] = len(data)
            print(f"Count: {len(data)} items")
            
            if len(data) == 0:
                print(f"❌ FAIL: Empty list returned")
                results[ally_type]["error"] = "Empty list returned"
                continue
            
            # Check for ObjectId serialization issues
            try:
                json.dumps(data)
                print(f"✅ PASS: Non-empty list ({len(data)} items), no serialization errors")
                results[ally_type]["passed"] = True
            except Exception as e:
                print(f"❌ FAIL: JSON serialization error: {e}")
                results[ally_type]["error"] = f"JSON serialization error: {e}"
                
        except Exception as e:
            print(f"❌ FAIL: Request error: {e}")
            results[ally_type]["error"] = str(e)
    
    return results

def test_archangels():
    """Test 2: Archangels complete and stable"""
    print("\n" + "="*80)
    print("TEST 2: ARCHANGELS ENDPOINT")
    print("="*80)
    
    url = f"{BASE_URL}/oracle/archangels"
    print(f"\nTesting: GET {url}")
    
    result = {"passed": False, "count": 0, "status": None, "error": None}
    
    try:
        response = requests.get(url, timeout=10)
        result["status"] = response.status_code
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAIL: Got 500 error")
            result["error"] = "500 Internal Server Error"
            return result
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            result["error"] = f"Unexpected status code: {response.status_code}"
            return result
        
        data = response.json()
        
        if not isinstance(data, list):
            print(f"❌ FAIL: Response is not a list, got {type(data)}")
            result["error"] = f"Response is not a list: {type(data)}"
            return result
        
        result["count"] = len(data)
        print(f"Count: {len(data)} cards")
        
        if len(data) != 15:
            print(f"❌ FAIL: Expected 15 cards, got {len(data)}")
            result["error"] = f"Expected 15 cards, got {len(data)}"
            return result
        
        # Check for ObjectId serialization issues
        try:
            json_str = json.dumps(data)
            
            # Check if any ObjectId references leaked
            if "ObjectId" in json_str or "_id" in json_str:
                print(f"❌ FAIL: ObjectId serialization issue detected")
                result["error"] = "ObjectId serialization issue detected"
                return result
            
            print(f"✅ PASS: Exactly 15 cards, no ObjectId errors, no 500")
            result["passed"] = True
            
        except Exception as e:
            print(f"❌ FAIL: JSON serialization error: {e}")
            result["error"] = f"JSON serialization error: {e}"
            
    except Exception as e:
        print(f"❌ FAIL: Request error: {e}")
        result["error"] = str(e)
    
    return result

def test_angelic_alchemy():
    """Test 3: Basic related endpoint health"""
    print("\n" + "="*80)
    print("TEST 3: ANGELIC ALCHEMY ENDPOINT")
    print("="*80)
    
    url = f"{BASE_URL}/angelic-alchemy"
    print(f"\nTesting: GET {url}")
    
    result = {"passed": False, "count": 0, "status": None, "error": None}
    
    try:
        response = requests.get(url, timeout=10)
        result["status"] = response.status_code
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAIL: Got 500 error")
            result["error"] = "500 Internal Server Error"
            return result
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            result["error"] = f"Unexpected status code: {response.status_code}"
            return result
        
        data = response.json()
        
        if not isinstance(data, list):
            print(f"❌ FAIL: Response is not a list, got {type(data)}")
            result["error"] = f"Response is not a list: {type(data)}"
            return result
        
        result["count"] = len(data)
        print(f"Count: {len(data)} items")
        
        if len(data) == 0:
            print(f"❌ FAIL: Empty list returned")
            result["error"] = "Empty list returned"
            return result
        
        print(f"✅ PASS: 200 response, non-empty list ({len(data)} items)")
        result["passed"] = True
        
    except Exception as e:
        print(f"❌ FAIL: Request error: {e}")
        result["error"] = str(e)
    
    return result

def print_summary(kundalini_results, archangels_result, angelic_result):
    """Print final summary"""
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    total_tests = 4  # kundalini + kundulini + archangels + angelic
    passed_tests = 0
    
    print("\n1) Kundalini aliases:")
    for ally_type, result in kundalini_results.items():
        if result["passed"]:
            print(f"   ✅ {ally_type}: PASS ({result['count']} items)")
            passed_tests += 1
        else:
            print(f"   ❌ {ally_type}: FAIL - {result['error']}")
    
    print("\n2) Archangels:")
    if archangels_result["passed"]:
        print(f"   ✅ PASS ({archangels_result['count']} cards)")
        passed_tests += 1
    else:
        print(f"   ❌ FAIL - {archangels_result['error']}")
    
    print("\n3) Angelic Alchemy:")
    if angelic_result["passed"]:
        print(f"   ✅ PASS ({angelic_result['count']} items)")
        passed_tests += 1
    else:
        print(f"   ❌ FAIL - {angelic_result['error']}")
    
    print(f"\n{'='*80}")
    print(f"RESULT: {passed_tests}/{total_tests} tests passed")
    print(f"{'='*80}\n")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    print("Backend Verification Test")
    print(f"Base URL: {BASE_URL}")
    
    kundalini_results = test_kundalini_aliases()
    archangels_result = test_archangels()
    angelic_result = test_angelic_alchemy()
    
    all_passed = print_summary(kundalini_results, archangels_result, angelic_result)
    
    sys.exit(0 if all_passed else 1)
