"""Shared secure test configuration.

Avoids hardcoded credentials/tokens in test files.
"""
import os
import uuid


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Auth credentials (env-first, randomized fallback)
TEST_EMAIL = os.environ.get("TEST_EMAIL") or f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = os.environ.get("TEST_PASSWORD") or f"TestPass_{uuid.uuid4().hex[:12]}!"
TEST_NAME = os.environ.get("TEST_NAME", "Test User")

# Admin/test tokens (env-only preferred)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
TEST_SESSION_TOKEN = os.environ.get("TEST_SESSION_TOKEN", "")

# Optional QA credentials (fallback to test credentials)
QA_USER_EMAIL = os.environ.get("QA_USER_EMAIL") or TEST_EMAIL
QA_USER_PASSWORD = os.environ.get("QA_USER_PASSWORD") or TEST_PASSWORD
