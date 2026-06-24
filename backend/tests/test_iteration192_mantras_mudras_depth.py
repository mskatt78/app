"""
Iteration 192 - Mantras & Mudras Master-Level Depth Testing
Tests enriched fields: master_embodiment_protocol and youtube_tutorials
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestMantrasEnrichedFields:
    """Tests for /api/mantras endpoint enriched fields"""

    def test_mantras_endpoint_returns_200(self):
        """Verify mantras endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mantras"
        assert len(data) > 0, "Expected at least one mantra"

    def test_mantras_have_master_embodiment_protocol(self):
        """Verify each mantra has master_embodiment_protocol with required sections"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        mantras = response.json()
        
        for mantra in mantras[:5]:  # Test first 5 mantras
            assert "master_embodiment_protocol" in mantra, f"Mantra {mantra.get('name')} missing master_embodiment_protocol"
            protocol = mantra["master_embodiment_protocol"]
            
            # Check required sections
            assert "preparation_phase" in protocol, f"Mantra {mantra.get('name')} missing preparation_phase"
            assert "embodiment_phase" in protocol, f"Mantra {mantra.get('name')} missing embodiment_phase"
            assert "integration_phase" in protocol, f"Mantra {mantra.get('name')} missing integration_phase"
            assert "seven_day_embodiment" in protocol, f"Mantra {mantra.get('name')} missing seven_day_embodiment"
            
            # Verify each section has content
            assert len(protocol["preparation_phase"]) >= 2, f"Mantra {mantra.get('name')} preparation_phase too short"
            assert len(protocol["embodiment_phase"]) >= 2, f"Mantra {mantra.get('name')} embodiment_phase too short"
            assert len(protocol["integration_phase"]) >= 2, f"Mantra {mantra.get('name')} integration_phase too short"
            assert len(protocol["seven_day_embodiment"]) == 7, f"Mantra {mantra.get('name')} seven_day_embodiment should have 7 days"

    def test_mantras_have_youtube_tutorials(self):
        """Verify each mantra has youtube_tutorials array"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        mantras = response.json()
        
        for mantra in mantras[:5]:  # Test first 5 mantras
            assert "youtube_tutorials" in mantra, f"Mantra {mantra.get('name')} missing youtube_tutorials"
            tutorials = mantra["youtube_tutorials"]
            
            assert isinstance(tutorials, list), f"Mantra {mantra.get('name')} youtube_tutorials should be a list"
            assert len(tutorials) >= 1, f"Mantra {mantra.get('name')} should have at least 1 tutorial"
            
            for tutorial in tutorials:
                assert "title" in tutorial, "Tutorial missing title"
                assert "url" in tutorial, "Tutorial missing url"
                assert "platform" in tutorial, "Tutorial missing platform"
                assert tutorial["platform"] == "youtube", "Platform should be youtube"
                assert "youtube.com" in tutorial["url"], "URL should contain youtube.com"

    def test_mantra_youtube_urls_are_valid_search_queries(self):
        """Verify YouTube URLs are properly formatted search queries"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        mantras = response.json()
        
        first_mantra = mantras[0]
        tutorials = first_mantra.get("youtube_tutorials", [])
        
        for tutorial in tutorials:
            url = tutorial["url"]
            assert "youtube.com/results?search_query=" in url, f"URL should be a search query: {url}"


class TestMudrasEnrichedFields:
    """Tests for /api/mudras endpoint enriched fields"""

    def test_mudras_endpoint_returns_200(self):
        """Verify mudras endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mudras"
        assert len(data) > 0, "Expected at least one mudra"

    def test_mudras_have_master_embodiment_protocol(self):
        """Verify each mudra has master_embodiment_protocol with required sections"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        
        for mudra in mudras[:5]:  # Test first 5 mudras
            assert "master_embodiment_protocol" in mudra, f"Mudra {mudra.get('name')} missing master_embodiment_protocol"
            protocol = mudra["master_embodiment_protocol"]
            
            # Check required sections
            assert "preparation_phase" in protocol, f"Mudra {mudra.get('name')} missing preparation_phase"
            assert "embodiment_phase" in protocol, f"Mudra {mudra.get('name')} missing embodiment_phase"
            assert "integration_phase" in protocol, f"Mudra {mudra.get('name')} missing integration_phase"
            assert "seven_day_embodiment" in protocol, f"Mudra {mudra.get('name')} missing seven_day_embodiment"
            
            # Verify each section has content
            assert len(protocol["preparation_phase"]) >= 2, f"Mudra {mudra.get('name')} preparation_phase too short"
            assert len(protocol["embodiment_phase"]) >= 2, f"Mudra {mudra.get('name')} embodiment_phase too short"
            assert len(protocol["integration_phase"]) >= 2, f"Mudra {mudra.get('name')} integration_phase too short"
            assert len(protocol["seven_day_embodiment"]) == 7, f"Mudra {mudra.get('name')} seven_day_embodiment should have 7 days"

    def test_mudras_have_youtube_tutorials(self):
        """Verify each mudra has youtube_tutorials array"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        
        for mudra in mudras[:5]:  # Test first 5 mudras
            assert "youtube_tutorials" in mudra, f"Mudra {mudra.get('name')} missing youtube_tutorials"
            tutorials = mudra["youtube_tutorials"]
            
            assert isinstance(tutorials, list), f"Mudra {mudra.get('name')} youtube_tutorials should be a list"
            assert len(tutorials) >= 1, f"Mudra {mudra.get('name')} should have at least 1 tutorial"
            
            for tutorial in tutorials:
                assert "title" in tutorial, "Tutorial missing title"
                assert "url" in tutorial, "Tutorial missing url"
                assert "platform" in tutorial, "Tutorial missing platform"
                assert tutorial["platform"] == "youtube", "Platform should be youtube"
                assert "youtube.com" in tutorial["url"], "URL should contain youtube.com"

    def test_mudra_youtube_urls_are_valid_search_queries(self):
        """Verify YouTube URLs are properly formatted search queries"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        
        first_mudra = mudras[0]
        tutorials = first_mudra.get("youtube_tutorials", [])
        
        for tutorial in tutorials:
            url = tutorial["url"]
            assert "youtube.com/results?search_query=" in url, f"URL should be a search query: {url}"


class TestMantrasAndMudrasDataQuality:
    """Data quality tests for mantras and mudras enriched content"""

    def test_mantra_protocol_content_is_meaningful(self):
        """Verify mantra protocol content is not empty placeholder text"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        mantras = response.json()
        
        first_mantra = mantras[0]
        protocol = first_mantra["master_embodiment_protocol"]
        
        # Check preparation phase has meaningful content
        prep_text = " ".join(protocol["preparation_phase"])
        assert len(prep_text) > 100, "Preparation phase content too short"
        assert "breath" in prep_text.lower() or "spine" in prep_text.lower(), "Preparation should mention breath or spine"
        
        # Check seven_day_embodiment has day references
        for i, day in enumerate(protocol["seven_day_embodiment"]):
            assert f"Day {i+1}" in day, f"Day {i+1} should be labeled correctly"

    def test_mudra_protocol_content_is_meaningful(self):
        """Verify mudra protocol content is not empty placeholder text"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        
        first_mudra = mudras[0]
        protocol = first_mudra["master_embodiment_protocol"]
        
        # Check preparation phase has meaningful content
        prep_text = " ".join(protocol["preparation_phase"])
        assert len(prep_text) > 100, "Preparation phase content too short"
        
        # Check seven_day_embodiment has day references
        for i, day in enumerate(protocol["seven_day_embodiment"]):
            assert f"Day {i+1}" in day, f"Day {i+1} should be labeled correctly"

    def test_youtube_tutorial_titles_include_practice_name(self):
        """Verify YouTube tutorial titles include the practice name"""
        # Test mantras
        response = requests.get(f"{BASE_URL}/api/mantras")
        mantras = response.json()
        first_mantra = mantras[0]
        mantra_name = first_mantra["name"]
        
        for tutorial in first_mantra["youtube_tutorials"]:
            assert mantra_name in tutorial["title"], f"Tutorial title should include mantra name: {mantra_name}"
        
        # Test mudras
        response = requests.get(f"{BASE_URL}/api/mudras")
        mudras = response.json()
        first_mudra = mudras[0]
        mudra_name = first_mudra["name"]
        
        for tutorial in first_mudra["youtube_tutorials"]:
            assert mudra_name in tutorial["title"], f"Tutorial title should include mudra name: {mudra_name}"
