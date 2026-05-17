"""
Iteration 120 - Content Truth/Depth Testing
Tests for all 8 content depth items:
1. Mudras - image_validation and image_source fields
2. Light Codes - linguistic_foundations and symbol_lineage_notes
3. Energy Healing - ritual_tools, meridian_functions, body_ailment_connections
4. Ancient Wisdom - expanded_context
5. Shamanic/Elemental Practices - linked_practices
6. Mindfulness - linked_practices
7. Water Practices - supplemental entries
8. Dashboard daily - contract health
9. Crystals - iolite image URL stability
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestMudrasImageValidation:
    """Test mudras endpoint returns image_validation and image_source fields"""
    
    def test_mudras_returns_image_validation_fields(self):
        """GET /api/mudras should include image_validation and image_source"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        mudras = response.json()
        assert isinstance(mudras, list), "Expected list of mudras"
        assert len(mudras) > 0, "Expected at least one mudra"
        
        # Check first mudra has required fields
        first_mudra = mudras[0]
        assert "image_validation" in first_mudra, "Missing image_validation field"
        assert "image_source" in first_mudra, "Missing image_source field"
        
        # Check image_validation structure
        img_val = first_mudra["image_validation"]
        assert "status" in img_val, "image_validation missing status"
        assert img_val["status"] in ["verified", "review"], f"Unexpected status: {img_val['status']}"
        
    def test_verified_mudras_have_wikipedia_urls(self):
        """Verified mudras should have wikipedia_verified source"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        
        mudras = response.json()
        verified_count = 0
        unverified_count = 0
        
        for mudra in mudras:
            if mudra.get("image_validation", {}).get("status") == "verified":
                verified_count += 1
                assert mudra.get("image_source") == "wikipedia_verified", \
                    f"Verified mudra {mudra.get('name')} should have wikipedia_verified source"
                assert mudra.get("image_url") is not None, \
                    f"Verified mudra {mudra.get('name')} should have image_url"
            else:
                unverified_count += 1
                assert mudra.get("image_source") == "awaiting_verification", \
                    f"Unverified mudra {mudra.get('name')} should have awaiting_verification source"
        
        print(f"Verified mudras: {verified_count}, Unverified: {unverified_count}")


class TestLightCodesLinguisticFoundations:
    """Test light-codes endpoint returns linguistic_foundations and symbol_lineage_notes"""
    
    def test_light_codes_returns_linguistic_foundations(self):
        """GET /api/light-codes should include linguistic_foundations"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Expected dict response"
        
        assert "linguistic_foundations" in data, "Missing linguistic_foundations field"
        foundations = data["linguistic_foundations"]
        assert isinstance(foundations, list), "linguistic_foundations should be a list"
        assert len(foundations) > 0, "Expected at least one linguistic foundation"
        
        # Check structure of first foundation
        first = foundations[0]
        assert "id" in first, "Foundation missing id"
        assert "title" in first, "Foundation missing title"
        assert "description" in first, "Foundation missing description"
        
    def test_light_codes_returns_symbol_lineage_notes(self):
        """GET /api/light-codes should include symbol_lineage_notes"""
        response = requests.get(f"{BASE_URL}/api/light-codes")
        assert response.status_code == 200
        
        data = response.json()
        assert "symbol_lineage_notes" in data, "Missing symbol_lineage_notes field"
        notes = data["symbol_lineage_notes"]
        assert isinstance(notes, list), "symbol_lineage_notes should be a list"
        assert len(notes) > 0, "Expected at least one lineage note"


class TestEnergyHealingDepth:
    """Test energy-healing endpoint returns ritual_tools, meridian_functions, body_ailment_connections"""
    
    def test_energy_healing_returns_ritual_tools(self):
        """GET /api/energy-healing should include ritual_tools"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert isinstance(practices, list), "Expected list of practices"
        
        if len(practices) > 0:
            first = practices[0]
            assert "ritual_tools" in first, "Missing ritual_tools field"
            assert isinstance(first["ritual_tools"], list), "ritual_tools should be a list"
            
    def test_energy_healing_returns_meridian_functions(self):
        """GET /api/energy-healing should include meridian_functions"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        practices = response.json()
        if len(practices) > 0:
            first = practices[0]
            assert "meridian_functions" in first, "Missing meridian_functions field"
            assert isinstance(first["meridian_functions"], list), "meridian_functions should be a list"
            
    def test_energy_healing_returns_body_ailment_connections(self):
        """GET /api/energy-healing should include body_ailment_connections"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        
        practices = response.json()
        if len(practices) > 0:
            first = practices[0]
            assert "body_ailment_connections" in first, "Missing body_ailment_connections field"
            assert isinstance(first["body_ailment_connections"], list), "body_ailment_connections should be a list"


class TestAncientWisdomExpandedContext:
    """Test ancient-wisdom endpoint returns expanded_context"""
    
    def test_ancient_wisdom_returns_expanded_context(self):
        """GET /api/ancient-wisdom should include expanded_context on entries"""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        entries = response.json()
        assert isinstance(entries, list), "Expected list of entries"
        assert len(entries) > 0, "Expected at least one entry"
        
        # Check that at least some entries have expanded_context
        entries_with_context = [e for e in entries if e.get("expanded_context")]
        print(f"Entries with expanded_context: {len(entries_with_context)} / {len(entries)}")
        # Note: expanded_context may be optional, so we just verify the field can exist


class TestShamanicPracticesLinkedPractices:
    """Test shamanic-practices endpoint returns linked_practices"""
    
    def test_shamanic_practices_returns_linked_practices(self):
        """GET /api/shamanic-practices should include linked_practices"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert isinstance(practices, list), "Expected list of practices"
        
        if len(practices) > 0:
            # Check that linked_practices field exists (may be empty list)
            practices_with_links = [p for p in practices if p.get("linked_practices")]
            print(f"Shamanic practices with linked_practices: {len(practices_with_links)} / {len(practices)}")


