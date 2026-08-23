# Android API Contract (Play Store Submission)

This document provides a reviewer-friendly API contract for Android builds.

## Base URL
- Production: `https://temple-soul-dev.emergent.host`
- API base path: `/api`

## Android Config Endpoints
- `/api/user/mobile/android-api-config`
- `/api/user/android-api-config`
- `/api/mobile/android-api-config`
- `/api/android-api-config`

All endpoints return the same JSON contract describing auth, required public endpoints, privacy/deletion APIs, and Play release requirements.

## API 36 Compliance Notes
- `play_store_release_requirements.required_target_sdk` is `36`.
- `play_store_release_requirements.recommended_compile_sdk` is `36`.
- Existing Play package ID expected for update flow: `host.emergent.embodiment_journey.twa`.
- New bundles must use a strictly higher `versionCode` than the currently published production release.

## Core Public Endpoints Used by Android
- `/api/health`
- `/api/auth/me`
- `/api/mindfulness`
- `/api/meditations`
- `/api/heart-practices`
- `/api/healing-portals`
- `/api/energy-healing`
- `/api/mantras`
- `/api/tts/generate-base64`
- `/api/content/expand-script`

## Privacy & Account Deletion Endpoints
- `/api/account/export`
- `/api/account/delete-request`
- `/api/account/deletion-status`

## CORS / Mobile Notes
- Backend CORS is configured using explicit allowed origins via environment (`CORS_ORIGINS`).
- Mobile origins supported include Capacitor/Ionic localhost schemes and web origins required for app review/testing.
