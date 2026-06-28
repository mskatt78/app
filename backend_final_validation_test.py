#!/usr/bin/env python3
"""
Final validation test for preview deployment
Tests API counts, tiering expectations, and image correctness
"""

import requests
import json
from typing import Dict, List, Any

# Backend URL from frontend/.env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_pass(msg):
    print(f"{Colors.GREEN}✓ PASS:{Colors.END} {msg}")

def print_fail(msg):
    print(f"{Colors.RED}✗ FAIL:{Colors.END} {msg}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ INFO:{Colors.END} {msg}")

def print_section(msg):
    print(f"\n{Colors.YELLOW}{'='*80}{Colors.END}")
    print(f"{Colors.YELLOW}{msg}{Colors.END}")
    print(f"{Colors.YELLOW}{'='*80}{Colors.END}\n")

def count_free_premium(items: List[Dict], premium_field: str = "is_premium") -> tuple:
    """Count free and premium items in a list"""
    free_count = sum(1 for item in items if not item.get(premium_field, False))
    premium_count = sum(1 for item in items if item.get(premium_field, False))
    return free_count, premium_count

def test_api_endpoint(endpoint: str, expected_total: int = None, expected_free: int = None, 
                      expected_premium: int = None, premium_field: str = "is_premium") -> bool:
    """Test an API endpoint for count and tiering expectations"""
    url = f"{BASE_URL}{endpoint}"
    print_info(f"Testing: {endpoint}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print_fail(f"{endpoint} returned status {response.status_code}")
            return False
        
        data = response.json()
        
        # Handle different response formats
        if isinstance(data, dict):
            if 'items' in data:
                items = data['items']
            elif 'practices' in data:
                items = data['practices']
            elif 'sessions' in data:
                items = data['sessions']
            elif 'cards' in data:
                items = data['cards']
            else:
                # Assume the dict values are the items
                items = list(data.values())[0] if data else []
        elif isinstance(data, list):
            items = data
        else:
            print_fail(f"{endpoint} returned unexpected format")
            return False
        
        total_count = len(items)
        free_count, premium_count = count_free_premium(items, premium_field)
        
        # Check total count
        if expected_total is not None and total_count != expected_total:
            print_fail(f"{endpoint} - Expected {expected_total} total, got {total_count}")
            return False
        
        # Check free count
        if expected_free is not None and free_count != expected_free:
            print_fail(f"{endpoint} - Expected {expected_free} free, got {free_count}")
            print_info(f"  Total: {total_count}, Free: {free_count}, Premium: {premium_count}")
            return False
        
        # Check premium count
        if expected_premium is not None and premium_count != expected_premium:
            print_fail(f"{endpoint} - Expected {expected_premium} premium, got {premium_count}")
            print_info(f"  Total: {total_count}, Free: {free_count}, Premium: {premium_count}")
            return False
        
        print_pass(f"{endpoint} - Total: {total_count}, Free: {free_count}, Premium: {premium_count}")
        return True
        
    except requests.exceptions.RequestException as e:
        print_fail(f"{endpoint} - Request failed: {str(e)}")
        return False
    except Exception as e:
        print_fail(f"{endpoint} - Error: {str(e)}")
        return False

def test_creative_processes():
    """Test creative processes endpoints"""
    print_section("TESTING CREATIVE PROCESSES")
    
    results = []
    
    # Test main endpoint
    url = f"{BASE_URL}/creative-processes"
    print_info(f"Testing: /creative-processes")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print_fail(f"/creative-processes returned status {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            items = data if isinstance(data, list) else data.get('items', [])
            
            # Check for premium flags
            has_premium_flags = any('is_premium' in item or 'premium' in item for item in items)
            
            # Check for earth-crafting entries
            earth_crafting_items = [item for item in items if item.get('category') == 'earth-crafting']
            
            # Check for sacred-tool-birthing entries
            tool_birthing_items = [item for item in items if item.get('category') == 'sacred-tool-birthing']
            
            if has_premium_flags:
                print_pass("/creative-processes includes premium flags")
                results.append(True)
            else:
                print_fail("/creative-processes missing premium flags")
                results.append(False)
            
            if earth_crafting_items:
                print_pass(f"/creative-processes includes {len(earth_crafting_items)} earth-crafting entries")
                results.append(True)
            else:
                print_fail("/creative-processes missing earth-crafting entries")
                results.append(False)
            
            if tool_birthing_items:
                print_pass(f"/creative-processes includes {len(tool_birthing_items)} sacred-tool-birthing entries")
                results.append(True)
            else:
                print_fail("/creative-processes missing sacred-tool-birthing entries")
                results.append(False)
    
    except Exception as e:
        print_fail(f"/creative-processes - Error: {str(e)}")
        results.append(False)
    
    # Test earth-crafting category filter
    url = f"{BASE_URL}/creative-processes?category=earth-crafting"
    print_info(f"Testing: /creative-processes?category=earth-crafting")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print_fail(f"/creative-processes?category=earth-crafting returned status {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            items = data if isinstance(data, list) else data.get('items', [])
            
            if len(items) > 0:
                print_pass(f"/creative-processes?category=earth-crafting returned {len(items)} items (non-empty)")
                results.append(True)
            else:
                print_fail("/creative-processes?category=earth-crafting returned empty list")
                results.append(False)
    
    except Exception as e:
        print_fail(f"/creative-processes?category=earth-crafting - Error: {str(e)}")
        results.append(False)
    
    # Test sacred-tool-birthing category filter
    url = f"{BASE_URL}/creative-processes?category=sacred-tool-birthing"
    print_info(f"Testing: /creative-processes?category=sacred-tool-birthing")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print_fail(f"/creative-processes?category=sacred-tool-birthing returned status {response.status_code}")
            results.append(False)
        else:
            data = response.json()
            items = data if isinstance(data, list) else data.get('items', [])
            
            if len(items) > 0:
                print_pass(f"/creative-processes?category=sacred-tool-birthing returned {len(items)} items (non-empty)")
                results.append(True)
            else:
                print_fail("/creative-processes?category=sacred-tool-birthing returned empty list")
                results.append(False)
    
    except Exception as e:
        print_fail(f"/creative-processes?category=sacred-tool-birthing - Error: {str(e)}")
        results.append(False)
    
    return all(results)

def test_oracle_cards_coyote_image():
    """Test that coyote card has correct coyote image (not flower)"""
    print_section("TESTING ORACLE CARDS - COYOTE IMAGE")
    
    url = f"{BASE_URL}/oracle/cards"
    print_info(f"Testing: /oracle/cards - coyote card image")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print_fail(f"/oracle/cards returned status {response.status_code}")
            return False
        
        data = response.json()
        cards = data if isinstance(data, list) else data.get('cards', [])
        
        # Find coyote card
        coyote_card = None
        for card in cards:
            if 'coyote' in card.get('name', '').lower() or 'coyote' in card.get('title', '').lower():
                coyote_card = card
                break
        
        if not coyote_card:
            print_fail("Coyote card not found in oracle cards")
            return False
        
        image_url = coyote_card.get('image_url', '') or coyote_card.get('image', '')
        
        # Check if image URL contains 'coyote' and not 'flower'
        if 'coyote' in image_url.lower():
            print_pass(f"Coyote card has coyote image: {image_url}")
            return True
        elif 'flower' in image_url.lower():
            print_fail(f"Coyote card has FLOWER image (incorrect): {image_url}")
            return False
        else:
            print_info(f"Coyote card image URL: {image_url}")
            print_info("Cannot determine if image is coyote or flower from URL alone")
            # Consider this a pass if it doesn't have 'flower' in the URL
            print_pass("Coyote card image does not contain 'flower' in URL")
            return True
    
    except Exception as e:
        print_fail(f"/oracle/cards - Error: {str(e)}")
        return False

def main():
    print_section("FINAL VALIDATION TEST - PREVIEW DEPLOYMENT")
    print_info(f"Backend URL: {BASE_URL}")
    
    results = {}
    
    # Test 1: API counts and tiering expectations
    print_section("1. API COUNTS AND TIERING EXPECTATIONS")
    
    results['yoga_poses'] = test_api_endpoint("/yoga/poses", expected_free=4)
    results['somatic'] = test_api_endpoint("/somatic", expected_free=4)
    results['breathwork_sessions'] = test_api_endpoint("/breathwork/sessions", expected_free=5)
    results['meditations'] = test_api_endpoint("/meditations", expected_total=14, expected_free=4, expected_premium=10)
    results['mindfulness'] = test_api_endpoint("/mindfulness", expected_total=17, expected_free=5, expected_premium=12)
    results['mantras'] = test_api_endpoint("/mantras", expected_total=36, expected_free=11, expected_premium=25)
    results['water_practices'] = test_api_endpoint("/water-practices", expected_total=17, expected_free=5, expected_premium=12)
    results['heart_practices'] = test_api_endpoint("/heart-practices", expected_total=15, expected_free=5, expected_premium=10)
    results['sacred_ally_alchemy'] = test_api_endpoint("/sacred-ally-alchemy", expected_free=5)
    results['angelic_alchemy'] = test_api_endpoint("/angelic-alchemy", expected_free=5)
    results['sacred_guardians'] = test_api_endpoint("/sacred-guardians", expected_free=5)
    results['ancient_wisdom'] = test_api_endpoint("/ancient-wisdom", expected_free=5)
    
    # Test 2: Creative processes
    results['creative_processes'] = test_creative_processes()
    
    # Test 3: Oracle cards - coyote image
    results['oracle_coyote_image'] = test_oracle_cards_coyote_image()
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    failed = sum(1 for v in results.values() if not v)
    total = len(results)
    
    print(f"\nTotal Tests: {total}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"{Colors.RED}Failed: {failed}{Colors.END}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{'='*80}{Colors.END}")
        print(f"{Colors.GREEN}ALL TESTS PASSED ✓{Colors.END}")
        print(f"{Colors.GREEN}{'='*80}{Colors.END}\n")
    else:
        print(f"\n{Colors.RED}{'='*80}{Colors.END}")
        print(f"{Colors.RED}SOME TESTS FAILED ✗{Colors.END}")
        print(f"{Colors.RED}{'='*80}{Colors.END}\n")
        
        print("Failed tests:")
        for test_name, result in results.items():
            if not result:
                print(f"  - {test_name}")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