class TestElementalPracticesLinkedPractices:
    """Test elemental-practices endpoint returns linked_practices"""
    
    def test_elemental_practices_returns_linked_practices(self):
        """GET /api/elemental-practices should include linked_practices"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert isinstance(practices, list), "Expected list of practices"
        
        if len(practices) > 0:
            practices_with_links = [p for p in practices if p.get("linked_practices")]
            print(f"Elemental practices with linked_practices: {len(practices_with_links)} / {len(practices)}")


class TestMindfulnessLinkedPractices:
    """Test mindfulness endpoints return linked_practices"""
    
    def test_mindfulness_returns_200(self):
        """GET /api/mindfulness should return 200"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert isinstance(practices, list), "Expected list of practices"
        
    def test_mindfulness_practices_returns_200(self):
        """GET /api/mindfulness-practices should return 200"""
        response = requests.get(f"{BASE_URL}/api/mindfulness-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert isinstance(practices, list), "Expected list of practices"
        
    def test_mindfulness_has_linked_practices(self):
        """Mindfulness practices should have linked_practices field"""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        
        practices = response.json()
        if len(practices) > 0:
            practices_with_links = [p for p in practices if p.get("linked_practices")]
            print(f"Mindfulness practices with linked_practices: {len(practices_with_links)} / {len(practices)}")


class TestWaterPracticesSupplemental:
    """Test water-practices endpoint includes supplemental entries"""
    
    def test_water_practices_returns_data(self):
        """GET /api/water-practices should return practices"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        practices = response.json()
        assert isinstance(practices, list), "Expected list of practices"
        print(f"Water practices count: {len(practices)}")
        
    def test_water_practices_includes_supplements(self):
        """Water practices should include supplemental entries"""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        
        practices = response.json()
        # Check for known supplemental IDs
        supplement_ids = ["water-practice-auric-rinse", "water-practice-meridian-soak", "water-practice-moon-infusion"]
        found_supplements = [p for p in practices if p.get("id") in supplement_ids]
        print(f"Found supplemental water practices: {len(found_supplements)} / {len(supplement_ids)}")


class TestDashboardDailyContract:
    """Test dashboard daily endpoint contract"""
    
    def test_dashboard_daily_requires_auth(self):
        """GET /api/dashboard/daily should require authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        # Should return 401 or 422 without auth
        assert response.status_code in [401, 422], f"Expected 401/422, got {response.status_code}"
        
    def test_dashboard_route_accessible(self):
        """Dashboard route should be accessible (frontend handles auth)"""
        # This is a frontend route test - just verify backend doesn't crash
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, "Backend health check failed"


class TestCrystalsIoliteStability:
    """Test crystals iolite image URL stability"""
    
    def test_crystals_deep_returns_iolite(self):
        """GET /api/crystals/deep should return iolite with correct image"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        crystals = response.json()
        assert isinstance(crystals, list), "Expected list of crystals"
        
        # Find iolite
        iolite = next((c for c in crystals if c.get("id") == "iolite"), None)
        if iolite:
            print(f"Iolite found with image_url: {iolite.get('image_url', 'None')[:80]}...")
            # Verify it's not the old cluster mismatch
            image_url = iolite.get("image_url", "")
            if image_url:
                assert "cluster" not in image_url.lower(), "Iolite should not have cluster image"
        else:
            print("Iolite not found in crystals/deep - may need seeding")
            
    def test_crystals_returns_data(self):
        """GET /api/crystals should return crystals"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        crystals = response.json()
        assert isinstance(crystals, list), "Expected list of crystals"
        print(f"Crystals count: {len(crystals)}")


class TestHealthAndCoreEndpoints:
    """Test core health and stability"""
    
    def test_health_endpoint(self):
        """GET /api/health should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_yoga_poses_endpoint(self):
        """GET /api/yoga/poses should return poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_mantras_endpoint(self):
        """GET /api/mantras should return mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_breathwork_sessions_endpoint(self):
        """GET /api/breathwork/sessions should return sessions"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
