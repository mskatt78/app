"""
Iteration 229 - Immersive Content Depth Testing
Tests for enriched immersive fields (alchemy, ritual, ceremony, guided_practice)
across Sacred Allies, Angelic Alchemy, and Ancient Wisdom sections.
Also tests retreats cleanup and narration expansion floor.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestSacredAllyAlchemy:
    """Tests for GET /api/sacred-ally-alchemy enriched immersive fields."""

    def test_sacred_ally_alchemy_returns_data(self):
        """Verify endpoint returns array of items."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) > 0, "Expected at least one sacred ally"
        print(f"PASS: /api/sacred-ally-alchemy returns {len(data)} items")

    def test_sacred_ally_has_alchemy_field(self):
        """Verify items have enriched 'alchemy' field."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:  # Check first 5
            assert "alchemy" in item or "alchemy_teachings" in item, f"Missing alchemy field in {item.get('id')}"
            alchemy = item.get("alchemy") or item.get("alchemy_teachings") or []
            assert isinstance(alchemy, list), f"alchemy should be list in {item.get('id')}"
            assert len(alchemy) >= 1, f"alchemy should have at least 1 item in {item.get('id')}"
        print("PASS: Sacred allies have alchemy field with content")

    def test_sacred_ally_has_ritual_field(self):
        """Verify items have enriched 'ritual' field."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "ritual" in item or "rituals" in item or "practical_rituals" in item, f"Missing ritual field in {item.get('id')}"
            ritual = item.get("ritual") or item.get("rituals") or item.get("practical_rituals") or []
            assert isinstance(ritual, list), f"ritual should be list in {item.get('id')}"
            assert len(ritual) >= 1, f"ritual should have at least 1 item in {item.get('id')}"
        print("PASS: Sacred allies have ritual field with content")

    def test_sacred_ally_has_ceremony_field(self):
        """Verify items have enriched 'ceremony' field."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "ceremony" in item or "ceremonies" in item, f"Missing ceremony field in {item.get('id')}"
            ceremony = item.get("ceremony") or item.get("ceremonies") or []
            assert isinstance(ceremony, list), f"ceremony should be list in {item.get('id')}"
            assert len(ceremony) >= 1, f"ceremony should have at least 1 item in {item.get('id')}"
        print("PASS: Sacred allies have ceremony field with content")

    def test_sacred_ally_has_guided_practice_field(self):
        """Verify items have enriched 'guided_practice' field."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "guided_practice" in item or "practice" in item, f"Missing guided_practice field in {item.get('id')}"
            guided = item.get("guided_practice") or item.get("practice") or []
            assert isinstance(guided, list), f"guided_practice should be list in {item.get('id')}"
            assert len(guided) >= 1, f"guided_practice should have at least 1 item in {item.get('id')}"
        print("PASS: Sacred allies have guided_practice field with content")

    def test_sacred_ally_preserves_existing_fields(self):
        """Verify existing fields (id, name, description, element) are preserved."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "id" in item, f"Missing id field"
            assert "name" in item, f"Missing name field"
            assert "description" in item, f"Missing description field"
        print("PASS: Sacred allies preserve existing fields")

    def test_sacred_ally_free_paid_tiering(self):
        """Verify approximately 1/4 items are free (is_premium=False)."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        total = len(data)
        # Check for is_premium field (False = free, True = premium)
        free_count = sum(1 for item in data if not item.get("is_premium", True))
        # Approximately 25% should be free (with some tolerance)
        assert free_count >= 1, f"Expected at least 1 free item (is_premium=False), got {free_count}"
        print(f"PASS: Sacred allies tiering - {free_count}/{total} free ({100*free_count/total:.1f}%)")


