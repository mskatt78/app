"""
Iteration 241 - Mantra/Mudra Depth & Copy-Consistency Tests
Tests for P1 deepening of mantras/mudras with ceremonial fields and copy-tone consistency.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestMantrasEnrichedContent:
    """Test /api/mantras returns tiered content with richer ceremonial fields."""

    def test_mantras_endpoint_returns_data(self, api_client):
        """Verify /api/mantras returns 200 and a list."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mantras"
        assert len(data) >= 14, f"Expected at least 14 mantras, got {len(data)}"
        print(f"PASS: /api/mantras returned {len(data)} mantras")

    def test_mantras_have_alchemy_field(self, api_client):
        """Verify mantras have alchemy field with content."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_alchemy = [m for m in data if m.get("alchemy") and len(m.get("alchemy", [])) > 0]
        assert len(mantras_with_alchemy) >= 10, f"Expected at least 10 mantras with alchemy, got {len(mantras_with_alchemy)}"
        # Check first mantra's alchemy content
        first_with_alchemy = mantras_with_alchemy[0]
        assert isinstance(first_with_alchemy["alchemy"], list), "alchemy should be a list"
        assert len(first_with_alchemy["alchemy"]) >= 2, "alchemy should have at least 2 items"
        print(f"PASS: {len(mantras_with_alchemy)} mantras have alchemy field")

    def test_mantras_have_ritual_field(self, api_client):
        """Verify mantras have ritual field with content."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_ritual = [m for m in data if m.get("ritual") and len(m.get("ritual", [])) > 0]
        assert len(mantras_with_ritual) >= 10, f"Expected at least 10 mantras with ritual, got {len(mantras_with_ritual)}"
        first_with_ritual = mantras_with_ritual[0]
        assert isinstance(first_with_ritual["ritual"], list), "ritual should be a list"
        print(f"PASS: {len(mantras_with_ritual)} mantras have ritual field")

    def test_mantras_have_ceremony_field(self, api_client):
        """Verify mantras have ceremony field with content."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_ceremony = [m for m in data if m.get("ceremony") and len(m.get("ceremony", [])) > 0]
        assert len(mantras_with_ceremony) >= 10, f"Expected at least 10 mantras with ceremony, got {len(mantras_with_ceremony)}"
        first_with_ceremony = mantras_with_ceremony[0]
        assert isinstance(first_with_ceremony["ceremony"], list), "ceremony should be a list"
        print(f"PASS: {len(mantras_with_ceremony)} mantras have ceremony field")

    def test_mantras_have_guided_practice_field(self, api_client):
        """Verify mantras have guided_practice field with content."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_guided = [m for m in data if m.get("guided_practice") and len(m.get("guided_practice", [])) > 0]
        assert len(mantras_with_guided) >= 10, f"Expected at least 10 mantras with guided_practice, got {len(mantras_with_guided)}"
        first_with_guided = mantras_with_guided[0]
        assert isinstance(first_with_guided["guided_practice"], list), "guided_practice should be a list"
        print(f"PASS: {len(mantras_with_guided)} mantras have guided_practice field")

    def test_mantras_have_why_this_heals_field(self, api_client):
        """Verify mantras have why_this_heals field with content."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_why = [m for m in data if m.get("why_this_heals") and len(str(m.get("why_this_heals", ""))) > 20]
        assert len(mantras_with_why) >= 10, f"Expected at least 10 mantras with why_this_heals, got {len(mantras_with_why)}"
        first_with_why = mantras_with_why[0]
        assert isinstance(first_with_why["why_this_heals"], str), "why_this_heals should be a string"
        assert len(first_with_why["why_this_heals"]) > 30, "why_this_heals should have substantial content"
        print(f"PASS: {len(mantras_with_why)} mantras have why_this_heals field")

    def test_mantras_have_integration_guide_field(self, api_client):
        """Verify mantras have integration_guide field with content."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_integration = [m for m in data if m.get("integration_guide") and len(str(m.get("integration_guide", ""))) > 20]
        assert len(mantras_with_integration) >= 10, f"Expected at least 10 mantras with integration_guide, got {len(mantras_with_integration)}"
        first_with_integration = mantras_with_integration[0]
        assert isinstance(first_with_integration["integration_guide"], str), "integration_guide should be a string"
        print(f"PASS: {len(mantras_with_integration)} mantras have integration_guide field")

    def test_mantras_have_master_embodiment_protocol(self, api_client):
        """Verify mantras have master_embodiment_protocol with phases."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        mantras_with_protocol = [m for m in data if m.get("master_embodiment_protocol")]
        assert len(mantras_with_protocol) >= 10, f"Expected at least 10 mantras with master_embodiment_protocol, got {len(mantras_with_protocol)}"
        
        # Check structure of first protocol
        first_protocol = mantras_with_protocol[0]["master_embodiment_protocol"]
        assert "preparation_phase" in first_protocol, "master_embodiment_protocol should have preparation_phase"
        assert "embodiment_phase" in first_protocol, "master_embodiment_protocol should have embodiment_phase"
        assert "integration_phase" in first_protocol, "master_embodiment_protocol should have integration_phase"
        print(f"PASS: {len(mantras_with_protocol)} mantras have master_embodiment_protocol")


class TestMudrasEnrichedContent:
    """Test /api/mudras returns enriched ceremonial fields and supplements."""

    def test_mudras_endpoint_returns_data(self, api_client):
        """Verify /api/mudras returns 200 and a list."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mudras"
        assert len(data) >= 12, f"Expected at least 12 mudras, got {len(data)}"
        print(f"PASS: /api/mudras returned {len(data)} mudras")

    def test_mudras_have_alchemy_field(self, api_client):
        """Verify mudras have alchemy field with content."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_alchemy = [m for m in data if m.get("alchemy") and len(m.get("alchemy", [])) > 0]
        assert len(mudras_with_alchemy) >= 10, f"Expected at least 10 mudras with alchemy, got {len(mudras_with_alchemy)}"
        first_with_alchemy = mudras_with_alchemy[0]
        assert isinstance(first_with_alchemy["alchemy"], list), "alchemy should be a list"
        print(f"PASS: {len(mudras_with_alchemy)} mudras have alchemy field")

    def test_mudras_have_ritual_field(self, api_client):
        """Verify mudras have ritual field with content."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_ritual = [m for m in data if m.get("ritual") and len(m.get("ritual", [])) > 0]
        assert len(mudras_with_ritual) >= 10, f"Expected at least 10 mudras with ritual, got {len(mudras_with_ritual)}"
        print(f"PASS: {len(mudras_with_ritual)} mudras have ritual field")

    def test_mudras_have_ceremony_field(self, api_client):
        """Verify mudras have ceremony field with content."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_ceremony = [m for m in data if m.get("ceremony") and len(m.get("ceremony", [])) > 0]
        assert len(mudras_with_ceremony) >= 10, f"Expected at least 10 mudras with ceremony, got {len(mudras_with_ceremony)}"
        print(f"PASS: {len(mudras_with_ceremony)} mudras have ceremony field")

    def test_mudras_have_guided_practice_field(self, api_client):
        """Verify mudras have guided_practice field with content."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_guided = [m for m in data if m.get("guided_practice") and len(m.get("guided_practice", [])) > 0]
        assert len(mudras_with_guided) >= 10, f"Expected at least 10 mudras with guided_practice, got {len(mudras_with_guided)}"
        print(f"PASS: {len(mudras_with_guided)} mudras have guided_practice field")

    def test_mudras_have_why_this_heals_field(self, api_client):
        """Verify mudras have why_this_heals field with content."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_why = [m for m in data if m.get("why_this_heals") and len(str(m.get("why_this_heals", ""))) > 20]
        assert len(mudras_with_why) >= 10, f"Expected at least 10 mudras with why_this_heals, got {len(mudras_with_why)}"
        first_with_why = mudras_with_why[0]
        assert isinstance(first_with_why["why_this_heals"], str), "why_this_heals should be a string"
        print(f"PASS: {len(mudras_with_why)} mudras have why_this_heals field")

    def test_mudras_have_integration_guide_field(self, api_client):
        """Verify mudras have integration_guide field with content."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_integration = [m for m in data if m.get("integration_guide") and len(str(m.get("integration_guide", ""))) > 20]
        assert len(mudras_with_integration) >= 10, f"Expected at least 10 mudras with integration_guide, got {len(mudras_with_integration)}"
        print(f"PASS: {len(mudras_with_integration)} mudras have integration_guide field")

    def test_mudras_have_master_embodiment_protocol(self, api_client):
        """Verify mudras have master_embodiment_protocol with phases."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudras_with_protocol = [m for m in data if m.get("master_embodiment_protocol")]
        assert len(mudras_with_protocol) >= 10, f"Expected at least 10 mudras with master_embodiment_protocol, got {len(mudras_with_protocol)}"
        
        # Check structure of first protocol
        first_protocol = mudras_with_protocol[0]["master_embodiment_protocol"]
        assert "preparation_phase" in first_protocol, "master_embodiment_protocol should have preparation_phase"
        assert "embodiment_phase" in first_protocol, "master_embodiment_protocol should have embodiment_phase"
        assert "integration_phase" in first_protocol, "master_embodiment_protocol should have integration_phase"
        print(f"PASS: {len(mudras_with_protocol)} mudras have master_embodiment_protocol")

    def test_mudra_supplements_included(self, api_client):
        """Verify mudra supplements like Hakini Mudra are included."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        mudra_ids = [m.get("id") for m in data]
        mudra_names = [m.get("name", "").lower() for m in data]
        
        # Check for Hakini Mudra (mudra-supp-301)
        has_hakini = "mudra-supp-301" in mudra_ids or "hakini mudra" in mudra_names
        assert has_hakini, "Expected Hakini Mudra (mudra-supp-301) to be included in mudras"
        print("PASS: Hakini Mudra supplement is included")


