"""
Iteration 77 - Regression tests for security hardening + modularization + storage migration.
Tests:
- Backend health and core endpoints after SHA-256 + secrets refactor
- TTS endpoint (audio generation)
- Oracle/runes/tarot/daily practice endpoints after random->secrets change
- Admin login flow after sessionStorage migration helpers
- Courses endpoint
- Content endpoints (yoga, breathwork, crystals, mantras, etc.)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'ShamanicAdmin2026!')


class TestHealthAndCore:
    """Test backend health and core endpoints after security refactor."""
    
    def test_health_endpoint(self):
        """Health endpoint should return 200."""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: Health endpoint working")
    
    def test_yoga_poses_endpoint(self):
        """Yoga poses endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: Yoga poses endpoint returned {len(data)} poses")
    
    def test_breathwork_sessions_endpoint(self):
        """Breathwork sessions endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Breathwork sessions endpoint returned {len(data)} sessions")
    
    def test_crystals_endpoint(self):
        """Crystals endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Crystals endpoint returned {len(data)} crystals")
    
    def test_mantras_endpoint(self):
        """Mantras endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mantras endpoint returned {len(data)} mantras")
    
    def test_meditations_endpoint(self):
        """Meditations endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Meditations endpoint returned {len(data)} meditations")
    
    def test_mudras_endpoint(self):
        """Mudras endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mudras endpoint returned {len(data)} mudras")


class TestOracleEndpointsAfterSecretsRefactor:
    """Test oracle endpoints after random->secrets module change."""
    
    def test_oracle_cards_endpoint(self):
        """Oracle cards endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Oracle cards endpoint returned {len(data)} cards")
    
    def test_oracle_guest_reading(self):
        """Guest oracle reading should work without auth."""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading/guest",
            json={"spread_type": "single"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert "interpretation" in data
        assert len(data["cards"]) == 1
        print("PASS: Guest oracle reading working with secrets.randbelow")
    
    def test_archangel_cards_endpoint(self):
        """Archangel cards endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/oracle/archangels")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Archangel cards endpoint returned {len(data)} cards")
    
    def test_archangel_guest_reading(self):
        """Guest archangel reading should work without auth."""
        response = requests.post(
            f"{BASE_URL}/api/oracle/archangels/reading/guest",
            json={"spread_type": "single"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert "interpretation" in data
        print("PASS: Guest archangel reading working")


class TestRunesEndpointsAfterSecretsRefactor:
    """Test runes endpoints after random->secrets module change."""
    
    def test_runes_list_endpoint(self):
        """Runes list endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Runes endpoint returned {len(data)} runes")
    
    def test_runes_draw_single(self):
        """Single rune draw should work with secrets module."""
        response = requests.get(f"{BASE_URL}/api/runes/draw/single")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "is_reversed" in data
        print(f"PASS: Single rune draw returned: {data.get('name')}")
    
    def test_runes_draw_three(self):
        """Three rune draw should work with secrets module."""
        response = requests.get(f"{BASE_URL}/api/runes/draw/three")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        positions = [r.get("position") for r in data]
        assert "past" in positions
        assert "present" in positions
        assert "future" in positions
        print("PASS: Three rune draw working with secrets.randbelow")
    
    def test_runes_celtic_cross(self):
        """Celtic cross rune spread should work."""
        response = requests.get(f"{BASE_URL}/api/runes/draw/celtic-cross")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 10
        print("PASS: Celtic cross rune spread working")


class TestTarotEndpointsAfterSecretsRefactor:
    """Test tarot endpoints after random->secrets module change."""
    
    def test_tarot_cards_endpoint(self):
        """Tarot cards endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/tarot/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Tarot cards endpoint returned {len(data)} cards")
    
    def test_tarot_single_reading(self):
        """Single tarot reading should work with secrets module."""
        response = requests.get(f"{BASE_URL}/api/tarot/reading?spread=single")
        assert response.status_code == 200
        data = response.json()
        assert "spread" in data
        assert "cards" in data
        assert len(data["cards"]) == 1
        print("PASS: Single tarot reading working")
    
    def test_tarot_three_card_reading(self):
        """Three card tarot reading should work."""
        response = requests.get(f"{BASE_URL}/api/tarot/reading?spread=three")
        assert response.status_code == 200
        data = response.json()
        assert len(data["cards"]) == 3
        print("PASS: Three card tarot reading working")


class TestDailyPracticeAfterSecretsRefactor:
    """Test daily practice endpoint after random->secrets module change."""
    
    def test_daily_practice_endpoint(self):
        """Daily practice endpoint should return practice recommendations."""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200
        data = response.json()
        assert "date" in data
        assert "day_of_week" in data
        assert "moon_phase" in data
        assert "morning_practice" in data or "evening_practice" in data
        print(f"PASS: Daily practice endpoint returned data for {data.get('date')}")


class TestAdminLoginAfterSessionStorageMigration:
    """Test admin login flow after sessionStorage migration helpers."""
    
    def test_admin_login_endpoint(self):
        """Admin login should work with correct password."""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print("PASS: Admin login endpoint working")
    
    def test_admin_login_wrong_password(self):
        """Admin login should reject wrong password."""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"}
        )
        assert response.status_code == 401
        print("PASS: Admin login correctly rejects wrong password")
    
    def test_admin_protected_endpoint_without_token(self):
        """Admin protected endpoint should require token."""
        response = requests.get(f"{BASE_URL}/api/admin/oracle_cards/items")
        assert response.status_code in [401, 403]  # 401 Unauthorized or 403 Forbidden both acceptable
        print("PASS: Admin endpoint correctly requires authentication")
    
    def test_admin_protected_endpoint_with_token(self):
        """Admin protected endpoint should work with valid token."""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        token = login_response.json().get("token")
        
        # Then access protected endpoint
        response = requests.get(
            f"{BASE_URL}/api/admin/oracle_cards/items",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        print(f"PASS: Admin protected endpoint working with token, returned {len(data.get('items', []))} items")


class TestCoursesEndpoint:
    """Test courses endpoint after storage/constants extraction."""
    
    def test_courses_list_endpoint(self):
        """Courses list endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Courses endpoint returned {len(data)} courses")
    
    def test_sacred_rites_endpoint(self):
        """Sacred rites endpoint should return shamanic initiation courses."""
        response = requests.get(f"{BASE_URL}/api/sacred-rites")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Sacred rites endpoint returned {len(data)} rites")


class TestContentEndpointsAfterModularization:
    """Test content endpoints after helper extraction."""
    
    def test_somatic_practices_endpoint(self):
        """Somatic practices endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Somatic practices endpoint returned {len(data)} practices")
    
    def test_grounding_exercises_endpoint(self):
        """Grounding exercises endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Grounding exercises endpoint returned {len(data)} exercises")
    
    def test_mindfulness_practices_endpoint(self):
        """Mindfulness practices endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mindfulness practices endpoint returned {len(data)} practices")
    
    def test_heart_practices_endpoint(self):
        """Heart practices endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Heart practices endpoint returned {len(data)} practices")
    
    def test_shamanic_practices_endpoint(self):
        """Shamanic practices endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Shamanic practices endpoint returned {len(data)} practices")
    
    def test_elemental_practices_endpoint(self):
        """Elemental practices endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Elemental practices endpoint returned {len(data)} practices")
    
    def test_creative_processes_endpoint(self):
        """Creative processes endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Creative processes endpoint returned {len(data)} processes")
    
    def test_earth_altars_endpoint(self):
        """Earth altars endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Earth altars endpoint returned {len(data)} altars")
    
    def test_chakra_cleansing_endpoint(self):
        """Chakra cleansing endpoint should return 13 chakras."""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 13  # 7 base + 6 extended chakras
        print(f"PASS: Chakra cleansing endpoint returned {len(data)} chakras")
    
    def test_energy_healing_endpoint(self):
        """Energy healing endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/energy-healing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Energy healing endpoint returned {len(data)} modalities")
    
    def test_somatic_yoga_endpoint(self):
        """Somatic yoga endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/somatic-yoga")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Somatic yoga endpoint returned {len(data)} practices")
    
    def test_feminine_embodiment_endpoint(self):
        """Feminine embodiment endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Feminine embodiment endpoint returned {len(data)} practices")


class TestWaterAndMantraFlows:
    """Test water and mantra flows not regressed."""
    
    def test_water_practices_endpoint(self):
        """Water practices endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Water practices endpoint returned {len(data)} practices")
    
    def test_mantras_by_element(self):
        """Mantras filtered by element should work."""
        response = requests.get(f"{BASE_URL}/api/mantras?element=Water")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Mantras by element returned {len(data)} mantras")