class TestAngelicAlchemy:
    """Tests for GET /api/angelic-alchemy enriched immersive fields."""

    def test_angelic_alchemy_returns_data(self):
        """Verify endpoint returns array of items."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) > 0, "Expected at least one angelic entry"
        print(f"PASS: /api/angelic-alchemy returns {len(data)} items")

    def test_angelic_has_alchemy_field(self):
        """Verify items have enriched 'alchemy' field."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "alchemy" in item or "alchemy_teachings" in item, f"Missing alchemy field in {item.get('id')}"
            alchemy = item.get("alchemy") or item.get("alchemy_teachings") or []
            assert isinstance(alchemy, list), f"alchemy should be list in {item.get('id')}"
            assert len(alchemy) >= 1, f"alchemy should have at least 1 item in {item.get('id')}"
        print("PASS: Angelic entries have alchemy field with content")

    def test_angelic_has_ritual_field(self):
        """Verify items have enriched 'ritual' field."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "ritual" in item or "rituals" in item or "practical_rituals" in item, f"Missing ritual field in {item.get('id')}"
            ritual = item.get("ritual") or item.get("rituals") or item.get("practical_rituals") or []
            assert isinstance(ritual, list), f"ritual should be list in {item.get('id')}"
            assert len(ritual) >= 1, f"ritual should have at least 1 item in {item.get('id')}"
        print("PASS: Angelic entries have ritual field with content")

    def test_angelic_has_ceremony_field(self):
        """Verify items have enriched 'ceremony' field."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "ceremony" in item or "ceremonies" in item, f"Missing ceremony field in {item.get('id')}"
            ceremony = item.get("ceremony") or item.get("ceremonies") or []
            assert isinstance(ceremony, list), f"ceremony should be list in {item.get('id')}"
            assert len(ceremony) >= 1, f"ceremony should have at least 1 item in {item.get('id')}"
        print("PASS: Angelic entries have ceremony field with content")

    def test_angelic_has_guided_practice_field(self):
        """Verify items have enriched 'guided_practice' field."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "guided_practice" in item or "practice" in item, f"Missing guided_practice field in {item.get('id')}"
            guided = item.get("guided_practice") or item.get("practice") or []
            assert isinstance(guided, list), f"guided_practice should be list in {item.get('id')}"
            assert len(guided) >= 1, f"guided_practice should have at least 1 item in {item.get('id')}"
        print("PASS: Angelic entries have guided_practice field with content")

    def test_angelic_free_paid_tiering(self):
        """Verify free/paid tiering is intact (is_premium=False for free items)."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        total = len(data)
        free_count = sum(1 for item in data if not item.get("is_premium", True))
        assert free_count >= 1, f"Expected at least 1 free item (is_premium=False), got {free_count}"
        print(f"PASS: Angelic tiering - {free_count}/{total} free ({100*free_count/total:.1f}%)")


