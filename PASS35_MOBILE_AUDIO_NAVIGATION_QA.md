# Pass 35 — Mobile, Audio & Navigation QA

Built from SoulTemple LIVE MASTER Pass 34.

## Changes
- Strengthened protected-route session handling: only confirmed HTTP 401/403 authentication rejection redirects to sign-in. A transient mobile/TWA network failure no longer automatically masquerades as logout when a valid user is already known.
- Guided practice voice/speed selectors now interrupt the currently playing narration, invalidate prior TTS cache, and resume the current segment using the newly selected voice/speed. This makes the control affect heard playback rather than only the UI preference.
- Preserved the existing single-audio-instance cleanup and overlay-open stop event used to prevent overlapping guided playback/echo.
- Fixed Daily Guidance sunrise/sunset navigation from nonexistent `/sunrise-sunset-practices` to live `/sunrise-sunset`.
- Fixed the unauthenticated custom-mantra Sign In button from nonexistent `/auth` to the real landing/sign-in route `/`.
- Audited all literal Dashboard configuration routes: 50/50 resolve to AppRoutes.
- Audited literal `navigate()` destinations and corrected the two genuine missing routes. Query-string Mystery School destinations resolve to their valid base route.
- Refined the shared embodiment protocol language to remove generic nervous-system outcome language and forced emotional-shift framing; it now emphasizes comfortable pacing, specific technique, body choice, observation, and integration.

## Validation
- Python backend compileall: PASS
- JSON parse audit: PASS
- Dashboard route audit: 50/50 present
- ZIP integrity: PASS
- Frontend production build not run in this clean source because node_modules are intentionally excluded.

## Runtime checks still required on deployed Android build
- Hear a voice change mid-guided meditation and confirm the resumed segment uses the new voice.
- Change speed mid-session and confirm audible pacing changes.
- Confirm no doubled narration/echo after opening, closing, and reopening guided overlays.
- Android system Back/Home/session persistence should be checked on-device because browser history/TWA lifecycle cannot be fully simulated by static source validation.
