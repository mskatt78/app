"""
Backend tests for Shamanic Elements Soul Temple 2.0 new features (iteration 47):
- Sound Frequencies: 6 drum journey types, 17+ total entries
- Creative Processes: 9 deep entries with safety_precautions, why_this_heals
- Videos: 15 tutorial entries
- Community sharing: POST /api/community/posts endpoint
"""
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestSoundFrequencies:
    """Test sound frequencies API - 17 total entries including 6 drum types"""

    def test_get_all_sound_frequencies(self):
        """Should return at least 17 sound frequency entries"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 17, f"Expected at least 17 entries, got {len(data)}"
        print(f"PASS: Got {len(data)} sound frequencies")

    def test_drum_entries_exist(self):
        """Should have 6 drum-related entries"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        drum_entries = [f for f in data if 'drum' in f.get('id', '').lower()]
        assert len(drum_entries) >= 6, f"Expected 6 drum entries, got {len(drum_entries)}: {[d['id'] for d in drum_entries]}"
        print(f"PASS: Found {len(drum_entries)} drum entries: {[d['id'] for d in drum_entries]}")

    def test_drum_ambient_types_present(self):
        """Each new drum type should have correct ambient_type"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        ambient_types = {f.get('ambient_type') for f in data}
        expected_drum_types = {'drums', 'drums_gentle', 'drums_journey', 'drums_awakening', 'drums_fire', 'drums_return'}
        for drum_type in expected_drum_types:
            assert drum_type in ambient_types, f"Missing ambient_type: {drum_type}. Found: {ambient_types}"
        print(f"PASS: All 6 drum ambient_types present: {expected_drum_types}")

    def test_shamanic_drums_classic_entry(self):
        """freq-drum entry (Classic Shamanic Drums) should exist with ambient_type=drums"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-drum")
        assert response.status_code == 200
        data = response.json()
        assert data['ambient_type'] == 'drums'
        assert data['name'] == 'Shamanic Drumming'
        print(f"PASS: Classic drum entry found: {data['name']}")

    def test_gentle_drum_entry(self):
        """freq-drum-gentle entry (Gentle Grounding) should exist with ambient_type=drums_gentle"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-drum-gentle")
        assert response.status_code == 200
        data = response.json()
        assert data['ambient_type'] == 'drums_gentle'
        assert 'Gentle' in data['name']
        print(f"PASS: Gentle drum entry: {data['name']}, ambient_type: {data['ambient_type']}")

    def test_journey_drum_entry(self):
        """freq-drum-journey entry (Classic Theta Journey) should exist"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-drum-journey")
        assert response.status_code == 200
        data = response.json()
        assert data['ambient_type'] == 'drums_journey'
        print(f"PASS: Journey drum entry: {data['name']}")

    def test_awakening_drum_entry(self):
        """freq-drum-awakening entry (Awakening Activation) should exist"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-drum-awakening")
        assert response.status_code == 200
        data = response.json()
        assert data['ambient_type'] == 'drums_awakening'
        print(f"PASS: Awakening drum entry: {data['name']}")

    def test_fire_drum_entry(self):
        """freq-drum-fire entry (Fire Ceremony) should exist"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-drum-fire")
        assert response.status_code == 200
        data = response.json()
        assert data['ambient_type'] == 'drums_fire'
        print(f"PASS: Fire ceremony drum entry: {data['name']}")

    def test_return_drum_entry(self):
        """freq-drum-return entry (Journey Return Call) should exist"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies/freq-drum-return")
        assert response.status_code == 200
        data = response.json()
        assert data['ambient_type'] == 'drums_return'
        print(f"PASS: Return call drum entry: {data['name']}")

    def test_shamanic_category_filter(self):
        """Filter by shamanic category should return new drum entries"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies?category=shamanic")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5, f"Expected at least 5 shamanic drum entries, got {len(data)}"
        print(f"PASS: Shamanic category filter returns {len(data)} entries")


class TestCreativeProcesses:
    """Test creative processes API - 9 deep entries with safety/healing fields"""

    def test_get_all_creative_processes(self):
        """Should return exactly 9 deep creative processes"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 9, f"Expected at least 9 processes, got {len(data)}"
        print(f"PASS: Got {len(data)} creative processes")

    def test_safety_precautions_field_present(self):
        """All processes should have safety_precautions field"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        processes_with_safety = [p for p in data if p.get('safety_precautions')]
        assert len(processes_with_safety) >= 8, f"Expected at least 8 with safety_precautions, got {len(processes_with_safety)}"
        print(f"PASS: {len(processes_with_safety)}/{len(data)} processes have safety_precautions")

    def test_why_this_heals_field_present(self):
        """Most processes should have why_this_heals field"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        processes_with_why = [p for p in data if p.get('why_this_heals')]
        assert len(processes_with_why) >= 8, f"Expected at least 8 with why_this_heals, got {len(processes_with_why)}"
        print(f"PASS: {len(processes_with_why)}/{len(data)} processes have why_this_heals")

    def test_smudging_standalone_entry(self):
        """Sacred Smudging should be a standalone entry with herb_properties"""
        response = requests.get(f"{BASE_URL}/api/creative-processes/smudging")
        assert response.status_code == 200
        data = response.json()
        assert data['name'] == 'Sacred Smudging & Space Clearing'
        assert 'herb_properties' in data
        assert isinstance(data['herb_properties'], list)
        assert len(data['herb_properties']) > 0
        assert 'safety_precautions' in data
        print(f"PASS: Smudging entry found with {len(data['herb_properties'])} herbs and safety_precautions")

    def test_vision_quest_process_fields(self):
        """Vision Quest Journaling entry should have full deep fields"""
        response = requests.get(f"{BASE_URL}/api/creative-processes/1")
        assert response.status_code == 200
        data = response.json()
        assert data['name'] == 'Vision Quest Journaling'
        assert 'why_this_heals' in data and data['why_this_heals']
        assert 'safety_precautions' in data and data['safety_precautions']
        assert 'integration' in data
        print("PASS: Vision Quest entry has all deep fields")

    def test_creative_processes_ceremony_category(self):
        """Filter by ceremony category should return smudging entry"""
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=ceremony")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        smudging = next((p for p in data if p['id'] == 'smudging'), None)
        assert smudging is not None, "Smudging entry not found in ceremony category"
        print(f"PASS: Ceremony filter returns {len(data)} entries including smudging")

    def test_therapeutic_benefits_present(self):
        """Processes should have therapeutic_benefits array"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        data = response.json()
        processes_with_benefits = [p for p in data if p.get('therapeutic_benefits') and len(p['therapeutic_benefits']) > 0]
        assert len(processes_with_benefits) >= 8, f"Expected at least 8 with therapeutic_benefits, got {len(processes_with_benefits)}"
        print(f"PASS: {len(processes_with_benefits)}/{len(data)} processes have therapeutic_benefits")


