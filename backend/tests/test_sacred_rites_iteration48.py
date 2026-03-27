"""
Backend tests for Sacred Rites 2.0 - Iteration 48
Tests: new fields (forty_day_integration, daily_practice, ceremony_preparation_guide, is_premium, safety_precautions)
for all 3 Sacred Rites courses, plus Sound Frequencies and Creative Processes.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestSacredRitesCourses:
    """Test that Sacred Rites courses have new deep content fields"""

    def test_munay_ki_has_is_premium(self):
        """Munay Ki course should have is_premium=True"""
        resp = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("is_premium") is True, f"Expected is_premium=True, got {data.get('is_premium')}"
        print("PASS: munay-ki is_premium=True")

    def test_munay_ki_has_forty_day_integration(self):
        """Munay Ki should have forty_day_integration with 4 phases"""
        resp = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert resp.status_code == 200
        data = resp.json()
        fdi = data.get("forty_day_integration")
        assert fdi is not None, "forty_day_integration field missing"
        assert "overview" in fdi, "forty_day_integration missing 'overview'"
        phases = fdi.get("phases", [])
        assert len(phases) == 4, f"Expected 4 phases, got {len(phases)}"
        # Check phase day labels
        day_labels = [p["days"] for p in phases]
        assert "Days 1–9" in day_labels, f"Missing 'Days 1–9', got {day_labels}"
        assert "Days 10–19" in day_labels, f"Missing 'Days 10–19', got {day_labels}"
        assert "Days 20–29" in day_labels, f"Missing 'Days 20–29', got {day_labels}"
        assert "Days 30–40" in day_labels, f"Missing 'Days 30–40', got {day_labels}"
        # Each phase should have journaling_prompts
        for phase in phases:
            assert "journaling_prompts" in phase, f"Phase {phase.get('days')} missing journaling_prompts"
            assert len(phase["journaling_prompts"]) > 0
        print(f"PASS: munay-ki forty_day_integration has 4 phases: {day_labels}")

    def test_munay_ki_has_daily_practice(self):
        """Munay Ki should have daily_practice with Morning Mesa Activation and 10 steps"""
        resp = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert resp.status_code == 200
        data = resp.json()
        dp = data.get("daily_practice")
        assert dp is not None, "daily_practice field missing"
        assert "Mesa Activation" in dp.get("name", ""), f"Expected 'Mesa Activation' in name, got {dp.get('name')}"
        steps = dp.get("steps", [])
        assert len(steps) >= 10, f"Expected 10+ steps, got {len(steps)}"
        print(f"PASS: munay-ki daily_practice has {len(steps)} steps, name='{dp.get('name')}'")

    def test_munay_ki_has_ceremony_preparation_guide(self):
        """Munay Ki should have ceremony_preparation_guide with altar_items and preparation_steps"""
        resp = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert resp.status_code == 200
        data = resp.json()
        cpg = data.get("ceremony_preparation_guide")
        assert cpg is not None, "ceremony_preparation_guide missing"
        assert "altar_items" in cpg, "Missing altar_items in ceremony_preparation_guide"
        assert "preparation_steps" in cpg, "Missing preparation_steps in ceremony_preparation_guide"
        assert len(cpg["altar_items"]) > 0, "altar_items is empty"
        assert len(cpg["preparation_steps"]) > 0, "preparation_steps is empty"
        print(f"PASS: munay-ki ceremony_preparation_guide has {len(cpg['altar_items'])} altar items, {len(cpg['preparation_steps'])} prep steps")

    def test_munay_ki_has_safety_precautions(self):
        """Munay Ki should have safety_precautions"""
        resp = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert resp.status_code == 200
        data = resp.json()
        sp = data.get("safety_precautions")
        assert sp is not None and len(sp) > 0, "safety_precautions missing or empty"
        print(f"PASS: munay-ki safety_precautions length={len(sp)}")

    def test_nusta_karpay_has_new_fields(self):
        """Nusta Karpay should have all new deep content fields"""
        resp = requests.get(f"{BASE_URL}/api/courses/nusta-karpay")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("is_premium") is True, "nusta-karpay missing is_premium=True"
        assert data.get("forty_day_integration") is not None, "nusta-karpay missing forty_day_integration"
        assert data.get("daily_practice") is not None, "nusta-karpay missing daily_practice"
        assert data.get("ceremony_preparation_guide") is not None, "nusta-karpay missing ceremony_preparation_guide"
        assert data.get("safety_precautions") is not None, "nusta-karpay missing safety_precautions"
        print("PASS: nusta-karpay has all new fields")

    def test_nusta_karpay_forty_day_phases(self):
        """Nusta Karpay should have forty_day_integration with phases"""
        resp = requests.get(f"{BASE_URL}/api/courses/nusta-karpay")
        assert resp.status_code == 200
        data = resp.json()
        fdi = data.get("forty_day_integration")
        phases = fdi.get("phases", [])
        assert len(phases) >= 3, f"Expected at least 3 phases, got {len(phases)}"
        for phase in phases:
            assert "journaling_prompts" in phase
        print(f"PASS: nusta-karpay forty_day_integration has {len(phases)} phases")

    def test_womb_rite_has_new_fields(self):
        """13th Womb Rite should have all new deep content fields"""
        resp = requests.get(f"{BASE_URL}/api/courses/13th-rite-womb")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("is_premium") is True, "13th-rite-womb missing is_premium=True"
        assert data.get("forty_day_integration") is not None, "13th-rite-womb missing forty_day_integration"
        assert data.get("daily_practice") is not None, "13th-rite-womb missing daily_practice"
        assert data.get("ceremony_preparation_guide") is not None, "13th-rite-womb missing ceremony_preparation_guide"
        assert data.get("safety_precautions") is not None, "13th-rite-womb missing safety_precautions"
        print("PASS: 13th-rite-womb has all new fields")

    def test_womb_rite_forty_day_has_4_phases(self):
        """13th Womb Rite should have forty_day_integration with 4 phases"""
        resp = requests.get(f"{BASE_URL}/api/courses/13th-rite-womb")
        assert resp.status_code == 200
        data = resp.json()
        fdi = data.get("forty_day_integration")
        phases = fdi.get("phases", [])
        assert len(phases) == 4, f"Expected 4 phases for womb rite, got {len(phases)}"
        day_labels = [p["days"] for p in phases]
        print(f"PASS: 13th-rite-womb forty_day_integration has 4 phases: {day_labels}")

    def test_all_courses_list_has_3_sacred_rites(self):
        """GET /api/courses should include all 3 Sacred Rites with is_premium"""
        resp = requests.get(f"{BASE_URL}/api/courses")
        assert resp.status_code == 200
        courses = resp.json()
        sacred_rite_ids = {"munay-ki", "nusta-karpay", "13th-rite-womb"}
        found_ids = {c.get("id") for c in courses}
        for rite_id in sacred_rite_ids:
            assert rite_id in found_ids, f"Missing sacred rite: {rite_id}"
        # Verify is_premium on all 3
        for course in courses:
            if course.get("id") in sacred_rite_ids:
                assert course.get("is_premium") is True, f"Course {course.get('id')} missing is_premium"
        print(f"PASS: All 3 sacred rites present in /api/courses, all have is_premium=True")


class TestSoundFrequencies:
    """Test Sound Frequencies endpoint for 5+ drum entries"""

    def test_sound_frequencies_has_shamanic_drums(self):
        """Should have 5+ entries with category='shamanic'"""
        resp = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert resp.status_code == 200
        entries = resp.json()
        shamanic = [e for e in entries if e.get("category") == "shamanic"]
        assert len(shamanic) >= 5, f"Expected 5+ shamanic drum entries, got {len(shamanic)}"
        print(f"PASS: Found {len(shamanic)} shamanic drum entries")

    def test_sound_frequencies_total_count(self):
        """Should have a healthy total count of sound frequencies"""
        resp = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert resp.status_code == 200
        entries = resp.json()
        assert len(entries) > 10, f"Expected 10+ total frequencies, got {len(entries)}"
        print(f"PASS: Total sound frequencies: {len(entries)}")


class TestCreativeProcesses:
    """Test Creative Processes endpoint for 'ceremony' category"""

    def test_creative_processes_has_ceremony_category(self):
        """Should have at least one entry with category='ceremony' (smudging)"""
        resp = requests.get(f"{BASE_URL}/api/creative-processes")
        assert resp.status_code == 200
        processes = resp.json()
        ceremony_entries = [p for p in processes if p.get("category") == "ceremony"]
        assert len(ceremony_entries) >= 1, f"Expected 1+ ceremony entries, got {len(ceremony_entries)}"
        # Verify smudging is in ceremony category
        smudging = next((p for p in processes if p.get("id") == "smudging"), None)
        assert smudging is not None, "smudging entry not found"
        assert smudging.get("category") == "ceremony", f"smudging category is {smudging.get('category')}, expected 'ceremony'"
        print(f"PASS: Found {len(ceremony_entries)} ceremony processes, smudging is ceremony")

    def test_creative_processes_smudging_has_safety_precautions(self):
        """Smudging should have safety_precautions"""
        resp = requests.get(f"{BASE_URL}/api/creative-processes/smudging")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("safety_precautions"), "smudging missing safety_precautions"
        print(f"PASS: smudging has safety_precautions (length={len(data['safety_precautions'])})")
