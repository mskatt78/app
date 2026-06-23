"""
Test Sacred Ally Alchemy Expansion - Iteration 184
Tests expanded categories: Elemental Dragons, Sophia Alchemy, Ascended Masters, Earth Allies, Galactic Allies
Tests expanded Angelic Alchemy: Uriel, Zadkiel, Chamuel, Jophiel
Verifies Wikimedia image URLs and diagram paths
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestSacredAllyAlchemyExpansion:
    """Test expanded Sacred Ally Alchemy API content"""

    def test_sacred_ally_alchemy_endpoint_returns_data(self):
        """Verify /api/sacred-ally-alchemy returns expanded entries"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 23, f"Expected at least 23 ally entries, got {len(data)}"
        print(f"PASSED: Sacred Ally Alchemy API returns {len(data)} entries")

    def test_angelic_alchemy_endpoint_returns_data(self):
        """Verify /api/angelic-alchemy returns expanded entries"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 8, f"Expected at least 8 angelic entries, got {len(data)}"
        print(f"PASSED: Angelic Alchemy API returns {len(data)} entries")

    def test_elemental_dragons_category_present(self):
        """Verify Elemental Dragons category entries exist"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        dragon_entries = [e for e in data if e.get('category') == 'elemental_dragons']
        
        assert len(dragon_entries) >= 5, f"Expected at least 5 elemental dragon entries, got {len(dragon_entries)}"
        
        # Check for specific elemental dragons
        dragon_ids = [e.get('id') for e in dragon_entries]
        expected_dragons = [
            'ally-dragon-fire-phoenix-current',
            'ally-dragon-water-lunar-current',
            'ally-dragon-air-feathered-current',
            'ally-dragon-earth-root-current',
            'ally-dragon-spirit-aether-current'
        ]
        
        for dragon_id in expected_dragons:
            assert dragon_id in dragon_ids, f"Missing elemental dragon: {dragon_id}"
        
        print(f"PASSED: Found {len(dragon_entries)} elemental dragon entries")

    def test_sophia_alchemy_category_present(self):
        """Verify Sophia Alchemy category entry exists"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        sophia_entries = [e for e in data if e.get('category') == 'sophia_alchemy']
        
        assert len(sophia_entries) >= 1, f"Expected at least 1 Sophia entry, got {len(sophia_entries)}"
        
        sophia = sophia_entries[0]
        assert 'ally-sophia-wisdom-stream' == sophia.get('id'), "Missing Sophia Wisdom Stream entry"
        assert 'Sophia' in sophia.get('name', ''), "Sophia name not found"
        
        print(f"PASSED: Found Sophia Alchemy entry")

    def test_ascended_masters_category_present(self):
        """Verify Ascended Masters category entries exist"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        master_entries = [e for e in data if e.get('category') == 'ascended_masters']
        
        assert len(master_entries) >= 2, f"Expected at least 2 Ascended Master entries, got {len(master_entries)}"
        
        master_ids = [e.get('id') for e in master_entries]
        assert 'ally-ascended-master-st-germain' in master_ids, "Missing St. Germain entry"
        assert 'ally-ascended-master-thoth' in master_ids, "Missing Thoth entry"
        
        print(f"PASSED: Found {len(master_entries)} Ascended Master entries")

    def test_earth_allies_category_present(self):
        """Verify Earth Allies category entries exist"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        earth_entries = [e for e in data if e.get('category') == 'earth_allies']
        
        assert len(earth_entries) >= 4, f"Expected at least 4 Earth Ally entries, got {len(earth_entries)}"
        
        earth_ids = [e.get('id') for e in earth_entries]
        expected_earth = [
            'ally-earth-oak-elder',
            'ally-earth-honeybee-alliance',
            'ally-earth-mycelium-network',
            'ally-earth-redwood-guardian'
        ]
        
        for earth_id in expected_earth:
            assert earth_id in earth_ids, f"Missing Earth Ally: {earth_id}"
        
        print(f"PASSED: Found {len(earth_entries)} Earth Ally entries")

    def test_galactic_allies_category_present(self):
        """Verify Galactic Allies category entries exist"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        galactic_entries = [e for e in data if e.get('category') == 'galactic_allies']
        
        assert len(galactic_entries) >= 4, f"Expected at least 4 Galactic Ally entries, got {len(galactic_entries)}"
        
        galactic_ids = [e.get('id') for e in galactic_entries]
        expected_galactic = [
            'ally-galactic-pleiades-harmonic',
            'ally-galactic-sirius-focus',
            'ally-galactic-andromeda-perspective',
            'ally-galactic-orion-creation-field'
        ]
        
        for galactic_id in expected_galactic:
            assert galactic_id in galactic_ids, f"Missing Galactic Ally: {galactic_id}"
        
        print(f"PASSED: Found {len(galactic_entries)} Galactic Ally entries")

    def test_expanded_archangels_present(self):
        """Verify newly added archangels in Angelic Alchemy"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        angel_ids = [e.get('id') for e in data]
        
        # New archangels added in expansion
        new_archangels = [
            'angel-uriel-golden-wisdom',
            'angel-zadkiel-mercy-violet',
            'angel-chamuel-heart-peace',
            'angel-jophiel-illumination'
        ]
        
        for angel_id in new_archangels:
            assert angel_id in angel_ids, f"Missing new archangel: {angel_id}"
        
        print(f"PASSED: All 4 new archangels present in Angelic Alchemy")

    def test_entry_has_full_depth_content(self):
        """Verify entries have teachings, rituals, prompts, affirmations"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        
        # Sample a few entries from different categories
        sample_ids = [
            'ally-dragon-fire-phoenix-current',
            'ally-sophia-wisdom-stream',
            'ally-ascended-master-st-germain',
            'ally-earth-oak-elder',
            'ally-galactic-pleiades-harmonic'
        ]
        
        for entry_id in sample_ids:
            entry = next((e for e in data if e.get('id') == entry_id), None)
            assert entry is not None, f"Entry {entry_id} not found"
            
            # Check full-depth content fields
            assert 'alchemy_teachings' in entry and len(entry['alchemy_teachings']) >= 3, f"{entry_id} missing alchemy_teachings"
            assert 'rituals' in entry and len(entry['rituals']) >= 3, f"{entry_id} missing rituals"
            assert 'journal_prompts' in entry and len(entry['journal_prompts']) >= 3, f"{entry_id} missing journal_prompts"
            assert 'affirmations' in entry and len(entry['affirmations']) >= 3, f"{entry_id} missing affirmations"
            
            print(f"  - {entry_id}: Full depth content verified")
        
        print(f"PASSED: All sampled entries have full-depth content")

    def test_wikimedia_image_urls(self):
        """Verify image URLs are Wikimedia upload URLs"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        
        # Sample entries that should have Wikimedia URLs
        sample_ids = [
            'ally-dragon-fire-phoenix-current',
            'ally-sophia-wisdom-stream',
            'ally-ascended-master-st-germain',
            'ally-earth-oak-elder',
            'ally-galactic-pleiades-harmonic'
        ]
        
        wikimedia_count = 0
        for entry_id in sample_ids:
            entry = next((e for e in data if e.get('id') == entry_id), None)
            if entry:
                image_url = entry.get('image_url', '')
                if 'upload.wikimedia.org' in image_url or 'wikimedia.org' in image_url:
                    wikimedia_count += 1
                    print(f"  - {entry_id}: Wikimedia URL verified")
                else:
                    print(f"  - {entry_id}: Non-Wikimedia URL: {image_url[:60]}...")
        
        assert wikimedia_count >= 3, f"Expected at least 3 Wikimedia URLs in sample, got {wikimedia_count}"
        print(f"PASSED: {wikimedia_count}/{len(sample_ids)} sampled entries have Wikimedia URLs")

    def test_diagram_image_urls_present(self):
        """Verify diagram_image_url field is present in entries"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        
        # Sample entries that should have diagram URLs
        sample_ids = [
            'ally-dragon-fire-phoenix-current',
            'ally-sophia-wisdom-stream',
            'ally-ascended-master-st-germain'
        ]
        
        for entry_id in sample_ids:
            entry = next((e for e in data if e.get('id') == entry_id), None)
            assert entry is not None, f"Entry {entry_id} not found"
            
            diagram_url = entry.get('diagram_image_url', '')
            assert diagram_url, f"{entry_id} missing diagram_image_url"
            assert diagram_url.startswith('/diagrams/'), f"{entry_id} diagram URL should start with /diagrams/"
            assert diagram_url.endswith('.svg'), f"{entry_id} diagram URL should end with .svg"
            
            print(f"  - {entry_id}: diagram_image_url = {diagram_url}")
        
        print(f"PASSED: All sampled entries have diagram_image_url")


