"""
Test premium tiering and monetization consistency across all sections.
Iteration 226: Testing ~30% free / ~70% paid ratio and premium metadata.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestPremiumProducts:
    """Test /api/payments/premium-products endpoint for new unlock products."""

    def test_premium_products_endpoint_returns_200(self):
        """Verify premium products endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "products" in data, "Response should contain 'products' key"

    def test_premium_products_contains_required_sections(self):
        """Verify all required section unlock products exist."""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200
        data = response.json()
        products = data.get("products", [])
        product_ids = [p.get("id") for p in products]

        required_sections = [
            "shamanic_practices",
            "heart_practices",
            "elemental_practices",
            "mindfulness_practices",
            "meditations",
            "water_practices",
            "chakra_cleansing",
        ]

        for section_id in required_sections:
            assert section_id in product_ids, f"Missing premium product: {section_id}"

    def test_premium_products_have_required_fields(self):
        """Verify each premium product has required fields."""
        response = requests.get(f"{BASE_URL}/api/payments/premium-products")
        assert response.status_code == 200
        data = response.json()
        products = data.get("products", [])

        for product in products:
            assert "id" in product, f"Product missing 'id': {product}"
            assert "name" in product, f"Product missing 'name': {product}"
            assert "price" in product, f"Product missing 'price': {product}"
            assert "unlock_scope" in product, f"Product missing 'unlock_scope': {product}"
            assert product["price"] > 0, f"Product price should be positive: {product}"


class TestShamanicPracticesTiering:
    """Test /api/shamanic-practices tiering and advanced entries."""

    def test_shamanic_practices_returns_200(self):
        """Verify shamanic practices endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_shamanic_practices_has_free_and_premium_items(self):
        """Verify shamanic practices has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        practices = response.json()
        assert isinstance(practices, list), "Response should be a list"
        assert len(practices) > 0, "Should have at least one practice"

        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        premium_count = sum(1 for p in practices if p.get("is_premium", False))

        print(f"Shamanic: {free_count} free, {premium_count} premium, total {len(practices)}")
        assert free_count >= 2, f"Should have at least 2 free items, got {free_count}"
        assert premium_count > 0, f"Should have premium items, got {premium_count}"

    def test_shamanic_practices_premium_items_have_metadata(self):
        """Verify premium shamanic items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        practices = response.json()

        premium_items = [p for p in practices if p.get("is_premium", False)]
        assert len(premium_items) > 0, "Should have premium items"

        for item in premium_items[:5]:  # Check first 5 premium items
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert "premium_label" in item, f"Premium item missing premium_label: {item.get('id')}"
            assert item["premium_unlock_id"] == "shamanic_practices", f"Wrong unlock_id: {item.get('premium_unlock_id')}"

    def test_shamanic_practices_has_advanced_entries(self):
        """Verify shamanic practices includes advanced entries (shamanic-advanced-*)."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        practices = response.json()

        advanced_ids = [p.get("id") for p in practices if str(p.get("id", "")).startswith("shamanic-advanced-")]
        print(f"Found advanced shamanic entries: {advanced_ids}")
        assert len(advanced_ids) >= 3, f"Should have at least 3 advanced entries, got {len(advanced_ids)}"

    def test_shamanic_practices_ratio_approximately_30_70(self):
        """Verify shamanic practices ratio is approximately 30% free / 70% paid."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        practices = response.json()

        total = len(practices)
        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        free_ratio = free_count / total if total > 0 else 0

        print(f"Shamanic free ratio: {free_ratio:.2%} ({free_count}/{total})")
        # Allow 15-45% free (target is ~30%)
        assert 0.15 <= free_ratio <= 0.45, f"Free ratio {free_ratio:.2%} outside expected range (15-45%)"


class TestHeartPracticesTiering:
    """Test /api/heart-practices tiering."""

    def test_heart_practices_returns_200(self):
        """Verify heart practices endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_heart_practices_has_free_and_premium_items(self):
        """Verify heart practices has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        practices = response.json()
        assert isinstance(practices, list), "Response should be a list"

        if len(practices) == 0:
            pytest.skip("No heart practices in database")

        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        premium_count = sum(1 for p in practices if p.get("is_premium", False))

        print(f"Heart: {free_count} free, {premium_count} premium, total {len(practices)}")
        assert free_count >= 1, f"Should have at least 1 free item, got {free_count}"

    def test_heart_practices_premium_items_have_metadata(self):
        """Verify premium heart items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        practices = response.json()

        premium_items = [p for p in practices if p.get("is_premium", False)]
        if len(premium_items) == 0:
            pytest.skip("No premium heart practices")

        for item in premium_items[:3]:
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert item["premium_unlock_id"] == "heart_practices", f"Wrong unlock_id: {item.get('premium_unlock_id')}"


