"""
Iteration 180 - Sacred Ally Alchemy & Angelic Alchemy Feature Tests

Tests for:
- GET /api/sacred-ally-alchemy returns seeded ally entries with teachings/rituals/journal/affirmations
- GET /api/angelic-alchemy returns seeded angelic entries including Metatron geometry
- Whale entry exposes dedicated song_lines and song_line_practices in API
- Admin generic collections endpoint includes sacred_ally_alchemy and angelic_alchemy collections
- Admin item CRUD for these new collections works (create/update/delete)
"""

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestSacredAllyAlchemyAPI:
    """Tests for GET /api/sacred-ally-alchemy endpoint"""

    def test_sacred_ally_alchemy_returns_200(self):
        """API returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: GET /api/sacred-ally-alchemy returns 200")

    def test_sacred_ally_alchemy_returns_list(self):
        """API returns a list of allies"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) >= 5, f"Expected at least 5 allies, got {len(data)}"
        print(f"PASSED: Returns {len(data)} sacred ally entries")

    def test_sacred_ally_has_required_fields(self):
        """Each ally has required fields: id, name, ally_type, category, element, description"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        required_fields = ["id", "name", "ally_type", "category", "element", "description"]
        for ally in data:
            for field in required_fields:
                assert field in ally, f"Missing field '{field}' in ally {ally.get('id', 'unknown')}"
        print("PASSED: All allies have required base fields")

    def test_sacred_ally_has_teachings_rituals_journal_affirmations(self):
        """Each ally has alchemy_teachings, rituals, journal_prompts, affirmations"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        content_fields = ["alchemy_teachings", "rituals", "journal_prompts", "affirmations"]
        for ally in data:
            for field in content_fields:
                assert field in ally, f"Missing field '{field}' in ally {ally.get('name', 'unknown')}"
                assert isinstance(ally[field], list), f"Field '{field}' should be a list"
                assert len(ally[field]) >= 1, f"Field '{field}' should have at least 1 item"
        print("PASSED: All allies have teachings, rituals, journal prompts, and affirmations")

    def test_sacred_ally_has_content_integrity(self):
        """Each ally has content_integrity with source_type and verified status"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        for ally in data:
            assert "content_integrity" in ally, f"Missing content_integrity in {ally.get('name')}"
            ci = ally["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
        print("PASSED: All allies have content_integrity metadata")

    def test_dragon_ally_present(self):
        """Dragon ally is present with correct category"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        dragons = [a for a in data if a.get("ally_type") == "dragon"]
        assert len(dragons) >= 1, "Expected at least 1 dragon ally"
        dragon = dragons[0]
        assert dragon["category"] == "dragon", f"Dragon category should be 'dragon', got {dragon['category']}"
        print(f"PASSED: Dragon ally present: {dragon['name']}")

    def test_fairy_ally_present(self):
        """Fairy ally is present with correct category"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        fairies = [a for a in data if a.get("ally_type") == "fairy"]
        assert len(fairies) >= 1, "Expected at least 1 fairy ally"
        fairy = fairies[0]
        assert fairy["category"] == "fairies", f"Fairy category should be 'fairies', got {fairy['category']}"
        print(f"PASSED: Fairy ally present: {fairy['name']}")

    def test_wolf_ally_present(self):
        """Wolf ally is present with correct category"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        wolves = [a for a in data if a.get("ally_type") == "wolf"]
        assert len(wolves) >= 1, "Expected at least 1 wolf ally"
        wolf = wolves[0]
        assert wolf["category"] == "wolves", f"Wolf category should be 'wolves', got {wolf['category']}"
        print(f"PASSED: Wolf ally present: {wolf['name']}")

    def test_dolphin_ally_present(self):
        """Dolphin ally is present with correct category"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        dolphins = [a for a in data if a.get("ally_type") == "dolphin"]
        assert len(dolphins) >= 1, "Expected at least 1 dolphin ally"
        dolphin = dolphins[0]
        assert dolphin["category"] == "dolphins", f"Dolphin category should be 'dolphins', got {dolphin['category']}"
        print(f"PASSED: Dolphin ally present: {dolphin['name']}")


class TestWhaleAllyWithSongLines:
    """Tests for Whale ally with dedicated Song Lines feature"""

    def test_whale_ally_present(self):
        """Whale ally is present with correct category"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        whales = [a for a in data if a.get("ally_type") == "whale"]
        assert len(whales) >= 1, "Expected at least 1 whale ally"
        whale = whales[0]
        assert whale["category"] == "whales", f"Whale category should be 'whales', got {whale['category']}"
        print(f"PASSED: Whale ally present: {whale['name']}")

    def test_whale_has_song_lines(self):
        """Whale ally has dedicated song_lines field"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        whales = [a for a in data if a.get("ally_type") == "whale"]
        assert len(whales) >= 1, "Expected at least 1 whale ally"
        whale = whales[0]
        assert "song_lines" in whale, "Whale should have song_lines field"
        assert isinstance(whale["song_lines"], list), "song_lines should be a list"
        assert len(whale["song_lines"]) >= 3, f"Expected at least 3 song lines, got {len(whale['song_lines'])}"
        print(f"PASSED: Whale has {len(whale['song_lines'])} song lines")

    def test_whale_has_song_line_practices(self):
        """Whale ally has dedicated song_line_practices field"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        whales = [a for a in data if a.get("ally_type") == "whale"]
        assert len(whales) >= 1, "Expected at least 1 whale ally"
        whale = whales[0]
        assert "song_line_practices" in whale, "Whale should have song_line_practices field"
        assert isinstance(whale["song_line_practices"], list), "song_line_practices should be a list"
        assert len(whale["song_line_practices"]) >= 3, f"Expected at least 3 practices, got {len(whale['song_line_practices'])}"
        print(f"PASSED: Whale has {len(whale['song_line_practices'])} song line practices")

    def test_whale_song_lines_content(self):
        """Whale song lines contain meaningful content"""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        data = response.json()
        whales = [a for a in data if a.get("ally_type") == "whale"]
        whale = whales[0]
        for line in whale["song_lines"]:
            assert len(line) > 20, f"Song line too short: {line}"
            assert "Song Line" in line or "Ancestral" in line or "Heart" in line or "Planetary" in line, f"Song line should have meaningful content: {line}"
        print("PASSED: Whale song lines have meaningful content")


