#!/usr/bin/env python3
"""Lightweight security guardrails for CI.

Checks:
- hashlib.md5 usage
- subprocess with shell=True
- hardcoded secret-like assignments in tests
- auth token localStorage usage in frontend
"""
from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

RULES = [
    {
        "name": "md5-usage",
        "pattern": re.compile(r"hashlib\.md5\s*\("),
        "paths": ["backend"],
        "message": "Use SHA-256 or stronger instead of MD5.",
    },
    {
        "name": "subprocess-shell-true",
        "pattern": re.compile(r"subprocess\.(run|Popen)\([^\n]*shell\s*=\s*True"),
        "paths": ["backend"],
        "message": "Avoid shell=True to prevent command injection.",
    },
    {
        "name": "hardcoded-test-secrets",
        "pattern": re.compile(
            r"\b(ADMIN_PASSWORD|SESSION_TOKEN|TEST_PASSWORD|QA_USER_PASSWORD)\s*=\s*[\"'][^\"']+[\"']"
        ),
        "paths": ["backend/tests"],
        "message": "Use env-backed test_security_config.py instead of hardcoded secrets.",
    },
    {
        "name": "localstorage-auth-token",
        "pattern": re.compile(r"localStorage\.(getItem|setItem)\(\s*[\"'](auth_token|admin_token)[\"']"),
        "paths": ["frontend/src"],
        "message": "Store auth/admin tokens in sessionStorage or httpOnly cookies.",
    },
]


def iter_files(base_path: Path):
    for ext in ("*.py", "*.js", "*.jsx", "*.ts", "*.tsx"):
        yield from base_path.rglob(ext)


def main() -> int:
    violations = []

    for rule in RULES:
        for rel_path in rule["paths"]:
            scan_root = ROOT / rel_path
            if not scan_root.exists():
                continue
            for file_path in iter_files(scan_root):
                try:
                    text = file_path.read_text(encoding="utf-8")
                except Exception:
                    continue

                for match in rule["pattern"].finditer(text):
                    if rule["name"] == "localstorage-auth-token" and str(file_path).endswith("adminSession.js"):
                        # Allowed for one-time legacy migration from localStorage -> sessionStorage.
                        continue
                    line_num = text.count("\n", 0, match.start()) + 1
                    violations.append(
                        f"[{rule['name']}] {file_path.relative_to(ROOT)}:{line_num} — {rule['message']}"
                    )

    if violations:
        print("Security guardrails failed:\n")
        for item in violations:
            print(f"- {item}")
        return 1

    print("Security guardrails passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
