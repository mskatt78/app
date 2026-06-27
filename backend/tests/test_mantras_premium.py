"""
Test suite for Mantras Premium Features - Iteration 222
Tests:
- GET /api/mantras returns 26 items with first 3 free (is_premium=false) and rest premium (is_premium=true)
- New mantra records (ids 13-26) include transliteration, sanskrit, meaning/translation, description, ritual_practice fields
- GET /api/payments/premium-products includes premium_mantras and full_app_unlock products
- GET /api/payments/plans exposes subscription plans (monthly/yearly)
- GET /api/retreats returns empty list (no seeded placeholders)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestMantrasAPI:
    """Test mantras endpoint for premium/free split and content fields."""
    
    def test_mantras_returns_26_items(self):
        """GET /api/mantras should return exactly 26 mantras."""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        mantras = response.json()
        assert isinstance(mantras, list), "Response should be a list"
        assert len(mantras) == 26, f"Expected 26 mantras, got {len(mantras)}"
        print(f"PASS: GET /api/mantras returns {len(mantras)} mantras")
    
    def test_first_3_mantras_are_free(self):
        """First 3 mantras (ids 1, 2, 3) should have is_premium=false."""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        mantras = response.json()
        # Sort by id to ensure order
        mantras_by_id = {str(m.get("id")): m for m in mantras}
        
        free_ids = ["1", "2", "3"]
        for mantra_id in free_ids:
            mantra = mantras_by_id.get(mantra_id)
            assert mantra is not None, f"Mantra with id {mantra_id} not found"
            is_premium = mantra.get("is_premium", True)
            assert is_premium is False, f"Mantra id={mantra_id} ({mantra.get('name')}) should be free (is_premium=false), got {is_premium}"
            print(f"PASS: Mantra id={mantra_id} ({mantra.get('name')}) is free (is_premium=false)")
    
    def test_remaining_mantras_are_premium(self):
        """Mantras with ids 4-26 should have is_premium=true."""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        mantras = response.json()
        mantras_by_id = {str(m.get("id")): m for m in mantras}
        
        premium_ids = [str(i) for i in range(4, 27)]
        premium_count = 0
        for mantra_id in premium_ids:
            mantra = mantras_by_id.get(mantra_id)
            if mantra is None:
                continue  # Some IDs might not exist
            is_premium = mantra.get("is_premium", False)
            assert is_premium is True, f"Mantra id={mantra_id} ({mantra.get('name')}) should be premium (is_premium=true), got {is_premium}"
            premium_count += 1
        
        assert premium_count >= 20, f"Expected at least 20 premium mantras, found {premium_count}"
        print(f"PASS: {premium_count} mantras (ids 4-26) are premium (is_premium=true)")
    
    def test_new_mantras_have_required_fields(self):
        """Mantras with ids 13-26 should include transliteration, sanskrit, meaning/translation, description, ritual_practice."""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        mantras = response.json()
        mantras_by_id = {str(m.get("id")): m for m in mantras}
        
        new_mantra_ids = [str(i) for i in range(13, 27)]
        required_fields = ["transliteration", "sanskrit", "description", "ritual_practice"]
        meaning_fields = ["meaning", "translation"]  # At least one should be present
        
        checked_count = 0
        for mantra_id in new_mantra_ids:
            mantra = mantras_by_id.get(mantra_id)
            if mantra is None:
                continue
            
            # Check required fields
            for field in required_fields:
                value = mantra.get(field)
                assert value is not None and str(value).strip(), \
                    f"Mantra id={mantra_id} ({mantra.get('name')}) missing or empty field: {field}"
            
            # Check meaning/translation (at least one should be present)
            has_meaning = bool(mantra.get("meaning") and str(mantra.get("meaning")).strip())
            has_translation = bool(mantra.get("translation") and str(mantra.get("translation")).strip())
            assert has_meaning or has_translation, \
                f"Mantra id={mantra_id} ({mantra.get('name')}) missing both meaning and translation"
            
            checked_count += 1
            print(f"PASS: Mantra id={mantra_id} ({mantra.get('name')}) has all required fields")
        
        assert checked_count >= 10, f"Expected at least 10 new mantras (ids 13-26), found {checked_count}"
        print(f"PASS: {checked_count} new mantras have all required fields")


class TestPaymentsAPI:
    """Test payments endpoints for premium products and subscription plans."""
    
    def test_premium_products_includes_mantras_and_full_app(self):
        """GET /api/payments/premium-products should include premium_mantras and full_app_unlock."""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        products = data.get("products", [])
        assert isinstance(products, list), "Products should be a list"
        
        product_ids = [p.get("id") for p in products]
        
        # Check premium_mantras exists
        assert "premium_mantras" in product_ids, f"premium_mantras not found in products: {product_ids}"
        mantras_product = next((p for p in products if p.get("id") == "premium_mantras"), None)
        assert mantras_product is not None
        assert mantras_product.get("price") is not None, "premium_mantras should have a price"
        assert mantras_product.get("name"), "premium_mantras should have a name"
        print(f"PASS: premium_mantras product found with price ${mantras_product.get('price')}")
        
        # Check full_app_unlock exists
        assert "full_app_unlock" in product_ids, f"full_app_unlock not found in products: {product_ids}"
        full_app_product = next((p for p in products if p.get("id") == "full_app_unlock"), None)
        assert full_app_product is not None
        assert full_app_product.get("price") is not None, "full_app_unlock should have a price"
        assert full_app_product.get("name"), "full_app_unlock should have a name"
        print(f"PASS: full_app_unlock product found with price ${full_app_product.get('price')}")
    
    def test_subscription_plans_exposed(self):
        """GET /api/payments/plans should expose monthly and yearly subscription plans."""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        plans = data.get("plans", [])
        assert isinstance(plans, list), "Plans should be a list"
        assert len(plans) >= 2, f"Expected at least 2 plans, got {len(plans)}"
        
        plan_ids = [p.get("id") for p in plans]
        
        # Check monthly plan
        assert "monthly" in plan_ids, f"monthly plan not found: {plan_ids}"
        monthly = next((p for p in plans if p.get("id") == "monthly"), None)
        assert monthly.get("price") is not None, "monthly plan should have a price"
        assert monthly.get("interval") == "month", "monthly plan should have interval=month"
        print(f"PASS: monthly plan found with price ${monthly.get('price')}")
        
        # Check yearly plan
        assert "yearly" in plan_ids, f"yearly plan not found: {plan_ids}"
        yearly = next((p for p in plans if p.get("id") == "yearly"), None)
        assert yearly.get("price") is not None, "yearly plan should have a price"
        assert yearly.get("interval") == "year", "yearly plan should have interval=year"
        print(f"PASS: yearly plan found with price ${yearly.get('price')}")


class TestRetreatsAPI:
    """Test retreats endpoint returns empty list (no seeded placeholders)."""
    
    def test_retreats_returns_empty_list(self):
        """GET /api/retreats should return an empty list."""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        retreats = response.json()
        assert isinstance(retreats, list), "Response should be a list"
        assert len(retreats) == 0, f"Expected empty list, got {len(retreats)} retreats"
        print("PASS: GET /api/retreats returns empty list (no seeded placeholders)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