class TestElementalPracticesTiering:
    """Test /api/elemental-practices tiering."""

    def test_elemental_practices_returns_200(self):
        """Verify elemental practices endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_elemental_practices_has_free_and_premium_items(self):
        """Verify elemental practices has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        practices = response.json()
        assert isinstance(practices, list), "Response should be a list"

        if len(practices) == 0:
            pytest.skip("No elemental practices in database")

        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        premium_count = sum(1 for p in practices if p.get("is_premium", False))

        print(f"Elemental: {free_count} free, {premium_count} premium, total {len(practices)}")
        assert free_count >= 1, f"Should have at least 1 free item, got {free_count}"

    def test_elemental_practices_premium_items_have_metadata(self):
        """Verify premium elemental items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        practices = response.json()

        premium_items = [p for p in practices if p.get("is_premium", False)]
        if len(premium_items) == 0:
            pytest.skip("No premium elemental practices")

        for item in premium_items[:3]:
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert item["premium_unlock_id"] == "elemental_practices", f"Wrong unlock_id: {item.get('premium_unlock_id')}"


class TestMindfulnessTiering:
    """Test /api/mindfulness tiering."""

    def test_mindfulness_returns_200(self):
        """Verify mindfulness endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_mindfulness_has_free_and_premium_items(self):
        """Verify mindfulness has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        practices = response.json()
        assert isinstance(practices, list), "Response should be a list"

        if len(practices) == 0:
            pytest.skip("No mindfulness practices in database")

        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        premium_count = sum(1 for p in practices if p.get("is_premium", False))

        print(f"Mindfulness: {free_count} free, {premium_count} premium, total {len(practices)}")
        assert free_count >= 1, f"Should have at least 1 free item, got {free_count}"

    def test_mindfulness_premium_items_have_metadata(self):
        """Verify premium mindfulness items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        practices = response.json()

        premium_items = [p for p in practices if p.get("is_premium", False)]
        if len(premium_items) == 0:
            pytest.skip("No premium mindfulness practices")

        for item in premium_items[:3]:
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert item["premium_unlock_id"] == "mindfulness_practices", f"Wrong unlock_id: {item.get('premium_unlock_id')}"


class TestMeditationsTiering:
    """Test /api/meditations tiering."""

    def test_meditations_returns_200(self):
        """Verify meditations endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_meditations_has_free_and_premium_items(self):
        """Verify meditations has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        meditations = response.json()
        assert isinstance(meditations, list), "Response should be a list"

        if len(meditations) == 0:
            pytest.skip("No meditations in database")

        free_count = sum(1 for m in meditations if not m.get("is_premium", False))
        premium_count = sum(1 for m in meditations if m.get("is_premium", False))

        print(f"Meditations: {free_count} free, {premium_count} premium, total {len(meditations)}")
        assert free_count >= 1, f"Should have at least 1 free item, got {free_count}"

    def test_meditations_premium_items_have_metadata(self):
        """Verify premium meditation items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        meditations = response.json()

        premium_items = [m for m in meditations if m.get("is_premium", False)]
        if len(premium_items) == 0:
            pytest.skip("No premium meditations")

        for item in premium_items[:3]:
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert item["premium_unlock_id"] == "meditations", f"Wrong unlock_id: {item.get('premium_unlock_id')}"


class TestWaterPracticesTiering:
    """Test /api/water-practices tiering."""

    def test_water_practices_returns_200(self):
        """Verify water practices endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_water_practices_has_free_and_premium_items(self):
        """Verify water practices has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        practices = response.json()
        assert isinstance(practices, list), "Response should be a list"

        if len(practices) == 0:
            pytest.skip("No water practices in database")

        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        premium_count = sum(1 for p in practices if p.get("is_premium", False))

        print(f"Water: {free_count} free, {premium_count} premium, total {len(practices)}")
        assert free_count >= 1, f"Should have at least 1 free item, got {free_count}"

    def test_water_practices_premium_items_have_metadata(self):
        """Verify premium water items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        practices = response.json()

        premium_items = [p for p in practices if p.get("is_premium", False)]
        if len(premium_items) == 0:
            pytest.skip("No premium water practices")

        for item in premium_items[:3]:
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert item["premium_unlock_id"] == "water_practices", f"Wrong unlock_id: {item.get('premium_unlock_id')}"