class TestVideos:
    """Test videos API - 15 tutorial entries"""

    def test_get_all_videos(self):
        """Should return exactly 15 video entries"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 15, f"Expected 15 videos, got {len(data)}"
        print(f"PASS: Got {len(data)} videos")

    def test_video_structure(self):
        """Each video should have required fields"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        required_fields = ['id', 'title', 'description', 'category', 'video_url', 'duration', 'level', 'tradition']
        for video in data:
            for field in required_fields:
                assert field in video, f"Video {video.get('id')} missing field: {field}"
        print(f"PASS: All {len(data)} videos have required structure")

    def test_video_categories_present(self):
        """Videos should cover multiple categories"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        categories = {v['category'] for v in data}
        expected_categories = {'shamanic', 'somatic', 'breathwork', 'creative', 'sacred_rites', 'sound', 'meditation', 'movement'}
        for cat in expected_categories:
            assert cat in categories, f"Missing video category: {cat}. Found: {categories}"
        print(f"PASS: Video categories present: {categories}")

    def test_video_filter_by_category(self):
        """Filter by shamanic should return shamanic videos"""
        response = requests.get(f"{BASE_URL}/api/videos?category=shamanic")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3, f"Expected at least 3 shamanic videos, got {len(data)}"
        for video in data:
            assert video['category'] == 'shamanic'
        print(f"PASS: Shamanic filter returns {len(data)} videos")


class TestCommunityPosts:
    """Test community posts API - POST endpoint"""

    def test_create_community_post(self):
        """POST /api/community/posts should create a new post"""
        post_data = {
            "title": "TEST_Journey Reflection — Heart Chakra",
            "content": "**Reflection:** I felt deep peace during this practice.\n\n**Key Insights:** The drum carried me home.",
            "author": "TEST_Sacred Traveller",
            "type": "reflection",
            "practice_type": "chakra",
            "moon_phase": "Full Moon",
            "mood": "Radiant"
        }
        response = requests.post(f"{BASE_URL}/api/community/posts", json=post_data)
        assert response.status_code == 200
        data = response.json()
        assert data['title'] == post_data['title']
        assert data['content'] == post_data['content']
        assert data['author'] == post_data['author']
        assert data['type'] == 'reflection'
        assert 'id' in data
        assert data['likes'] == 0
        assert data['status'] == 'published'
        print(f"PASS: Community post created with id: {data['id']}")
        return data['id']

    def test_get_community_posts_after_creation(self):
        """GET /api/community/posts should return created posts"""
        # First create a post
        post_data = {
            "title": "TEST_Verification Post",
            "content": "Test content for verification",
            "author": "TEST_User",
            "type": "reflection"
        }
        create_resp = requests.post(f"{BASE_URL}/api/community/posts", json=post_data)
        assert create_resp.status_code == 200
        created_post = create_resp.json()
        post_id = created_post['id']

        # Now verify it appears in GET
        get_resp = requests.get(f"{BASE_URL}/api/community/posts")
        assert get_resp.status_code == 200
        posts = get_resp.json()
        post_ids = [p['id'] for p in posts]
        assert post_id in post_ids, f"Created post {post_id} not found in list"
        print(f"PASS: Created post {post_id} found in community posts list")

    def test_community_post_missing_fields_defaults(self):
        """POST should work with minimal data, defaulting missing fields"""
        post_data = {
            "content": "A minimal shamanic reflection"
        }
        response = requests.post(f"{BASE_URL}/api/community/posts", json=post_data)
        assert response.status_code == 200
        data = response.json()
        assert data['title'] == 'Reflection'  # default title
        assert data['author'] == 'Anonymous'  # default author
        assert data['type'] == 'reflection'   # default type
        assert data['content'] == 'A minimal shamanic reflection'
        print(f"PASS: Minimal post created with defaults. id: {data['id']}")

    def test_like_community_post(self):
        """POST /api/community/posts/{id}/like should increment likes"""
        # Create a post first
        post_data = {"title": "TEST_Like Test", "content": "Like this post", "author": "TEST_User"}
        create_resp = requests.post(f"{BASE_URL}/api/community/posts", json=post_data)
        assert create_resp.status_code == 200
        post_id = create_resp.json()['id']

        # Like it
        like_resp = requests.post(f"{BASE_URL}/api/community/posts/{post_id}/like")
        assert like_resp.status_code == 200

        # Verify likes incremented
        get_resp = requests.get(f"{BASE_URL}/api/community/posts/{post_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()['likes'] == 1
        print("PASS: Like endpoint works - likes incremented to 1")
