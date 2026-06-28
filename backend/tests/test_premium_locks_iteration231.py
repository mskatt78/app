"""
Backend API tests for iteration 231 - Premium locks, content counts, and image fixes
Tests: yoga, somatic, sacred guardians, sound frequencies, meditations, mindfulness, mantras,
       water practices, heart practices, creative processes, oracle coyote image, crystal images
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


class TestYogaPosesEndpoint:
    """Yoga library: first 4 free, rest premium"""

    def test_yoga_poses_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Yoga poses total: {len(data)}")

    def test_yoga_poses_free_premium_split(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        free_poses = [p for p in data if not p.get("is_premium")]
        premium_poses = [p for p in data if p.get("is_premium")]
        print(f"Yoga: {len(free_poses)} free, {len(premium_poses)} premium")
        # Expect first 4 free
        assert len(free_poses) >= 4, f"Expected at least 4 free yoga poses, got {len(free_poses)}"


class TestSomaticEndpoint:
    """Somatic movement: first 4 free, rest premium"""

    def test_somatic_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Somatic practices total: {len(data)}")

    def test_somatic_free_premium_split(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Somatic: {len(free_items)} free, {len(premium_items)} premium")
        # Expect first 4 free
        assert len(free_items) >= 4, f"Expected at least 4 free somatic practices, got {len(free_items)}"


class TestSacredGuardiansEndpoint:
    """Sacred Guardians: first 5 free, rest premium"""

    def test_sacred_guardians_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Sacred guardians total: {len(data)}")

    def test_sacred_guardians_free_premium_split(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Sacred Guardians: {len(free_items)} free, {len(premium_items)} premium")
        # Expect first 5 free
        assert len(free_items) >= 5, f"Expected at least 5 free guardians, got {len(free_items)}"


class TestSoundFrequenciesEndpoint:
    """Sound frequencies: premium flags present"""

    def test_sound_frequencies_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Sound frequencies total: {len(data)}")

    def test_sound_frequencies_has_premium_flags(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        # Check that at least some items have is_premium field
        items_with_premium_flag = [p for p in data if "is_premium" in p]
        print(f"Sound frequencies with is_premium flag: {len(items_with_premium_flag)}/{len(data)}")
        # At least some should have the flag
        assert len(items_with_premium_flag) > 0, "Expected some sound frequencies to have is_premium flag"


class TestMeditationsEndpoint:
    """Meditations: 4 free, 10 premium (14 total)"""

    def test_meditations_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Meditations total: {len(data)}")

    def test_meditations_free_premium_counts(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Meditations: {len(free_items)} free, {len(premium_items)} premium, {len(data)} total")
        # Expect 4 free, 10 premium
        assert len(free_items) >= 4, f"Expected at least 4 free meditations, got {len(free_items)}"


class TestMindfulnessEndpoint:
    """Mindfulness: 5 free, 12 premium (17 total)"""

    def test_mindfulness_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Mindfulness total: {len(data)}")

    def test_mindfulness_free_premium_counts(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Mindfulness: {len(free_items)} free, {len(premium_items)} premium, {len(data)} total")
        # Expect 5 free, 12 premium
        assert len(free_items) >= 5, f"Expected at least 5 free mindfulness, got {len(free_items)}"


class TestMantrasEndpoint:
    """Mantras: 11 free, 25 premium (36 total)"""

    def test_mantras_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Mantras total: {len(data)}")

    def test_mantras_free_premium_counts(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Mantras: {len(free_items)} free, {len(premium_items)} premium, {len(data)} total")
        # Expect 11 free, 25 premium
        assert len(free_items) >= 11, f"Expected at least 11 free mantras, got {len(free_items)}"


class TestWaterPracticesEndpoint:
    """Water practices: 17 total (5 free, 12 premium)"""

    def test_water_practices_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Water practices total: {len(data)}")

    def test_water_practices_counts(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/water-practices")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Water practices: {len(free_items)} free, {len(premium_items)} premium, {len(data)} total")
        # Expect 17 total (5 free, 12 premium)
        assert len(data) >= 17, f"Expected at least 17 water practices, got {len(data)}"
        assert len(free_items) >= 5, f"Expected at least 5 free water practices, got {len(free_items)}"


class TestHeartPracticesEndpoint:
    """Heart practices: 15 total (5 free, 10 premium)"""

    def test_heart_practices_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Heart practices total: {len(data)}")

    def test_heart_practices_counts(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Heart practices: {len(free_items)} free, {len(premium_items)} premium, {len(data)} total")
        # Expect 15 total (5 free, 10 premium)
        assert len(data) >= 15, f"Expected at least 15 heart practices, got {len(data)}"
        assert len(free_items) >= 5, f"Expected at least 5 free heart practices, got {len(free_items)}"


class TestCreativeProcessesEndpoint:
    """Creative processes: includes earth-crafting and sacred-tool-birthing categories"""

    def test_creative_processes_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Creative processes total: {len(data)}")

    def test_creative_processes_has_earth_crafting(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/creative-processes?category=earth-crafting")
        assert response.status_code == 200
        data = response.json()
        print(f"Earth crafting processes: {len(data)}")
        # Should have earth-crafting items
        assert len(data) > 0, "Expected earth-crafting category to have items"

    def test_creative_processes_has_sacred_tool_birthing(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/creative-processes?category=sacred-tool-birthing")
        assert response.status_code == 200
        data = response.json()
        print(f"Sacred tool birthing processes: {len(data)}")
        # Should have sacred-tool-birthing items
        assert len(data) > 0, "Expected sacred-tool-birthing category to have items"


class TestOracleCoyoteImage:
    """Oracle cards: coyote card should have proper coyote image URL"""

    def test_oracle_cards_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Oracle cards total: {len(data)}")

    def test_coyote_card_has_proper_image(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        data = response.json()
        # Find coyote card
        coyote_cards = [c for c in data if "coyote" in c.get("name", "").lower()]
        print(f"Coyote cards found: {len(coyote_cards)}")
        if coyote_cards:
            coyote = coyote_cards[0]
            image_url = coyote.get("image_url", "")
            print(f"Coyote image URL: {image_url}")
            # Should contain coyote-related image, not flower
            assert "flower" not in image_url.lower(), f"Coyote card has flower image: {image_url}"
            # Should have a valid URL
            assert image_url.startswith("http"), f"Coyote card image URL invalid: {image_url}"


class TestCrystalsEndpoint:
    """Crystals: images should be restored and not blank"""

    def test_crystals_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Crystals total: {len(data)}")

    def test_crystals_have_images(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200
        data = response.json()
        # Check how many crystals have valid image URLs
        crystals_with_images = 0
        crystals_without_images = 0
        for crystal in data:
            resolved = crystal.get("image_url_resolved") or crystal.get("verified_image_url")
            original = crystal.get("image_url_original") or crystal.get("image_url")
            if resolved or original:
                crystals_with_images += 1
            else:
                crystals_without_images += 1
                print(f"Crystal without image: {crystal.get('name')}")
        print(f"Crystals with images: {crystals_with_images}/{len(data)}")
        print(f"Crystals without images: {crystals_without_images}/{len(data)}")
        # Most crystals should have images
        assert crystals_with_images > crystals_without_images, "More crystals without images than with"


class TestBreathworkEndpoint:
    """Breathwork: 5 free, rest premium"""

    def test_breathwork_returns_data(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Breathwork total: {len(data)}")

    def test_breathwork_free_premium_split(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        free_items = [p for p in data if not p.get("is_premium")]
        premium_items = [p for p in data if p.get("is_premium")]
        print(f"Breathwork: {len(free_items)} free, {len(premium_items)} premium")
        # Expect 5 free
        assert len(free_items) >= 5, f"Expected at least 5 free breathwork, got {len(free_items)}"


class TestHealthEndpoint:
    """Basic health check"""

    def test_health_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
