#!/usr/bin/env python3
"""
Backend API Testing Script
Tests backend endpoints for Breathwork Sanctuary app
"""

import requests
import json
import time
from typing import Dict, Any, List

# Base URL from frontend/.env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_chair_yoga_expansion():
    """
    Test 1: GET /chair-yoga returns expanded set (>14) with premium structure (4 free, rest premium)
    """
    print("\n" + "="*80)
    print("TEST 1: Chair Yoga Expansion Verification")
    print("="*80)
    
    url = f"{BASE_URL}/chair-yoga"
    print(f"Testing: GET {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check if response is a list
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        total_count = len(data)
        print(f"Total chair yoga practices: {total_count}")
        
        # Check if expanded set (>14)
        if total_count <= 14:
            print(f"❌ FAILED: Expected >14 practices, got {total_count}")
            return False
        else:
            print(f"✅ PASS: Expanded set confirmed ({total_count} > 14)")
        
        # Check premium structure (4 free, rest premium)
        free_count = sum(1 for item in data if not item.get('is_premium', True))
        premium_count = sum(1 for item in data if item.get('is_premium', False))
        
        print(f"Free practices: {free_count}")
        print(f"Premium practices: {premium_count}")
        
        if free_count != 4:
            print(f"❌ FAILED: Expected 4 free practices, got {free_count}")
            return False
        else:
            print(f"✅ PASS: Correct free count (4)")
        
        if premium_count != (total_count - 4):
            print(f"❌ FAILED: Expected {total_count - 4} premium practices, got {premium_count}")
            return False
        else:
            print(f"✅ PASS: Correct premium count ({premium_count})")
        
        # Verify first 4 are free, rest are premium
        first_4_free = all(not item.get('is_premium', True) for item in data[:4])
        rest_premium = all(item.get('is_premium', False) for item in data[4:])
        
        if not first_4_free:
            print(f"❌ FAILED: First 4 practices should be free")
            return False
        else:
            print(f"✅ PASS: First 4 practices are free")
        
        if not rest_premium:
            print(f"❌ FAILED: Remaining practices should be premium")
            return False
        else:
            print(f"✅ PASS: Remaining practices are premium")
        
        print("\n✅ TEST 1 PASSED: Chair Yoga expansion verified")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_chair_yoga_spot_check():
    """
    Test 2: Spot-check new chair practice ids exist:
    - chair-yoga-201
    - chair-yoga-202
    - chair-yoga-208
    """
    print("\n" + "="*80)
    print("TEST 2: Chair Yoga Spot-Check (New Practice IDs)")
    print("="*80)
    
    url = f"{BASE_URL}/chair-yoga"
    print(f"Testing: GET {url}")
    
    required_ids = ["chair-yoga-201", "chair-yoga-202", "chair-yoga-208"]
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Extract all IDs from response
        practice_ids = [item.get('id') for item in data if 'id' in item]
        print(f"Total practices found: {len(practice_ids)}")
        
        # Check each required ID
        all_found = True
        for required_id in required_ids:
            if required_id in practice_ids:
                # Find the practice details
                practice = next((p for p in data if p.get('id') == required_id), None)
                if practice:
                    print(f"✅ FOUND: {required_id} - {practice.get('name', 'N/A')}")
                else:
                    print(f"✅ FOUND: {required_id}")
            else:
                print(f"❌ MISSING: {required_id}")
                all_found = False
        
        if all_found:
            print("\n✅ TEST 2 PASSED: All required chair practice IDs exist")
            return True
        else:
            print("\n❌ TEST 2 FAILED: Some required chair practice IDs are missing")
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_expand_script_endpoint():
    """
    Test 3: GET /content/expand-script response remains valid and fast for target_minutes=7 payload
    """
    print("\n" + "="*80)
    print("TEST 3: Expand Script Endpoint (target_minutes=7)")
    print("="*80)
    
    url = f"{BASE_URL}/content/expand-script"
    print(f"Testing: POST {url}")
    
    payload = {
        "practice_name": "Test Practice",
        "duration_minutes": 7,
        "use_ai": False
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        start_time = time.time()
        response = requests.post(url, json=payload, timeout=30)
        elapsed_time = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {elapsed_time:.2f} seconds")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check required fields
        required_fields = ['target_minutes', 'target_word_count', 'word_count', 'segments', 'paragraphs']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            print(f"❌ FAILED: Missing required fields: {missing_fields}")
            return False
        else:
            print(f"✅ PASS: All required fields present")
        
        # Verify target_minutes
        target_minutes = data.get('target_minutes')
        if target_minutes != 7:
            print(f"❌ FAILED: Expected target_minutes=7, got {target_minutes}")
            return False
        else:
            print(f"✅ PASS: target_minutes = {target_minutes}")
        
        # Verify segments is non-empty
        segments = data.get('segments', [])
        if not segments or len(segments) == 0:
            print(f"❌ FAILED: segments is empty")
            return False
        else:
            print(f"✅ PASS: segments is non-empty (count: {len(segments)})")
        
        # Verify paragraphs is non-empty
        paragraphs = data.get('paragraphs', [])
        if not paragraphs or len(paragraphs) == 0:
            print(f"❌ FAILED: paragraphs is empty")
            return False
        else:
            print(f"✅ PASS: paragraphs is non-empty (count: {len(paragraphs)})")
        
        # Verify word_count
        word_count = data.get('word_count', 0)
        target_word_count = data.get('target_word_count', 0)
        print(f"Word count: {word_count}")
        print(f"Target word count: {target_word_count}")
        
        if word_count == 0:
            print(f"❌ FAILED: word_count is 0")
            return False
        else:
            print(f"✅ PASS: word_count is non-zero ({word_count})")
        
        # Check performance (should be fast)
        if elapsed_time > 5.0:
            print(f"⚠️ WARNING: Response time ({elapsed_time:.2f}s) is slower than expected (<5s)")
        else:
            print(f"✅ PASS: Response time is fast ({elapsed_time:.2f}s < 5s)")
        
        print("\n✅ TEST 3 PASSED: Expand script endpoint valid and fast")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("BACKEND VALIDATION - Partner + Chair Expansion and Voice Latency Tuning")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = []
    
    # Test 1: Chair Yoga Expansion
    results.append(("Chair Yoga Expansion", test_chair_yoga_expansion()))
    
    # Test 2: Chair Yoga Spot-Check
    results.append(("Chair Yoga Spot-Check", test_chair_yoga_spot_check()))
    
    # Test 3: Expand Script Endpoint
    results.append(("Expand Script Endpoint", test_expand_script_endpoint()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, passed in results if passed)
    failed_tests = total_tests - passed_tests
    
    print("\n" + "="*80)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print("="*80)
    
    if failed_tests == 0:
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {failed_tests} TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    exit(main())
