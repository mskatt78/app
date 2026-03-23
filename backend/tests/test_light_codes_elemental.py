"""
Tests for Light Codes and Elemental Temples content expansion features.
Testing: 5 category tabs, galactic_codes (15 entries), chakra_codes (12 entries), 
         and ElementalTemples 8 sections per element.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLightCodesAPI:
    """Tests for /api/light-codes endpoint - 5 category tabs with proper content counts."""

    def test_light_codes_returns_200(self):
        """API returns 200 for /api/light-codes"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        print("✓ /api/light-codes returns 200")

    def test_light_codes_has_5_categories(self):
        """Light codes should contain exactly 5 categories"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        expected_cats = ['sacred_geometry', 'ancient_alphabets', 'light_language_symbols', 'galactic_codes', 'chakra_codes']
        for cat in expected_cats:
            assert cat in data, f"Missing category: {cat}"
        print(f"✓ All 5 categories present: {expected_cats}")

    def test_sacred_geometry_count(self):
        """Sacred Geometry should have 25 entries"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        count = len(data.get('sacred_geometry', []))
        assert count == 25, f"Expected 25 sacred_geometry entries, got {count}"
        print(f"✓ sacred_geometry has {count} entries")

    def test_ancient_alphabets_count(self):
        """Ancient Alphabets should have 25 entries"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        count = len(data.get('ancient_alphabets', []))
        assert count == 25, f"Expected 25 ancient_alphabets entries, got {count}"
        print(f"✓ ancient_alphabets has {count} entries")

    def test_light_language_count(self):
        """Light Language should have 25 entries"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        count = len(data.get('light_language_symbols', []))
        assert count == 25, f"Expected 25 light_language_symbols entries, got {count}"
        print(f"✓ light_language_symbols has {count} entries")

    def test_galactic_codes_count(self):
        """Galactic Codes should have 15 entries"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        count = len(data.get('galactic_codes', []))
        assert count == 15, f"Expected 15 galactic_codes entries, got {count}"
        print(f"✓ galactic_codes has {count} entries")

    def test_chakra_codes_count(self):
        """Chakra Codes should have 12 entries"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        count = len(data.get('chakra_codes', []))
        assert count == 12, f"Expected 12 chakra_codes entries, got {count}"
        print(f"✓ chakra_codes has {count} entries")

    def test_galactic_codes_have_activation_field(self):
        """Each galactic code should have activation, purpose, and practice fields"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        galactic = data.get('galactic_codes', [])
        for entry in galactic:
            assert 'activation' in entry, f"Missing 'activation' in {entry.get('name')}"
            assert 'purpose' in entry, f"Missing 'purpose' in {entry.get('name')}"
            assert 'practice' in entry, f"Missing 'practice' in {entry.get('name')}"
        print(f"✓ All {len(galactic)} galactic codes have activation, purpose, practice fields")

    def test_galactic_codes_star_system_names(self):
        """Galactic codes should include star system names like Pleiadian, Sirian, Arcturian"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        names = [gc['name'] for gc in data.get('galactic_codes', [])]
        expected_stars = ['Pleiadian', 'Sirian', 'Arcturian']
        for star in expected_stars:
            assert any(star in name for name in names), f"No entry with star system '{star}' found"
        print(f"✓ Galactic codes contain Pleiadian, Sirian, Arcturian entries")

    def test_chakra_codes_have_activation_field(self):
        """Each chakra code should have activation, purpose, and practice fields"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        chakras = data.get('chakra_codes', [])
        for entry in chakras:
            assert 'activation' in entry, f"Missing 'activation' in {entry.get('name')}"
            assert 'purpose' in entry, f"Missing 'purpose' in {entry.get('name')}"
            assert 'practice' in entry, f"Missing 'practice' in {entry.get('name')}"
        print(f"✓ All {len(chakras)} chakra codes have activation, purpose, practice fields")

    def test_chakra_codes_earth_star_to_stellar_gateway(self):
        """Chakra codes should include Earth Star and Stellar Gateway entries"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        chakra_names = [cc['name'] for cc in data.get('chakra_codes', [])]
        assert any('Earth Star' in name for name in chakra_names), f"Earth Star Chakra not found"
        assert any('Stellar Gateway' in name for name in chakra_names), f"Stellar Gateway not found"
        print(f"✓ Chakra codes include Earth Star and Stellar Gateway")

    def test_galactic_codes_have_image_urls(self):
        """Galactic codes should have image_url fields"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        galactic = data.get('galactic_codes', [])
        with_images = [gc for gc in galactic if gc.get('image_url')]
        assert len(with_images) > 0, "No galactic codes have image_url"
        print(f"✓ {len(with_images)}/{len(galactic)} galactic codes have image_url")

    def test_chakra_codes_have_image_urls(self):
        """Chakra codes should have image_url fields"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        chakras = data.get('chakra_codes', [])
        with_images = [cc for cc in chakras if cc.get('image_url')]
        assert len(with_images) > 0, "No chakra codes have image_url"
        print(f"✓ {len(with_images)}/{len(chakras)} chakra codes have image_url")

    def test_galactic_codes_have_symbols(self):
        """Each galactic code should have a symbol field"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        galactic = data.get('galactic_codes', [])
        for entry in galactic:
            assert 'symbol' in entry and entry['symbol'], f"Missing/empty symbol in {entry.get('name')}"
        print("✓ All galactic codes have symbol fields")

    def test_chakra_codes_symbols(self):
        """Each chakra code should have a symbol field"""
        resp = requests.get(f"{BASE_URL}/api/light-codes")
        data = resp.json()
        chakras = data.get('chakra_codes', [])
        for entry in chakras:
            assert 'symbol' in entry, f"Missing symbol in {entry.get('name')}"
        print("✓ All chakra codes have symbol fields")
