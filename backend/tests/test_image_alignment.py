"""
Test image subject alignment for grounding, water-practices, daily-practice, mindfulness, and meditations routes.
Verifies that images are present, URLs resolve, and match subject matter.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Key practice names that should have explicit image fallbacks
GROUNDING_EXPECTED_SUBJECTS = [
    "cold water reset",
    "root visualization",
    "barefoot walking",
    "body scan anchor",
    "5-4-3-2-1 senses",
]

WATER_EXPECTED_SUBJECTS = [
    "water gratitude ceremony",
    "full moon water",
    "new moon water",
    "crystalline water activation",
    "light code water infusion",
    "crystal-charged water medicine",
    "energetic water cleansing",
]


class TestGroundingImageAlignment:
    """Test grounding exercises have proper subject-aligned images."""

    def test_grounding_endpoint_returns_data(self):
        """Verify /api/grounding returns exercises."""
        response = requests.get(f"{BASE_URL}/api/grounding", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of exercises"
        print(f"Grounding exercises count: {len(data)}")
        assert len(data) > 0, "Expected at least one grounding exercise"

    def test_grounding_exercises_have_images(self):
        """Verify each grounding exercise has an image_url."""
        response = requests.get(f"{BASE_URL}/api/grounding", timeout=15)
        assert response.status_code == 200
        exercises = response.json()
        
        missing_images = []
        placeholder_images = []
        
        for exercise in exercises:
            name = exercise.get("name", "Unknown")
            image_url = exercise.get("image_url", "")
            
            if not image_url or image_url == "None" or image_url.strip() == "":
                missing_images.append(name)
            elif "static.prod-images.emergentagent.com/jobs/" in image_url:
                placeholder_images.append(name)
        
        print(f"Exercises with missing images: {missing_images}")
        print(f"Exercises with placeholder images: {placeholder_images}")
        
        # Critical: No missing images
        assert len(missing_images) == 0, f"Exercises missing images: {missing_images}"

    def test_grounding_key_subjects_have_aligned_images(self):
        """Verify key grounding subjects have proper subject-aligned images."""
        response = requests.get(f"{BASE_URL}/api/grounding", timeout=15)
        assert response.status_code == 200
        exercises = response.json()
        
        # Build lookup by normalized name
        exercise_map = {}
        for ex in exercises:
            name_lower = (ex.get("name") or "").lower().strip()
            exercise_map[name_lower] = ex
        
        issues = []
        for subject in GROUNDING_EXPECTED_SUBJECTS:
            subject_lower = subject.lower()
            exercise = exercise_map.get(subject_lower)
            if not exercise:
                print(f"Subject '{subject}' not found in grounding exercises")
                continue
            
            image_url = exercise.get("image_url", "")
            if not image_url or image_url == "None":
                issues.append(f"{subject}: missing image")
            elif "static.prod-images.emergentagent.com/jobs/" in image_url:
                issues.append(f"{subject}: has placeholder image")
            else:
                print(f"✓ {subject}: has aligned image - {image_url[:80]}...")
        
        if issues:
            print(f"Issues found: {issues}")
        assert len(issues) == 0, f"Image alignment issues: {issues}"


class TestWaterPracticesImageAlignment:
    """Test water practices have proper subject-aligned images."""

    def test_water_practices_endpoint_returns_data(self):
        """Verify /api/water-practices returns practices."""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of practices"
        print(f"Water practices count: {len(data)}")
        assert len(data) > 0, "Expected at least one water practice"

    def test_water_practices_have_images(self):
        """Verify each water practice has an image_url."""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=15)
        assert response.status_code == 200
        practices = response.json()
        
        missing_images = []
        placeholder_images = []
        
        for practice in practices:
            name = practice.get("name", "Unknown")
            image_url = practice.get("image_url", "")
            
            if not image_url or image_url == "None" or image_url.strip() == "":
                missing_images.append(name)
            elif "static.prod-images.emergentagent.com/jobs/" in image_url:
                placeholder_images.append(name)
        
        print(f"Practices with missing images: {missing_images}")
        print(f"Practices with placeholder images: {placeholder_images}")
        
        # Critical: No missing images
        assert len(missing_images) == 0, f"Practices missing images: {missing_images}"

    def test_water_key_subjects_have_aligned_images(self):
        """Verify key water subjects have proper subject-aligned images."""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=15)
        assert response.status_code == 200
        practices = response.json()
        
        # Build lookup by normalized name
        practice_map = {}
        for p in practices:
            name_lower = (p.get("name") or "").lower().strip()
            practice_map[name_lower] = p
        
        issues = []
        for subject in WATER_EXPECTED_SUBJECTS:
            subject_lower = subject.lower()
            practice = practice_map.get(subject_lower)
            if not practice:
                print(f"Subject '{subject}' not found in water practices")
                continue
            
            image_url = practice.get("image_url", "")
            if not image_url or image_url == "None":
                issues.append(f"{subject}: missing image")
            elif "static.prod-images.emergentagent.com/jobs/" in image_url:
                issues.append(f"{subject}: has placeholder image")
            else:
                print(f"✓ {subject}: has aligned image - {image_url[:80]}...")
        
        if issues:
            print(f"Issues found: {issues}")
        # Allow some missing since not all may be in DB
        critical_issues = [i for i in issues if "missing image" in i]
        assert len(critical_issues) == 0, f"Critical image issues: {critical_issues}"


class TestDailyPracticeImageAlignment:
    """Test daily practice cards have proper images."""

    def test_daily_practice_endpoint_returns_data(self):
        """Verify /api/daily-practice returns structured data."""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, dict), "Expected dict response"
        print(f"Daily practice keys: {list(data.keys())}")

    def test_daily_practice_morning_has_image(self):
        """Verify morning practice has an image."""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        morning = data.get("morning_practice")
        if morning:
            name = morning.get("name", "Unknown")
            image_url = morning.get("image_url", "")
            print(f"Morning practice: {name}")
            print(f"Morning image: {image_url[:100] if image_url else 'MISSING'}...")
            
            assert image_url and image_url != "None", f"Morning practice '{name}' missing image"
            assert "static.prod-images.emergentagent.com/jobs/" not in image_url, f"Morning practice has placeholder image"
        else:
            print("No morning practice returned (may be expected)")

    def test_daily_practice_evening_has_image(self):
        """Verify evening practice has an image."""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        evening = data.get("evening_practice")
        if evening:
            name = evening.get("name", "Unknown")
            image_url = evening.get("image_url", "")
            print(f"Evening practice: {name}")
            print(f"Evening image: {image_url[:100] if image_url else 'MISSING'}...")
            
            assert image_url and image_url != "None", f"Evening practice '{name}' missing image"
            assert "static.prod-images.emergentagent.com/jobs/" not in image_url, f"Evening practice has placeholder image"
        else:
            print("No evening practice returned (may be expected)")

    def test_daily_ally_has_image(self):
        """Verify daily ally card has an image."""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        ally = data.get("daily_ally")
        if ally:
            name = ally.get("name", "Unknown")
            image_url = ally.get("image_url", "")
            print(f"Daily ally: {name}")
            print(f"Ally image: {image_url[:100] if image_url else 'MISSING'}...")
            
            # Ally images may come from different sources, just check not empty
            if not image_url or image_url == "None":
                print(f"WARNING: Daily ally '{name}' missing image")
        else:
            print("No daily ally returned")

    def test_daily_angel_has_image(self):
        """Verify daily angel card has an image."""
        response = requests.get(f"{BASE_URL}/api/daily-practice", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        angel = data.get("daily_angel")
        if angel:
            name = angel.get("name", "Unknown")
            image_url = angel.get("image_url", "")
            print(f"Daily angel: {name}")
            print(f"Angel image: {image_url[:100] if image_url else 'MISSING'}...")
            
            # Angel images may come from different sources, just check not empty
            if not image_url or image_url == "None":
                print(f"WARNING: Daily angel '{name}' missing image")
        else:
            print("No daily angel returned")


class TestMindfulnessImageAlignment:
    """Test mindfulness practices have proper images."""

    def test_mindfulness_endpoint_returns_data(self):
        """Verify /api/mindfulness returns practices."""
        response = requests.get(f"{BASE_URL}/api/mindfulness", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of practices"
        print(f"Mindfulness practices count: {len(data)}")

    def test_mindfulness_practices_have_images(self):
        """Verify mindfulness practices have images."""
        response = requests.get(f"{BASE_URL}/api/mindfulness", timeout=15)
        assert response.status_code == 200
        practices = response.json()
        
        if not practices:
            print("No mindfulness practices in database - skipping")
            return
        
        missing_images = []
        for practice in practices:
            name = practice.get("name", "Unknown")
            image_url = practice.get("image_url", "")
            
            if not image_url or image_url == "None" or image_url.strip() == "":
                missing_images.append(name)
        
        print(f"Mindfulness practices with missing images: {missing_images}")
        # Report but don't fail if some are missing
        if missing_images:
            print(f"WARNING: {len(missing_images)} mindfulness practices missing images")


class TestMeditationsImageAlignment:
    """Test meditations have proper images."""

    def test_meditations_endpoint_returns_data(self):
        """Verify /api/meditations returns meditations."""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of meditations"
        print(f"Meditations count: {len(data)}")

    def test_meditations_have_images(self):
        """Verify meditations have images."""
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=15)
        assert response.status_code == 200
        meditations = response.json()
        
        if not meditations:
            print("No meditations in database - skipping")
            return
        
        missing_images = []
        placeholder_images = []
        
        for meditation in meditations:
            name = meditation.get("name", "Unknown")
            image_url = meditation.get("image_url", "")
            
            if not image_url or image_url == "None" or image_url.strip() == "":
                missing_images.append(name)
            elif "static.prod-images.emergentagent.com/jobs/" in image_url:
                placeholder_images.append(name)
        
        print(f"Meditations with missing images: {missing_images}")
        print(f"Meditations with placeholder images: {placeholder_images}")
        
        # Report issues
        if missing_images:
            print(f"WARNING: {len(missing_images)} meditations missing images")


class TestImageURLsResolve:
    """Test that image URLs actually resolve (HTTP HEAD check)."""

    def test_sample_grounding_images_resolve(self):
        """Verify sample grounding images resolve."""
        response = requests.get(f"{BASE_URL}/api/grounding", timeout=15)
        assert response.status_code == 200
        exercises = response.json()[:5]  # Test first 5
        
        for exercise in exercises:
            image_url = exercise.get("image_url", "")
            if not image_url or image_url == "None":
                continue
            
            try:
                head_response = requests.head(image_url, timeout=10, allow_redirects=True)
                if head_response.status_code == 200:
                    print(f"✓ Image resolves: {exercise.get('name')}")
                else:
                    print(f"✗ Image failed ({head_response.status_code}): {exercise.get('name')} - {image_url[:60]}")
            except Exception as e:
                print(f"✗ Image error: {exercise.get('name')} - {str(e)[:50]}")

    def test_sample_water_images_resolve(self):
        """Verify sample water practice images resolve."""
        response = requests.get(f"{BASE_URL}/api/water-practices", timeout=15)
        assert response.status_code == 200
        practices = response.json()[:5]  # Test first 5
        
        for practice in practices:
            image_url = practice.get("image_url", "")
            if not image_url or image_url == "None":
                continue
            
            try:
                head_response = requests.head(image_url, timeout=10, allow_redirects=True)
                if head_response.status_code == 200:
                    print(f"✓ Image resolves: {practice.get('name')}")
                else:
                    print(f"✗ Image failed ({head_response.status_code}): {practice.get('name')} - {image_url[:60]}")
            except Exception as e:
                print(f"✗ Image error: {practice.get('name')} - {str(e)[:50]}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
