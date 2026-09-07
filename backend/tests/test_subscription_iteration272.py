"""Iteration 272: Test subscription cancel flow + pricing yearly checkout.

Backend integration tests for:
  - Pricing plans endpoint returns monthly/yearly/full_app_unlock
  - POST /payments/subscription/cancel with no subscription -> 404
  - Seed active subscription -> subscription-status returns is_subscribed=true
  - Cancel -> status='cancelled', expires_at preserved
  - After cancel -> subscription-status still is_subscribed=true (access retained until expiry)
  - Yearly checkout creates Stripe URL
"""
import os
from datetime import datetime, timedelta, timezone

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"
QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"
QA_USER_ID = "0bf4a7b2-03de-44a0-9e42-99cbf67679b5"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:200]}"
    return s


def _mongo_sync_op(coro):
    import asyncio
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _delete_sub():
    client = AsyncIOMotorClient(MONGO_URL)
    try:
        await client[DB_NAME].user_subscriptions.delete_many({"user_id": QA_USER_ID})
    finally:
        client.close()


async def _seed_active_sub(status="active", days=30):
    client = AsyncIOMotorClient(MONGO_URL)
    try:
        expires_at = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
        await client[DB_NAME].user_subscriptions.update_one(
            {"user_id": QA_USER_ID},
            {"$set": {
                "user_id": QA_USER_ID,
                "plan_id": "monthly",
                "status": status,
                "expires_at": expires_at,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True,
        )
        return expires_at
    finally:
        client.close()


# --- Plans endpoint ---
def test_plans_endpoint_includes_yearly(session):
    r = session.get(f"{API}/payments/plans", timeout=15)
    assert r.status_code == 200
    plans = {p["id"]: p for p in r.json().get("plans", [])}
    assert "monthly" in plans and "yearly" in plans and "full_app_unlock" in plans
    assert plans["yearly"]["price"] == 189.99
    assert plans["monthly"]["price"] == 19.99


# --- Cancel with no subscription -> 404 ---
def test_cancel_without_subscription_returns_404(session):
    _mongo_sync_op(_delete_sub())
    r = session.post(f"{API}/payments/subscription/cancel", timeout=15)
    assert r.status_code == 404, f"Expected 404 got {r.status_code}: {r.text[:200]}"
    detail = r.json().get("detail", "")
    assert "no active membership" in detail.lower()


# --- Seeded active subscription flow ---
def test_seeded_active_subscription_status(session):
    expires_at = _mongo_sync_op(_seed_active_sub(status="active"))
    r = session.get(f"{API}/payments/subscription-status", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["is_subscribed"] is True
    assert data["plan"] == "monthly"
    assert data["status"] == "active"
    assert data["expires_at"].startswith(expires_at[:19])


def test_cancel_active_subscription(session):
    _mongo_sync_op(_seed_active_sub(status="active"))
    r = session.post(f"{API}/payments/subscription/cancel", timeout=15)
    assert r.status_code == 200, f"{r.status_code}: {r.text[:200]}"
    data = r.json()
    assert data["status"] == "cancelled"
    assert data.get("expires_at")

    # Status endpoint should still report is_subscribed=true (access retained until expiry)
    r2 = session.get(f"{API}/payments/subscription-status", timeout=15)
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["is_subscribed"] is True, f"Access should be retained until expiry, got {d2}"
    assert d2["status"] == "cancelled"


def test_cancel_idempotent(session):
    # Already cancelled state -> should return cancelled without erroring
    _mongo_sync_op(_seed_active_sub(status="cancelled"))
    r = session.post(f"{API}/payments/subscription/cancel", timeout=15)
    assert r.status_code == 200
    assert r.json()["status"] == "cancelled"


# --- Yearly checkout ---
def test_yearly_checkout_creates_stripe_url(session):
    # Clean sub so checkout isn't blocked
    _mongo_sync_op(_delete_sub())
    payload = {
        "product_type": "subscription",
        "plan_id": "yearly",
        "origin_url": BASE_URL,
        "return_path": "/pricing",
        "payment_method": "stripe",
    }
    r = session.post(f"{API}/payments/create-checkout", json=payload, timeout=30)
    assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
    data = r.json()
    assert data.get("checkout_url", "").startswith("https://"), f"Missing checkout_url: {data}"
    assert "stripe.com" in data["checkout_url"] or "checkout" in data["checkout_url"]


def test_monthly_checkout_regression(session):
    _mongo_sync_op(_delete_sub())
    payload = {
        "product_type": "subscription",
        "plan_id": "monthly",
        "origin_url": BASE_URL,
        "return_path": "/pricing",
        "payment_method": "stripe",
    }
    r = session.post(f"{API}/payments/create-checkout", json=payload, timeout=30)
    assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
    assert r.json().get("checkout_url", "").startswith("https://")


# --- Cleanup ---
def test_cleanup_seeded_subscription():
    _mongo_sync_op(_delete_sub())