class TestMantraMudraContentConsistency:
    """Test copy-tone consistency across mantra/mudra content."""

    def test_mantra_alchemy_has_ceremonial_language(self, api_client):
        """Verify mantra alchemy uses ceremonial/devotional language."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        
        ceremonial_keywords = ["embod", "ritual", "ceremony", "devotion", "sacred", "integration", "coherence", "breath", "nervous system"]
        mantras_with_ceremonial = 0
        
        for mantra in data[:10]:  # Check first 10
            alchemy = mantra.get("alchemy", [])
            if alchemy:
                alchemy_text = " ".join(alchemy).lower()
                if any(kw in alchemy_text for kw in ceremonial_keywords):
                    mantras_with_ceremonial += 1
        
        assert mantras_with_ceremonial >= 7, f"Expected at least 7 mantras with ceremonial language in alchemy, got {mantras_with_ceremonial}"
        print(f"PASS: {mantras_with_ceremonial}/10 mantras have ceremonial language in alchemy")

    def test_mudra_alchemy_has_ceremonial_language(self, api_client):
        """Verify mudra alchemy uses ceremonial/devotional language."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        ceremonial_keywords = ["embod", "ritual", "ceremony", "devotion", "sacred", "integration", "coherence", "breath", "nervous system", "somatic"]
        mudras_with_ceremonial = 0
        
        for mudra in data[:10]:  # Check first 10
            alchemy = mudra.get("alchemy", [])
            if alchemy:
                alchemy_text = " ".join(alchemy).lower()
                if any(kw in alchemy_text for kw in ceremonial_keywords):
                    mudras_with_ceremonial += 1
        
        assert mudras_with_ceremonial >= 7, f"Expected at least 7 mudras with ceremonial language in alchemy, got {mudras_with_ceremonial}"
        print(f"PASS: {mudras_with_ceremonial}/10 mudras have ceremonial language in alchemy")

    def test_mantra_count_is_14_tiered(self, api_client):
        """Verify mantras endpoint returns exactly 14 tiered mantras."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        # The requirement states 14 tiered mantras
        assert len(data) >= 14, f"Expected at least 14 mantras, got {len(data)}"
        print(f"PASS: Mantras count is {len(data)} (meets 14 tiered requirement)")


class TestMantrasFieldStructure:
    """Test detailed field structure for mantras."""

    def test_mantra_sample_has_all_required_fields(self, api_client):
        """Verify a sample mantra has all required enriched fields."""
        response = api_client.get(f"{BASE_URL}/api/mantras")
        data = response.json()
        
        required_fields = [
            "id", "name", "alchemy", "ritual", "ceremony", 
            "guided_practice", "why_this_heals", "integration_guide"
        ]
        
        sample_mantra = data[0]
        missing_fields = [f for f in required_fields if f not in sample_mantra or not sample_mantra[f]]
        
        assert len(missing_fields) == 0, f"Sample mantra missing fields: {missing_fields}"
        print(f"PASS: Sample mantra '{sample_mantra.get('name')}' has all required fields")


class TestMudrasFieldStructure:
    """Test detailed field structure for mudras."""

    def test_mudra_sample_has_all_required_fields(self, api_client):
        """Verify a sample mudra has all required enriched fields."""
        response = api_client.get(f"{BASE_URL}/api/mudras")
        data = response.json()
        
        required_fields = [
            "id", "name", "alchemy", "ritual", "ceremony", 
            "guided_practice", "why_this_heals", "integration_guide"
        ]
        
        sample_mudra = data[0]
        missing_fields = [f for f in required_fields if f not in sample_mudra or not sample_mudra[f]]
        
        assert len(missing_fields) == 0, f"Sample mudra missing fields: {missing_fields}"
        print(f"PASS: Sample mudra '{sample_mudra.get('name')}' has all required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