class TestAngelicAlchemyAPI:
    """Tests for GET /api/angelic-alchemy endpoint"""

    def test_angelic_alchemy_returns_200(self):
        """API returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASSED: GET /api/angelic-alchemy returns 200")

    def test_angelic_alchemy_returns_list(self):
        """API returns a list of angelic entries"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) >= 4, f"Expected at least 4 angelic entries, got {len(data)}"
        print(f"PASSED: Returns {len(data)} angelic alchemy entries")

    def test_angelic_has_required_fields(self):
        """Each angelic entry has required fields"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        required_fields = ["id", "name", "angelic_order", "sacred_geometry", "element", "description"]
        for angel in data:
            for field in required_fields:
                assert field in angel, f"Missing field '{field}' in angel {angel.get('id', 'unknown')}"
        print("PASSED: All angelic entries have required base fields")

    def test_angelic_has_teachings_rituals_journal_affirmations(self):
        """Each angelic entry has alchemy_teachings, practical_rituals, journal_prompts, affirmations"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        content_fields = ["alchemy_teachings", "practical_rituals", "journal_prompts", "affirmations"]
        for angel in data:
            for field in content_fields:
                assert field in angel, f"Missing field '{field}' in angel {angel.get('name', 'unknown')}"
                assert isinstance(angel[field], list), f"Field '{field}' should be a list"
                assert len(angel[field]) >= 1, f"Field '{field}' should have at least 1 item"
        print("PASSED: All angelic entries have teachings, rituals, journal prompts, and affirmations")

    def test_metatron_cube_present(self):
        """Metatron's Cube entry is present with correct sacred_geometry"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        metatrons = [a for a in data if "metatron" in a.get("id", "").lower() or "metatron" in a.get("name", "").lower()]
        assert len(metatrons) >= 1, "Expected Metatron entry"
        metatron = metatrons[0]
        assert metatron["sacred_geometry"] == "Metatron's Cube", f"Expected 'Metatron's Cube', got {metatron['sacred_geometry']}"
        print(f"PASSED: Metatron's Cube entry present: {metatron['name']}")

    def test_michael_archangel_present(self):
        """Michael Archangel entry is present"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        michaels = [a for a in data if "michael" in a.get("id", "").lower() or "michael" in a.get("name", "").lower()]
        assert len(michaels) >= 1, "Expected Michael entry"
        michael = michaels[0]
        assert michael["angelic_order"] == "Archangel", f"Expected 'Archangel', got {michael['angelic_order']}"
        print(f"PASSED: Michael Archangel entry present: {michael['name']}")

    def test_raphael_archangel_present(self):
        """Raphael Archangel entry is present"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        raphaels = [a for a in data if "raphael" in a.get("id", "").lower() or "raphael" in a.get("name", "").lower()]
        assert len(raphaels) >= 1, "Expected Raphael entry"
        raphael = raphaels[0]
        assert raphael["angelic_order"] == "Archangel", f"Expected 'Archangel', got {raphael['angelic_order']}"
        print(f"PASSED: Raphael Archangel entry present: {raphael['name']}")

    def test_gabriel_archangel_present(self):
        """Gabriel Archangel entry is present"""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        data = response.json()
        gabriels = [a for a in data if "gabriel" in a.get("id", "").lower() or "gabriel" in a.get("name", "").lower()]
        assert len(gabriels) >= 1, "Expected Gabriel entry"
        gabriel = gabriels[0]
        assert gabriel["angelic_order"] == "Archangel", f"Expected 'Archangel', got {gabriel['angelic_order']}"
        print(f"PASSED: Gabriel Archangel entry present: {gabriel['name']}")


class TestAdminCollectionsIncludeNewAlchemy:
    """Tests that admin collections endpoint includes sacred_ally_alchemy and angelic_alchemy"""

    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        login_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"}
        )
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping admin tests")
        cookies = login_response.cookies
        return cookies

    def test_admin_collections_includes_sacred_ally_alchemy(self, admin_session):
        """Admin collections endpoint includes sacred_ally_alchemy"""
        response = requests.get(f"{BASE_URL}/api/admin/collections", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        collection_ids = [c["id"] for c in data]
        assert "sacred_ally_alchemy" in collection_ids, "sacred_ally_alchemy should be in admin collections"
        print("PASSED: Admin collections includes sacred_ally_alchemy")

    def test_admin_collections_includes_angelic_alchemy(self, admin_session):
        """Admin collections endpoint includes angelic_alchemy"""
        response = requests.get(f"{BASE_URL}/api/admin/collections", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        collection_ids = [c["id"] for c in data]
        assert "angelic_alchemy" in collection_ids, "angelic_alchemy should be in admin collections"
        print("PASSED: Admin collections includes angelic_alchemy")

    def test_admin_sacred_ally_items_list(self, admin_session):
        """Admin can list sacred_ally_alchemy items"""
        response = requests.get(f"{BASE_URL}/api/admin/sacred_ally_alchemy/items", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Response should have 'items' key"
        assert "total" in data, "Response should have 'total' key"
        assert data["total"] >= 5, f"Expected at least 5 items, got {data['total']}"
        print(f"PASSED: Admin can list {data['total']} sacred_ally_alchemy items")

    def test_admin_angelic_items_list(self, admin_session):
        """Admin can list angelic_alchemy items"""
        response = requests.get(f"{BASE_URL}/api/admin/angelic_alchemy/items", cookies=admin_session)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Response should have 'items' key"
        assert "total" in data, "Response should have 'total' key"
        assert data["total"] >= 4, f"Expected at least 4 items, got {data['total']}"
        print(f"PASSED: Admin can list {data['total']} angelic_alchemy items")


class TestAdminCRUDForNewCollections:
    """Tests for Admin CRUD operations on sacred_ally_alchemy and angelic_alchemy"""

    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        login_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "ShamanicAdmin2026!"}
        )
        if login_response.status_code != 200:
            pytest.skip("Admin login failed - skipping admin tests")
        cookies = login_response.cookies
        return cookies

    def test_admin_create_sacred_ally_item(self, admin_session):
        """Admin can create a new sacred_ally_alchemy item"""
        test_item = {
            "name": "TEST_Phoenix Alchemy · Rebirth Flame",
            "ally_type": "phoenix",
            "category": "sacred_allies",
            "element": "fire",
            "description": "Test phoenix ally for iteration 180 testing",
            "alchemy_teachings": ["Test teaching 1", "Test teaching 2"],
            "rituals": ["Test ritual 1"],
            "journal_prompts": ["Test prompt 1"],
            "affirmations": ["Test affirmation 1"],
            "source_type": "hybrid-curated",
            "source_references": ["https://en.wikipedia.org/wiki/Phoenix_(mythology)"],
            "review_status": "draft"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/sacred_ally_alchemy/items",
            json=test_item,
            cookies=admin_session
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        created = response.json()
        assert "id" in created, "Created item should have an id"
        assert created["name"] == test_item["name"], "Name should match"
        print(f"PASSED: Admin created sacred_ally_alchemy item: {created['id']}")
        return created["id"]

    def test_admin_update_sacred_ally_item(self, admin_session):
        """Admin can update a sacred_ally_alchemy item"""
        # First create an item
        test_item = {
            "name": "TEST_Update Phoenix",
            "ally_type": "phoenix",
            "category": "sacred_allies",
            "element": "fire",
            "description": "Test item for update",
            "alchemy_teachings": ["Original teaching"],
            "rituals": ["Original ritual"],
            "journal_prompts": ["Original prompt"],
            "affirmations": ["Original affirmation"],
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/sacred_ally_alchemy/items",
            json=test_item,
            cookies=admin_session
        )
        assert create_response.status_code == 200
        created = create_response.json()
        item_id = created["id"]

        # Update the item
        update_data = {
            "name": "TEST_Updated Phoenix",
            "description": "Updated description for testing",
            "alchemy_teachings": ["Updated teaching 1", "Updated teaching 2"],
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/sacred_ally_alchemy/items/{item_id}",
            json=update_data,
            cookies=admin_session
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        updated = update_response.json()
        assert updated["name"] == "TEST_Updated Phoenix", "Name should be updated"
        assert updated["description"] == "Updated description for testing", "Description should be updated"
        print(f"PASSED: Admin updated sacred_ally_alchemy item: {item_id}")

    def test_admin_delete_sacred_ally_item(self, admin_session):
        """Admin can delete a sacred_ally_alchemy item"""
        # First create an item
        test_item = {
            "name": "TEST_Delete Phoenix",
            "ally_type": "phoenix",
            "category": "sacred_allies",
            "element": "fire",
            "description": "Test item for deletion",
            "alchemy_teachings": ["Teaching"],
            "rituals": ["Ritual"],
            "journal_prompts": ["Prompt"],
            "affirmations": ["Affirmation"],
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/sacred_ally_alchemy/items",
            json=test_item,
            cookies=admin_session
        )
        assert create_response.status_code == 200
        created = create_response.json()
        item_id = created["id"]

        # Delete the item
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/sacred_ally_alchemy/items/{item_id}",
            cookies=admin_session
        )
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        result = delete_response.json()
        assert result.get("deleted") is True, "Should return deleted: true"
        print(f"PASSED: Admin deleted sacred_ally_alchemy item: {item_id}")

    def test_admin_create_angelic_item(self, admin_session):
        """Admin can create a new angelic_alchemy item"""
        test_item = {
            "name": "TEST_Uriel Alchemy · Golden Light",
            "angelic_order": "Archangel",
            "sacred_geometry": "Octahedron",
            "element": "earth",
            "description": "Test Uriel entry for iteration 180 testing",
            "alchemy_teachings": ["Test teaching 1"],
            "practical_rituals": ["Test ritual 1"],
            "journal_prompts": ["Test prompt 1"],
            "affirmations": ["Test affirmation 1"],
            "source_type": "hybrid-curated",
            "source_references": ["https://en.wikipedia.org/wiki/Uriel"],
            "review_status": "draft"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/angelic_alchemy/items",
            json=test_item,
            cookies=admin_session
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        created = response.json()
        assert "id" in created, "Created item should have an id"
        assert created["name"] == test_item["name"], "Name should match"
        print(f"PASSED: Admin created angelic_alchemy item: {created['id']}")

    def test_admin_delete_angelic_item(self, admin_session):
        """Admin can delete an angelic_alchemy item"""
        # First create an item
        test_item = {
            "name": "TEST_Delete Uriel",
            "angelic_order": "Archangel",
            "sacred_geometry": "Octahedron",
            "element": "earth",
            "description": "Test item for deletion",
            "alchemy_teachings": ["Teaching"],
            "practical_rituals": ["Ritual"],
            "journal_prompts": ["Prompt"],
            "affirmations": ["Affirmation"],
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/angelic_alchemy/items",
            json=test_item,
            cookies=admin_session
        )
        assert create_response.status_code == 200
        created = create_response.json()
        item_id = created["id"]

        # Delete the item
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/angelic_alchemy/items/{item_id}",
            cookies=admin_session
        )
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        result = delete_response.json()
        assert result.get("deleted") is True, "Should return deleted: true"
        print(f"PASSED: Admin deleted angelic_alchemy item: {item_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
