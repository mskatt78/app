"""Iteration 273 tests: admin security, AUD pricing, Play Billing scaffolding, checkout regression."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"


@pytest.fixture(scope="session")
def qa_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=20)
    if r.status_code != 200:
        pytest.skip(f"QA login failed: {r.status_code} {r.text[:200]}")
    return s


# ---------- Admin security ----------
class TestAdminSecurity:
    def test_admin_collections_unauth(self):
        r = requests.get(f"{API}/admin/collections", timeout=15)
        assert r.status_code == 401, f"expected 401 got {r.status_code}: {r.text[:200]}"

    def test_admin_collections_non_admin(self, qa_session):
        r = qa_session.get(f"{API}/admin/collections", timeout=15)
        assert r.status_code in (401, 403), f"expected 401/403 got {r.status_code}"

    def test_admin_create_item_non_admin(self, qa_session):
        r = qa_session.post(f"{API}/admin/videos/items", json={"title": "bogus"}, timeout=15)
        assert r.status_code in (401, 403), f"expected 401/403 got {r.status_code}"

    def test_admin_login_wrong_password(self):
        r = requests.post(f"{API}/admin/login", json={"password": "wrong-password-xyz"}, timeout=15)
        assert r.status_code == 401

    def test_admin_files_public(self):
        # non-existent path should still route to serve_file (not 401)
        r = requests.get(f"{API}/admin/files/nonexistent/path.png", timeout=15)
        assert r.status_code != 401, f"files endpoint must be public, got {r.status_code}"
        assert r.status_code in (200, 404)


# ---------- Pricing (AUD) ----------
class TestPricingAUD:
    def test_plans_currency_and_prices(self):
        r = requests.get(f"{API}/payments/plans", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("currency") == "AUD", f"currency mismatch: {data.get('currency')}"
        plans_by_id = {p["id"]: p for p in data.get("plans", [])}
        assert "monthly" in plans_by_id and "yearly" in plans_by_id and "full_app_unlock" in plans_by_id
        assert float(plans_by_id["monthly"]["price"]) == 24.99
        assert float(plans_by_id["yearly"]["price"]) == 189.99
        assert float(plans_by_id["full_app_unlock"]["price"]) == 369.0


# ---------- Web checkout regression ----------
class TestCheckoutRegression:
    def test_stripe_monthly_checkout(self, qa_session):
        r = qa_session.post(
            f"{API}/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "monthly",
                "payment_method": "stripe",
                "origin_url": BASE_URL,
            },
            timeout=25,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("checkout_url", "").startswith("http")

    def test_stripe_yearly_checkout(self, qa_session):
        r = qa_session.post(
            f"{API}/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "yearly",
                "payment_method": "stripe",
                "origin_url": BASE_URL,
            },
            timeout=25,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        assert r.json().get("checkout_url", "").startswith("http")

    def test_invalid_plan_rejected(self, qa_session):
        r = qa_session.post(
            f"{API}/payments/create-checkout",
            json={
                "product_type": "subscription",
                "plan_id": "not_a_plan",
                "payment_method": "stripe",
                "origin_url": BASE_URL,
            },
            timeout=15,
        )
        assert r.status_code in (400, 404, 422)


# ---------- Play Billing ----------
class TestPlayBilling:
    def test_config_public(self):
        r = requests.get(f"{API}/playbilling/config", timeout=15)
        assert r.status_code == 200, r.text[:200]
        data = r.json()
        assert data["package_name"] == "host.emergent.embodiment_journey.twa"
        assert data["subscription_product_id"] == "soul_temple_membership"
        assert sorted(data["base_plans"]) == ["monthly", "yearly"]
        assert data["lifetime_available"] is False
        assert data["verification_configured"] is False

    def test_verify_unauth(self):
        r = requests.post(
            f"{API}/playbilling/verify",
            json={"product_id": "soul_temple_membership", "purchase_token": "fake", "kind": "subscription"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_verify_auth_returns_503_not_configured(self, qa_session):
        r = qa_session.post(
            f"{API}/playbilling/verify",
            json={"product_id": "soul_temple_membership", "purchase_token": "fake", "kind": "subscription"},
            timeout=15,
        )
        assert r.status_code == 503, f"expected 503 got {r.status_code}: {r.text[:300]}"
        assert "not configured" in r.text.lower()

    def test_verify_unknown_product(self, qa_session):
        r = qa_session.post(
            f"{API}/playbilling/verify",
            json={"product_id": "some_bogus_product", "purchase_token": "fake", "kind": "subscription"},
            timeout=15,
        )
        assert r.status_code == 400


# ---------- Settings membership smoke ----------
class TestMembershipStatus:
    def test_subscription_status_no_sub(self, qa_session):
        r = qa_session.get(f"{API}/payments/subscription-status", timeout=15)
        assert r.status_code == 200, r.text[:200]
        data = r.json()
        # QA user should not be subscribed
        assert isinstance(data, dict)
        assert data.get("has_subscription") in (False, None) or data.get("has_full_app_unlock") in (False, None)