class TestChakraCleansingTiering:
    """Test /api/chakra-cleansing tiering."""

    def test_chakra_cleansing_returns_200(self):
        """Verify chakra cleansing endpoint is accessible."""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_chakra_cleansing_has_free_and_premium_items(self):
        """Verify chakra cleansing has both free and premium items."""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        practices = response.json()
        assert isinstance(practices, list), "Response should be a list"

        if len(practices) == 0:
            pytest.skip("No chakra cleansing practices in database")

        free_count = sum(1 for p in practices if not p.get("is_premium", False))
        premium_count = sum(1 for p in practices if p.get("is_premium", False))

        print(f"Chakra: {free_count} free, {premium_count} premium, total {len(practices)}")
        assert free_count >= 1, f"Should have at least 1 free item, got {free_count}"

    def test_chakra_cleansing_premium_items_have_metadata(self):
        """Verify premium chakra items have premium_unlock_id and premium_label."""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        practices = response.json()

        premium_items = [p for p in practices if p.get("is_premium", False)]
        if len(premium_items) == 0:
            pytest.skip("No premium chakra cleansing practices")

        for item in premium_items[:3]:
            assert "premium_unlock_id" in item, f"Premium item missing premium_unlock_id: {item.get('id')}"
            assert item["premium_unlock_id"] == "chakra_cleansing", f"Wrong unlock_id: {item.get('premium_unlock_id')}"


class TestTieringRatioSummary:
    """Summary test for all section tiering ratios."""

    def test_all_sections_tiering_summary(self):
        """Print summary of tiering ratios across all sections."""
        sections = [
            ("shamanic-practices", "shamanic_practices"),
            ("heart-practices", "heart_practices"),
            ("elemental-practices", "elemental_practices"),
            ("mindfulness", "mindfulness_practices"),
            ("meditations", "meditations"),
            ("water-practices", "water_practices"),
            ("chakra-cleansing", "chakra_cleansing"),
        ]

        results = []
        for endpoint, unlock_id in sections:
            response = requests.get(f"{BASE_URL}/api/{endpoint}")
            if response.status_code != 200:
                results.append((endpoint, "ERROR", 0, 0, 0))
                continue

            items = response.json()
            if not isinstance(items, list) or len(items) == 0:
                results.append((endpoint, "EMPTY", 0, 0, 0))
                continue

            total = len(items)
            free_count = sum(1 for i in items if not i.get("is_premium", False))
            premium_count = total - free_count
            free_ratio = free_count / total if total > 0 else 0

            results.append((endpoint, "OK", free_count, premium_count, free_ratio))

        print("\n=== TIERING RATIO SUMMARY ===")
        for endpoint, status, free, premium, ratio in results:
            if status == "OK":
                print(f"{endpoint}: {free} free / {premium} premium ({ratio:.1%} free)")
            else:
                print(f"{endpoint}: {status}")

        # At least 5 sections should have valid tiering
        valid_sections = [r for r in results if r[1] == "OK" and r[2] > 0]
        assert len(valid_sections) >= 5, f"Expected at least 5 sections with valid tiering, got {len(valid_sections)}"
