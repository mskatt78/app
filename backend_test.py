#!/usr/bin/env python3
"""
Backend API Verification Script
Tests exact counts, free/premium splits, and field requirements
"""

import requests
import json
from typing import Dict, List, Any, Tuple

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_pass(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_fail(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warn(msg: str):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def test_endpoint_count_and_split(endpoint: str, expected_total: int = 14, expected_free: int = 4, expected_premium: int = 10) -> Tuple[bool, Dict[str, Any]]:
    """Test endpoint returns exact count with correct free/premium split"""
    url = f"{BASE_URL}{endpoint}"
    print_info(f"Testing: {endpoint}")
    
    # Define the 5 main light code categories (excluding metadata categories)
    main_light_code_categories = ['sacred_geometry', 'ancient_alphabets', 'light_language_symbols', 'galactic_codes', 'chakra_codes']
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 500:
            print_fail(f"500 error on {endpoint}")
            return False, {"error": "500 error", "endpoint": endpoint}
        
        if response.status_code != 200:
            print_warn(f"Non-200 status: {response.status_code} on {endpoint}")
            return False, {"error": f"Status {response.status_code}", "endpoint": endpoint}
        
        data = response.json()
        
        # Handle different response structures
        if isinstance(data, dict):
            # Check for common list keys
            items = data.get('items') or data.get('data') or data.get('results') or []
            if not items and len(data) > 0:
                # Might be a dict of categories
                items = data
        else:
            items = data
        
        # Count items
        if isinstance(items, list):
            total_count = len(items)
            free_count = sum(1 for item in items if isinstance(item, dict) and not item.get('is_premium', False))
            premium_count = sum(1 for item in items if isinstance(item, dict) and item.get('is_premium', False))
        elif isinstance(items, dict):
            # For category-based responses (like light-codes)
            total_count = 0
            free_count = 0
            premium_count = 0
            for cat_name, category_items in items.items():
                # For /light-codes endpoint, only count main categories
                if endpoint == '/light-codes' and cat_name not in main_light_code_categories:
                    continue
                if isinstance(category_items, list):
                    # Only count items that are dicts (not metadata strings)
                    dict_items = [item for item in category_items if isinstance(item, dict)]
                    total_count += len(dict_items)
                    free_count += sum(1 for item in dict_items if not item.get('is_premium', False))
                    premium_count += sum(1 for item in dict_items if item.get('is_premium', False))
        else:
            print_fail(f"Unexpected data structure on {endpoint}")
            return False, {"error": "Unexpected structure", "endpoint": endpoint}
        
        # Validate counts
        count_pass = total_count == expected_total
        free_pass = free_count == expected_free
        premium_pass = premium_count == expected_premium
        
        if count_pass and free_pass and premium_pass:
            print_pass(f"{endpoint}: {total_count} items ({free_count} free + {premium_count} premium)")
            return True, {"total": total_count, "free": free_count, "premium": premium_count, "data": data}
        else:
            print_fail(f"{endpoint}: Expected {expected_total} ({expected_free} free + {expected_premium} premium), got {total_count} ({free_count} free + {premium_count} premium)")
            return False, {"total": total_count, "free": free_count, "premium": premium_count, "expected_total": expected_total, "expected_free": expected_free, "expected_premium": expected_premium}
    
    except requests.exceptions.RequestException as e:
        print_fail(f"Request error on {endpoint}: {str(e)}")
        return False, {"error": str(e), "endpoint": endpoint}
    except Exception as e:
        print_fail(f"Unexpected error on {endpoint}: {str(e)}")
        return False, {"error": str(e), "endpoint": endpoint}

def test_sacred_tool_birthing_fields() -> Tuple[bool, Dict[str, Any]]:
    """Test sacred tool birthing entries include ceremonial + ethical fields"""
    endpoint = "/creative-processes?category=sacred-tool-birthing"
    url = f"{BASE_URL}{endpoint}"
    print_info(f"Testing sacred tool birthing fields: {endpoint}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 500:
            print_fail(f"500 error on {endpoint}")
            return False, {"error": "500 error"}
        
        if response.status_code != 200:
            print_warn(f"Non-200 status: {response.status_code}")
            return False, {"error": f"Status {response.status_code}"}
        
        data = response.json()
        items = data if isinstance(data, list) else data.get('items', [])
        
        if not items:
            print_fail("No items returned")
            return False, {"error": "No items"}
        
        # Check required fields in all items
        required_fields = ['ethical_materials', 'ceremony', 'ritual', 'guided_practice']
        missing_fields = []
        items_checked = 0
        
        for item in items:
            items_checked += 1
            for field in required_fields:
                if field not in item:
                    missing_fields.append(f"Item {item.get('id', 'unknown')}: missing '{field}'")
        
        if missing_fields:
            print_fail(f"Missing required fields in {len(missing_fields)} cases:")
            for missing in missing_fields[:5]:  # Show first 5
                print(f"  - {missing}")
            return False, {"missing_fields": missing_fields, "items_checked": items_checked}
        else:
            print_pass(f"All {items_checked} items have required ceremonial + ethical fields")
            return True, {"items_checked": items_checked, "fields_verified": required_fields}
    
    except Exception as e:
        print_fail(f"Error: {str(e)}")
        return False, {"error": str(e)}

def test_light_code_ceremonial_fields() -> Tuple[bool, Dict[str, Any]]:
    """Test light code category endpoints include ceremonial enrichment fields"""
    categories = [
        '/light-codes',
        '/light-codes/sacred-geometry',
        '/light-codes/ancient-alphabets',
        '/light-codes/light-language'
    ]
    
    required_fields = ['embodiment_ritual', 'light_coded_symbols', 'ceremony']
    all_passed = True
    results = {}
    
    # Define the 5 main light code categories (excluding metadata categories)
    main_light_code_categories = ['sacred_geometry', 'ancient_alphabets', 'light_language_symbols', 'galactic_codes', 'chakra_codes']
    
    for endpoint in categories:
        url = f"{BASE_URL}{endpoint}"
        print_info(f"Testing light code ceremonial fields: {endpoint}")
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 500:
                print_fail(f"500 error on {endpoint}")
                all_passed = False
                results[endpoint] = {"error": "500 error"}
                continue
            
            if response.status_code != 200:
                print_warn(f"Non-200 status: {response.status_code}")
                all_passed = False
                results[endpoint] = {"error": f"Status {response.status_code}"}
                continue
            
            data = response.json()
            
            # Handle different structures
            items = []
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                # For /light-codes which returns categories
                for cat_name, category_items in data.items():
                    # Only check main light code categories, skip metadata categories
                    if endpoint == '/light-codes' and cat_name not in main_light_code_categories:
                        continue
                    if isinstance(category_items, list):
                        # Only include dict items (not metadata strings)
                        dict_items = [item for item in category_items if isinstance(item, dict)]
                        items.extend(dict_items)
            
            if not items:
                print_fail(f"No items returned from {endpoint}")
                all_passed = False
                results[endpoint] = {"error": "No items"}
                continue
            
            # Check required fields
            missing_fields = []
            items_checked = 0
            
            for item in items:
                items_checked += 1
                for field in required_fields:
                    if field not in item:
                        missing_fields.append(f"Item {item.get('id', 'unknown')}: missing '{field}'")
            
            if missing_fields:
                print_fail(f"{endpoint}: Missing required fields in {len(missing_fields)} cases")
                for missing in missing_fields[:3]:  # Show first 3
                    print(f"  - {missing}")
                all_passed = False
                results[endpoint] = {"missing_fields": missing_fields, "items_checked": items_checked}
            else:
                print_pass(f"{endpoint}: All {items_checked} items have ceremonial enrichment fields")
                results[endpoint] = {"items_checked": items_checked, "fields_verified": required_fields}
        
        except Exception as e:
            print_fail(f"Error on {endpoint}: {str(e)}")
            all_passed = False
            results[endpoint] = {"error": str(e)}
    
    return all_passed, results

def test_no_500_errors() -> Tuple[bool, List[str]]:
    """Test all specified endpoints return no 500 errors"""
    endpoints = [
        '/creative-processes?category=sacred-tool-birthing',
        '/light-codes',
        '/light-codes/sacred-geometry',
        '/light-codes/ancient-alphabets',
        '/light-codes/light-language',
        '/runes',
        '/i-ching',
        '/tarot/cards',
        '/crystals/deep',
        '/free-form-movement',
        '/somatic-yoga',
        '/earth-altars'
    ]
    
    print_info("Testing for 500 errors across all endpoints...")
    errors_500 = []
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 500:
                errors_500.append(endpoint)
                print_fail(f"500 error: {endpoint}")
            else:
                print_pass(f"No 500: {endpoint} (status: {response.status_code})")
        except Exception as e:
            print_warn(f"Request error on {endpoint}: {str(e)}")
    
    if errors_500:
        print_fail(f"Found {len(errors_500)} endpoints with 500 errors")
        return False, errors_500
    else:
        print_pass("No 500 errors detected on any tested endpoint")
        return True, []

def main():
    print("\n" + "="*80)
    print("BACKEND API VERIFICATION - FINAL REQUEST")
    print("="*80 + "\n")
    
    results = {
        "passed": [],
        "failed": []
    }
    
    # Test 1: Count and split validation for all endpoints
    print("\n" + "-"*80)
    print("TEST 1: Exact 14-count + 4 free / 10 premium validation")
    print("-"*80 + "\n")
    
    endpoints_to_test = [
        '/creative-processes?category=sacred-tool-birthing',
        '/light-codes/sacred-geometry',
        '/light-codes/ancient-alphabets',
        '/light-codes/light-language',
        '/runes',
        '/i-ching',
        '/tarot/cards',
        '/crystals/deep',
        '/free-form-movement',
        '/somatic-yoga',
        '/earth-altars'
    ]
    
    for endpoint in endpoints_to_test:
        passed, data = test_endpoint_count_and_split(endpoint)
        if passed:
            results["passed"].append(f"Count validation: {endpoint}")
        else:
            results["failed"].append(f"Count validation: {endpoint} - {data}")
    
    # Test /light-codes separately (returns all 5 categories)
    print_info("Testing /light-codes (all 5 categories combined)")
    passed, data = test_endpoint_count_and_split('/light-codes', expected_total=70, expected_free=20, expected_premium=50)
    if passed:
        results["passed"].append("Count validation: /light-codes (all categories)")
    else:
        results["failed"].append(f"Count validation: /light-codes - {data}")
    
    # Test 2: Sacred tool birthing ceremonial + ethical fields
    print("\n" + "-"*80)
    print("TEST 2: Sacred tool birthing ceremonial + ethical fields")
    print("-"*80 + "\n")
    
    passed, data = test_sacred_tool_birthing_fields()
    if passed:
        results["passed"].append("Sacred tool birthing fields validation")
    else:
        results["failed"].append(f"Sacred tool birthing fields - {data}")
    
    # Test 3: Light code ceremonial enrichment fields
    print("\n" + "-"*80)
    print("TEST 3: Light code ceremonial enrichment fields")
    print("-"*80 + "\n")
    
    passed, data = test_light_code_ceremonial_fields()
    if passed:
        results["passed"].append("Light code ceremonial fields validation")
    else:
        results["failed"].append(f"Light code ceremonial fields - {data}")
    
    # Test 4: No 500 errors
    print("\n" + "-"*80)
    print("TEST 4: No 500 errors on tested endpoints")
    print("-"*80 + "\n")
    
    passed, errors = test_no_500_errors()
    if passed:
        results["passed"].append("No 500 errors validation")
    else:
        results["failed"].append(f"500 errors found on: {errors}")
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80 + "\n")
    
    print(f"{Colors.GREEN}PASSED: {len(results['passed'])}{Colors.END}")
    for item in results["passed"]:
        print(f"  ✓ {item}")
    
    print(f"\n{Colors.RED}FAILED: {len(results['failed'])}{Colors.END}")
    for item in results["failed"]:
        print(f"  ✗ {item}")
    
    print("\n" + "="*80 + "\n")
    
    if len(results["failed"]) == 0:
        print(f"{Colors.GREEN}ALL TESTS PASSED ✓{Colors.END}\n")
        return 0
    else:
        print(f"{Colors.RED}SOME TESTS FAILED ✗{Colors.END}\n")
        return 1

if __name__ == "__main__":
    exit(main())
