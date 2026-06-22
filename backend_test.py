#!/usr/bin/env python3
"""
Backend Regression Test - Sacred Ally Alchemy & Angelic Alchemy API Validation
Test URL: https://breathwork-sanctuary.preview.emergentagent.com
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_health_endpoint():
    """Test 1: GET /api/health should return 200 and healthy status"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/health")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify expected fields
            if 'status' in data and data['status'] == 'healthy':
                print("✅ PASS: Health endpoint returns 200 with 'healthy' status")
                return True
            else:
                print("❌ FAIL: Health endpoint missing 'status' field or not 'healthy'")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_sacred_ally_alchemy_endpoint():
    """Test 2: GET /api/sacred-ally-alchemy returns non-empty list with whale entry"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/sacred-ally-alchemy")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check if response is non-empty list
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) == 0:
            print("❌ FAIL: Response is empty list")
            return False
        
        print(f"✓ Response is non-empty list with {len(data)} entries")
        
        # Find whale entry
        whale_entry = None
        for entry in data:
            if 'category' in entry and 'whale' in entry['category'].lower():
                whale_entry = entry
                break
        
        if not whale_entry:
            print("❌ FAIL: No whale entry found in response")
            print(f"Available categories: {[e.get('category', 'N/A') for e in data]}")
            return False
        
        print(f"✓ Found whale entry: {whale_entry.get('id', 'N/A')}")
        
        # Check for song_lines field
        has_song_lines = 'song_lines' in whale_entry
        print(f"  - has song_lines field: {has_song_lines}")
        
        # Check for song_line_practices field
        has_song_line_practices = 'song_line_practices' in whale_entry
        print(f"  - has song_line_practices field: {has_song_line_practices}")
        
        if has_song_lines and has_song_line_practices:
            print("✅ PASS: Sacred ally alchemy endpoint returns whale entry with song_lines + song_line_practices")
            return True
        else:
            print("❌ FAIL: Whale entry missing song_lines or song_line_practices fields")
            print(f"Whale entry keys: {list(whale_entry.keys())}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_sacred_ally_alchemy_filter_whales():
    """Test 3: GET /api/sacred-ally-alchemy?category=whales filters successfully"""
    print("\n" + "="*80)
    print("TEST 3: GET /api/sacred-ally-alchemy?category=whales")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy?category=whales", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check if response is list
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) == 0:
            print("❌ FAIL: Filter returned empty list")
            return False
        
        print(f"✓ Filter returned {len(data)} entries")
        
        # Verify all entries are whale category
        all_whales = all('category' in entry and 'whale' in entry['category'].lower() for entry in data)
        
        if all_whales:
            print(f"✓ All {len(data)} entries are whale category")
            print("✅ PASS: Category filter for whales works correctly")
            return True
        else:
            print("❌ FAIL: Not all entries are whale category")
            categories = [e.get('category', 'N/A') for e in data]
            print(f"Categories found: {categories}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_angelic_alchemy_endpoint():
    """Test 4: GET /api/angelic-alchemy returns non-empty list with Metatron entry"""
    print("\n" + "="*80)
    print("TEST 4: GET /api/angelic-alchemy")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check if response is non-empty list
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) == 0:
            print("❌ FAIL: Response is empty list")
            return False
        
        print(f"✓ Response is non-empty list with {len(data)} entries")
        
        # Find Metatron entry
        metatron_entry = None
        for entry in data:
            if 'sacred_geometry' in entry and 'metatron' in entry['sacred_geometry'].lower():
                metatron_entry = entry
                break
        
        if not metatron_entry:
            print("❌ FAIL: No Metatron entry found in response")
            print(f"Available sacred_geometry values: {[e.get('sacred_geometry', 'N/A') for e in data]}")
            return False
        
        print(f"✓ Found Metatron entry: {metatron_entry.get('id', 'N/A')}")
        print(f"  - sacred_geometry: {metatron_entry.get('sacred_geometry', 'N/A')}")
        
        print("✅ PASS: Angelic alchemy endpoint returns Metatron entry with sacred_geometry")
        return True
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_angelic_alchemy_filter_metatron():
    """Test 5: GET /api/angelic-alchemy?sacred_geometry=Metatron filters successfully"""
    print("\n" + "="*80)
    print("TEST 5: GET /api/angelic-alchemy?sacred_geometry=Metatron")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy?sacred_geometry=Metatron", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check if response is list
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) == 0:
            print("❌ FAIL: Filter returned empty list")
            return False
        
        print(f"✓ Filter returned {len(data)} entries")
        
        # Verify all entries have Metatron in sacred_geometry
        all_metatron = all('sacred_geometry' in entry and 'metatron' in entry['sacred_geometry'].lower() for entry in data)
        
        if all_metatron:
            print(f"✓ All {len(data)} entries have Metatron sacred_geometry")
            print("✅ PASS: Sacred geometry filter for Metatron works correctly")
            return True
        else:
            print("❌ FAIL: Not all entries have Metatron sacred_geometry")
            geometries = [e.get('sacred_geometry', 'N/A') for e in data]
            print(f"Sacred geometries found: {geometries}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def main():
    print("\n" + "="*80)
    print("BACKEND REGRESSION TEST - Sacred Ally Alchemy & Angelic Alchemy")
    print("="*80)
    print(f"Test URL: {BASE_URL}")
    
    results = []
    
    # Run all tests
    results.append(("Health Endpoint", test_health_endpoint()))
    results.append(("Sacred Ally Alchemy Endpoint", test_sacred_ally_alchemy_endpoint()))
    results.append(("Sacred Ally Alchemy Filter (whales)", test_sacred_ally_alchemy_filter_whales()))
    results.append(("Angelic Alchemy Endpoint", test_angelic_alchemy_endpoint()))
    results.append(("Angelic Alchemy Filter (Metatron)", test_angelic_alchemy_filter_metatron()))
    
    # Summary
    print("\n" + "="*80)
    print("BACKEND TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL BACKEND REGRESSION TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {total - passed} BACKEND TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
