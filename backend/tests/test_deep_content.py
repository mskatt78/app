"""
Test deep philosophical content in chakras and embodiment practices.
Verifies that 'deeper_teaching' and 'somatic_practice' fields have rich content.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestChakraDeepContent:
    """Test chakra cleansing content has deep philosophical teachings"""
    
    def test_chakra_cleansing_endpoint_returns_data(self):
        """Verify chakra-cleansing endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10, f"Expected at least 10 chakras, got {len(data)}"
        print(f"PASS: Chakra cleansing endpoint returns {len(data)} chakras")
    
    def test_causal_chakra_has_deep_content(self):
        """Verify Causal chakra has deeper_teaching > 2000 chars"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        
        causal = next((c for c in data if 'causal' in c.get('chakra', '').lower()), None)
        assert causal is not None, "Causal chakra not found"
        
        deeper_teaching = causal.get('deeper_teaching', '')
        assert len(deeper_teaching) > 2000, f"Causal deeper_teaching too short: {len(deeper_teaching)} chars"
        print(f"PASS: Causal chakra deeper_teaching has {len(deeper_teaching)} chars")
        
        # Verify it contains philosophical content
        assert 'karma' in deeper_teaching.lower() or 'soul' in deeper_teaching.lower() or 'divine' in deeper_teaching.lower(), \
            "Causal deeper_teaching should contain philosophical terms"
    
    def test_stellar_gateway_has_deep_content(self):
        """Verify Stellar Gateway chakra has deep cosmic consciousness teachings"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        
        stellar = next((c for c in data if 'stellar' in c.get('chakra', '').lower()), None)
        assert stellar is not None, "Stellar Gateway chakra not found"
        
        deeper_teaching = stellar.get('deeper_teaching', '')
        assert len(deeper_teaching) > 300, f"Stellar Gateway deeper_teaching too short: {len(deeper_teaching)} chars"
        print(f"PASS: Stellar Gateway deeper_teaching has {len(deeper_teaching)} chars")
        
        # Verify cosmic content
        assert 'cosmic' in deeper_teaching.lower() or 'galactic' in deeper_teaching.lower() or 'star' in deeper_teaching.lower(), \
            "Stellar Gateway should contain cosmic/galactic terms"
    
    def test_universal_gateway_has_deep_content(self):
        """Verify Universal Gateway chakra has deep Source connection teachings"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        
        universal = next((c for c in data if 'universal' in c.get('chakra', '').lower()), None)
        assert universal is not None, "Universal Gateway chakra not found"
        
        deeper_teaching = universal.get('deeper_teaching', '')
        assert len(deeper_teaching) > 300, f"Universal Gateway deeper_teaching too short: {len(deeper_teaching)} chars"
        print(f"PASS: Universal Gateway deeper_teaching has {len(deeper_teaching)} chars")
        
        # Verify Source connection content
        assert 'source' in deeper_teaching.lower() or 'divine' in deeper_teaching.lower() or 'unity' in deeper_teaching.lower(), \
            "Universal Gateway should contain Source/divine terms"
    
    def test_all_chakras_have_deeper_teaching(self):
        """Verify all 13 chakras have deeper_teaching field with content"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        
        chakras_with_teaching = 0
        chakras_missing_teaching = []
        
        for chakra in data:
            deeper_teaching = chakra.get('deeper_teaching', '')
            if len(deeper_teaching) > 300:
                chakras_with_teaching += 1
            else:
                chakras_missing_teaching.append(f"{chakra.get('chakra', 'Unknown')} ({len(deeper_teaching)} chars)")
        
        print(f"Chakras with deep teaching: {chakras_with_teaching}/{len(data)}")
        if chakras_missing_teaching:
            print(f"Chakras missing/short teaching: {chakras_missing_teaching}")
        
        # At least 10 chakras should have deep content
        assert chakras_with_teaching >= 10, f"Only {chakras_with_teaching} chakras have deep teaching"


