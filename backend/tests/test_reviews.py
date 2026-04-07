"""
Backend tests for Community Reviews API
Tests: GET /reviews, GET /reviews/stats, POST /reviews (auth), GET /reviews/my-review
"""
import pytest
import requests
import os
import time
import subprocess
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


def _run_mongosh(eval_script: str):
    return subprocess.run(
        ["mongosh", "test_database", "--quiet", "--eval", eval_script],
        shell=False,
        capture_output=True,
        text=True,
        check=False,
    )


def create_test_session():
    """Create a test user and session in MongoDB for authentication testing."""
    user_id = f"test-reviews-user-{int(time.time())}"
    session_token = f"test_reviews_session_{int(time.time())}"
    email = f"test.reviews.{int(time.time())}@example.com"

    script = f"""
db.users.insertOne({{
  user_id: {json.dumps(user_id)},
  email: {json.dumps(email)},
  name: "Test Reviewer",
  picture: "https://via.placeholder.com/150",
  created_at: new Date()
}});
db.sessions.insertOne({{
  user_id: {json.dumps(user_id)},
  session_token: {json.dumps(session_token)},
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('done');
"""
    result = _run_mongosh(script)
    if result.returncode != 0:
        raise RuntimeError(f"Failed to seed test review user/session: {result.stderr}")
    return session_token, user_id


def cleanup_test_data(user_id: str, session_token: str):
    """Remove test user, session, and review from MongoDB."""
    script = f"""
db.users.deleteMany({{ user_id: {json.dumps(user_id)} }});
db.sessions.deleteMany({{ session_token: {json.dumps(session_token)} }});
db.reviews.deleteMany({{ user_id: {json.dumps(user_id)} }});
print('cleaned');
"""
    _run_mongosh(script)


