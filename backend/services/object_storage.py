"""Object storage service wrapper for Emergent Object Storage."""
from __future__ import annotations

import logging
import os
from typing import Any

import requests

logger = logging.getLogger(__name__)

_storage_key: str | None = None


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def _initialize_storage_key(force_refresh: bool = False) -> str:
    global _storage_key

    if _storage_key and not force_refresh:
        return _storage_key

    response = requests.post(
        f"{_require_env('EMERGENT_OBJECT_STORAGE_URL')}/init",
        json={"emergent_key": _require_env('EMERGENT_LLM_KEY')},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    storage_key = payload.get("storage_key")
    if not storage_key:
        raise RuntimeError("Object storage init failed: missing storage_key")
    _storage_key = storage_key
    return _storage_key


def ensure_storage_initialized() -> None:
    _initialize_storage_key()


def build_storage_path(user_id: str, folder: str, extension: str) -> str:
    app_storage_prefix = _require_env("OBJECT_STORAGE_APP_PREFIX")
    normalized_extension = extension.strip().lower().lstrip(".") or "bin"
    return f"{app_storage_prefix}/uploads/{user_id}/{folder}/{os.urandom(12).hex()}.{normalized_extension}"


def put_object(path: str, data: bytes, content_type: str) -> dict[str, Any]:
    storage_url = _require_env("EMERGENT_OBJECT_STORAGE_URL")
    for attempt in range(2):
        storage_key = _initialize_storage_key(force_refresh=attempt > 0)
        response = requests.put(
            f"{storage_url}/objects/{path}",
            headers={
                "X-Storage-Key": storage_key,
                "Content-Type": content_type,
            },
            data=data,
            timeout=120,
        )

        if response.status_code == 403 and attempt == 0:
            logger.warning("Object storage key expired. Refreshing key and retrying upload.")
            continue

        response.raise_for_status()
        return response.json()

    raise RuntimeError("Object upload failed after retry")


def get_object(path: str) -> tuple[bytes, str]:
    storage_url = _require_env("EMERGENT_OBJECT_STORAGE_URL")
    for attempt in range(2):
        storage_key = _initialize_storage_key(force_refresh=attempt > 0)
        response = requests.get(
            f"{storage_url}/objects/{path}",
            headers={"X-Storage-Key": storage_key},
            timeout=60,
        )

        if response.status_code == 403 and attempt == 0:
            logger.warning("Object storage key expired. Refreshing key and retrying download.")
            continue

        response.raise_for_status()
        return response.content, response.headers.get("Content-Type", "application/octet-stream")

    raise RuntimeError("Object download failed after retry")
