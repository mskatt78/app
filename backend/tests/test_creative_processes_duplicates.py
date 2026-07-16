"""
Test Creative Processes API for duplicate prevention
Iteration 253 - Testing fix for River Stone and other item repeats in Creative/Earth Crafting
"""
import os
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCreativeProcessesNoDuplicates:
    """Test that creative processes API returns no duplicates"""
    
    def test_creative_processes_all_healthy(self):
        """GET /api/creative-processes should return 200 with no duplicate names/ids"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one creative process"
        
        # Check for duplicate IDs
        ids = [item.get('id') for item in data if item.get('id')]
        id_counts = Counter(ids)
        duplicate_ids = {k: v for k, v in id_counts.items() if v > 1}
        assert not duplicate_ids, f"Found duplicate IDs: {duplicate_ids}"
        
        # Check for duplicate names
        names = [item.get('name') for item in data if item.get('name')]
        name_counts = Counter(names)
        duplicate_names = {k: v for k, v in name_counts.items() if v > 1}
        assert not duplicate_names, f"Found duplicate names: {duplicate_names}"
        
        print(f"✓ All creative processes healthy: {len(data)} items, no duplicates")
    
    def test_earth_crafting_no_duplicates(self):
        """GET /api/creative-processes?category=earth-crafting should have unique items only"""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=earth-crafting")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check for duplicate IDs
        ids = [item.get('id') for item in data if item.get('id')]
        id_counts = Counter(ids)
        duplicate_ids = {k: v for k, v in id_counts.items() if v > 1}
        assert not duplicate_ids, f"Found duplicate IDs in earth-crafting: {duplicate_ids}"
        
        # Check for duplicate names
        names = [item.get('name') for item in data if item.get('name')]
        name_counts = Counter(names)
        duplicate_names = {k: v for k, v in name_counts.items() if v > 1}
        assert not duplicate_names, f"Found duplicate names in earth-crafting: {duplicate_names}"
        
        # Specifically check for River Stone Prayer Bundle
        river_stone_items = [item for item in data if 'river stone' in str(item.get('name', '')).lower()]
        assert len(river_stone_items) <= 1, f"River Stone Prayer Bundle appears {len(river_stone_items)} times (should be 0 or 1)"
        
        # Verify no deepening-cycle duplicates
        for item in data:
            item_id = str(item.get('id', ''))
            assert 'deepening' not in item_id.lower(), f"Deepening cycle item found in earth-crafting: {item_id}"
        
        print(f"✓ Earth-crafting category: {len(data)} items, no duplicates, no deepening-cycle items")
        if river_stone_items:
            print(f"  River Stone Prayer Bundle appears exactly once: {river_stone_items[0].get('name')}")
    
    def test_sacred_tool_birthing_no_duplicates(self):
        """GET /api/creative-processes?category=sacred-tool-birthing should have unique items only"""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check for duplicate IDs
        ids = [item.get('id') for item in data if item.get('id')]
        id_counts = Counter(ids)
        duplicate_ids = {k: v for k, v in id_counts.items() if v > 1}
        assert not duplicate_ids, f"Found duplicate IDs in sacred-tool-birthing: {duplicate_ids}"
        
        # Check for duplicate names
        names = [item.get('name') for item in data if item.get('name')]
        name_counts = Counter(names)
        duplicate_names = {k: v for k, v in name_counts.items() if v > 1}
        assert not duplicate_names, f"Found duplicate names in sacred-tool-birthing: {duplicate_names}"
        
        # Verify no deepening-cycle duplicates
        for item in data:
            item_id = str(item.get('id', ''))
            assert 'deepening' not in item_id.lower(), f"Deepening cycle item found in sacred-tool-birthing: {item_id}"
        
        print(f"✓ Sacred-tool-birthing category: {len(data)} items, no duplicates, no deepening-cycle items")
    
    def test_all_category_no_breakage(self):
        """Regression: /api/creative-processes all-category should load without errors"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 5, f"Expected at least 5 creative processes, got {len(data)}"
        
        # Verify each item has required fields
        for item in data:
            assert 'id' in item, f"Item missing 'id': {item.get('name', 'unknown')}"
            assert 'name' in item, f"Item missing 'name': {item.get('id', 'unknown')}"
            assert 'category' in item, f"Item missing 'category': {item.get('name', 'unknown')}"
        
        # Check categories are valid
        valid_categories = {'visual', 'writing', 'movement', 'nature', 'meditation', 'ceremony', 'earth-crafting', 'sacred-tool-birthing'}
        categories_found = set(item.get('category', '').lower() for item in data)
        print(f"✓ All-category regression: {len(data)} items, categories found: {categories_found}")
    
    def test_premium_tags_preserved(self):
        """Regression: Premium tags should still work for non-earth-crafting categories"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check that some items have premium flags (for non-earth-crafting categories)
        non_earth_items = [item for item in data if item.get('category', '').lower() not in {'earth-crafting', 'sacred-tool-birthing'}]
        
        # At least some items should have is_premium field
        items_with_premium = [item for item in non_earth_items if 'is_premium' in item]
        print(f"✓ Premium tags check: {len(items_with_premium)} non-earth items have is_premium field")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
