"""
Test sacred rites courses deep content:
- GET /api/courses returns all 3 sacred rite courses
- Each course has rites[], rituals[], embodiment_practices[], preparation, integration_guidance
- Munay Ki: 9 rites, 3 rituals, 4 embodiment practices
- Nusta Karpay: 7 rites, 3 rituals, 2 embodiment practices
- 13th Womb Rite: 3 rites, 3 rituals, 3 embodiment practices
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestCoursesAPI:
    """Basic courses API tests"""

    def test_get_courses_returns_list(self):
        resp = requests.get(f"{BASE_URL}/api/courses")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 3, f"Expected at least 3 courses, got {len(data)}"

    def test_courses_contain_sacred_rite_ids(self):
        resp = requests.get(f"{BASE_URL}/api/courses")
        assert resp.status_code == 200
        ids = [c.get('id') for c in resp.json()]
        assert 'munay-ki' in ids, "munay-ki course missing"
        assert 'nusta-karpay' in ids, "nusta-karpay course missing"
        assert '13th-rite-womb' in ids, "13th-rite-womb course missing"


class TestMunayKiCourse:
    """Munay Ki course — 9 rites, 3 rituals, 4 embodiment, preparation + integration"""

    def _get_course(self):
        resp = requests.get(f"{BASE_URL}/api/courses/munay-ki")
        assert resp.status_code == 200
        return resp.json()

    def test_munay_ki_exists(self):
        course = self._get_course()
        assert course.get('id') == 'munay-ki'

    def test_munay_ki_has_9_rites(self):
        course = self._get_course()
        rites = course.get('rites', [])
        assert len(rites) == 9, f"Expected 9 rites, got {len(rites)}"

    def test_munay_ki_rite_names(self):
        course = self._get_course()
        names = [r['name'] for r in course['rites']]
        expected = ['Bands of Power', "Healer's Rite", 'Harmony Rite',
                    "Seer's Rite", "Daykeeper's Rite", "Wisdomkeeper's Rite",
                    "Earthkeeper's Rite", "Starkeeper's Rite", 'Creator Rite']
        for name in expected:
            assert name in names, f"Rite '{name}' missing from Munay Ki"

    def test_munay_ki_rites_have_deep_content(self):
        course = self._get_course()
        for rite in course['rites']:
            assert rite.get('description'), f"Rite '{rite['name']}' missing description"
            assert rite.get('embodiment_practice'), f"Rite '{rite['name']}' missing embodiment_practice"
            ep = rite['embodiment_practice']
            assert ep.get('name'), f"Embodiment practice for '{rite['name']}' missing name"
            assert len(ep.get('steps', [])) > 0, f"Embodiment practice for '{rite['name']}' missing steps"

    def test_munay_ki_has_3_rituals(self):
        course = self._get_course()
        rituals = course.get('rituals', [])
        assert len(rituals) == 3, f"Expected 3 rituals, got {len(rituals)}"

    def test_munay_ki_ritual_names(self):
        course = self._get_course()
        names = [r['name'] for r in course['rituals']]
        assert 'The Despacho Ceremony' in names
        assert 'The Mesa Activation' in names
        assert any('Saminchakuy' in n for n in names)

    def test_munay_ki_rituals_have_steps_and_what_you_need(self):
        course = self._get_course()
        for ritual in course['rituals']:
            assert len(ritual.get('steps', [])) > 0, f"Ritual '{ritual['name']}' missing steps"
            assert len(ritual.get('what_you_need', [])) > 0, f"Ritual '{ritual['name']}' missing what_you_need"

    def test_munay_ki_has_4_embodiment_practices(self):
        course = self._get_course()
        practices = course.get('embodiment_practices', [])
        assert len(practices) == 4, f"Expected 4 embodiment practices, got {len(practices)}"

    def test_munay_ki_embodiment_practices_have_type_duration_steps(self):
        course = self._get_course()
        for practice in course['embodiment_practices']:
            assert practice.get('type'), f"Practice '{practice['name']}' missing type"
            assert practice.get('duration'), f"Practice '{practice['name']}' missing duration"
            assert len(practice.get('steps', [])) > 0, f"Practice '{practice['name']}' missing steps"

    def test_munay_ki_has_preparation(self):
        course = self._get_course()
        assert course.get('preparation'), "Munay Ki missing preparation"
        assert len(course['preparation']) > 50

    def test_munay_ki_has_integration_guidance(self):
        course = self._get_course()
        assert course.get('integration_guidance'), "Munay Ki missing integration_guidance"
        assert len(course['integration_guidance']) > 50


class TestNustaKarpayCourse:
    """Nusta Karpay — 7 rites, 3 rituals, 2 embodiment"""

    def _get_course(self):
        resp = requests.get(f"{BASE_URL}/api/courses/nusta-karpay")
        assert resp.status_code == 200
        return resp.json()

    def test_nusta_karpay_exists(self):
        course = self._get_course()
        assert course.get('id') == 'nusta-karpay'

    def test_nusta_karpay_has_7_rites(self):
        course = self._get_course()
        rites = course.get('rites', [])
        assert len(rites) == 7, f"Expected 7 rites, got {len(rites)}"

    def test_nusta_karpay_rite_names(self):
        course = self._get_course()
        names = [r['name'] for r in course['rites']]
        expected = ['Mama Ocllo', 'Dona Mujia', 'Mama Simona',
                    'Choquesuso', 'Dona Teresa', 'Maria Sakapana', 'Huayra Mujia']
        for name in expected:
            assert name in names, f"Rite '{name}' missing from Nusta Karpay"

    def test_nusta_karpay_rites_have_deep_content(self):
        course = self._get_course()
        for rite in course['rites']:
            assert rite.get('description'), f"Rite '{rite['name']}' missing description"
            assert rite.get('embodiment_practice'), f"Rite '{rite['name']}' missing embodiment_practice"

    def test_nusta_karpay_has_3_rituals(self):
        course = self._get_course()
        rituals = course.get('rituals', [])
        assert len(rituals) == 3, f"Expected 3 rituals, got {len(rituals)}"

    def test_nusta_karpay_has_2_embodiment_practices(self):
        course = self._get_course()
        practices = course.get('embodiment_practices', [])
        assert len(practices) == 2, f"Expected 2 embodiment practices, got {len(practices)}"

    def test_nusta_karpay_has_preparation(self):
        course = self._get_course()
        assert course.get('preparation'), "Nusta Karpay missing preparation"


class TestWombRiteCourse:
    """13th Rite of the Womb — 3 rites, 3 rituals, 3 embodiment"""

    def _get_course(self):
        resp = requests.get(f"{BASE_URL}/api/courses/13th-rite-womb")
        assert resp.status_code == 200
        return resp.json()

    def test_womb_rite_exists(self):
        course = self._get_course()
        assert course.get('id') == '13th-rite-womb'

    def test_womb_rite_has_3_rites(self):
        course = self._get_course()
        rites = course.get('rites', [])
        assert len(rites) == 3, f"Expected 3 rites, got {len(rites)}"

    def test_womb_rite_rite_names(self):
        course = self._get_course()
        names = [r['name'] for r in course['rites']]
        assert 'The Rite Itself' in names
        assert 'The Lineage Healing' in names
        assert 'The Creative Rebirth' in names

    def test_womb_rite_rites_have_deep_content(self):
        course = self._get_course()
        for rite in course['rites']:
            assert rite.get('description'), f"Rite '{rite['name']}' missing description"
            assert rite.get('embodiment_practice'), f"Rite '{rite['name']}' missing embodiment_practice"

    def test_womb_rite_has_3_rituals(self):
        course = self._get_course()
        rituals = course.get('rituals', [])
        assert len(rituals) == 3, f"Expected 3 rituals, got {len(rituals)}"

    def test_womb_rite_has_3_embodiment_practices(self):
        course = self._get_course()
        practices = course.get('embodiment_practices', [])
        assert len(practices) == 3, f"Expected 3 embodiment practices, got {len(practices)}"

    def test_womb_rite_embodiment_practices_have_steps(self):
        course = self._get_course()
        for practice in course['embodiment_practices']:
            assert len(practice.get('steps', [])) > 0, f"Practice '{practice['name']}' missing steps"

    def test_womb_rite_has_preparation(self):
        course = self._get_course()
        assert course.get('preparation'), "13th Womb Rite missing preparation"
