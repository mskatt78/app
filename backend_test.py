#!/usr/bin/env python3
"""
Backend verification for content expansion release.
Validates 6 endpoints for tiered content, expanded IDs, and enriched fields.
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_water_practices():
    """Test 1: Validate /api/water-practices returns 14 tiered items with expanded IDs (water-practice-101+)."""
    endpoint = "/water-practices"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Water Practices",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if we have at least 14 items
        if len(data) < 14:
            return {
                "test": "Water Practices",
                "passed": False,
                "error": f"Expected at least 14 items, got {len(data)}"
            }
        
        # Check for expanded IDs (water-practice-101+)
        expanded_ids = [item for item in data if item.get('id', '').startswith('water-practice-1')]
        
        if not expanded_ids:
            return {
                "test": "Water Practices",
                "passed": False,
                "error": "No expanded IDs found (water-practice-101+)"
            }
        
        return {
            "test": "Water Practices",
            "passed": True,
            "total_items": len(data),
            "expanded_ids_count": len(expanded_ids),
            "sample_expanded_ids": [item['id'] for item in expanded_ids[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Water Practices",
            "passed": False,
            "error": str(e)
        }

def test_energy_healing():
    """Test 2: Validate /api/energy-healing returns 14 tiered items with expanded IDs (energy-healing-supp-110+)."""
    endpoint = "/energy-healing"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Energy Healing",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if we have at least 14 items
        if len(data) < 14:
            return {
                "test": "Energy Healing",
                "passed": False,
                "error": f"Expected at least 14 items, got {len(data)}"
            }
        
        # Check for expanded IDs (energy-healing-supp-110+)
        expanded_ids = [item for item in data if 'energy-healing-supp-1' in item.get('id', '')]
        
        if not expanded_ids:
            return {
                "test": "Energy Healing",
                "passed": False,
                "error": "No expanded IDs found (energy-healing-supp-110+)"
            }
        
        return {
            "test": "Energy Healing",
            "passed": True,
            "total_items": len(data),
            "expanded_ids_count": len(expanded_ids),
            "sample_expanded_ids": [item['id'] for item in expanded_ids[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Energy Healing",
            "passed": False,
            "error": str(e)
        }

def test_ancient_wisdom():
    """Test 3: Validate /api/ancient-wisdom returns 14 tiered items with expanded IDs (ancient-wisdom-supp-101+)."""
    endpoint = "/ancient-wisdom"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Ancient Wisdom",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if we have at least 14 items
        if len(data) < 14:
            return {
                "test": "Ancient Wisdom",
                "passed": False,
                "error": f"Expected at least 14 items, got {len(data)}"
            }
        
        # Check for expanded IDs (ancient-wisdom-supp-101+)
        expanded_ids = [item for item in data if 'ancient-wisdom-supp-1' in item.get('id', '')]
        
        if not expanded_ids:
            return {
                "test": "Ancient Wisdom",
                "passed": False,
                "error": "No expanded IDs found (ancient-wisdom-supp-101+)"
            }
        
        return {
            "test": "Ancient Wisdom",
            "passed": True,
            "total_items": len(data),
            "expanded_ids_count": len(expanded_ids),
            "sample_expanded_ids": [item['id'] for item in expanded_ids[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Ancient Wisdom",
            "passed": False,
            "error": str(e)
        }

def test_sacred_guardians():
    """Test 4: Validate /api/sacred-guardians returns 14 tiered items with expanded IDs (sacred-guardian-supp-101+)."""
    endpoint = "/sacred-guardians"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Sacred Guardians",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if we have at least 14 items
        if len(data) < 14:
            return {
                "test": "Sacred Guardians",
                "passed": False,
                "error": f"Expected at least 14 items, got {len(data)}"
            }
        
        # Check for expanded IDs (sacred-guardian-supp-101+)
        expanded_ids = [item for item in data if 'sacred-guardian-supp-1' in item.get('id', '')]
        
        if not expanded_ids:
            return {
                "test": "Sacred Guardians",
                "passed": False,
                "error": "No expanded IDs found (sacred-guardian-supp-101+)"
            }
        
        return {
            "test": "Sacred Guardians",
            "passed": True,
            "total_items": len(data),
            "expanded_ids_count": len(expanded_ids),
            "sample_expanded_ids": [item['id'] for item in expanded_ids[:3]]
        }
        
    except Exception as e:
        return {
            "test": "Sacred Guardians",
            "passed": False,
            "error": str(e)
        }

def test_sacred_ally_alchemy():
    """Test 5: Validate /api/sacred-ally-alchemy returns 14 tiered items with expanded IDs and star lineages."""
    endpoint = "/sacred-ally-alchemy"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Sacred Ally Alchemy",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if we have at least 14 items
        if len(data) < 14:
            return {
                "test": "Sacred Ally Alchemy",
                "passed": False,
                "error": f"Expected at least 14 items, got {len(data)}"
            }
        
        # Check for expanded IDs (sacred-ally-supp-101+)
        expanded_ids = [item for item in data if 'sacred-ally-supp-1' in item.get('id', '')]
        
        if not expanded_ids:
            return {
                "test": "Sacred Ally Alchemy",
                "passed": False,
                "error": "No expanded IDs found (sacred-ally-supp-101+)"
            }
        
        # Check for star lineages (Pleiadian/Andromedan/Sirian)
        # Star lineages are in the ally_type field
        star_lineages = []
        for item in data:
            ally_type = item.get('ally_type', '')
            if any(star in str(ally_type).lower() for star in ['pleiadian', 'andromedan', 'sirian']):
                star_lineages.append(item['id'])
        
        if not star_lineages:
            return {
                "test": "Sacred Ally Alchemy",
                "passed": False,
                "error": "No star lineages found (Pleiadian/Andromedan/Sirian)"
            }
        
        return {
            "test": "Sacred Ally Alchemy",
            "passed": True,
            "total_items": len(data),
            "expanded_ids_count": len(expanded_ids),
            "star_lineages_count": len(star_lineages),
            "sample_expanded_ids": [item['id'] for item in expanded_ids[:3]],
            "sample_star_lineages": star_lineages[:3]
        }
        
    except Exception as e:
        return {
            "test": "Sacred Ally Alchemy",
            "passed": False,
            "error": str(e)
        }

def test_creative_processes():
    """Test 6: Validate /api/creative-processes?category=sacred-tool-birthing returns enriched multi-day fields."""
    endpoint = "/creative-processes?category=sacred-tool-birthing"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {
                "test": "Creative Processes (sacred-tool-birthing)",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        if not data:
            return {
                "test": "Creative Processes (sacred-tool-birthing)",
                "passed": False,
                "error": "Empty response"
            }
        
        # Check for enriched multi-day fields (process_steps and multi_day_pathway)
        multi_day_fields = ['process_steps', 'multi_day_pathway']
        items_with_multi_day = []
        
        for item in data:
            has_multi_day = any(field in item and item[field] for field in multi_day_fields)
            if has_multi_day:
                items_with_multi_day.append(item['id'])
        
        if not items_with_multi_day:
            return {
                "test": "Creative Processes (sacred-tool-birthing)",
                "passed": False,
                "error": "No enriched multi-day fields found (process_steps or multi_day_pathway)"
            }
        
        return {
            "test": "Creative Processes (sacred-tool-birthing)",
            "passed": True,
            "total_items": len(data),
            "items_with_multi_day": len(items_with_multi_day),
            "sample_ids": items_with_multi_day[:3]
        }
        
    except Exception as e:
        return {
            "test": "Creative Processes (sacred-tool-birthing)",
            "passed": False,
            "error": str(e)
        }

def main():
    """Run all content expansion tests."""
    print("=" * 80)
    print("BACKEND VERIFICATION - Content Expansion Release")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print()
    
    tests = [
        test_water_practices,
        test_energy_healing,
        test_ancient_wisdom,
        test_sacred_guardians,
        test_sacred_ally_alchemy,
        test_creative_processes
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
        print()
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    
    print(f"Passed: {passed_count}/{total_count}")
    print()
    
    if passed_count == total_count:
        print("✅ ALL TESTS PASSED - Content expansion verified successfully")
        print("No regressions detected.")
        return 0
    else:
        print("❌ SOME TESTS FAILED - Content expansion issues detected")
        print("\nFailed tests:")
        for r in results:
            if not r["passed"]:
                print(f"  - {r['test']}: {r['error']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
