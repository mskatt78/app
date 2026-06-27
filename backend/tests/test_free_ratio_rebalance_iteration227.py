"""
Test free/premium ratio rebalance - iteration 227
Verifies that the free ratio has been increased to ~60% free / ~40% premium
across key sections: shamanic, heart, elemental, mindfulness, meditations, water, chakra
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected free ratio is now 60% (0.60)
EXPECTED_FREE_RATIO = 0.60
TOLERANCE = 0.15  # Allow some tolerance for rounding

class TestFreeRatioRebalance:
    """Test that free ratio is approximately 60% across all sections"""
    
    def test_shamanic_practices_free_ratio(self):
        """Shamanic practices should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some shamanic practices"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Shamanic Practices: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        # Verify ratio is approximately 60% free (with tolerance)
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"
        
    def test_heart_practices_free_ratio(self):
        """Heart practices should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some heart practices"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Heart Practices: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"
    
    def test_elemental_practices_free_ratio(self):
        """Elemental practices should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some elemental practices"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Elemental Practices: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"
    
    def test_mindfulness_free_ratio(self):
        """Mindfulness practices should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some mindfulness practices"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Mindfulness: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"
    
    def test_meditations_free_ratio(self):
        """Meditations should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some meditations"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Meditations: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"
    
    def test_water_practices_free_ratio(self):
        """Water practices should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some water practices"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Water Practices: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"
    
    def test_chakra_cleansing_free_ratio(self):
        """Chakra cleansing should have ~60% free items"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data) > 0, "Expected at least some chakra cleansing practices"
        
        total = len(data)
        free_count = sum(1 for item in data if not item.get('is_premium', False))
        premium_count = total - free_count
        
        free_ratio = free_count / total if total > 0 else 0
        
        print(f"Chakra Cleansing: {free_count} free / {premium_count} premium out of {total} total")
        print(f"Free ratio: {free_ratio:.2%}")
        
        assert free_ratio >= (EXPECTED_FREE_RATIO - TOLERANCE), \
            f"Free ratio {free_ratio:.2%} is below expected {EXPECTED_FREE_RATIO - TOLERANCE:.2%}"


class TestEndpointsReturnData:
    """Regression tests - ensure all endpoints return valid data"""
    
    def test_shamanic_practices_returns_data(self):
        """Shamanic practices endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Shamanic practices returned {len(data)} items")
    
    def test_heart_practices_returns_data(self):
        """Heart practices endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Heart practices returned {len(data)} items")
    
    def test_elemental_practices_returns_data(self):
        """Elemental practices endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Elemental practices returned {len(data)} items")
    
    def test_mindfulness_returns_data(self):
        """Mindfulness endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Mindfulness returned {len(data)} items")
    
    def test_meditations_returns_data(self):
        """Meditations endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Meditations returned {len(data)} items")
    
    def test_water_practices_returns_data(self):
        """Water practices endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Water practices returned {len(data)} items")
    
    def test_chakra_cleansing_returns_data(self):
        """Chakra cleansing endpoint returns valid array"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Chakra cleansing returned {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
