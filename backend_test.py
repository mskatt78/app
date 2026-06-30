#!/usr/bin/env python3
"""
Backend API Testing Script
Tests narration duration bounds, guided content endpoints, and retreat endpoint
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Base URL from frontend env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def test_narration_duration_bounds():
    """
    Test 1: Narration duration bounds for /api/content/expand-script
    Request duration_minutes values: 5, 7, 12, 20, 27
    Expected target_minutes clamp: 7 for low values, 20 max cap, and exact for in-range values
    """
    print("\n" + "="*80)
    print("TEST 1: Narration Duration Bounds - /api/content/expand-script")
    print("="*80)
    
    test_cases = [
        {"duration_minutes": 5, "expected_target": 7, "description": "Below minimum (5) should clamp to 7"},
        {"duration_minutes": 7, "expected_target": 7, "description": "Minimum value (7) should remain 7"},
        {"duration_minutes": 12, "expected_target": 12, "description": "In-range value (12) should remain 12"},
        {"duration_minutes": 20, "expected_target": 20, "description": "Maximum value (20) should remain 20"},
        {"duration_minutes": 27, "expected_target": 20, "description": "Above maximum (27) should clamp to 20"},
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        duration = test_case["duration_minutes"]
        expected_target = test_case["expected_target"]
        description = test_case["description"]
        
        print(f"\n{Colors.BLUE}Testing duration_minutes={duration}: {description}{Colors.END}")
        
        payload = {
            "practice_name": "Test Practice",
            "duration_minutes": duration,
            "use_ai": False
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/content/expand-script",
                json=payload,
                timeout=30
            )
            
            # Check status code
            if response.status_code != 200:
                print_error(f"Expected 200, got {response.status_code}")
                print_error(f"Response: {response.text}")
                all_passed = False
                continue
            
            # Parse response
            data = response.json()
            
            # Check required fields
            required_fields = ["target_minutes", "paragraphs", "segments"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing required fields: {missing_fields}")
                all_passed = False
                continue
            
            # Check target_minutes clamping
            actual_target = data["target_minutes"]
            if actual_target != expected_target:
                print_error(f"target_minutes={actual_target}, expected {expected_target}")
                all_passed = False
                continue
            
            # Check paragraphs and segments are non-empty
            if not data["paragraphs"]:
                print_error("paragraphs array is empty")
                all_passed = False
                continue
            
            if not data["segments"]:
                print_error("segments array is empty")
                all_passed = False
                continue
            
            print_success(f"duration_minutes={duration} → target_minutes={actual_target} (expected {expected_target})")
            print_success(f"  paragraphs: {len(data['paragraphs'])} items")
            print_success(f"  segments: {len(data['segments'])} items")
            
        except requests.exceptions.RequestException as e:
            print_error(f"Request failed: {e}")
            all_passed = False
        except json.JSONDecodeError as e:
            print_error(f"Invalid JSON response: {e}")
            all_passed = False
        except Exception as e:
            print_error(f"Unexpected error: {e}")
            all_passed = False
    
    if all_passed:
        print(f"\n{Colors.GREEN}✅ TEST 1 PASSED: All narration duration bounds working correctly{Colors.END}")
    else:
        print(f"\n{Colors.RED}❌ TEST 1 FAILED: Some narration duration tests failed{Colors.END}")
    
    return all_passed

def test_guided_content_endpoints():
    """
    Test 2: Guided content endpoint sanity
    - /api/ancient-wisdom
    - /api/mystery-school?stream=egyptian_mystery
    - /api/mystery-school?stream=priestess_rose
    - /api/mystery-school?stream=merlin_alchemy
    - /api/mystery-school?stream=emerald_tablet
    """
    print("\n" + "="*80)
    print("TEST 2: Guided Content Endpoints Sanity")
    print("="*80)
    
    endpoints = [
        {
            "url": f"{BASE_URL}/ancient-wisdom",
            "description": "Ancient Wisdom endpoint",
            "expect_array": True
        },
        {
            "url": f"{BASE_URL}/mystery-school?stream=egyptian_mystery",
            "description": "Mystery School - Egyptian Mystery",
            "expect_array": True
        },
        {
            "url": f"{BASE_URL}/mystery-school?stream=priestess_rose",
            "description": "Mystery School - Priestess Rose",
            "expect_array": True
        },
        {
            "url": f"{BASE_URL}/mystery-school?stream=merlin_alchemy",
            "description": "Mystery School - Merlin Alchemy",
            "expect_array": True
        },
        {
            "url": f"{BASE_URL}/mystery-school?stream=emerald_tablet",
            "description": "Mystery School - Emerald Tablet",
            "expect_array": True
        }
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        url = endpoint["url"]
        description = endpoint["description"]
        expect_array = endpoint["expect_array"]
        
        print(f"\n{Colors.BLUE}Testing: {description}{Colors.END}")
        print(f"  URL: {url}")
        
        try:
            response = requests.get(url, timeout=30)
            
            # Check status code
            if response.status_code != 200:
                print_error(f"Expected 200, got {response.status_code}")
                print_error(f"Response: {response.text}")
                all_passed = False
                continue
            
            # Parse response
            data = response.json()
            
            # Check if response is array when expected
            if expect_array:
                if not isinstance(data, list):
                    print_error(f"Expected array, got {type(data).__name__}")
                    all_passed = False
                    continue
                
                if len(data) == 0:
                    print_warning(f"Array is empty (0 items)")
                else:
                    print_success(f"Returns 200 with {len(data)} items")
            else:
                print_success(f"Returns 200 with valid JSON")
            
        except requests.exceptions.RequestException as e:
            print_error(f"Request failed: {e}")
            all_passed = False
        except json.JSONDecodeError as e:
            print_error(f"Invalid JSON response: {e}")
            all_passed = False
        except Exception as e:
            print_error(f"Unexpected error: {e}")
            all_passed = False
    
    if all_passed:
        print(f"\n{Colors.GREEN}✅ TEST 2 PASSED: All guided content endpoints healthy{Colors.END}")
    else:
        print(f"\n{Colors.RED}❌ TEST 2 FAILED: Some guided content endpoints failed{Colors.END}")
    
    return all_passed

def test_retreat_endpoint():
    """
    Test 3: Retreat endpoint sanity
    GET /api/retreats returns 200 and valid JSON (empty or populated)
    """
    print("\n" + "="*80)
    print("TEST 3: Retreat Endpoint Sanity - /api/retreats")
    print("="*80)
    
    url = f"{BASE_URL}/retreats"
    
    print(f"\n{Colors.BLUE}Testing: GET /api/retreats{Colors.END}")
    
    try:
        response = requests.get(url, timeout=30)
        
        # Check status code
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Parse response
        data = response.json()
        
        # Check if response is valid JSON (array or object)
        if isinstance(data, list):
            print_success(f"Returns 200 with valid JSON array ({len(data)} items)")
        elif isinstance(data, dict):
            print_success(f"Returns 200 with valid JSON object")
        else:
            print_error(f"Unexpected response type: {type(data).__name__}")
            return False
        
        print(f"\n{Colors.GREEN}✅ TEST 3 PASSED: Retreat endpoint healthy{Colors.END}")
        return True
        
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON response: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def main():
    """Run all backend tests"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}BACKEND VERIFICATION TEST SUITE{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    results = {
        "test_1_narration_duration": test_narration_duration_bounds(),
        "test_2_guided_content": test_guided_content_endpoints(),
        "test_3_retreat_endpoint": test_retreat_endpoint()
    }
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    
    for test_name, passed in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if passed else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test_name}: {status}")
    
    print(f"\n{Colors.BLUE}Total: {passed_count}/{total_count} tests passed{Colors.END}")
    
    if passed_count == total_count:
        print(f"\n{Colors.GREEN}✅ ALL TESTS PASSED{Colors.END}")
        return 0
    else:
        print(f"\n{Colors.RED}❌ SOME TESTS FAILED{Colors.END}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
