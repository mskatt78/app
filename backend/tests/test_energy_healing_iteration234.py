"""
Backend tests for Energy Healing expansion and global free/premium tiering - Iteration 234
Tests:
1. Energy Healing modality expansion (~14 practices per modality)
2. Deep content fields (alchemy, ritual, ceremony, guided_practice)
3. Free/premium split (4 free, rest premium)
4. Global baseline activation (4 free for major sections)
5. API latency for expanded dataset
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestEnergyHealingExpansion:
    """Test Energy Healing modality expansion and deep content"""
    
    def test_energy_healing_endpoint_returns_data(self):
        """Verify energy healing endpoint returns practices"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should return at least some practices"
        print(f"Total energy healing practices: {len(data)}")
    
    def test_energy_healing_modality_counts(self):
        """Verify each modality has expanded practice sets targeting ~14 practices"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        # Count practices per modality
        modality_counts = {}
        for practice in data:
            modality = practice.get("modality", "Unknown")
            modality_counts[modality] = modality_counts.get(modality, 0) + 1
        
        print(f"Modality counts: {modality_counts}")
        
        # Expected modalities from supplements
        expected_modalities = ["Egyptian", "Australian", "Crystal", "Sound", "Quantum", "Reiki", "Sekhem", "Dreamtime", "Pranic"]
        
        for modality in expected_modalities:
            count = modality_counts.get(modality, 0)
            print(f"  {modality}: {count} practices")
            # Each modality should have at least 10 practices (targeting ~14)
            assert count >= 10, f"{modality} should have at least 10 practices, got {count}"
    
    def test_energy_healing_modality_filter(self):
        """Test modality filtering works correctly"""
        modalities_to_test = ["Reiki", "Crystal", "Sound", "Quantum"]
        
        for modality in modalities_to_test:
            response = requests.get(f"{BASE_URL}/api/energy-healing", params={"modality": modality})
            assert response.status_code == 200, f"Filter for {modality} failed"
            data = response.json()
            
            # All returned practices should match the modality
            for practice in data:
                assert practice.get("modality", "").lower() == modality.lower(), \
                    f"Practice {practice.get('id')} has wrong modality: {practice.get('modality')}"
            
            print(f"  {modality} filter: {len(data)} practices")
            assert len(data) >= 10, f"{modality} filter should return at least 10 practices"
    
    def test_energy_healing_deep_content_fields(self):
        """Verify deep content fields are present (alchemy, ritual, ceremony, guided_practice)"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        deep_fields = ["alchemy", "ritual", "ceremony", "guided_practice"]
        practices_with_deep_content = 0
        
        for practice in data:
            has_all_fields = all(
                practice.get(field) and len(practice.get(field, [])) > 0
                for field in deep_fields
            )
            if has_all_fields:
                practices_with_deep_content += 1
        
        print(f"Practices with all deep fields: {practices_with_deep_content}/{len(data)}")
        # All practices should have deep content after enrichment
        assert practices_with_deep_content == len(data), \
            f"All practices should have deep content fields, only {practices_with_deep_content}/{len(data)} have them"
    
    def test_energy_healing_deep_content_quality(self):
        """Verify deep content is non-vague and substantial"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        # Check first few practices for content quality
        for practice in data[:5]:
            # Alchemy should have meaningful content
            alchemy = practice.get("alchemy", [])
            assert len(alchemy) >= 2, f"Practice {practice.get('id')} should have at least 2 alchemy points"
            for point in alchemy:
                assert len(point) > 50, f"Alchemy point too short: {point[:50]}..."
            
            # Ritual should have steps
            ritual = practice.get("ritual", [])
            assert len(ritual) >= 2, f"Practice {practice.get('id')} should have at least 2 ritual steps"
            
            # Ceremony should have arc
            ceremony = practice.get("ceremony", [])
            assert len(ceremony) >= 2, f"Practice {practice.get('id')} should have at least 2 ceremony phases"
            
            # Guided practice should have arc
            guided = practice.get("guided_practice", [])
            assert len(guided) >= 2, f"Practice {practice.get('id')} should have at least 2 guided practice phases"
        
        print("Deep content quality check passed for first 5 practices")


class TestEnergyHealingFreePremiumSplit:
    """Test free/premium tiering for Energy Healing (4 free, rest premium)"""
    
    def test_energy_healing_free_count(self):
        """Verify first 4 practices are free, rest are premium"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        free_count = sum(1 for p in data if not p.get("is_premium", True))
        premium_count = sum(1 for p in data if p.get("is_premium", False))
        
        print(f"Free practices: {free_count}")
        print(f"Premium practices: {premium_count}")
        
        # Should have exactly 4 free practices
        assert free_count == 4, f"Expected 4 free practices, got {free_count}"
        # Rest should be premium
        assert premium_count == len(data) - 4, f"Expected {len(data) - 4} premium, got {premium_count}"
    
    def test_energy_healing_premium_labels(self):
        """Verify premium practices have correct labels"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data:
            if practice.get("is_premium"):
                assert practice.get("premium_unlock_id") == "energy_healing", \
                    f"Practice {practice.get('id')} has wrong unlock_id"
                assert "Energy Healing" in practice.get("premium_label", ""), \
                    f"Practice {practice.get('id')} has wrong premium_label"


class TestGlobalFreeBaseline:
    """Test global 4-free baseline across major sections"""
    
    SECTIONS_WITH_4_FREE = [
        ("/api/yoga-poses", "yoga_poses"),
        ("/api/somatic-practices", "somatic_practices"),
        ("/api/breathwork", "premium_breathwork"),
        ("/api/meditations", "meditations"),
        ("/api/mindfulness", "mindfulness_practices"),
        ("/api/mantras", "premium_mantras"),
        ("/api/water-practices", "water_practices"),
        ("/api/heart-practices", "heart_practices"),
        ("/api/sacred-allies", "sacred_allies"),
        ("/api/angelic-alchemy", "angelic_alchemy"),
        ("/api/sacred-guardians", "sacred_guardians"),
        ("/api/ancient-wisdom", "ancient_wisdom"),
        ("/api/sacred-art-therapy", "sacred_art_therapy"),
        ("/api/energy-healing", "energy_healing"),
    ]
    
    @pytest.mark.parametrize("endpoint,section_name", SECTIONS_WITH_4_FREE)
    def test_section_has_4_free(self, endpoint, section_name):
        """Verify section has exactly 4 free practices"""
        response = requests.get(f"{BASE_URL}{endpoint}")
        
        # Skip if endpoint doesn't exist
        if response.status_code == 404:
            pytest.skip(f"Endpoint {endpoint} not found")
        
        assert response.status_code == 200, f"{endpoint} returned {response.status_code}"
        data = response.json()
        
        if not data:
            pytest.skip(f"No data returned for {endpoint}")
        
        free_count = sum(1 for item in data if not item.get("is_premium", True))
        total_count = len(data)
        
        print(f"{section_name}: {free_count} free / {total_count} total")
        
        # Should have 4 free (or all free if total < 5)
        if total_count <= 4:
            assert free_count == total_count, f"{section_name}: all {total_count} should be free"
        else:
            assert free_count == 4, f"{section_name}: expected 4 free, got {free_count}"


class TestEnergyHealingAPIPerformance:
    """Test API latency for expanded energy healing dataset"""
    
    def test_energy_healing_latency(self):
        """Verify API response time is acceptable (<2s)"""
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        elapsed = time.time() - start
        
        assert response.status_code == 200
        print(f"Energy healing API latency: {elapsed:.3f}s")
        assert elapsed < 2.0, f"API too slow: {elapsed:.3f}s (should be <2s)"
    
    def test_energy_healing_with_filter_latency(self):
        """Verify filtered API response time is acceptable"""
        modalities = ["Reiki", "Crystal", "Sound"]
        
        for modality in modalities:
            start = time.time()
            response = requests.get(f"{BASE_URL}/api/energy-healing", params={"modality": modality})
            elapsed = time.time() - start
            
            assert response.status_code == 200
            print(f"  {modality} filter latency: {elapsed:.3f}s")
            assert elapsed < 1.5, f"{modality} filter too slow: {elapsed:.3f}s"


class TestEnergyHealingAdditionalFields:
    """Test additional enrichment fields for energy healing"""
    
    def test_ritual_tools_present(self):
        """Verify ritual_tools field is present"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data[:5]:
            tools = practice.get("ritual_tools", [])
            assert len(tools) > 0, f"Practice {practice.get('id')} missing ritual_tools"
    
    def test_meridian_functions_present(self):
        """Verify meridian_functions field is present"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data[:5]:
            functions = practice.get("meridian_functions", [])
            assert len(functions) > 0, f"Practice {practice.get('id')} missing meridian_functions"
    
    def test_body_ailment_connections_present(self):
        """Verify body_ailment_connections field is present"""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data[:5]:
            connections = practice.get("body_ailment_connections", [])
            assert len(connections) > 0, f"Practice {practice.get('id')} missing body_ailment_connections"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