class TestDiagramAssetLoading:
    """Test that diagram SVG assets load correctly"""

    def test_new_diagram_files_load(self):
        """Verify new diagram SVG files return HTTP 200"""
        new_diagrams = [
            '/diagrams/dragon-fire-current-diagram.svg',
            '/diagrams/dragon-water-current-diagram.svg',
            '/diagrams/dragon-air-current-diagram.svg',
            '/diagrams/dragon-earth-current-diagram.svg',
            '/diagrams/dragon-spirit-current-diagram.svg',
            '/diagrams/sophia-wisdom-diagram.svg',
            '/diagrams/st-germain-violet-flame-diagram.svg',
            '/diagrams/thoth-language-diagram.svg',
            '/diagrams/oak-rootedness-diagram.svg',
            '/diagrams/honeybee-pollination-diagram.svg',
            '/diagrams/mycelium-network-diagram.svg',
            '/diagrams/redwood-axis-diagram.svg',
            '/diagrams/pleiades-harmonic-diagram.svg',
            '/diagrams/sirius-focus-diagram.svg',
            '/diagrams/andromeda-perspective-diagram.svg',
            '/diagrams/orion-creation-diagram.svg',
            '/diagrams/uriel-wisdom-diagram.svg',
            '/diagrams/zadkiel-mercy-diagram.svg',
            '/diagrams/chamuel-heart-peace-diagram.svg',
            '/diagrams/jophiel-illumination-diagram.svg'
        ]
        
        passed = 0
        failed = []
        
        for diagram_path in new_diagrams:
            url = f"{BASE_URL}{diagram_path}"
            try:
                response = requests.head(url, timeout=10)
                if response.status_code == 200:
                    passed += 1
                    print(f"  - {diagram_path}: HTTP 200")
                else:
                    failed.append(f"{diagram_path}: HTTP {response.status_code}")
            except Exception as e:
                failed.append(f"{diagram_path}: Error - {str(e)}")
        
        if failed:
            print(f"FAILED diagrams: {failed}")
        
        assert passed >= len(new_diagrams) * 0.8, f"Expected at least 80% diagrams to load, got {passed}/{len(new_diagrams)}"
        print(f"PASSED: {passed}/{len(new_diagrams)} diagram files load successfully")


class TestNoCuratedContentWording:
    """Verify no 'Curated content' wording appears in API responses"""

    def test_sacred_ally_no_curated_wording(self):
        """Verify Sacred Ally API response has no 'curated content' text"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy", timeout=30)
        assert response.status_code == 200
        
        response_text = response.text.lower()
        assert 'curated content' not in response_text, "Found 'curated content' in Sacred Ally API response"
        assert 'curated reference' not in response_text, "Found 'curated reference' in Sacred Ally API response"
        
        print("PASSED: No 'curated content' wording in Sacred Ally API response")

    def test_angelic_no_curated_wording(self):
        """Verify Angelic Alchemy API response has no 'curated content' text"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy", timeout=30)
        assert response.status_code == 200
        
        response_text = response.text.lower()
        assert 'curated content' not in response_text, "Found 'curated content' in Angelic API response"
        assert 'curated reference' not in response_text, "Found 'curated reference' in Angelic API response"
        
        print("PASSED: No 'curated content' wording in Angelic Alchemy API response")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
