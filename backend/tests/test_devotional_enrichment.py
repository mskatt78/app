"""
Test devotional enrichment across key content APIs.
Validates that devotional_invocation, embodiment_prompt, integration_vow fields are present.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Endpoints to test for devotional enrichment
DEVOTIONAL_ENDPOINTS = [
    ("/api/breathwork/sessions", "breathwork"),
    ("/api/mindfulness", "mindfulness"),
    ("/api/meditations", "meditations"),
    ("/api/heart-practices", "heart-practices"),
    ("/api/shamanic-practices", "shamanic-practices"),
    ("/api/elemental-practices", "elemental-practices"),
    ("/api/healing-portals", "healing-portals"),
    ("/api/feminine-embodiment", "feminine-embodiment"),
]


class TestDevotionalEnrichment:
    """Test devotional language enrichment across content APIs"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    @pytest.mark.parametrize("endpoint,domain", DEVOTIONAL_ENDPOINTS)
    def test_endpoint_returns_devotional_fields(self, endpoint, domain):
        """Verify first record in each endpoint contains devotional fields"""
        url = f"{BASE_URL}{endpoint}"
        response = self.session.get(url, timeout=15)
        
        assert response.status_code == 200, f"{domain}: Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), f"{domain}: Expected list response"
        
        if len(data) == 0:
            pytest.skip(f"{domain}: No records returned, skipping devotional check")
        
        first_record = data[0]
        
        # Check devotional_invocation
        assert "devotional_invocation" in first_record, f"{domain}: Missing devotional_invocation"
        assert isinstance(first_record["devotional_invocation"], str), f"{domain}: devotional_invocation should be string"
        assert len(first_record["devotional_invocation"]) > 10, f"{domain}: devotional_invocation too short"
        
        # Check embodiment_prompt
        assert "embodiment_prompt" in first_record, f"{domain}: Missing embodiment_prompt"
        assert isinstance(first_record["embodiment_prompt"], str), f"{domain}: embodiment_prompt should be string"
        assert len(first_record["embodiment_prompt"]) > 10, f"{domain}: embodiment_prompt too short"
        
        # Check integration_vow
        assert "integration_vow" in first_record, f"{domain}: Missing integration_vow"
        assert isinstance(first_record["integration_vow"], str), f"{domain}: integration_vow should be string"
        assert len(first_record["integration_vow"]) > 10, f"{domain}: integration_vow too short"
        
        print(f"PASS: {domain} - devotional fields present in first record")
        print(f"  - devotional_invocation: {first_record['devotional_invocation'][:60]}...")
        print(f"  - embodiment_prompt: {first_record['embodiment_prompt'][:60]}...")
        print(f"  - integration_vow: {first_record['integration_vow'][:60]}...")

    @pytest.mark.parametrize("endpoint,domain", DEVOTIONAL_ENDPOINTS)
    def test_endpoint_has_enriched_description(self, endpoint, domain):
        """Verify first record has enriched description text"""
        url = f"{BASE_URL}{endpoint}"
        response = self.session.get(url, timeout=15)
        
        assert response.status_code == 200, f"{domain}: Expected 200, got {response.status_code}"
        
        data = response.json()
        if len(data) == 0:
            pytest.skip(f"{domain}: No records returned")
        
        first_record = data[0]
        description = first_record.get("description", "")
        
        # Description should exist and have reasonable length
        assert description, f"{domain}: Missing description"
        assert len(description) >= 30, f"{domain}: Description too short ({len(description)} chars)"
        
        print(f"PASS: {domain} - description present ({len(description)} chars)")


class TestBreathworkDevotional:
    """Specific tests for breathwork sessions devotional enrichment"""

    def test_breathwork_sessions_list(self):
        """Verify breathwork sessions return with devotional fields"""
        url = f"{BASE_URL}/api/breathwork/sessions"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No breathwork sessions returned"
        
        # Check first session
        session = data[0]
        assert "devotional_invocation" in session
        assert "embodiment_prompt" in session
        assert "integration_vow" in session
        assert "name" in session
        
        print(f"PASS: Breathwork has {len(data)} sessions with devotional fields")