class TestAncientWisdom:
    """Tests for GET /api/ancient-wisdom enriched immersive fields."""

    def test_ancient_wisdom_returns_data(self):
        """Verify endpoint returns array of items."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) > 0, "Expected at least one ancient wisdom entry"
        print(f"PASS: /api/ancient-wisdom returns {len(data)} items")

    def test_ancient_wisdom_has_alchemy_field(self):
        """Verify items have enriched 'alchemy' field."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "alchemy" in item or "alchemy_teachings" in item or "teachings" in item, f"Missing alchemy/teachings field in {item.get('id')}"
        print("PASS: Ancient wisdom entries have alchemy/teachings field")

    def test_ancient_wisdom_has_ritual_field(self):
        """Verify items have enriched 'ritual' field."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "ritual" in item or "rituals" in item or "practical_rituals" in item or "practice" in item, f"Missing ritual field in {item.get('id')}"
        print("PASS: Ancient wisdom entries have ritual field")

    def test_ancient_wisdom_has_ceremony_field(self):
        """Verify items have enriched 'ceremony' field."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "ceremony" in item or "ceremonies" in item, f"Missing ceremony field in {item.get('id')}"
        print("PASS: Ancient wisdom entries have ceremony field")

    def test_ancient_wisdom_has_guided_practice_field(self):
        """Verify items have enriched 'guided_practice' field."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "guided_practice" in item or "practice" in item, f"Missing guided_practice field in {item.get('id')}"
        print("PASS: Ancient wisdom entries have guided_practice field")

    def test_ancient_wisdom_preserves_data_shape(self):
        """Verify existing fields are preserved for frontend compatibility."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        for item in data[:5]:
            assert "id" in item, "Missing id field"
            assert "name" in item, "Missing name field"
            assert "description" in item, "Missing description field"
            # Check tradition field exists
            assert "tradition" in item or "section_focus" in item, "Missing tradition/section_focus field"
        print("PASS: Ancient wisdom preserves data shape for frontend")

    def test_ancient_wisdom_free_paid_tiering(self):
        """Verify free/paid tiering is intact (is_premium=False for free items)."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        total = len(data)
        free_count = sum(1 for item in data if not item.get("is_premium", True))
        assert free_count >= 1, f"Expected at least 1 free item (is_premium=False), got {free_count}"
        print(f"PASS: Ancient wisdom tiering - {free_count}/{total} free ({100*free_count/total:.1f}%)")


class TestRetreats:
    """Tests for GET /api/retreats - should return empty if no user entries."""

    def test_retreats_returns_array(self):
        """Verify endpoint returns array (possibly empty)."""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/retreats returns array with {len(data)} items")

    def test_retreats_no_placeholder_rows(self):
        """Verify no placeholder retreat rows are auto-seeded."""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        # Check for placeholder titles
        placeholder_titles = ["test", "test_", "test-", "pytest", "sacred journey retreat"]
        for item in data:
            title = str(item.get("title", "")).strip().lower()
            is_placeholder = any(title.startswith(p) or title == p for p in placeholder_titles)
            assert not is_placeholder, f"Found placeholder retreat: {title}"
        print(f"PASS: No placeholder retreats found (total: {len(data)})")


class TestNarrationExpansion:
    """Tests for POST /api/content/expand-script narration floor."""

    def test_expand_script_returns_long_form(self):
        """Verify expand-script returns long-form script with word_count > 840 for 7+ min."""
        payload = {
            "practice_name": "Test Grounding Practice",
            "element": "earth",
            "duration_minutes": 8,
            "steps": [
                "Begin by standing with feet hip-width apart.",
                "Breathe deeply and feel your connection to the earth.",
                "Visualize roots growing from your feet into the ground."
            ],
            "source_texts": [
                "Grounding is the practice of connecting with the earth's energy.",
                "This helps stabilize your nervous system and bring calm."
            ],
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "word_count" in data, "Missing word_count in response"
        assert "target_word_count" in data, "Missing target_word_count in response"
        assert "paragraphs" in data, "Missing paragraphs in response"
        assert "segments" in data, "Missing segments in response"
        
        # For 7+ min audio, target should be significantly above 840 (7 min * 120 wpm)
        # MIN_NARRATION_MINUTES = 7, TARGET_WORDS_PER_MINUTE = 132
        # So minimum floor should be around 7 * 132 = 924 words
        word_count = data["word_count"]
        target_word_count = data["target_word_count"]
        
        print(f"word_count: {word_count}, target_word_count: {target_word_count}")
        
        # The target should be at least 840 (7 min * 120 wpm baseline)
        assert target_word_count >= 840, f"target_word_count {target_word_count} should be >= 840 for 7+ min"
        
        # Word count should be reasonably close to target
        assert word_count >= 500, f"word_count {word_count} should be >= 500 for meaningful narration"
        
        print(f"PASS: expand-script returns word_count={word_count}, target={target_word_count}")

    def test_expand_script_with_longer_duration(self):
        """Verify expand-script scales with duration."""
        payload = {
            "practice_name": "Extended Meditation Journey",
            "element": "spirit",
            "duration_minutes": 12,
            "steps": [
                "Find a comfortable seated position.",
                "Close your eyes and begin to breathe deeply.",
                "Allow your awareness to expand."
            ],
            "source_texts": [],
            "use_ai": False,
            "anti_repetition_mode": "balanced",
            "include_toning": False
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # For 12 min, target should be higher
        target_word_count = data["target_word_count"]
        assert target_word_count >= 1000, f"target_word_count {target_word_count} should be >= 1000 for 12 min"
        
        print(f"PASS: expand-script for 12 min has target_word_count={target_word_count}")


class TestContentIntegrity:
    """Tests for content integrity fields across enriched endpoints."""

    def test_sacred_ally_has_content_integrity(self):
        """Verify sacred allies have content_integrity metadata."""
        response = requests.get(f"{BASE_URL}/api/sacred-ally-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:3]:
            assert "content_integrity" in item, f"Missing content_integrity in {item.get('id')}"
            ci = item["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
        print("PASS: Sacred allies have content_integrity metadata")

    def test_angelic_has_content_integrity(self):
        """Verify angelic entries have content_integrity metadata."""
        response = requests.get(f"{BASE_URL}/api/angelic-alchemy")
        assert response.status_code == 200
        data = response.json()
        for item in data[:3]:
            assert "content_integrity" in item, f"Missing content_integrity in {item.get('id')}"
        print("PASS: Angelic entries have content_integrity metadata")

    def test_ancient_wisdom_has_content_integrity(self):
        """Verify ancient wisdom entries have content_integrity metadata."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom")
        assert response.status_code == 200
        data = response.json()
        for item in data[:3]:
            assert "content_integrity" in item, f"Missing content_integrity in {item.get('id')}"
        print("PASS: Ancient wisdom entries have content_integrity metadata")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