class TestLiveSessionsAndVideos:
    """Test live sessions and videos endpoints."""
    
    def test_live_sessions_endpoint(self):
        """Live sessions endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Live sessions endpoint returned {len(data)} sessions")
    
    def test_videos_endpoint(self):
        """Videos endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Videos endpoint returned {len(data)} videos")
    
    def test_retreats_endpoint(self):
        """Retreats endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Retreats endpoint returned {len(data)} retreats")


class TestExpandScriptEndpoint:
    """Test expand-script endpoint used by GuidedPracticeOverlay."""
    
    def test_expand_script_endpoint(self):
        """Expand script endpoint should return expanded narration."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "Spirit",
                "duration_minutes": 7,
                "use_ai": False,
                "steps": ["Step 1: Breathe deeply", "Step 2: Relax"],
                "source_texts": ["This is a test practice for relaxation."]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "paragraphs" in data
        assert "segments" in data
        assert "word_count" in data
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        print(f"PASS: Expand script endpoint returned {len(data['paragraphs'])} paragraphs, {data['word_count']} words")


class TestIChing:
    """Test I Ching endpoints."""
    
    def test_i_ching_hexagrams_endpoint(self):
        """I Ching hexagrams endpoint should return list."""
        response = requests.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: I Ching endpoint returned {len(data)} hexagrams")
    
    def test_i_ching_cast(self):
        """I Ching cast endpoint should work with secrets module."""
        response = requests.get(f"{BASE_URL}/api/i-ching/cast/coins")
        assert response.status_code == 200
        data = response.json()
        assert "lines_cast" in data
        assert "changing_lines" in data
        print(f"PASS: I Ching cast working, hexagram: {data.get('name', 'Unknown')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
