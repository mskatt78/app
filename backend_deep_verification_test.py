#!/usr/bin/env python3
"""
Backend Deep Verification Test
Focused testing on specific API flows as per review request
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

def test_sacred_guardians_deep():
    """
    Test 1: GET /api/sacred-guardians deep verification
    Requirements:
    1) Expect exactly 14 items
    2) Exactly 4 free and 10 premium
    3) First 4 free guardians include diverse lineages (power_animal, spirit_animal, dragon_energy, angel)
    4) Each guardian has non-empty image_url and guided_practice data
    """
    print("\n" + "="*80)
    print("TEST 1: Sacred Guardians Deep Verification - /api/sacred-guardians")
    print("="*80)
    
    url = f"{BASE_URL}/sacred-guardians"
    
    try:
        response = requests.get(url, timeout=30)
        
        # Check status code
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Parse response
        data = response.json()
        
        # Requirement 1: Expect exactly 14 items
        print(f"\n{Colors.BLUE}Requirement 1: Expect exactly 14 items{Colors.END}")
        if not isinstance(data, list):
            print_error(f"Expected array, got {type(data).__name__}")
            return False
        
        if len(data) != 14:
            print_error(f"Expected 14 items, got {len(data)}")
            return False
        
        print_success(f"Returns exactly 14 items ✓")
        
        # Requirement 2: Exactly 4 free and 10 premium
        print(f"\n{Colors.BLUE}Requirement 2: Exactly 4 free and 10 premium{Colors.END}")
        free_count = sum(1 for item in data if not item.get('is_premium', True))
        premium_count = sum(1 for item in data if item.get('is_premium', False))
        
        if free_count != 4:
            print_error(f"Expected 4 free items, got {free_count}")
            return False
        
        if premium_count != 10:
            print_error(f"Expected 10 premium items, got {premium_count}")
            return False
        
        print_success(f"Free count: {free_count} ✓")
        print_success(f"Premium count: {premium_count} ✓")
        
        # Requirement 3: First 4 free guardians include diverse lineages
        print(f"\n{Colors.BLUE}Requirement 3: First 4 free guardians include diverse lineages{Colors.END}")
        first_four = data[:4]
        
        # Check if first 4 are all free
        first_four_free = all(not item.get('is_premium', True) for item in first_four)
        if not first_four_free:
            print_error("First 4 items are not all free")
            return False
        
        print_success("First 4 items are all free ✓")
        
        # Check for diverse lineages (using 'category' field)
        required_lineages = ['power_animal', 'spirit_animal', 'dragon_energy', 'angel']
        found_lineages = []
        
        for item in first_four:
            category = item.get('category', '')
            if category:
                found_lineages.append(category)
                print_info(f"  Guardian '{item.get('name', 'Unknown')}' has category: {category}")
        
        # Check if all required lineages are present
        missing_lineages = [l for l in required_lineages if l not in found_lineages]
        
        if missing_lineages:
            print_error(f"Missing required lineages in first 4: {missing_lineages}")
            print_info(f"Found lineages: {found_lineages}")
            return False
        
        print_success(f"All required lineages present: {required_lineages} ✓")
        
        # Requirement 4: Each guardian has non-empty image_url and guided_practice data
        print(f"\n{Colors.BLUE}Requirement 4: Each guardian has non-empty image_url and guided_practice{Colors.END}")
        
        all_valid = True
        for idx, item in enumerate(data):
            name = item.get('name', f'Item {idx}')
            
            # Check image_url
            image_url = item.get('image_url', '')
            if not image_url or not isinstance(image_url, str) or len(image_url.strip()) == 0:
                print_error(f"Guardian '{name}' has empty or missing image_url")
                all_valid = False
            
            # Check guided_practice (should be a non-empty array)
            guided_practice = item.get('guided_practice', [])
            if not guided_practice or not isinstance(guided_practice, list) or len(guided_practice) == 0:
                print_error(f"Guardian '{name}' has empty or missing guided_practice")
                all_valid = False
        
        if not all_valid:
            return False
        
        print_success(f"All {len(data)} guardians have non-empty image_url ✓")
        print_success(f"All {len(data)} guardians have non-empty guided_practice ✓")
        
        print(f"\n{Colors.GREEN}✅ TEST 1 PASSED: Sacred Guardians deep verification successful{Colors.END}")
        return True
        
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON response: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_retreats_empty():
    """
    Test 2: GET /api/retreats
    Requirement: Expect [] (no placeholder retreat entries)
    """
    print("\n" + "="*80)
    print("TEST 2: Retreats Empty Verification - /api/retreats")
    print("="*80)
    
    url = f"{BASE_URL}/retreats"
    
    try:
        response = requests.get(url, timeout=30)
        
        # Check status code
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Parse response
        data = response.json()
        
        # Check if response is empty array
        if not isinstance(data, list):
            print_error(f"Expected array, got {type(data).__name__}")
            return False
        
        if len(data) != 0:
            print_error(f"Expected empty array [], got {len(data)} items")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return False
        
        print_success(f"Returns empty array [] as expected ✓")
        
        print(f"\n{Colors.GREEN}✅ TEST 2 PASSED: Retreats endpoint returns empty array{Colors.END}")
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

def test_expand_script_word_count():
    """
    Test 3: POST /api/content/expand-script
    Requirements:
    - Test with duration_minutes=7 and 15
    - Expect word_count meeting >=7 min floor at 132 WPM
    - For 7 minutes: minimum 924 words (7 * 132)
    - For 15 minutes: minimum 1980 words (15 * 132)
    """
    print("\n" + "="*80)
    print("TEST 3: Expand Script Word Count Verification - /api/content/expand-script")
    print("="*80)
    
    test_cases = [
        {
            "duration_minutes": 7,
            "min_word_count": 7 * 132,  # 924 words
            "description": "7 minutes (minimum 924 words at 132 WPM)"
        },
        {
            "duration_minutes": 15,
            "min_word_count": 15 * 132,  # 1980 words
            "description": "15 minutes (minimum 1980 words at 132 WPM)"
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        duration = test_case["duration_minutes"]
        min_word_count = test_case["min_word_count"]
        description = test_case["description"]
        
        print(f"\n{Colors.BLUE}Testing: {description}{Colors.END}")
        
        payload = {
            "practice_name": "Deep Verification Test Practice",
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
            if 'word_count' not in data:
                print_error("Missing 'word_count' field in response")
                all_passed = False
                continue
            
            if 'target_minutes' not in data:
                print_error("Missing 'target_minutes' field in response")
                all_passed = False
                continue
            
            word_count = data['word_count']
            target_minutes = data['target_minutes']
            
            print_info(f"  target_minutes: {target_minutes}")
            print_info(f"  word_count: {word_count}")
            print_info(f"  minimum required: {min_word_count}")
            
            # Check if word count meets minimum requirement
            if word_count < min_word_count:
                print_error(f"word_count ({word_count}) is below minimum ({min_word_count})")
                all_passed = False
                continue
            
            print_success(f"word_count ({word_count}) meets minimum requirement ({min_word_count}) ✓")
            
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
        print(f"\n{Colors.GREEN}✅ TEST 3 PASSED: Expand script word count verification successful{Colors.END}")
    else:
        print(f"\n{Colors.RED}❌ TEST 3 FAILED: Some expand script tests failed{Colors.END}")
    
    return all_passed

def test_health_endpoint():
    """
    Test 4: GET /api/health
    Requirement: Expect 200 status
    """
    print("\n" + "="*80)
    print("TEST 4: Health Endpoint Verification - /api/health")
    print("="*80)
    
    url = f"{BASE_URL}/health"
    
    try:
        response = requests.get(url, timeout=30)
        
        # Check status code
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Parse response
        data = response.json()
        
        print_success(f"Returns 200 OK ✓")
        print_info(f"Response: {json.dumps(data, indent=2)}")
        
        print(f"\n{Colors.GREEN}✅ TEST 4 PASSED: Health endpoint returns 200{Colors.END}")
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
    """Run all backend deep verification tests"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}BACKEND DEEP VERIFICATION TEST SUITE{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")
    
    results = {
        "test_1_sacred_guardians_deep": test_sacred_guardians_deep(),
        "test_2_retreats_empty": test_retreats_empty(),
        "test_3_expand_script_word_count": test_expand_script_word_count(),
        "test_4_health_endpoint": test_health_endpoint()
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