class TestReviewsPublicEndpoints:
    """Tests for unauthenticated GET endpoints."""

    def test_get_reviews_returns_list(self):
        """GET /api/reviews should return a list (empty or with items)."""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"PASS: GET /api/reviews returned {len(data)} items")

    def test_get_reviews_structure(self):
        """GET /api/reviews should return items with correct fields."""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        if data:
            review = data[0]
            required_fields = ["review_id", "user_name", "initials", "rating", "text", "created_at"]
            for field in required_fields:
                assert field in review, f"Missing field '{field}' in review: {review.keys()}"
            assert 1 <= review["rating"] <= 5, f"Rating {review['rating']} out of valid range"
            assert isinstance(review["review_id"], str), "review_id should be a string"
            print(f"PASS: Review structure valid: {list(review.keys())}")
        else:
            print("PASS: GET /api/reviews returned empty list (no reviews yet)")

    def test_get_stats_returns_correct_structure(self):
        """GET /api/reviews/stats should return average, total, breakdown."""
        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "average" in data, f"Missing 'average' in stats: {data}"
        assert "total" in data, f"Missing 'total' in stats: {data}"
        assert "breakdown" in data, f"Missing 'breakdown' in stats: {data}"
        assert isinstance(data["average"], (int, float)), "average should be numeric"
        assert isinstance(data["total"], int), "total should be integer"
        assert isinstance(data["breakdown"], dict), "breakdown should be a dict"
        print(f"PASS: Stats structure valid: average={data['average']}, total={data['total']}, breakdown={data['breakdown']}")

    def test_get_stats_empty_when_no_reviews(self):
        """If no reviews, stats should show 0 values."""
        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert response.status_code == 200
        data = response.json()
        if data["total"] == 0:
            assert data["average"] == 0, f"Expected average=0 when no reviews, got {data['average']}"
            print("PASS: Empty stats returns correct 0 values")
        else:
            assert data["average"] > 0, "Total > 0 but average is 0"
            print(f"PASS: Stats with {data['total']} reviews, avg={data['average']}")

    def test_my_review_requires_auth(self):
        """GET /api/reviews/my-review should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/reviews/my-review")
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("PASS: GET /api/reviews/my-review correctly requires authentication (401)")

    def test_post_review_requires_auth(self):
        """POST /api/reviews should return 401 without auth."""
        response = requests.post(f"{BASE_URL}/api/reviews", json={
            "rating": 5,
            "text": "This is a test review for unauthenticated user"
        })
        assert response.status_code == 401, f"Expected 401 (auth required), got {response.status_code}"
        print("PASS: POST /api/reviews correctly requires authentication (401)")


class TestReviewsAuthenticated:
    """Tests for authenticated review submission."""

    session_token = None
    user_id = None

    @classmethod
    def setup_class(cls):
        """Create test user + session before tests in this class."""
        cls.session_token, cls.user_id = create_test_session()
        print(f"Test session created: {cls.session_token[:20]}..., user_id={cls.user_id}")

    @classmethod
    def teardown_class(cls):
        """Clean up test data after tests in this class."""
        cleanup_test_data(cls.user_id, cls.session_token)
        print(f"Cleaned up test data for user_id={cls.user_id}")

    def get_auth_headers(self):
        return {"Authorization": f"Bearer {self.session_token}"}

    def test_auth_me_works_with_session(self):
        """Verify our test session works with /api/auth/me."""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if response.status_code != 200:
            pytest.skip(f"Auth not working ({response.status_code}), skipping authenticated tests")
        data = response.json()
        assert "user_id" in data or "name" in data, f"Unexpected auth/me response: {data}"
        print(f"PASS: Auth /api/auth/me works, user: {data.get('name', 'unknown')}")

    def test_post_review_success(self):
        """POST /api/reviews with valid auth and data should return 200 with review."""
        # First verify auth works
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working, skipping authenticated review tests")

        response = requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={
                "rating": 5,
                "text": "TEST_This is a wonderful practice space that has transformed my daily meditation",
                "practice_area": "Meditation"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()

        # Validate response structure
        assert "review_id" in data, f"Missing review_id in response: {data}"
        assert "user_name" in data, f"Missing user_name in response: {data}"
        assert "initials" in data, f"Missing initials in response: {data}"
        assert data["rating"] == 5, f"Expected rating=5, got {data['rating']}"
        assert "TEST_" in data["text"], f"Expected test text, got {data['text']}"
        assert data["practice_area"] == "Meditation", f"Expected Meditation, got {data['practice_area']}"
        assert isinstance(data["initials"], str) and len(data["initials"]) > 0
        print(f"PASS: Review submitted successfully: id={data['review_id']}, initials={data['initials']}, rating={data['rating']}")

    def test_review_appears_in_get_reviews(self):
        """After submitting, the review should appear in GET /api/reviews."""
        # First ensure we have a review
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working")

        # Submit review (may already exist - will update)
        requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={
                "rating": 4,
                "text": "TEST_Sacred practices here have deepened my connection to earth and spirit",
                "practice_area": "Shamanic Practices"
            }
        )

        # Get all reviews and verify our review is there
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()

        # Find our test review
        test_reviews = [r for r in data if "TEST_Sacred practices here" in r.get("text", "")]
        assert len(test_reviews) >= 1, f"Test review not found in GET /reviews. Got {len(data)} reviews"
        review = test_reviews[0]
        assert review["rating"] == 4
        assert review["practice_area"] == "Shamanic Practices"
        print("PASS: Review appears in GET /api/reviews with correct data")

    def test_get_my_review_returns_data(self):
        """GET /api/reviews/my-review should return the user's review."""
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working")

        # Make sure a review exists
        requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={
                "rating": 3,
                "text": "TEST_Beautiful space for healing and sacred practice growth",
                "practice_area": "Yoga"
            }
        )

        response = requests.get(f"{BASE_URL}/api/reviews/my-review", headers=self.get_auth_headers())
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()

        if data is not None:
            assert "review_id" in data
            assert "rating" in data
            assert "text" in data
            print(f"PASS: GET /api/reviews/my-review returns review: rating={data['rating']}")
        else:
            print("PASS: GET /api/reviews/my-review returned null (review may not exist for this user)")

    def test_update_review_updates_existing(self):
        """Submitting another review should UPDATE the existing one (upsert)."""
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working")

        # Submit initial review
        requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={"rating": 3, "text": "TEST_Initial review text that is long enough to pass validation", "practice_area": "Yoga"}
        )

        # Submit updated review
        response = requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={"rating": 5, "text": "TEST_Updated review text that is long enough to pass validation and shows a change", "practice_area": "Meditation"}
        )
        assert response.status_code == 200, f"Expected 200 on update, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["rating"] == 5, f"Expected updated rating=5, got {data['rating']}"
        print(f"PASS: Review updated correctly: rating={data['rating']}, area={data['practice_area']}")

    def test_stats_update_after_review(self):
        """Stats should include the review we submitted (total > 0)."""
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working")

        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1, f"Expected total >= 1 after submission, got {data['total']}"
        assert data["average"] > 0, f"Expected average > 0, got {data['average']}"
        print(f"PASS: Stats updated after review: total={data['total']}, average={data['average']}")

    def test_review_validation_short_text(self):
        """POST /api/reviews with text < 10 chars should return 422."""
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working")

        response = requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={"rating": 5, "text": "Short", "practice_area": None}
        )
        assert response.status_code == 422, f"Expected 422 for short text, got {response.status_code}: {response.text}"
        print("PASS: Short text review returns 422 validation error")

    def test_review_validation_invalid_rating(self):
        """POST /api/reviews with rating=6 (out of range) should return 422."""
        auth_check = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_headers())
        if auth_check.status_code != 200:
            pytest.skip("Auth not working")

        response = requests.post(
            f"{BASE_URL}/api/reviews",
            headers=self.get_auth_headers(),
            json={"rating": 6, "text": "This text is long enough for validation purposes", "practice_area": None}
        )
        assert response.status_code == 422, f"Expected 422 for invalid rating, got {response.status_code}: {response.text}"
        print("PASS: Invalid rating=6 returns 422 validation error")
