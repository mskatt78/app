"""
Test for Inner Polarity Harmonization rename verification
Tests that the old phrases 'Masculine & Feminine Integration' and 'Gender Principle Integration'
have been replaced with 'Inner Polarity Harmonization' and 'Receptive & Projective Integration'
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestInnerPolarityRename:
    """Verify the terminology rename from 'Masculine & Feminine Integration' to 'Inner Polarity Harmonization'"""

    def test_mystery_school_emerald_tablet_endpoint_returns_renamed_content(self):
        """Test that /api/mystery-school?stream=emerald_tablet returns mystery-emerald-007 with new name"""
        response = requests.get(f"{BASE_URL}/api/mystery-school?stream=emerald_tablet")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        
        # Find mystery-emerald-007
        emerald_007 = None
        for item in data:
            if item.get('id') == 'mystery-emerald-007':
                emerald_007 = item
                break
        
        assert emerald_007 is not None, "mystery-emerald-007 not found in response"
        
        # Verify renamed content
        assert emerald_007.get('name') == 'Inner Polarity Harmonization', \
            f"Expected name 'Inner Polarity Harmonization', got '{emerald_007.get('name')}'"
        
        assert emerald_007.get('title') == 'Receptive & Projective Integration', \
            f"Expected title 'Receptive & Projective Integration', got '{emerald_007.get('title')}'"

    def test_old_phrase_not_in_mystery_school_response(self):
        """Test that old phrases are NOT present in the mystery school response"""
        response = requests.get(f"{BASE_URL}/api/mystery-school?stream=emerald_tablet")
        assert response.status_code == 200
        
        response_text = response.text
        
        # Old phrases should NOT be present
        assert 'Masculine & Feminine Integration' not in response_text, \
            "Old phrase 'Masculine & Feminine Integration' still present in API response"
        
        assert 'Gender Principle Integration' not in response_text, \
            "Old phrase 'Gender Principle Integration' still present in API response"

    def test_mystery_school_endpoint_accessible(self):
        """Test that the mystery school endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/mystery-school?stream=emerald_tablet")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Expected non-empty response"

    def test_emerald_tablet_stream_has_expected_teachings(self):
        """Test that emerald_tablet stream has the expected number of teachings"""
        response = requests.get(f"{BASE_URL}/api/mystery-school?stream=emerald_tablet")
        assert response.status_code == 200
        
        data = response.json()
        # Should have multiple emerald tablet teachings
        emerald_teachings = [item for item in data if item.get('stream') == 'emerald_tablet']
        assert len(emerald_teachings) >= 10, f"Expected at least 10 emerald tablet teachings, got {len(emerald_teachings)}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
