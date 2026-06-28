"""
Test Energy Healing section deepening and free/premium tiering for iteration 233.
Tests:
1. GET /api/energy-healing returns expanded dataset with deep fields
2. First 5 practices are free, remainder are premium
3. Deep fields (alchemy, ritual, ceremony, guided_practice) are present
4. Premium products endpoint includes energy_healing product
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestEnergyHealingAPI:
    """Energy Healing API endpoint tests"""

    def test_energy_healing_endpoint_returns_data(self):
        """Test GET /api/energy-healing returns a list of practices"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should return at least one practice"
        print(f"✓ Energy healing endpoint returned {len(data)} practices")

    def test_energy_healing_has_deep_fields(self):
        """Test that practices have deep fields: alchemy, ritual, ceremony, guided_practice"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Should have practices to test"
        
        # Check first practice for deep fields
        practice = data[0]
        deep_fields = ["alchemy", "ritual", "ceremony", "guided_practice"]
        
        for field in deep_fields:
            assert field in practice, f"Practice should have '{field}' field"
            field_value = practice[field]
            assert field_value is not None, f"'{field}' should not be None"
            # Should be a list with content
            if isinstance(field_value, list):
                assert len(field_value) > 0, f"'{field}' list should not be empty"
            print(f"✓ Deep field '{field}' present with content")
        
        print(f"✓ Practice '{practice.get('name', 'Unknown')}' has all deep fields")

    def test_energy_healing_free_premium_tiering(self):
        """Test that first 5 practices are free, remainder are premium"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 5, f"Should have at least 5 practices, got {len(data)}"
        
        # Count free and premium
        free_count = sum(1 for p in data if not p.get("is_premium", False))
        premium_count = sum(1 for p in data if p.get("is_premium", False))
        
        print(f"Total practices: {len(data)}")
        print(f"Free practices: {free_count}")
        print(f"Premium practices: {premium_count}")
        
        # Per SECTION_FREE_COUNT_OVERRIDES, energy_healing should have 5 free
        assert free_count == 5, f"Expected exactly 5 free practices, got {free_count}"
        
        # If there are more than 5 practices, the rest should be premium
        if len(data) > 5:
            assert premium_count == len(data) - 5, f"Expected {len(data) - 5} premium practices, got {premium_count}"
        
        print(f"✓ Free/premium tiering correct: 5 free, {premium_count} premium")

    def test_energy_healing_premium_fields(self):
        """Test that premium practices have correct premium metadata"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        premium_practices = [p for p in data if p.get("is_premium", False)]
        
        if len(premium_practices) > 0:
            practice = premium_practices[0]
            assert practice.get("premium_unlock_id") == "energy_healing", \
                f"Premium unlock ID should be 'energy_healing', got {practice.get('premium_unlock_id')}"
            assert practice.get("premium_label") == "Energy Healing Premium", \
                f"Premium label should be 'Energy Healing Premium', got {practice.get('premium_label')}"
            print(f"✓ Premium practice has correct metadata: unlock_id=energy_healing, label=Energy Healing Premium")
        else:
            print("⚠ No premium practices to test (all practices are free)")

    def test_energy_healing_supplements_included(self):
        """Test that ENERGY_HEALING_SUPPLEMENTS are included in response"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        practice_ids = [p.get("id") for p in data]
        
        # Check for supplement IDs
        supplement_ids = [
            "energy-healing-supp-101",
            "energy-healing-supp-102",
            "energy-healing-supp-103",
            "energy-healing-supp-104",
            "energy-healing-supp-105",
            "energy-healing-supp-106",
            "energy-healing-supp-107",
            "energy-healing-supp-108",
            "energy-healing-supp-109",
        ]
        
        found_supplements = [sid for sid in supplement_ids if sid in practice_ids]
        print(f"Found {len(found_supplements)} of {len(supplement_ids)} supplements")
        
        # At least some supplements should be present
        assert len(found_supplements) > 0, "Should have at least some supplement practices"
        print(f"✓ Supplements included: {found_supplements}")

    def test_energy_healing_practice_structure(self):
        """Test that each practice has required fields"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "description", "modality"]
        
        for practice in data[:5]:  # Check first 5
            for field in required_fields:
                assert field in practice, f"Practice missing required field '{field}'"
            print(f"✓ Practice '{practice.get('name')}' has all required fields")


class TestPremiumProductsAPI:
    """Premium products endpoint tests"""

    def test_premium_products_includes_energy_healing(self):
        """Test that /api/payments/premium-products includes energy_healing product"""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "products" in data, "Response should have 'products' key"
        
        products = data["products"]
        product_ids = [p.get("id") for p in products]
        
        assert "energy_healing" in product_ids, \
            f"energy_healing should be in premium products, got: {product_ids}"
        
        # Find the energy_healing product and verify its structure
        energy_product = next((p for p in products if p.get("id") == "energy_healing"), None)
        assert energy_product is not None, "energy_healing product not found"
        
        assert energy_product.get("name") == "Energy Healing Unlock", \
            f"Expected name 'Energy Healing Unlock', got {energy_product.get('name')}"
        assert energy_product.get("price") == 59.00, \
            f"Expected price 59.00, got {energy_product.get('price')}"
        assert energy_product.get("unlock_scope") == "section", \
            f"Expected unlock_scope 'section', got {energy_product.get('unlock_scope')}"
        
        print(f"✓ energy_healing product found with correct structure: {energy_product}")


class TestEnergyHealingFiltering:
    """Test modality filtering for energy healing"""

    def test_filter_by_modality(self):
        """Test filtering by modality parameter"""
        # First get all practices to find available modalities
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        data = response.json()
        modalities = set(p.get("modality") for p in data if p.get("modality"))
        
        if modalities:
            test_modality = list(modalities)[0]
            filtered_response = requests.get(f"{BASE_URL}/api/energy-healing?modality={test_modality}")
            assert filtered_response.status_code == 200
            
            filtered_data = filtered_response.json()
            for practice in filtered_data:
                assert practice.get("modality", "").lower() == test_modality.lower(), \
                    f"Filtered practice should have modality '{test_modality}'"
            
            print(f"✓ Modality filter works: {len(filtered_data)} practices for '{test_modality}'")
        else:
            print("⚠ No modalities found to test filtering")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
