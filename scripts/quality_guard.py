#!/usr/bin/env python3

"""Project quality guards used in CI and local checks.

Current checks:
- Reject empty catch blocks in frontend source files
- Enforce max line count for selected source directories
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path


EMPTY_CATCH_PATTERN = re.compile(r"catch\s*\([^)]*\)\s*\{\s*\}", re.MULTILINE | re.DOTALL)


@dataclass
class GuardIssue:
    file_path: str
    line: int
    message: str


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _line_number(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def _iter_source_files(base: Path, extensions: tuple[str, ...]) -> list[Path]:
    return sorted(
        path
        for path in base.rglob("*")
        if path.is_file()
        and path.suffix in extensions
        and "node_modules" not in path.parts
        and ".git" not in path.parts
        and "build" not in path.parts
        and "dist" not in path.parts
        and "__pycache__" not in path.parts
    )


def check_empty_catch(frontend_src: Path) -> list[GuardIssue]:
    issues: list[GuardIssue] = []
    for path in _iter_source_files(frontend_src, (".js", ".jsx", ".ts", ".tsx")):
        text = _read_text(path)
        for match in EMPTY_CATCH_PATTERN.finditer(text):
            issues.append(
                GuardIssue(
                    file_path=str(path),
                    line=_line_number(text, match.start()),
                    message="empty catch block is not allowed",
                )
            )
    return issues


def check_file_length(target_dir: Path, max_lines: int, extensions: tuple[str, ...]) -> list[GuardIssue]:
    issues: list[GuardIssue] = []
    for path in _iter_source_files(target_dir, extensions):
        line_count = _read_text(path).count("\n") + 1
        if line_count > max_lines:
            issues.append(
                GuardIssue(
                    file_path=str(path),
                    line=1,
                    message=f"file has {line_count} lines (max allowed: {max_lines})",
                )
            )
    return issues


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run code quality guards")
    parser.add_argument("--frontend-max-lines", type=int, default=1200)
    parser.add_argument("--backend-max-lines", type=int, default=4500)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parents[1]
    frontend_src = repo_root / "frontend" / "src"
    backend_dir = repo_root / "backend"

    all_issues: list[GuardIssue] = []
    all_issues.extend(check_empty_catch(frontend_src))
    all_issues.extend(check_file_length(frontend_src, args.frontend_max_lines, (".js", ".jsx", ".ts", ".tsx")))
    all_issues.extend(check_file_length(backend_dir, args.backend_max_lines, (".py",)))

    if not all_issues:
        print("✅ quality_guard passed")
        return 0

    print("❌ quality_guard failed")
    for issue in all_issues:
        print(f"- {issue.file_path}:{issue.line} -> {issue.message}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
