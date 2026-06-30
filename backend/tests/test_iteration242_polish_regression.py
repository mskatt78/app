"""
Iteration 242 - P1 Polish Regression Tests
Focus: Backend endpoint regression for mantras, mudras, sacred-ally-alchemy, angelic-alchemy, sacred-guardians, energy-healing
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestMantrasEndpoint:
    """Mantras endpoint regression tests"""
    
    def test_mantras_returns_200(self):
        """Verify /api/mantras returns 200"""
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/mantras returned {len(data)} mantras")
    
    def test_mantras_have_required_fields(self):
        """Verify mantras have required fields for modal display"""
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one mantra"
        
        sample = data[0]
        required_fields = ["id", "name", "element"]
        for field in required_fields:
            assert field in sample, f"Missing required field: {field}"
        
        # Check enriched fields exist on at least some mantras
        enriched_fields = ["alchemy", "ritual", "ceremony", "guided_practice", "why_this_heals", "integration_guide"]
        enriched_count = sum(1 for m in data if any(m.get(f) for f in enriched_fields))
        print(f"PASS: {enriched_count}/{len(data)} mantras have enriched fields")


class TestMudrasEndpoint:
    """Mudras endpoint regression tests"""
    
    def test_mudras_returns_200(self):
        """Verify /api/mudras returns 200"""
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/mudras returned {len(data)} mudras")
    
    def test_mudras_have_required_fields(self):
        """Verify mudras have required fields for modal display"""
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one mudra"
        
        sample = data[0]
        required_fields = ["id", "name", "element"]
        for field in required_fields:
            assert field in sample, f"Missing required field: {field}"
        print(f"PASS: Mudras have required fields")


class TestSacredAllyAlchemyEndpoint:
    """Sacred Ally Alchemy endpoint regression tests"""
    
    def test_sacred_ally_alchemy_returns_200(self):
        """Verify /api/sacred-ally-alchemy returns 200"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/sacred-ally-alchemy returned {len(data)} allies")
    
    def test_sacred_ally_has_required_fields(self):
        """Verify sacred allies have required fields"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            sample = data[0]
            required_fields = ["id", "name"]
            for field in required_fields:
                assert field in sample, f"Missing required field: {field}"
        print(f"PASS: Sacred allies have required fields")


class TestAngelicAlchemyEndpoint:
    """Angelic Alchemy endpoint regression tests"""
    
    def test_angelic_alchemy_returns_200(self):
        """Verify /api/angelic-alchemy returns 200"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/angelic-alchemy returned {len(data)} angels")
    
    def test_angelic_has_required_fields(self):
        """Verify angelic entries have required fields"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            sample = data[0]
            required_fields = ["id", "name"]
            for field in required_fields:
                assert field in sample, f"Missing required field: {field}"
        print(f"PASS: Angelic entries have required fields")


class TestSacredGuardiansEndpoint:
    """Sacred Guardians endpoint regression tests"""
    
    def test_sacred_guardians_returns_200(self):
        """Verify /api/sacred-guardians returns 200"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/sacred-guardians returned {len(data)} guardians")
    
    def test_guardians_have_required_fields(self):
        """Verify guardians have required fields"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            sample = data[0]
            required_fields = ["id", "name"]
            for field in required_fields:
                assert field in sample, f"Missing required field: {field}"
        print(f"PASS: Guardians have required fields")


class TestEnergyHealingEndpoint:
    """Energy Healing endpoint regression tests"""
    
    def test_energy_healing_returns_200(self):
        """Verify /api/energy-healing returns 200"""
        response = requests.get(f"{BASE_URL}/api/energy-healing", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/energy-healing returned {len(data)} practices")
    
    def test_energy_healing_has_required_fields(self):
        """Verify energy healing practices have required fields"""
        response = requests.get(f"{BASE_URL}/api/energy-healing", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            sample = data[0]
            required_fields = ["id", "name"]
            for field in required_fields:
                assert field in sample, f"Missing required field: {field}"
        print(f"PASS: Energy healing practices have required fields")


class TestOracleArchangelsEndpoint:
    """Oracle Archangels endpoint regression tests (used by AngelicAlchemy)"""
    
    def test_oracle_archangels_returns_200(self):
        """Verify /api/oracle/archangels returns 200"""
        response = requests.get(f"{BASE_URL}/api/oracle/archangels", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/oracle/archangels returned {len(data)} archangels")


class TestSacredAllyAudioJourneysEndpoint:
    """Sacred Ally Audio Journeys endpoint regression tests"""
    
    def test_sacred_ally_audio_journeys_returns_200(self):
        """Verify /api/sacred-ally-audio-journeys returns 200"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-audio-journeys", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/sacred-ally-audio-journeys returned {len(data)} journeys")


class TestSacredAllyPathwaysEndpoint:
    """Sacred Ally Pathways endpoint regression tests"""
    
    def test_sacred_ally_pathways_returns_200(self):
        """Verify /api/sacred-ally-pathways returns 200"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-pathways", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/sacred-ally-pathways returned {len(data)} pathways")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