class TestMindfulnessDevotional:
    """Specific tests for mindfulness practices devotional enrichment"""

    def test_mindfulness_list(self):
        """Verify mindfulness practices return with devotional fields"""
        url = f"{BASE_URL}/api/mindfulness"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No mindfulness practices returned"
        
        # Check first practice
        practice = data[0]
        assert "devotional_invocation" in practice
        assert "embodiment_prompt" in practice
        assert "integration_vow" in practice
        
        print(f"PASS: Mindfulness has {len(data)} practices with devotional fields")


class TestMeditationsDevotional:
    """Specific tests for meditations devotional enrichment"""

    def test_meditations_list(self):
        """Verify meditations return with devotional fields"""
        url = f"{BASE_URL}/api/meditations"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No meditations returned"
        
        # Check first meditation
        meditation = data[0]
        assert "devotional_invocation" in meditation
        assert "embodiment_prompt" in meditation
        assert "integration_vow" in meditation
        
        print(f"PASS: Meditations has {len(data)} items with devotional fields")


class TestHealingPortalsDevotional:
    """Specific tests for healing portals devotional enrichment"""

    def test_healing_portals_list(self):
        """Verify healing portals return with devotional fields"""
        url = f"{BASE_URL}/api/healing-portals"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No healing portals returned"
        
        # Check first portal
        portal = data[0]
        assert "devotional_invocation" in portal
        assert "embodiment_prompt" in portal
        assert "integration_vow" in portal
        
        print(f"PASS: Healing Portals has {len(data)} items with devotional fields")


class TestHeartPracticesDevotional:
    """Specific tests for heart practices devotional enrichment"""

    def test_heart_practices_list(self):
        """Verify heart practices return with devotional fields"""
        url = f"{BASE_URL}/api/heart-practices"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No heart practices returned"
        
        # Check first practice
        practice = data[0]
        assert "devotional_invocation" in practice
        assert "embodiment_prompt" in practice
        assert "integration_vow" in practice
        
        print(f"PASS: Heart Practices has {len(data)} items with devotional fields")


class TestShamanicPracticesDevotional:
    """Specific tests for shamanic practices devotional enrichment"""

    def test_shamanic_practices_list(self):
        """Verify shamanic practices return with devotional fields"""
        url = f"{BASE_URL}/api/shamanic-practices"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No shamanic practices returned"
        
        # Check first practice
        practice = data[0]
        assert "devotional_invocation" in practice
        assert "embodiment_prompt" in practice
        assert "integration_vow" in practice
        
        print(f"PASS: Shamanic Practices has {len(data)} items with devotional fields")


class TestElementalPracticesDevotional:
    """Specific tests for elemental practices devotional enrichment"""

    def test_elemental_practices_list(self):
        """Verify elemental practices return with devotional fields"""
        url = f"{BASE_URL}/api/elemental-practices"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No elemental practices returned"
        
        # Check first practice
        practice = data[0]
        assert "devotional_invocation" in practice
        assert "embodiment_prompt" in practice
        assert "integration_vow" in practice
        
        print(f"PASS: Elemental Practices has {len(data)} items with devotional fields")


class TestFeminineEmbodimentDevotional:
    """Specific tests for feminine embodiment devotional enrichment"""

    def test_feminine_embodiment_list(self):
        """Verify feminine embodiment practices return with devotional fields"""
        url = f"{BASE_URL}/api/feminine-embodiment"
        response = requests.get(url, timeout=15)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No feminine embodiment practices returned"
        
        # Check first practice
        practice = data[0]
        assert "devotional_invocation" in practice
        assert "embodiment_prompt" in practice
        assert "integration_vow" in practice
        
        print(f"PASS: Feminine Embodiment has {len(data)} items with devotional fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
