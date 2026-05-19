"""
Backend tests for iteration 51:
- Community reply/like APIs
- Crystal deep profiles (20 crystals)
- Daily practice widget API
"""
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestCrystalDeep:
    """Crystal deep profiles - expect 20 crystals including 5 new ones"""

    def test_crystals_deep_returns_200(self):
        resp = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    def test_crystals_deep_count_is_20(self):
        resp = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list), "Expected list of crystals"
        assert len(data) >= 20, f"Expected >=20 crystals, got {len(data)}"
        print(f"Crystal count: {len(data)}")

    def test_crystals_deep_includes_new_crystals(self):
        resp = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        crystal_ids = {c["id"] for c in data}
        new_crystals = ["lepidolite", "rhodonite", "fluorite", "chrysocolla", "sunstone"]
        for crystal_id in new_crystals:
            assert crystal_id in crystal_ids, f"Missing crystal: {crystal_id}"
        print(f"All 5 new crystals present: {new_crystals}")

    def test_crystals_deep_structure(self):
        resp = requests.get(f"{BASE_URL}/api/crystals/deep", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        first = data[0]
        assert "id" in first
        assert "name" in first
        assert "_id" not in first, "MongoDB _id should not be exposed"


class TestDailyPractice:
    """Daily practice API for Sacred Practice Widget"""

    def test_daily_practice_returns_200(self):
        resp = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    def test_daily_practice_has_required_fields(self):
        resp = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert "moon_phase" in data, "Missing moon_phase"
        assert "day_theme" in data, "Missing day_theme"
        assert "morning_practice" in data, "Missing morning_practice"
        assert "evening_practice" in data, "Missing evening_practice"
        print(f"Moon phase: {data['moon_phase']}, Day theme: {data['day_theme']}")

    def test_daily_practice_moon_phase_valid(self):
        resp = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        valid_phases = [
            "New Moon", "Waxing Crescent", "First Quarter",
            "Waxing Gibbous", "Full Moon", "Waning Gibbous",
            "Last Quarter", "Waning Crescent"
        ]
        assert data["moon_phase"] in valid_phases, f"Invalid moon phase: {data['moon_phase']}"

    def test_daily_practice_morning_has_name(self):
        resp = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        if data.get("morning_practice"):
            assert "name" in data["morning_practice"], "morning_practice missing 'name'"
            print(f"Morning practice: {data['morning_practice']['name']}")


class TestCommunityPosts:
    """Community posts CRUD and like/reply APIs"""

    def _create_post(self):
        """Helper to create a test post"""
        payload = {
            "author_name": "TEST_AutomatedTester",
            "content": "TEST_ This is an automated test post for the sacred community",
            "type": "journey",
            "element": "spirit",
            "title": "TEST_ Automated Test Journey"
        }
        resp = requests.post(f"{BASE_URL}/api/community/posts", json=payload, timeout=15)
        return resp

    def test_community_posts_list(self):
        resp = requests.get(f"{BASE_URL}/api/community/posts", timeout=15)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert isinstance(data, list), "Expected list of posts"
        print(f"Total community posts: {len(data)}")

    def test_create_community_post(self):
        resp = self._create_post()
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "id" in data
        assert data["content"].startswith("TEST_")
        print(f"Created post ID: {data['id']}")

    def test_like_community_post(self):
        # First create a post
        create_resp = self._create_post()
        assert create_resp.status_code == 200
        post_id = create_resp.json()["id"]

        # Like it
        like_resp = requests.post(f"{BASE_URL}/api/community/posts/{post_id}/like", timeout=15)
        assert like_resp.status_code == 200, f"Expected 200, got {like_resp.status_code}: {like_resp.text}"
        data = like_resp.json()
        assert data.get("success"), f"Expected success=True: {data}"
        print(f"Post {post_id} liked successfully")

    def test_reply_to_community_post(self):
        # Create a post first
        create_resp = self._create_post()
        assert create_resp.status_code == 200
        post_id = create_resp.json()["id"]

        # Add reply
        reply_payload = {
            "author_name": "TEST_AutoTester",
            "content": "TEST_ This is an automated test reply"
        }
        reply_resp = requests.post(
            f"{BASE_URL}/api/community/posts/{post_id}/replies",
            json=reply_payload,
            timeout=15
        )
        assert reply_resp.status_code == 200, f"Expected 200, got {reply_resp.status_code}: {reply_resp.text}"
        data = reply_resp.json()
        assert "id" in data, "Reply should have id"
        assert "author_name" in data, "Reply should have author_name"
        assert "content" in data, "Reply should have content"
        assert "created_at" in data, "Reply should have created_at"
        assert data["author_name"] == "TEST_AutoTester"
        assert data["content"] == "TEST_ This is an automated test reply"
        print(f"Reply created: {data}")

    def test_reply_empty_content_rejected(self):
        # Create a post first
        create_resp = self._create_post()
        assert create_resp.status_code == 200
        post_id = create_resp.json()["id"]

        # Try empty reply
        reply_resp = requests.post(
            f"{BASE_URL}/api/community/posts/{post_id}/replies",
            json={"author_name": "Tester", "content": ""},
            timeout=15
        )
        assert reply_resp.status_code == 400, f"Expected 400 for empty content, got {reply_resp.status_code}"

    def test_reply_nonexistent_post(self):
        reply_resp = requests.post(
            f"{BASE_URL}/api/community/posts/nonexistent-post-id-12345/replies",
            json={"author_name": "Tester", "content": "Test reply"},
            timeout=15
        )
        assert reply_resp.status_code == 404, f"Expected 404 for nonexistent post, got {reply_resp.status_code}"

    def test_reply_default_author_name(self):
        """When no author_name given, defaults to Sacred Seeker"""
        create_resp = self._create_post()
        assert create_resp.status_code == 200
        post_id = create_resp.json()["id"]

        reply_resp = requests.post(
            f"{BASE_URL}/api/community/posts/{post_id}/replies",
            json={"content": "TEST_ Anonymous reply"},
            timeout=15
        )
        assert reply_resp.status_code == 200
        data = reply_resp.json()
        assert data["author_name"] == "Sacred Seeker", f"Expected 'Sacred Seeker', got '{data['author_name']}'"
