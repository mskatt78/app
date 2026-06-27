#!/usr/bin/env python3
"""
Backend verification test for preview URL
Tests specific endpoints as per review request:
1. GET /api/mantras - 26 items, IDs 1-3 free, 4+ premium, 13-26 with extended fields
2. GET /api/payments/premium-products - contains premium_mantras and full_app_unlock
3. GET /api/payments/plans - returns monthly and yearly plans
4. GET /api/retreats - returns empty list
"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_mantras_endpoint():
    """Test 1: GET /api/mantras validation"""
    print("\n" + "=" * 80)
    print("TEST 1: GET /api/mantras")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        mantras = response.json()
        print(f"Total mantras returned: {len(mantras)}")
        
        # Check 1: Should return 26 items
        if len(mantras) != 26:
            print(f"❌ FAIL: Expected 26 mantras, got {len(mantras)}")
            return False
        print(f"✅ PASS: Returns 26 mantras")
        
        # Check 2: IDs 1, 2, 3 should be is_premium=false
        free_ids = [1, 2, 3, "1", "2", "3"]  # Support both int and string IDs
        for mantra in mantras:
            mantra_id = mantra.get("id")
            # Convert to int for comparison if it's a string
            try:
                mantra_id_int = int(mantra_id) if isinstance(mantra_id, str) else mantra_id
            except (ValueError, TypeError):
                mantra_id_int = mantra_id
            
            is_premium = mantra.get("is_premium")
            
            if mantra_id_int in [1, 2, 3]:
                if is_premium != False:
                    print(f"❌ FAIL: Mantra ID {mantra_id} should be is_premium=false, got {is_premium}")
                    return False
        print(f"✅ PASS: IDs 1, 2, 3 are is_premium=false")
        
        # Check 3: IDs 4+ should be is_premium=true
        premium_count = 0
        for mantra in mantras:
            mantra_id = mantra.get("id")
            # Convert to int for comparison if it's a string
            try:
                mantra_id_int = int(mantra_id) if isinstance(mantra_id, str) else mantra_id
            except (ValueError, TypeError):
                mantra_id_int = mantra_id
            
            is_premium = mantra.get("is_premium")
            
            if isinstance(mantra_id_int, int) and mantra_id_int >= 4:
                if is_premium != True:
                    print(f"❌ FAIL: Mantra ID {mantra_id} should be is_premium=true, got {is_premium}")
                    return False
                premium_count += 1
        print(f"✅ PASS: IDs 4+ are is_premium=true ({premium_count} premium mantras)")
        
        # Check 4: IDs 13-26 should include transliteration, sanskrit, meaning/translation, description, ritual_practice
        extended_fields = ["transliteration", "sanskrit", "description", "ritual_practice"]
        meaning_fields = ["meaning", "translation"]  # Either meaning or translation
        
        # Filter mantras with IDs 13-26
        ids_13_to_26 = []
        for m in mantras:
            m_id = m.get("id")
            try:
                m_id_int = int(m_id) if isinstance(m_id, str) else m_id
                if isinstance(m_id_int, int) and 13 <= m_id_int <= 26:
                    ids_13_to_26.append(m)
            except (ValueError, TypeError):
                pass
        print(f"\nChecking extended fields for IDs 13-26 ({len(ids_13_to_26)} mantras)...")
        
        print(f"\nChecking extended fields for IDs 13-26 ({len(ids_13_to_26)} mantras)...")
        
        if len(ids_13_to_26) == 0:
            print(f"⚠️ WARNING: No mantras found with IDs 13-26")
        
        for mantra in ids_13_to_26:
            mantra_id = mantra.get("id")
            mantra_name = mantra.get("name", "Unknown")
            
            # Check required fields
            for field in extended_fields:
                if field not in mantra or not mantra.get(field):
                    print(f"❌ FAIL: Mantra ID {mantra_id} ({mantra_name}) missing or empty field: {field}")
                    return False
            
            # Check meaning or translation (at least one should exist)
            has_meaning = "meaning" in mantra and mantra.get("meaning")
            has_translation = "translation" in mantra and mantra.get("translation")
            
            if not (has_meaning or has_translation):
                print(f"❌ FAIL: Mantra ID {mantra_id} ({mantra_name}) missing both 'meaning' and 'translation'")
                return False
        
        print(f"✅ PASS: IDs 13-26 include all required extended fields")
        
        # Print sample data for verification
        print("\n--- Sample Mantra Data ---")
        sample_free = None
        sample_premium = None
        sample_extended = None
        
        for m in mantras:
            m_id = m.get("id")
            try:
                m_id_int = int(m_id) if isinstance(m_id, str) else m_id
                if m_id_int == 1:
                    sample_free = m
                elif m_id_int == 4:
                    sample_premium = m
                elif m_id_int == 13:
                    sample_extended = m
            except (ValueError, TypeError):
                pass
        
        if sample_free:
            print(f"\nFree Mantra (ID 1):")
            print(f"  Name: {sample_free.get('name')}")
            print(f"  is_premium: {sample_free.get('is_premium')}")
        
        if sample_premium:
            print(f"\nPremium Mantra (ID 4):")
            print(f"  Name: {sample_premium.get('name')}")
            print(f"  is_premium: {sample_premium.get('is_premium')}")
        
        if sample_extended:
            print(f"\nExtended Mantra (ID 13):")
            print(f"  Name: {sample_extended.get('name')}")
            print(f"  is_premium: {sample_extended.get('is_premium')}")
            print(f"  Has transliteration: {bool(sample_extended.get('transliteration'))}")
            print(f"  Has sanskrit: {bool(sample_extended.get('sanskrit'))}")
            print(f"  Has meaning: {bool(sample_extended.get('meaning'))}")
            print(f"  Has translation: {bool(sample_extended.get('translation'))}")
            print(f"  Has description: {bool(sample_extended.get('description'))}")
            print(f"  Has ritual_practice: {bool(sample_extended.get('ritual_practice'))}")
        
        print("\n✅ TEST 1 PASSED: /api/mantras endpoint meets all requirements")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_premium_products_endpoint():
    """Test 2: GET /api/payments/premium-products validation"""
    print("\n" + "=" * 80)
    print("TEST 2: GET /api/payments/premium-products")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/payments/premium-products", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response structure: {json.dumps(data, indent=2)}")
        
        # Check if response contains products
        products = data.get("products", []) if isinstance(data, dict) else data
        
        if not products:
            print(f"❌ FAIL: No products found in response")
            return False
        
        # Check 1: Should contain premium_mantras product
        premium_mantras = None
        full_app_unlock = None
        
        for product in products:
            product_id = product.get("id") or product.get("product_id")
            if product_id == "premium_mantras":
                premium_mantras = product
            elif product_id == "full_app_unlock":
                full_app_unlock = product
        
        if not premium_mantras:
            print(f"❌ FAIL: premium_mantras product not found")
            print(f"Available product IDs: {[p.get('id') or p.get('product_id') for p in products]}")
            return False
        print(f"✅ PASS: premium_mantras product found")
        
        # Check 2: Should contain full_app_unlock product
        if not full_app_unlock:
            print(f"❌ FAIL: full_app_unlock product not found")
            print(f"Available product IDs: {[p.get('id') or p.get('product_id') for p in products]}")
            return False
        print(f"✅ PASS: full_app_unlock product found")
        
        # Check 3: premium_mantras should have a price value
        price = premium_mantras.get("price")
        if price is None:
            print(f"❌ FAIL: premium_mantras has no price value")
            return False
        print(f"✅ PASS: premium_mantras has price: {price}")
        
        # Print product details
        print("\n--- Premium Products Details ---")
        print(f"\npremium_mantras:")
        print(f"  ID: {premium_mantras.get('id') or premium_mantras.get('product_id')}")
        print(f"  Name: {premium_mantras.get('name')}")
        print(f"  Price: {premium_mantras.get('price')}")
        print(f"  Description: {premium_mantras.get('description', 'N/A')[:100]}...")
        
        print(f"\nfull_app_unlock:")
        print(f"  ID: {full_app_unlock.get('id') or full_app_unlock.get('product_id')}")
        print(f"  Name: {full_app_unlock.get('name')}")
        print(f"  Price: {full_app_unlock.get('price')}")
        print(f"  Description: {full_app_unlock.get('description', 'N/A')[:100]}...")
        
        print("\n✅ TEST 2 PASSED: /api/payments/premium-products endpoint meets all requirements")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_plans_endpoint():
    """Test 3: GET /api/payments/plans validation"""
    print("\n" + "=" * 80)
    print("TEST 3: GET /api/payments/plans")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/payments/plans", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Check if response contains plans
        plans = data.get("plans", []) if isinstance(data, dict) else data
        
        if not plans:
            print(f"❌ FAIL: No plans found in response")
            return False
        
        print(f"Total plans returned: {len(plans)}")
        
        # Check 1: Should contain monthly plan
        monthly_plan = None
        yearly_plan = None
        
        for plan in plans:
            plan_id = plan.get("id") or plan.get("plan_id")
            interval = plan.get("interval") or plan.get("billing_interval")
            
            if "month" in str(plan_id).lower() or "month" in str(interval).lower():
                monthly_plan = plan
            elif "year" in str(plan_id).lower() or "year" in str(interval).lower():
                yearly_plan = plan
        
        if not monthly_plan:
            print(f"❌ FAIL: Monthly plan not found")
            print(f"Available plans: {json.dumps(plans, indent=2)}")
            return False
        print(f"✅ PASS: Monthly plan found")
        
        # Check 2: Should contain yearly plan
        if not yearly_plan:
            print(f"❌ FAIL: Yearly plan not found")
            print(f"Available plans: {json.dumps(plans, indent=2)}")
            return False
        print(f"✅ PASS: Yearly plan found")
        
        # Print plan details
        print("\n--- Subscription Plans Details ---")
        print(f"\nMonthly Plan:")
        print(f"  ID: {monthly_plan.get('id') or monthly_plan.get('plan_id')}")
        print(f"  Name: {monthly_plan.get('name')}")
        print(f"  Price: {monthly_plan.get('price')}")
        print(f"  Interval: {monthly_plan.get('interval') or monthly_plan.get('billing_interval')}")
        
        print(f"\nYearly Plan:")
        print(f"  ID: {yearly_plan.get('id') or yearly_plan.get('plan_id')}")
        print(f"  Name: {yearly_plan.get('name')}")
        print(f"  Price: {yearly_plan.get('price')}")
        print(f"  Interval: {yearly_plan.get('interval') or yearly_plan.get('billing_interval')}")
        
        print("\n✅ TEST 3 PASSED: /api/payments/plans endpoint meets all requirements")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_retreats_endpoint():
    """Test 4: GET /api/retreats validation"""
    print("\n" + "=" * 80)
    print("TEST 4: GET /api/retreats")
    print("=" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/retreats", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        retreats = response.json()
        print(f"Response: {json.dumps(retreats, indent=2)}")
        
        # Check: Should return empty list
        if not isinstance(retreats, list):
            print(f"❌ FAIL: Expected list, got {type(retreats)}")
            return False
        
        if len(retreats) != 0:
            print(f"❌ FAIL: Expected empty list, got {len(retreats)} items")
            return False
        
        print(f"✅ PASS: Returns empty list []")
        
        print("\n✅ TEST 4 PASSED: /api/retreats endpoint meets all requirements")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 80)
    print("BACKEND VERIFICATION TEST - PREVIEW URL")
    print("=" * 80)
    print(f"Testing: {BASE_URL}")
    
    # Run all tests
    results = {
        "GET /api/mantras": test_mantras_endpoint(),
        "GET /api/payments/premium-products": test_premium_products_endpoint(),
        "GET /api/payments/plans": test_plans_endpoint(),
        "GET /api/retreats": test_retreats_endpoint(),
    }
    
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL BACKEND VERIFICATION TESTS PASSED")
    else:
        print("❌ SOME BACKEND VERIFICATION TESTS FAILED")
    print("=" * 80)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
