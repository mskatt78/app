#!/usr/bin/env python3
"""
Backend verification for polish pass - ceremonial enrichment fields.
Validates mantras, mudras, and regression checks on sacred-ally-alchemy, angelic-alchemy, sacred-guardians, energy-healing.
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_mantras_ceremonial_enrichment():
    """Test 1: Validate /api/mantras returns 14 items with ceremonial enrichment fields."""
    endpoint = "/mantras"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Mantras Ceremonial Enrichment",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if we have exactly 14 items
        if len(data) != 14:
            return {
                "test": "Mantras Ceremonial Enrichment",
                "passed": False,
                "error": f"Expected 14 items, got {len(data)}"
            }
        
        # Check for ceremonial enrichment fields
        required_fields = [
            'why_this_heals',
            'integration_guide',
            'alchemy',
            'ritual',
            'ceremony',
            'guided_practice',
            'master_embodiment_protocol'
        ]
        
        missing_fields = {}
        for item in data:
            item_id = item.get('id', 'unknown')
            for field in required_fields:
                if field not in item or not item[field]:
                    if item_id not in missing_fields:
                        missing_fields[item_id] = []
                    missing_fields[item_id].append(field)
        
        if missing_fields:
            return {
                "test": "Mantras Ceremonial Enrichment",
                "passed": False,
                "error": f"Missing ceremonial enrichment fields in {len(missing_fields)} items",
                "missing_fields": missing_fields
            }
        
        return {
            "test": "Mantras Ceremonial Enrichment",
            "passed": True,
            "total_items": len(data),
            "sample_ids": [item['id'] for item in data[:3]],
            "all_fields_present": True
        }
        
    except Exception as e:
        return {
            "test": "Mantras Ceremonial Enrichment",
            "passed": False,
            "error": str(e)
        }

def test_mudras_ceremonial_enrichment():
    """Test 2: Validate /api/mudras includes mudra-supp-301..306 with ceremonial enrichment fields."""
    endpoint = "/mudras"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Mudras Ceremonial Enrichment",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check for mudra supplements (mudra-supp-301..306)
        required_supplement_ids = [
            'mudra-supp-301',
            'mudra-supp-302',
            'mudra-supp-303',
            'mudra-supp-304',
            'mudra-supp-305',
            'mudra-supp-306'
        ]
        
        found_supplements = []
        for item in data:
            item_id = item.get('id', '')
            if item_id in required_supplement_ids:
                found_supplements.append(item_id)
        
        missing_supplements = [sid for sid in required_supplement_ids if sid not in found_supplements]
        
        if missing_supplements:
            return {
                "test": "Mudras Ceremonial Enrichment",
                "passed": False,
                "error": f"Missing mudra supplements: {missing_supplements}",
                "found_supplements": found_supplements
            }
        
        # Check for ceremonial enrichment fields in supplements
        required_fields = [
            'why_this_heals',
            'integration_guide',
            'alchemy',
            'ritual',
            'ceremony',
            'guided_practice',
            'master_embodiment_protocol'
        ]
        
        missing_fields = {}
        for item in data:
            item_id = item.get('id', '')
            if item_id in required_supplement_ids:
                for field in required_fields:
                    if field not in item or not item[field]:
                        if item_id not in missing_fields:
                            missing_fields[item_id] = []
                        missing_fields[item_id].append(field)
        
        if missing_fields:
            return {
                "test": "Mudras Ceremonial Enrichment",
                "passed": False,
                "error": f"Missing ceremonial enrichment fields in supplements",
                "missing_fields": missing_fields
            }
        
        return {
            "test": "Mudras Ceremonial Enrichment",
            "passed": True,
            "total_items": len(data),
            "found_supplements": found_supplements,
            "all_fields_present": True
        }
        
    except Exception as e:
        return {
            "test": "Mudras Ceremonial Enrichment",
            "passed": False,
            "error": str(e)
        }

def test_sacred_ally_alchemy_regression():
    """Test 3: Validate /api/sacred-ally-alchemy has no regressions after readability/copy harmonization."""
    endpoint = "/sacred-ally-alchemy"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Sacred Ally Alchemy Regression",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        if not data:
            return {
                "test": "Sacred Ally Alchemy Regression",
                "passed": False,
                "error": "Empty response"
            }
        
        # Basic schema validation
        required_fields = ['id', 'name', 'ally_type']
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                if field not in item:
                    return {
                        "test": "Sacred Ally Alchemy Regression",
                        "passed": False,
                        "error": f"Missing required field '{field}' in item {item.get('id', 'unknown')}"
                    }
        
        return {
            "test": "Sacred Ally Alchemy Regression",
            "passed": True,
            "total_items": len(data),
            "sample_ids": [item['id'] for item in data[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Sacred Ally Alchemy Regression",
            "passed": False,
            "error": str(e)
        }

def test_angelic_alchemy_regression():
    """Test 4: Validate /api/angelic-alchemy has no regressions after readability/copy harmonization."""
    endpoint = "/angelic-alchemy"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Angelic Alchemy Regression",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        if not data:
            return {
                "test": "Angelic Alchemy Regression",
                "passed": False,
                "error": "Empty response"
            }
        
        # Basic schema validation
        required_fields = ['id', 'name']
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                if field not in item:
                    return {
                        "test": "Angelic Alchemy Regression",
                        "passed": False,
                        "error": f"Missing required field '{field}' in item {item.get('id', 'unknown')}"
                    }
        
        return {
            "test": "Angelic Alchemy Regression",
            "passed": True,
            "total_items": len(data),
            "sample_ids": [item['id'] for item in data[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Angelic Alchemy Regression",
            "passed": False,
            "error": str(e)
        }

def test_sacred_guardians_regression():
    """Test 5: Validate /api/sacred-guardians has no regressions after readability/copy harmonization."""
    endpoint = "/sacred-guardians"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Sacred Guardians Regression",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        if not data:
            return {
                "test": "Sacred Guardians Regression",
                "passed": False,
                "error": "Empty response"
            }
        
        # Basic schema validation
        required_fields = ['id', 'name']
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                if field not in item:
                    return {
                        "test": "Sacred Guardians Regression",
                        "passed": False,
                        "error": f"Missing required field '{field}' in item {item.get('id', 'unknown')}"
                    }
        
        return {
            "test": "Sacred Guardians Regression",
            "passed": True,
            "total_items": len(data),
            "sample_ids": [item['id'] for item in data[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Sacred Guardians Regression",
            "passed": False,
            "error": str(e)
        }

def test_energy_healing_regression():
    """Test 6: Validate /api/energy-healing has no regressions after readability/copy harmonization."""
    endpoint = "/energy-healing"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Energy Healing Regression",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        if not data:
            return {
                "test": "Energy Healing Regression",
                "passed": False,
                "error": "Empty response"
            }
        
        # Basic schema validation
        required_fields = ['id', 'name']
        for item in data[:3]:  # Check first 3 items
            for field in required_fields:
                if field not in item:
                    return {
                        "test": "Energy Healing Regression",
                        "passed": False,
                        "error": f"Missing required field '{field}' in item {item.get('id', 'unknown')}"
                    }
        
        return {
            "test": "Energy Healing Regression",
            "passed": True,
            "total_items": len(data),
            "sample_ids": [item['id'] for item in data[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Energy Healing Regression",
            "passed": False,
            "error": str(e)
        }

def main():
    """Run all polish pass verification tests."""
    print("=" * 80)
    print("BACKEND VERIFICATION - Polish Pass (Ceremonial Enrichment)")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print()
    
    tests = [
        test_mantras_ceremonial_enrichment,
        test_mudras_ceremonial_enrichment,
        test_sacred_ally_alchemy_regression,
        test_angelic_alchemy_regression,
        test_sacred_guardians_regression,
        test_energy_healing_regression
    ]
    
    results = []
    
    for test_func in tests:
        print(f"Running {test_func.__doc__.split(':')[0].strip()}...", end=" ")
        result = test_func()
        results.append(result)
        
        if result["passed"]:
            print(f"✅ PASS")
            # Print details
            for key, value in result.items():
                if key not in ["test", "passed"]:
                    print(f"   {key}: {value}")
        else:
            print(f"❌ FAIL")
            print(f"   Error: {result['error']}")
            if 'missing_fields' in result:
                print(f"   Missing fields: {result['missing_fields']}")
        print()
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    
    print(f"Passed: {passed_count}/{total_count}")
    print()
    
    if passed_count == total_count:
        print("✅ ALL TESTS PASSED - Polish pass verified successfully")
        print("No regressions or blockers detected.")
        return 0
    else:
        print("❌ SOME TESTS FAILED - Polish pass issues detected")
        print("\nFailed tests:")
        for r in results:
            if not r["passed"]:
                print(f"  - {r['test']}: {r['error']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
