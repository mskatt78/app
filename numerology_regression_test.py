#!/usr/bin/env python3
"""
Numerology Router Regression Test Suite
Tests numerology router cleanup on preview environment
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_life_paths_endpoint():
    """Test 1: GET /api/numerology/life-paths returns non-empty object"""
    print("\n" + "="*60)
    print("TEST 1: GET /api/numerology/life-paths")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/numerology/life-paths", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Number of life paths: {len(data) if isinstance(data, dict) else 'N/A'}")
            
            # Verify it's a non-empty dict
            if isinstance(data, dict) and len(data) > 0:
                # Show a sample life path
                sample_key = list(data.keys())[0]
                print(f"Sample life path ({sample_key}): {json.dumps(data[sample_key], indent=2)[:300]}...")
                print("✅ PASS: life-paths returns non-empty object")
                return True
            else:
                print("❌ FAIL: Response is empty or not a dict")
                print(f"Response: {json.dumps(data, indent=2)[:500]}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_calculate_basic():
    """Test 2: POST /api/numerology/calculate basic payload returns life_path and personal_year"""
    print("\n" + "="*60)
    print("TEST 2: POST /api/numerology/calculate (basic payload)")
    print("="*60)
    
    payload = {
        "birth_date": "1990-06-15"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json=payload,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify life_path and personal_year are present
            has_life_path = "life_path" in data
            has_personal_year = "personal_year" in data
            
            print(f"\nValidation:")
            print(f"  - Has 'life_path': {has_life_path}")
            print(f"  - Has 'personal_year': {has_personal_year}")
            
            if has_life_path and has_personal_year:
                # Verify personal_year has theme from PERSONAL_YEAR_THEMES
                py_number = data["personal_year"].get("number")
                py_theme = data["personal_year"].get("theme")
                print(f"  - Personal year number: {py_number}")
                print(f"  - Personal year theme: {py_theme}")
                
                if py_number and py_theme:
                    print("✅ PASS: Basic calculate returns life_path and personal_year with theme")
                    return True
                else:
                    print("❌ FAIL: personal_year missing number or theme")
                    return False
            else:
                print("❌ FAIL: Response missing life_path or personal_year")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_calculate_with_name():
    """Test 3: POST /api/numerology/calculate with full_name returns expression and soul_urge"""
    print("\n" + "="*60)
    print("TEST 3: POST /api/numerology/calculate (with full_name)")
    print("="*60)
    
    payload = {
        "birth_date": "1985-03-20",
        "full_name": "Sarah Elizabeth Johnson"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/numerology/calculate",
            json=payload,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify expression and soul_urge are present
            has_expression = "expression" in data
            has_soul_urge = "soul_urge" in data
            
            print(f"\nValidation:")
            print(f"  - Has 'expression': {has_expression}")
            print(f"  - Has 'soul_urge': {has_soul_urge}")
            
            if has_expression and has_soul_urge:
                expr_number = data["expression"].get("number")
                soul_number = data["soul_urge"].get("number")
                print(f"  - Expression number: {expr_number}")
                print(f"  - Soul urge number: {soul_number}")
                
                if expr_number and soul_number:
                    print("✅ PASS: Calculate with full_name returns expression and soul_urge")
                    return True
                else:
                    print("❌ FAIL: expression or soul_urge missing number")
                    return False
            else:
                print("❌ FAIL: Response missing expression or soul_urge")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_invalid_birth_date():
    """Test 4: Invalid birth_date validation returns 400"""
    print("\n" + "="*60)
    print("TEST 4: POST /api/numerology/calculate (invalid birth_date)")
    print("="*60)
    
    invalid_payloads = [
        {"birth_date": "invalid-date"},
        {"birth_date": "2025-13-45"},  # Invalid month/day
        {"birth_date": "not-a-date-at-all"}
    ]
    
    all_passed = True
    
    for i, payload in enumerate(invalid_payloads, 1):
        print(f"\n  Test 4.{i}: {payload['birth_date']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/numerology/calculate",
                json=payload,
                timeout=10
            )
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 400:
                print(f"  ✅ Correctly returns 400 for invalid date")
            else:
                print(f"  ❌ Expected 400, got {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                all_passed = False
                
        except Exception as e:
            print(f"  ❌ Exception occurred - {str(e)}")
            all_passed = False
    
    if all_passed:
        print("\n✅ PASS: Invalid birth_date validation returns 400")
    else:
        print("\n❌ FAIL: Some invalid dates did not return 400")
    
    return all_passed


def test_personal_year_themes_mapping():
    """Test 5: PERSONAL_YEAR_THEMES mapping resolves for 1..9 in responses"""
    print("\n" + "="*60)
    print("TEST 5: PERSONAL_YEAR_THEMES mapping (1..9)")
    print("="*60)
    
    # Test with different birth dates to get different personal year numbers
    # Personal year = (birth_month + birth_day + current_year) reduced to single digit
    # We'll test a few dates and verify the themes are present
    
    test_dates = [
        "1990-01-01",  # Should give a specific personal year
        "1985-05-15",
        "1992-09-23",
        "1988-12-31"
    ]
    
    personal_years_found = set()
    themes_found = []
    
    print("\nTesting multiple birth dates to verify PERSONAL_YEAR_THEMES mapping:")
    
    for birth_date in test_dates:
        try:
            response = requests.post(
                f"{BASE_URL}/api/numerology/calculate",
                json={"birth_date": birth_date},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                py_number = data.get("personal_year", {}).get("number")
                py_theme = data.get("personal_year", {}).get("theme")
                py_desc = data.get("personal_year", {}).get("description")
                
                if py_number and py_theme:
                    personal_years_found.add(py_number)
                    themes_found.append({
                        "birth_date": birth_date,
                        "number": py_number,
                        "theme": py_theme,
                        "has_description": bool(py_desc)
                    })
                    print(f"  {birth_date}: Personal Year {py_number} - '{py_theme}' ✓")
                else:
                    print(f"  {birth_date}: Missing personal_year data ✗")
            else:
                print(f"  {birth_date}: Request failed with {response.status_code} ✗")
                
        except Exception as e:
            print(f"  {birth_date}: Exception - {str(e)} ✗")
    
    print(f"\nPersonal year numbers found: {sorted(personal_years_found)}")
    print(f"Total unique personal years: {len(personal_years_found)}")
    
    # Verify all found personal years are in range 1-9
    all_valid = all(1 <= py <= 9 for py in personal_years_found)
    all_have_themes = all(t["theme"] for t in themes_found)
    all_have_descriptions = all(t["has_description"] for t in themes_found)
    
    print(f"\nValidation:")
    print(f"  - All personal years in range 1-9: {all_valid}")
    print(f"  - All have theme strings: {all_have_themes}")
    print(f"  - All have descriptions: {all_have_descriptions}")
    
    if all_valid and all_have_themes and all_have_descriptions and len(themes_found) > 0:
        print("\n✅ PASS: PERSONAL_YEAR_THEMES mapping resolves correctly for tested dates")
        return True
    else:
        print("\n❌ FAIL: PERSONAL_YEAR_THEMES mapping issues detected")
        return False


def main():
    """Run all numerology regression tests"""
    print("\n" + "="*60)
    print("NUMEROLOGY ROUTER REGRESSION TEST SUITE")
    print("Latest numerology router cleanup verification")
    print("="*60)
    print(f"Target: {BASE_URL}")
    
    results = []
    
    # Run all tests
    results.append(("GET /api/numerology/life-paths returns non-empty object", test_life_paths_endpoint()))
    results.append(("POST /api/numerology/calculate basic payload", test_calculate_basic()))
    results.append(("POST /api/numerology/calculate with full_name", test_calculate_with_name()))
    results.append(("Invalid birth_date validation returns 400", test_invalid_birth_date()))
    results.append(("PERSONAL_YEAR_THEMES mapping resolves for 1..9", test_personal_year_themes_mapping()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED - Numerology router regression successful")
        return 0
    else:
        print(f"\n❌ {total - passed} TEST(S) FAILED - Review failures above")
        return 1


if __name__ == "__main__":
    sys.exit(main())