class TestFeminineEmbodimentDeepContent:
    """Test feminine embodiment practices have deep philosophical teachings"""
    
    def test_feminine_embodiment_endpoint_returns_data(self):
        """Verify feminine-embodiment endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10, f"Expected at least 10 practices, got {len(data)}"
        print(f"PASS: Feminine embodiment endpoint returns {len(data)} practices")
    
    def test_all_feminine_practices_have_deeper_teaching(self):
        """Verify all 13 feminine embodiment practices have deeper_teaching"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_teaching = 0
        practices_missing_teaching = []
        
        for practice in data:
            deeper_teaching = practice.get('deeper_teaching', '')
            if len(deeper_teaching) > 300:
                practices_with_teaching += 1
            else:
                practices_missing_teaching.append(f"{practice.get('name', 'Unknown')} ({len(deeper_teaching)} chars)")
        
        print(f"Feminine practices with deep teaching: {practices_with_teaching}/{len(data)}")
        if practices_missing_teaching:
            print(f"Practices missing/short teaching: {practices_missing_teaching}")
        
        # All 13 practices should have deep content
        assert practices_with_teaching >= 13, f"Only {practices_with_teaching} practices have deep teaching"
    
    def test_feminine_practices_have_somatic_practice(self):
        """Verify feminine embodiment practices have somatic_practice field"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_somatic = 0
        for practice in data:
            somatic = practice.get('somatic_practice', '') or practice.get('practice_guide', '')
            if len(somatic) > 100:
                practices_with_somatic += 1
        
        print(f"Feminine practices with somatic/practice guide: {practices_with_somatic}/{len(data)}")
        assert practices_with_somatic >= 10, f"Only {practices_with_somatic} practices have somatic content"


class TestMasculineEmbodimentDeepContent:
    """Test masculine embodiment practices have deep philosophical teachings"""
    
    def test_masculine_embodiment_endpoint_returns_data(self):
        """Verify masculine-embodiment endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10, f"Expected at least 10 practices, got {len(data)}"
        print(f"PASS: Masculine embodiment endpoint returns {len(data)} practices")
    
    def test_all_masculine_practices_have_deeper_teaching(self):
        """Verify all 13 masculine embodiment practices have deeper_teaching"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_teaching = 0
        practices_missing_teaching = []
        
        for practice in data:
            deeper_teaching = practice.get('deeper_teaching', '')
            if len(deeper_teaching) > 300:
                practices_with_teaching += 1
            else:
                practices_missing_teaching.append(f"{practice.get('name', 'Unknown')} ({len(deeper_teaching)} chars)")
        
        print(f"Masculine practices with deep teaching: {practices_with_teaching}/{len(data)}")
        if practices_missing_teaching:
            print(f"Practices missing/short teaching: {practices_missing_teaching}")
        
        # All 13 practices should have deep content
        assert practices_with_teaching >= 13, f"Only {practices_with_teaching} practices have deep teaching"
    
    def test_masculine_practices_have_somatic_practice(self):
        """Verify masculine embodiment practices have somatic_practice field"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        data = response.json()
        
        practices_with_somatic = 0
        for practice in data:
            somatic = practice.get('somatic_practice', '') or practice.get('practice_guide', '')
            if len(somatic) > 100:
                practices_with_somatic += 1
        
        print(f"Masculine practices with somatic/practice guide: {practices_with_somatic}/{len(data)}")
        assert practices_with_somatic >= 10, f"Only {practices_with_somatic} practices have somatic content"


class TestContentQuality:
    """Test overall content quality and structure"""
    
    def test_chakra_content_structure(self):
        """Verify chakra content has expected fields"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'chakra', 'name', 'description']
        optional_deep_fields = ['deeper_teaching', 'somatic_practice', 'cleansing_guide']
        
        for chakra in data[:3]:  # Check first 3
            for field in required_fields:
                assert field in chakra, f"Missing required field: {field}"
            
            # Check at least one deep field exists
            has_deep_field = any(chakra.get(f) for f in optional_deep_fields)
            assert has_deep_field, f"Chakra {chakra.get('name')} missing all deep content fields"
        
        print("PASS: Chakra content structure is valid")
    
    def test_embodiment_content_structure(self):
        """Verify embodiment content has expected fields"""
        for endpoint in ['/api/feminine-embodiment', '/api/masculine-embodiment']:
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code == 200
            data = response.json()
            
            required_fields = ['id', 'name', 'description', 'category']
            
            for practice in data[:3]:  # Check first 3
                for field in required_fields:
                    assert field in practice, f"Missing required field: {field} in {endpoint}"
            
            print(f"PASS: {endpoint} content structure is valid")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
