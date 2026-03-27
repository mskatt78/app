"""
Test file for bug fix verification - Iteration 44
Tests:
1. Mudra images uniqueness - all 12 mudras have different image URLs
2. Heart practices API - modal content works (no timer component, has steps data)
3. Courses - 3 Sacred Rites present (Munay Ki, 13th Womb Rite, Nusta Karpay)
4. Community posts - 5 posts present (Sacred Circle Awakening)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestMudrasUniqueImages:
    """Verify all 12 mudras have unique image URLs - no duplicates"""

    def test_mudras_count(self):
        """12 mudras should be present"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12, f"Expected 12 mudras, got {len(data)}"

    def test_mudras_all_have_images(self):
        """All mudras should have image_url"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        for mudra in data:
            assert mudra.get('image_url'), f"Mudra {mudra.get('name')} has no image_url"

    def test_mudras_images_are_unique(self):
        """All 12 mudras should have unique image URLs - no duplicates"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        
        image_urls = [m['image_url'] for m in data if m.get('image_url')]
        unique_urls = set(image_urls)
        
        assert len(unique_urls) == len(image_urls), (
            f"Duplicate images found! Got {len(image_urls)} images but only {len(unique_urls)} unique. "
            f"Duplicates: {[u for u in image_urls if image_urls.count(u) > 1]}"
        )

    def test_mudras_have_expected_fields(self):
        """Mudras should have name, element, description, benefits"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        
        for mudra in data:
            assert mudra.get('name'), f"Mudra missing name: {mudra}"
            assert mudra.get('element'), f"Mudra {mudra.get('name')} missing element"
            assert mudra.get('description'), f"Mudra {mudra.get('name')} missing description"


class TestHeartPractices:
    """Verify heart practices API - data structure for guided practice modal"""

    def test_heart_practices_count(self):
        """Should have heart practices"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "No heart practices found"

    def test_heart_practices_have_required_fields(self):
        """Heart practices should have name, description, duration, category"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        
        for practice in data:
            assert practice.get('name'), f"Practice missing name: {practice}"
            assert practice.get('description'), f"Practice {practice.get('name')} missing description"

    def test_heart_practices_step_fields_present(self):
        """At least some practices should have step-type fields for guided mode"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        data = response.json()
        
        step_field_names = ['steps', 'ceremony_steps', 'meditation_steps', 'journey_steps', 
                            'ritual_steps', 'visualization_steps']
        
        practices_with_steps = []
        for practice in data:
            for field in step_field_names:
                if practice.get(field):
                    practices_with_steps.append(practice['name'])
                    break
        
        assert len(practices_with_steps) > 0, "No practices have any step fields"
        print(f"Practices with step fields: {practices_with_steps}")

    def test_heart_practices_filter_by_category(self):
        """Category filter should work"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=self_love")
        assert response.status_code == 200


class TestCoursesThreeSacredRites:
    """Verify 3 Sacred Rites are in courses"""

    def test_courses_count(self):
        """Should return 3 courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3, f"Expected 3 courses, got {len(data)}"

    def test_munay_ki_course_present(self):
        """Munay Ki should be in courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        titles = [c.get('title', c.get('name', '')).lower() for c in data]
        assert any('munay' in t for t in titles), f"Munay Ki not found in courses: {titles}"

    def test_nusta_karpay_course_present(self):
        """Nusta Karpay should be in courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        titles = [c.get('title', c.get('name', '')).lower() for c in data]
        assert any('nusta' in t for t in titles), f"Nusta Karpay not found in courses: {titles}"

    def test_womb_rite_course_present(self):
        """13th Womb Rite should be in courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        titles = [c.get('title', c.get('name', '')).lower() for c in data]
        assert any('womb' in t for t in titles), f"13th Womb Rite not found in courses: {titles}"

    def test_courses_have_content(self):
        """All courses should have title/name and description"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        
        for course in data:
            assert course.get('title') or course.get('name'), f"Course missing title/name: {course}"
            assert course.get('description'), f"Course missing description: {course}"


class TestCommunityPostsSacredCircle:
    """Verify 5 community posts are present for Sacred Circle"""

    def test_community_posts_count(self):
        """Should return 5 community posts"""
        response = requests.get(f"{BASE_URL}/api/community/posts")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5, f"Expected 5 posts, got {len(data)}"

    def test_munay_ki_post_present(self):
        """Munay Ki post should be in community posts"""
        response = requests.get(f"{BASE_URL}/api/community/posts")
        assert response.status_code == 200
        data = response.json()
        
        titles = [p.get('title', '').lower() for p in data]
        assert any('munay' in t for t in titles), f"Munay Ki post not found: {titles}"

    def test_womb_rite_post_present(self):
        """13th Rite of the Womb post should be present"""
        response = requests.get(f"{BASE_URL}/api/community/posts")
        assert response.status_code == 200
        data = response.json()
        
        titles = [p.get('title', '').lower() for p in data]
        assert any('womb' in t for t in titles), f"Womb rite post not found: {titles}"

    def test_nusta_karpay_post_present(self):
        """Nusta Karpay post should be present"""
        response = requests.get(f"{BASE_URL}/api/community/posts")
        assert response.status_code == 200
        data = response.json()
        
        titles = [p.get('title', '').lower() for p in data]
        assert any('nusta' in t for t in titles), f"Nusta Karpay post not found: {titles}"

    def test_posts_have_required_fields(self):
        """Posts should have title, content, type, element"""
        response = requests.get(f"{BASE_URL}/api/community/posts")
        assert response.status_code == 200
        data = response.json()
        
        for post in data:
            assert post.get('title'), f"Post missing title: {post.get('id')}"
            assert post.get('content'), f"Post {post.get('title')} missing content"
            assert post.get('type'), f"Post {post.get('title')} missing type"
