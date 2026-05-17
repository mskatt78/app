# Shamanic Elements Soul Temple 2.0 — Product Requirements Document

## Overview
A comprehensive full-stack spiritual wellness application featuring yoga, somatic movements, oracle readings, breathwork, meditations, shamanic practices, elemental healing, and advanced healing modalities. Built with React, FastAPI, and MongoDB.

## Tech Stack
- **Frontend:** React, Framer Motion, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI, MongoDB (Motor Async)
- **Auth:** Google OAuth (Emergent-managed) + Custom JWT Admin Auth
- **Payments:** Stripe Checkout (emergentintegrations library)
- **Integrations:** OpenAI TTS, Gemini Image Gen (Nano Banana), Emergent Object Storage
- **PWA:** Full manifest with app store ready icons

## Latest Changes (March–May 2026)
- **Code Review Remediation Batch (Iteration 118, May 2026):**
  - **Critical hook-dependency hardening (targeted files):**
    - Refactored route guard async flows in `routeGuards.jsx` with callback-based guards to reduce stale-closure risk.
    - Hardened `useCoursePayments.js` token/login callback dependencies and polling dependencies.
    - Added explicit `audioRef` dependency handling in `WaterPractices.jsx` cleanup effect.
  - **Index-as-key remediation across flagged pages:**
    - Replaced index keys with stable semantic keys in:
      - `DailySacredPractice.jsx`, `EarthAltars.jsx`, `ElementalPractices.jsx`, `CreativeProcesses.jsx`, `ChakraCleansing.jsx`, `Dashboard.jsx`, `AstrologyCalendar.jsx`, `Books.jsx`.
  - **Frontend performance improvements on flagged hotspots:**
    - Added memoization and precomputed lists in:
      - `AdminDashboard.jsx` (`visibleCollections`, loading placeholders)
      - `ChakraCleansing.jsx` (memoized filtered list)
      - `Dashboard.jsx` (memoized quick/deep nav collections)
      - `Books.jsx` (memoized related books)
  - **Backend complexity reductions (service-layer extraction):**
    - `content.py`: split crystal image resolver internals into dedicated cache/match/persist helper functions; simplified `_resolve_crystal_image` orchestration.
    - `content.py`: reduced monolithic script expansion flow by extracting prompt/parsing/LLM-call helpers and floor-extension/padding strategy helpers.
    - `admin.py`: split seed-loading workflow into `_load_standard_seed_collections` and `_load_special_seed_collections` helpers.
    - `gifts.py`: extracted gift pricing and gift-record builders (`_resolve_gift_pricing_context`, `_build_gift_record`) and reused existing payment helpers.
    - `payments.py`: extended service-style helper layer for payment context, PayPal auth/base URL, entitlement grants, subscription status checks.
  - **Validation:**
    - `/app/test_reports/iteration_118.json` => backend **100% (33/33)** and frontend **100%** on targeted pages/endpoints.

- **Payments/Gifts Complexity Reduction + Remaining P0 Provenance Follow-Through (Iteration 118, May 2026):**
  - Deepened cyclomatic-complexity reduction in `payments.py` and `gifts.py`:
    - Added reusable payment flow helpers in `payments.py`:
      - `_resolve_payment_context`, `_grant_transaction_entitlements`, `_grant_purchase_access`, `_activate_subscription`, `_has_active_subscription`, `_is_subscription_active_record`, `_get_paypal_api_base`, `_create_paypal_access_token`.
    - Rewired Stripe/PayPal flow paths to use shared helpers (reduced duplicated subscription/purchase and product-pricing logic).
    - Continued gifts helper extraction usage for PayPal base resolution, auth token, paid-state updates, and recipient notifications.
  - Completed requested provenance follow-through for remaining user-facing collections:
    - Backend integrity enrichment applied to:
      - `/api/ancient-wisdom`, `/api/shamanic-practices`, `/api/elemental-practices`, `/api/heart-practices` (plus item routes).
    - Frontend integrity labels + reviewed-date visibility added to:
      - `AncientWisdom.jsx`, `ShamanicPractices.jsx`, `ElementalPractices.jsx`, `HeartPractices.jsx`.
    - Admin source governance field coverage extended for these collections in `AdminSection.jsx` and `admin.py` source-aware normalization.
  - UX/accessibility polish:
    - Added Escape-key modal close handling for `ElementalPractices` and `HeartPractices` detail modals.
  - Validation:
    - Frontend focused verification passed (Escape-key modal behavior fixed for both pages).
    - Backend regression checks passed for payments/gifts route sanity (no 500 regressions).

- **P0 Follow-Through + Gifts Refactor/Typing Continuation (Iteration 117, May 2026):**
  - Completed provenance/review workflow on remaining user-facing collections:
    - Backend integrity enrichment added for:
      - `/api/ancient-wisdom`, `/api/shamanic-practices`, `/api/elemental-practices`, `/api/heart-practices`
    - Frontend integrity labels and review-time visibility added to:
      - `AncientWisdom.jsx`, `ShamanicPractices.jsx`, `ElementalPractices.jsx`, `HeartPractices.jsx`
  - Expanded admin source governance coverage:
    - `AdminSection` now exposes source fields for `ancient_wisdom`, `shamanic_practices`, `elemental_practices`, `heart_practices`.
    - `admin.py` source-aware normalization now covers those collections too.
  - Continued backend quality/refactor pass:
    - `gifts.py` duplicated PayPal/auth/paid-state/email notification logic extracted into reusable helpers (`_resolve_paypal_base_url`, `_fetch_paypal_access_token`, `_mark_gift_paid`, `_send_paid_gift_notification`).
    - Additional type-hint coverage continued in payments/oracle/numerology paths (non-breaking).
  - Validation:
    - `/app/test_reports/iteration_117.json`: backend **100% (20/20)**, frontend **100%** for all four newly expanded collections + gifts regression checks.

- **P0/P1 Provenance Expansion + Admin Review Controls + Typing Progress (Iteration 116, May 2026):**
  - Expanded content-integrity pipeline to additional user-facing libraries:
    - Backend endpoints now enrich with normalized `source_references` + `content_integrity` for:
      - `/api/yoga/poses`, `/api/mantras`, `/api/mudras`, `/api/sacred-guardians`
      - (Previously done and retained: `/api/courses`, `/api/meditations`, `/api/breathwork/sessions`)
  - App-wide provenance visibility upgraded:
    - Added integrity labels + optional last-reviewed display in Yoga, Mantras, Mudras, Sacred Guardians, Courses, Meditations, and Breathwork cards.
  - Admin source governance controls added:
    - `AdminSection` field config now includes `source_type`, `source_references`, `review_status`, `last_reviewed_at` on key collections.
    - `backend/routers/admin.py` now normalizes source references (string/list → validated URL list), auto-defaults `source_type`, and auto-sets `last_reviewed_at` when review status reaches reviewed/verified/approved.
  - Code-quality backlog progress:
    - Added/expanded return type hints in `numerology.py`, `oracle.py`, and `payments.py` public functions.
    - Further reduced admin route complexity via payload-normalization helper extraction.
  - Validation:
    - `/app/test_reports/iteration_116.json`: backend **100% (17/17)**, frontend **100%** across all targeted library pages; no blocking regressions.

- **Crystal Image Truth Layer + Content Integrity Metadata (Iteration 115, May 2026):**
  - Implemented strict per-crystal server-side verification pipeline in `backend/routers/content.py`:
    - Deterministic crystal→Wikipedia title mapping for all 27 deep crystals.
    - Wikipedia summary lookup + image extraction + confidence scoring + disambiguation penalties.
    - Mongo cache collection (`crystal_image_validations`) with TTL-aware reuse and refresh behavior.
    - Enriched crystal payload fields: `image_url_resolved`, `verified_image_url`, `image_source`, `image_validation`.
  - Crystal guide frontend hardening in `CrystalGuide.jsx`:
    - Image quality validator state (`Verified image` / `Needs review`) with explicit badges.
    - Strict resolved-image usage, safer URL checks, and graceful unavailable-image fallback.
  - Reduced Wikimedia rate-limit risk by prioritizing thumbnail images over full originals.
  - Added factual-flow metadata for additional user-facing sections:
    - `GET /api/courses`, `GET /api/meditations`, `GET /api/breathwork/sessions` now include `content_integrity` + normalized `source_references`.
    - Frontend labels added in Courses, Meditations, Breathwork UIs (`Curated content` / `Verified references`).
  - Validation evidence:
    - `/app/test_reports/iteration_115.json`: backend and frontend checks passed; iolite regression verified fixed.
    - Final backend verification confirms all 27 crystals currently return `image_source=wikipedia_verified` and `image_validation.status=verified`.

- **Code Quality Stabilization + Regression Verification (Iteration 114, May 2026):**
  - Replaced remaining index-style React keys with semantic stable-key helpers across high-volume pages:
    - `IChing.jsx`, `HumanDesign.jsx`, `GeneKeys.jsx`, `ElementalTemples.jsx`, `CrystalDetailDialog.jsx`, `WaterPractices.jsx`, `HeartPractices.jsx`, `YogaLibrary.jsx`
  - Added hook-safety improvement in `HeartPractices.jsx` by memoizing fetch flow via `useCallback` and effect dependency cleanup.
  - Backend quality hardening:
    - Added explicit type hints across `routers/gifts.py` and key admin seeding helpers in `routers/admin.py`.
    - Removed fallback defaults in touched gift notification/payment config lookups to align with fail-fast env behavior.
  - Validation:
    - `/app/test_reports/iteration_114.json` => frontend **100%** across all 8 targeted pages; **0 React key warnings**.
    - Backend checks passed (`/api/health`, `/api/content/expand-script`, `/api/gifts/create`, `/api/admin/collections`) with no 500 regressions.

- **Day-by-Day 40 Timeline + Notes (Iteration 113, May 2026):**
  - Added dedicated Day 1–40 timeline tracker in course Journey tab for all 40-day courses:
    - Per-day checkbox completion
    - Per-day journal note field
    - Progress count + progress bar
  - Persistence mode implemented as requested: **browser/local storage only** (no DB writes).
  - Locked-day behavior for non-purchased users:
    - Days beyond first phase are disabled with lock indicator and upgrade placeholder.
  - Resolved localStorage race condition found during QA (data now persists reliably across modal close/reopen).
  - Validation: `/app/test_reports/iteration_113.json` => backend **100%**, frontend **100%**, Day 21–40 visibility and note persistence explicitly verified.

- **40-Day Journey Visibility + Depth Fix (Iteration 112, May 2026):**
  - Resolved missing Day 21–40 visibility concern in Courses journey experience.
  - Backend content update (`sacred_rites_deep.py`): Nusta Karpay phase labels now explicitly read:
    - `Days 1–7`
    - `Days 8–20`
    - `Days 21–40`
  - Expanded Nusta Karpay Day 21–40 phase depth with additional journaling prompts.
  - Frontend update (`CourseModalContent.jsx`): added persistent **40-Day Journey Map** phase chips at top of journey tab so all ranges are visible at a glance.
  - Added richer journey blocks:
    - Unlocked phases show Focus + Daily Focus + Journaling Prompts.
    - Locked phases show improved teaser copy + unlock CTA.
  - Validation: `/app/test_reports/iteration_112.json` => backend **100%**, frontend **100%**, issue explicitly marked **RESOLVED**.

- **Frontend Modularization Continuation (Iteration 109–111, May 2026):**
  - **Guided overlay split:** extracted orchestration/state logic into `components/guided/useGuidedPracticeEngine.js`; `GuidedPracticeOverlay.jsx` is now a thin presenter wrapper.
  - **Courses deeper modularization:** extracted large modal tab body into `components/courses/CourseModalContent.jsx`; introduced `pages/courses/CourseDetailModal.jsx` alias wrapper and wired `Courses.jsx` to use it.
  - **PracticeTimer modularization:** moved ambient audio/chime synthesis into `components/timer/timerAudioEngine.js`.
  - **Cleanup pass:** resolved CrystalGuide hook dependency by wrapping `fetchCrystals` in `useCallback([api])`.
  - Validation:
    - `/app/test_reports/iteration_110.json` and `/app/test_reports/iteration_111.json` => backend **100%**, frontend **100%**, no regressions.

- **Large Frontend Structural Sweep (Iteration 108, May 2026):**
  - **BirthChart split:** extracted chart-results rendering into `pages/birthchart/BirthChartResults.jsx`; moved planet icon mapping into `birthChartUtils.js`.
  - **CrystalGuide split:** extracted heavy detail modal/sections into `pages/crystal-guide/CrystalDetailDialog.jsx`.
  - **Courses refactor:** extracted payment/session checkout logic into `pages/courses/useCoursePayments.js` hook.
  - **PracticeTimer refactor:** extracted ambient audio/chime generation into `components/timer/timerAudioEngine.js`.
  - Validation: `/app/test_reports/iteration_108.json` => backend **100% (12/12)**, frontend **100%**, no regressions.

- **Code Quality Remediation Pass (Iteration 107, May 2026):**
  - **Security (tests):** removed fixed auth-test password usage by introducing dynamic `_generated_password()` in `backend/tests/test_iteration98_auth_refactor.py`.
  - **Backend complexity reduction (`routers/content.py`):**
    - Extracted helper-driven daily practice pipeline (`_collect_daily_practice_pool`, `_apply_focus_filter`, `_select_morning_evening_practices`, `_daily_guidance_text`, `_daily_reflection_prompts`, `_build_daily_practice_response`).
    - Reduced complexity in narration builders by extracting phrase-bank/composer helpers for adaptive and extension generation.
  - **Type hints:** added return type hints to all flagged seed/add scripts:
    - `seed_database.py`, `seed_content.py`, `add_chair_yoga.py`, `add_crystals.py`, `add_more_crystals.py`, `add_more_tai_chi_qigong.py`, `add_tai_chi_qigong.py`.
  - **Verification:** `/app/test_reports/iteration_107.json` => backend **100% (22/22)**, frontend **100%**, no regressions.

- **Humanized Guided Tone Pass (Iteration 106, May 2026):**
  - Reworked guided narration language across backend expansion generators to sound softer and intuitively spoken (less command-like, more compassionate/human cadence).
  - Updated fallback frontend narration language to match softer human tone and reduced default guided TTS speed to `0.82` for more natural delivery.
  - Preserved anti-repetition + word-floor guarantees while improving delivery quality.
  - Validation: `/app/test_reports/iteration_106.json` => backend **100% (17/17)**, frontend **100%**.

- **User-Controlled Anti-Repetition Modes (Iteration 102–104, May 2026):**
  - Added global guided narration mode preference with default **Strict** and optional **Balanced**:
    - New shared utility: `frontend/src/utils/guidedNarrationSettings.js`
    - New settings control in `Settings.jsx` (app-wide persistence via local storage)
    - New in-session quick selector inside `GuidedPracticeOverlay` (`Strict anti-repeat` / `Balanced flow`)
  - Wired mode payload propagation across all guided callers:
    - `GuidedPracticeOverlay`, `PracticeTimer`, and `GuidedAudioButton` now send `anti_repetition_mode`.
  - Backend enhancements in `content.py`:
    - `ExpandScriptRequest` now supports `anti_repetition_mode: Literal["strict","balanced"]`.
    - Strict/balanced-aware repetition controls and multi-pass word-floor logic.
    - Final word-floor top-up guard to guarantee long-session depth while preserving anti-repetition quality.
  - Validation:
    - `/app/test_reports/iteration_104.json` => backend **100% (20/20)**, frontend **100%**.
    - All tested durations (7/10/15/20/25 min) pass 80% word-floor in both modes.

- **Category Defaults + Global Manual Override (Iteration 105, May 2026):**
  - Added effective mode resolver so narration behavior is consistent across all guided entry points:
    - Category defaults: `sunrise_sunset=balanced`, `deep_healing=strict`, `general=strict`.
    - Manual selection (Settings or overlay quick selector) is persisted and globally overrides category defaults.
  - Fixed guided overlay runtime regression (`getGuidedNarrationMode` missing import) discovered during automated testing.
  - Validation: `/app/test_reports/iteration_105.json` => backend **100% (23/23)**, frontend **100%**.

- **Guided Repetition Quality Fix (Iteration 100–101, May 2026):**
  - Resolved user-reported repetitive guided narration across long practices by improving backend extension generation (`content.py`):
    - Expanded midline + closer phrase pools and added sentence-level repetition counters.
    - Added loop safeguards to prevent long-generation lockups.
    - Preserved strong paragraph-level diversity (`_dedupe_paragraphs` + `_enforce_stem_diversity`).
  - Stabilized runtime behavior under strict anti-repetition mode:
    - `use_ai=true` now only attempts LLM expansion when `ENABLE_GUIDED_AI_EXPANSION=true`; otherwise returns fast template expansion (non-blocking).
    - Frontend guided callers (`GuidedPracticeOverlay`, `PracticeTimer`, `GuidedAudioButton`) use stable non-AI expansion by default.
  - Validation evidence:
    - `/app/test_reports/iteration_101.json`: backend **100% (12/12)**, frontend **100%**.
    - Previously repeated phrases reduced from 11x/9x to **0x/0x** in long-practice tests.

- **Fix-All Continuation Pass (Iteration 99, May 2026):**
  - **Guided parity upgrades:**
    - `PartnerYoga.jsx`: added therapeutic depth cards (`Why this heals`, `Integration`) and direct launch into full-screen `GuidedPracticeOverlay`.
    - `SunriseSunsetPractices.jsx`: added depth cards in practice modal with cycle-aware healing/integration context while preserving timer flow.
  - **App Store readiness polish:**
    - `AppStoreReadiness.jsx`: added submission metadata pack with copy actions for package name and required review/legal paths.
    - Added checklist coverage for package identifier verification (`com.skywater.soultemple`).
  - **Backend type-hint expansion:**
    - Added explicit return typing and stronger signatures in `auth.py`, `dependencies.py`, `reviews.py`, `audio.py`, and `tts.py`.
  - Validation: `/app/test_reports/iteration_99.json` confirms frontend **100%** and no regressions in targeted backend flows.

- **Auth Refactor Completion (Iteration 98, May 2026):**
  - Completed Module 5 backend auth decomposition in `backend/routers/auth.py`:
    - Added typed payload models: `GoogleUserPayload`, `GoogleAuthPayload`
    - Extracted focused helpers for profile parsing, session persistence, and public-user serialization
    - Refactored `create_session` and `google_auth` to use helper-driven flow while preserving secure `httpOnly` cookie behavior
  - Added missing return type hints across flagged data scripts in `backend/data/` (including seed/apply/deepen utilities and journey helpers).
  - Verified P2 operator check status: no remaining `is`-literal comparison bugs in `backend/tests`.
  - Validation: `/app/test_reports/iteration_98.json` passed (**backend 100%, frontend 100%**) with full auth regression coverage.

- **Large-File Decomposition Sprint (Iteration 93):**
  - Completed structural splits (with minor readability polish) across all four requested pages:
    - `Courses.jsx` → extracted `components/courses/CourseCard.jsx`
    - `BirthChart.jsx` → extracted `components/birthchart/BigThreeCard.jsx`
    - `Breathwork.jsx` → extracted `components/breathwork/BreathworkControls.jsx` and `components/breathwork/BreathworkSoundSelector.jsx`
    - `AdminCMS.jsx` → extracted `components/admin/AdminCMSTabBar.jsx` and `components/admin/AdminCMSItemCard.jsx`
  - Quality follow-ups in same pass:
    - Added robust dependency-safe fetch flow in `Courses.jsx`
    - Expanded key-stability replacements in `Courses.jsx` and `BirthChart.jsx`
    - Continued P0/P1 cleanup alignment (hook safety, catch logging, maintainability)
  - Verification status:
    - `/app/test_reports/iteration_93.json` passed
    - Frontend regression checks: **100% pass** across all extracted components and routes
    - Lint checks for all newly extracted and updated files: **pass**.

- **Code Quality Remediation Sweep (Iteration 92):**
  - Completed critical frontend quality fixes requested in report:
    - Hook dependency hardening in key reported files (`routeGuards.jsx`, `VideosLibrary.jsx`, `TarotReading.jsx`, `Courses.jsx`, related pages)
    - Replaced silent catch blocks in touched files with explicit `console.error` logging (per user preference: console-only)
    - Replaced index-based React keys in priority pages:
      - `SomaticYoga.jsx`, `SacredGuardians.jsx`, `Retreats.jsx`, `ProgressDashboard.jsx`, `PartnerYoga.jsx`, `MasculineTemple.jsx`, plus additional updates in `Courses.jsx` and `BirthChart.jsx`
  - Began P2 refactor work across all requested areas with backend helper extraction:
    - `auth.py`: extracted session/auth helpers (`_now_iso`, `_build_session`, `_set_session_cookie`, `_upsert_google_user`, `_fetch_emergent_session_user`) and simplified `create_session`, `google_auth`, `register_user`, `login_user`
    - `content.py`: reduced branch density by extracting prompt/parsing helpers and paragraph builder function paths in extension/LLM expansion
    - `seed_extended_modalities.py`: split monolithic `seed_all()` into focused helpers (`_stamp_dataset`, `_existing_ids`, `_seed_collection`, `_apply_chakra_image_updates`, `_print_seed_summary`) and removed local fallback env defaults
  - Verification status:
    - `/app/test_reports/iteration_92.json` passed with backend **100%** and frontend **100%**
    - No critical regressions; all action items in test report resolved.

- **Guided Narration Humanization Pass (Iteration 91):**
  - Applied user-selected narration profile globally across guided meditations:
    - Tone: **Adaptive** (graceful opening → stronger empowering middle → soft close)
    - Repetition control: **Strong** (stem-based anti-repetition tightened)
    - Pace: **Slightly slower, more expressive** (`DEFAULT_GUIDED_TTS_SPEED=0.84`)
    - First pause behavior: tuned to **medium** with larger initial narration chunk (`FIRST_SEGMENT_TARGET_WORDS=95`) to reduce early dead-air feel.
  - Backend improvements (`backend/routers/content.py`):
    - Strengthened paragraph de-duplication threshold and recent-stem tracking in adaptive generation loops
    - Updated fallback intro/body/closing language for more human, less repetitive flow
    - Updated AI expansion prompt constraints to enforce adaptive arc + non-repetitive sentence stems
  - Frontend guided playback improvements:
    - `GuidedPracticeOverlay`, `PracticeTimer`, and `GuidedAudioButton` now prefetch the next TTS segment earlier to reduce pause between segment 1→2
    - Synced slower expressive speed constant across guided components
  - Validation:
    - `/app/test_reports/iteration_91.json` passed with backend **100%** and frontend **100%**
    - Verified: adaptive arc language present, reduced repeated stems, functional guided controls, and improved first-transition pacing.

- **Live UX Feedback Fix Pack (Iteration 90):**
  - Addressed user-reported guidance/sound/content issues:
    - Enabled narration by default for timer-based guided sessions (`PracticeTimer autoNarrate=true`).
    - Expanded breathwork sound palette with clearly distinct options: `whale`, `dolphin`, `chimes`, `drums_gentle`.
    - Added mobile-safe scrollable sound dropdown (`max-h` + overflow) in Breathwork selector.
    - Added fallback water practices for missing categories (`ceremony`, `ritual`) so sections are no longer empty.
    - Added guided audio support directly in Yoga pose dialog via `GuidedAudioButton` so users can listen instead of reading constantly.
    - Replaced Rose Temple embodiment imagery with curated feminine-focused visuals and ensured modal uses the same curated image set.
  - Validation status:
    - `/app/test_reports/iteration_90.json`: backend **100%**, frontend **100%**.
    - Verified on desktop and mobile viewport (390x844).

- **Backlog Refactor Sprint (Iteration 89):**
  - Reduced `PracticeTimer.jsx` complexity by extracting focused UI components:
    - `components/timer/TimerStatusPanel.jsx`
    - `components/timer/TimerControlsPanel.jsx`
    - Parent timer logic retained in `PracticeTimer.jsx` to preserve behavior while shrinking component size.
  - Reduced `GuidedPracticeOverlay.jsx` complexity by extracting presentation layer:
    - `components/guided/GuidedPracticeContent.jsx`
    - Core timing/audio logic remains in overlay container.
  - Completed console cleanup sweep for `console.log/info/debug` across frontend/backend source (retained only warning/error pathways where needed).
  - Fixed additional key-stability warning in `RoseTemple.jsx` by hardening mapped keys with stable+index fallback.
  - Verification: `/app/test_reports/iteration_89.json` reports refactor flow healthy and UI regression checks passing after extraction.

- **Code Review Remediation Pass (Iterations 87–88):**
  - **Security hardening completed:**
    - Removed dynamic import in numerology (`routers/numerology.py`) by replacing `__import__('uuid')` with explicit `import uuid`.
    - Migrated admin web session flow away from browser token storage to **httpOnly cookie-based admin session**:
      - Backend: `routers/admin.py` now supports cookie auth in `_verify_admin`, sets/clears `admin_session` cookie in `/admin/login`, `/admin/session-login`, and `/admin/logout`.
      - Frontend: `components/admin/adminSession.js` no longer uses session/local storage; now validates existing cookie session first, then falls back to session-login.
      - Fixed critical cookie-login regression (Iteration 88): password admin login now works end-to-end to `/admin` dashboard.
  - **Backend complexity reduction completed (critical functions):**
    - Refactored `seed_database()` in `routers/admin.py` into composable helpers:
      - `_load_seed_payloads`, `_seed_single_collection`, `_seed_standard_collections`, `_seed_special_collections`, `_seed_courses_collection`, `_resolve_collections_to_seed`.
    - Refactored `calculate_birth_chart()` in `routers/birth_chart.py` via helper extraction:
      - `_parse_birth_datetime`, `_resolve_location_and_timezone`, `_calculate_chart_planets`, `_build_birth_chart_payload`.
    - Refactored `_build_fallback_paragraphs()` in `routers/content.py` into intro/body/closing builders and context/step preprocessors.
  - **Frontend quality fixes completed:**
    - Replaced index-based keys in report-flagged pages:
      - `SunriseSunsetPractices.jsx`, `StarLineageQuiz.jsx`, `RoseTemple.jsx`, `RitualBuilder.jsx`.
    - Removed/cleaned key console debug usage in touched payment access flow (`Courses.jsx`).
    - Fixed empty catch in `SunriseSunsetPractices.jsx` with user feedback toast for audio warm-up failure.
  - **Testing and verification:**
    - Iteration 87: backend 17/17 passed; frontend checks passed; identified and isolated one critical admin cookie dashboard issue.
    - Iteration 88: critical issue fully fixed and verified.
    - `/app/test_reports/iteration_88.json`: backend **14/14** passed, frontend **10/10** passed.

- **Live Tester Error Remediation (Iteration 86):**
  - **Email/legacy deep-link reliability fixed**:
    - Added Daily Practice aliases: `/dailypractice`, `/daily_practice`, `/daily-guidance`, `/todays-guidance`
    - Added wildcard `SmartRouteResolver` fallback route for old/unknown email paths, auto-redirecting users to the nearest valid destination (`/daily-practice` for daily-practice-like links, otherwise `/menu`).
  - **Human Design strict mode implemented (no intuitive guessing):**
    - Added shared calculator utility: `frontend/src/utils/humanDesignCalculator.js`
    - Human Design "My Chart" now requires **birth date + exact birth time + city + country** and computes Profile/Type/Authority from birth-data-driven calculations using `POST /api/birth-chart/calculate` (personality + design chart at 88 days pre-birth).
    - Removed manual "choose the type that resonates" flow.
  - **Profile Calculator upgraded to strict mode:**
    - Requires **date + time + place** and computes Human Design from calculation pipeline (not distribution/guess logic).
    - Added explicit strict-mode UI messaging and authority display.
  - **Validation status:**
    - `/app/test_reports/iteration_86.json` passed with backend `100% (24/24)` and frontend `100%`.
    - User-reported issues marked fixed: deep links, dead old links, Human Design misclassification flow.

- **User Feedback Stabilization Pass Completed (Iteration 85):**
  - Fixed reported black-screen risk in installed/PWA flow by upgrading `sw.js` navigation handling to **network-first** and bumping cache version to `v4` (prevents stale SPA shell/chunk mismatch behavior).
  - Removed duplicate service-worker registration path from `App.js` to reduce registration race/stale-client edge cases.
  - Added global `RouteScrollManager` in `App.js` so navigating between subject pages now reliably lands at the top (no mid-page entry).
  - Hardened auth route behavior in `routeGuards.jsx`:
    - Protected route now always verifies `/auth/me` even with optimistic location state
    - Added non-blank session-expired fallback screen (`data-testid="protected-route-redirect-screen"`) before redirect.
  - Fixed astrology chart failure mode in `BirthChart.jsx`:
    - If signed-in chart save (`/birth-chart/save`) returns 401/403, app now auto-falls back to guest calculation (`/birth-chart/calculate`) and informs user to re-sign in for saving.
  - Validation status: `/app/test_reports/iteration_85.json` confirms all reported issues fixed (frontend 100%, no critical backend regressions).

- **Code Quality + Security Remediation Pass Completed (Iteration 84 + final verification):**
  - Replaced insecure Python randomness usage with `secrets` in:
    - `backend/tests/test_predeployment_comprehensive.py`
    - `backend/data/archangel_oracle.py`
  - Hardened client-side storage usage in report-flagged files:
    - `PracticeJournal.jsx`, `AddToJournal.jsx`, `AppStoreReadiness.jsx` now use session-oriented `clientStorage` helpers (with migration path)
    - `MantrasLibrary.jsx`, `PracticeTimer.jsx`, `InstallPrompt.jsx` now use centralized storage wrappers instead of direct localStorage calls
  - Hook/dependency stability hardening:
    - `ShamanicPractices.jsx` fetch routines memoized with `useCallback` + effect dependency cleanup
    - `Reviews.jsx` load routine memoized with `useCallback` + effect dependency cleanup
  - Index-key/robust render updates:
    - `WaterPractices.jsx`, `SeasonalTemple.jsx`, `YogaLibrary.jsx`, `ShamanicPractices.jsx` switched mapped keys to stable semantic keys
  - Error-handling cleanup:
    - Removed silent catch blocks in `WaterPractices.jsx`; added explicit logging for fetch failures
    - Added explicit warning when shamanic audio warmup cannot initialize
  - Modal interaction reliability:
    - Increased shamanic practice modal z-index to avoid close-button click interception by top navigation overlays
  - Validation status:
    - Testing agent report: `/app/test_reports/iteration_84.json` (**backend 100%, frontend 100%**)
    - Additional frontend testing agent run: 8/8 checks passed
    - Additional backend deep test run: 31/31 checks passed
  - Business-critical checks reconfirmed:
    - Narration expansion endpoint still returns >7-minute equivalent scripts for long sessions
    - `/api/retreats` returns empty set (no default placeholder retreats)

- **Final App Store Polish Sweep Completed (Iteration 80):**
  - Expanded `/app-readiness` into a two-track launch command center with both **Submission Asset Checklist** and **Release QA Checklist** (iOS Safari install, Android install, legal/mobile checks, guided-session smoke check, offline fallback).
  - Added persistent launch confidence summary and improved release navigation links to support final submission workflow.
  - Upgraded `/support` with dedicated **Android install instructions** in addition to iOS install guidance.
  - Refined `/privacy` layout and content structure for cleaner store-review readability and added explicit account export/deletion guidance.
  - Added final PWA metadata polish in `public/index.html` (`color-scheme: dark`, `apple-touch-fullscreen`) and global overflow safeguards in `index.css` to prevent horizontal clipping on mobile.
  - Navigation testability hardening: added missing `data-testid` coverage for critical `TopNav` interactions and menu actions.
  - Validation: **Iteration 80 passed 100% frontend checks** (App readiness, localStorage persistence, support/privacy flows, nav interactions, mobile/desktop overflow, PWA metadata).

- **Route-Layer Decomposition Completed (Iteration 79):** Split monolithic `App.js` into dedicated routing modules:
  - `frontend/src/routes/AppRoutes.jsx` (all route definitions)
  - `frontend/src/routes/routeGuards.jsx` (`AuthCallback`, `PublicRoute`, `ProtectedRoute`, `AdminRoute`)
  - `App.js` now focuses on app shell + nav visibility + providers only.
- **Full Regression Post-Split:** Iteration 79 passed 100% (backend 10/10, frontend 10/10) with no route regressions.
- **Full Continuation Pass Completed (Iteration 78):** Added CI security guardrails (`/app/security/security_guardrails.py` + `.github/workflows/security-guardrails.yml`) to automatically block MD5, `shell=True` subprocess, hardcoded test secret patterns, and unsafe token localStorage usage.
- **Oversized Component Modularization (Phase Progress):**
  - Extracted Guided narration helpers into `components/guided/guidedNarrationUtils.js`
  - Extracted PracticeTimer helper logic into `components/timer/practiceTimerUtils.js`
  - Extracted Courses constants into `pages/courses/courseConstants.js`
  - Extracted BirthChart utility logic into `pages/birthchart/birthChartUtils.js`
  - Added shared client storage utility `utils/clientStorage.js`
- **Frontend Security Hardening Expanded:** Migrated auth-token retrieval to session-first secure storage utility with localStorage backward migration path; integrated across Admin and Courses flows.
- **Hook Dependency Quality Sweep (additional):** Refactored `AdminCMS` and `BirthChart` fetch effects to `useCallback`-backed patterns with explicit dependencies.
- **Broad Regression Validation:** Iteration 78 completed with backend `45/45` and frontend `8/8` passes (no regressions).
- **Code Review Security Pass (Iteration 76):** Implemented all critical recommended fixes from static review:
  - Circular import removed (`routers/admin.py` now uses `routers/dependencies.get_db`)
  - Shell-injection risk removed in `tests/test_reviews.py` (`subprocess` now uses list args, `shell=False`, JSON-escaped payloads)
  - Hardcoded test credentials replaced with env-backed shared config (`backend/tests/test_security_config.py`) and updated priority test files
  - React hook dependency hardening in high-priority UI files (`YogaLibrary.jsx`, `GuidedPracticeOverlay.jsx`, `PracticeTimer.jsx`)
- **Additional Security Hardening:**
  - Replaced MD5 cache keys with SHA-256 in `routers/tts.py` and `routers/audio.py`
  - Replaced insecure `random` usage with `secrets`-backed helpers in `routers/user.py`, `routers/oracle.py`, `routers/content.py`
  - Migrated admin token storage from `localStorage` to safer `sessionStorage` with backward-compatible migration in `adminSession.js`, plus corresponding usage updates in `AdminLogin`, `AdminSection`, and `App.js`
- **Test Suite Cleanup:** Fixed stale endpoint paths in `test_refactored_backend.py` (`/api/retreats`, `/api/videos`, `/api/live-sessions`, `/api/courses`).
- **Water Practices Empty-State Recurrence Fixed (Iteration 74):** Implemented robust frontend category normalization aliases (`rituals→ritual`, `moon water→moon`, etc.) and category-specific fallback refetch when a selected tab appears empty. Verified all 7 categories load correctly on desktop + mobile.
- **Apple Install Flow Hardened (Iteration 73):** Fixed iPhone/iPad install friction with robust iOS + iPadOS desktop-mode detection, Safari-vs-non-Safari handling, copy-link helper for non-Safari iOS browsers, persistent reopen install chip after dismiss, and explicit 4-step Apple install instructions in Support Center.
- **Downloadable App Store Submission Kit Created:** Added `/app/submission_kit/` with complete ready-to-use docs (store copy, screenshot shotlist, legal/reviewer notes, forms cheatsheet, release QA script, and asset tracker) and packaged as `/app/app_store_submission_kit.zip` for one-click handoff.
- **Natural Sound Options Restored (Iteration 72):** Reintroduced Breathwork-style natural sound set in Mantras (`Ocean Waves`, `Forest Rain`, `Forest & Birds`, `Gentle Wind`, `Crackling Fire`, `Silence`) and added matching selector to shared `PracticeTimer` where picker was missing.
- **Last-Used Sound Persistence:** Implemented persistent natural sound preference via `localStorage` key `preferred-natural-sound` (works across close/reopen and page reload).
- **Landing Cover Demo Script Removed (Iteration 71):** Removed all demo-related script elements from Landing cover per owner request — deleted demo badge/label and demo button while preserving core CTA (`Enter the Temple`) plus Support/Install actions. `/demo` route remains available separately.
- **Critical Audio Reliability Fix (Iteration 69):** Resolved "scripts visible but no audible guidance" by switching frontend expansion calls to `use_ai: false` for fast fallback mode, reducing first narration segment size for faster TTS startup, and adding playback retries/tap-to-enable fallback states. Verified narration starts in ~1.4s (previously 25+ seconds).
- **Install Option Restored Across Entry Points:** Added explicit `Install App` CTA on Landing page and persistent `Install` action in TopNav so install access no longer disappears even when install prompt is dismissed.
- **Guided Script Repetition Fully Resolved (Iteration 66):** Refactored backend fallback generator to use 4 structural paragraph variants, context queue consumption (instead of hard cycling), expanded phrase banks, and stronger de-duplication. Result: prior repetitive stems reduced to `0x`, source text repetition reduced from `11–22x` to `2–4x`, and long-form quality stabilized.
- **Frontend Narration Fallback Quality Upgrade:** Upgraded local `GuidedPracticeOverlay` narration planner with better step/context separation and less template-like repetition during pre-expansion display states.
- **Final App-Readiness Command Center Added:** New public `/app-readiness` route with persistent launch checklist (localStorage), progress tracking, reset flow, and direct links to Demo/Support/Privacy/Terms.
- **Submission Placeholder Workflow Enabled:** Added explicit asset-prep checklist items (icon, iPhone/iPad screenshots, listing copy, legal URLs, reviewer demo flow) so store submission requirements are tracked in-app.
- **Navigation Coverage for Launch Ops:** Linked app-readiness from Support Center and Footer to ensure owner/admin can quickly access launch status from anywhere.
- **PWA Manifest Polish:** Added maskable purpose to 1024 icon and added App Readiness shortcut entry.
- **Guided Parity Upgrade — Mantras + Mudras:** Added immersive "Begin Guided Practice" flows in both Mantras and Mudras detail dialogs, now launching the same full-screen `GuidedPracticeOverlay` used across core healing modules.
- **Therapeutic Depth Cards Added:** Both sections now include explicit `Why this heals` and `Integration` cards for stronger philosophical and practical alignment with deep-content standards.
- **Accessibility Polish:** Fixed Mudras dialog accessibility warning by adding required dialog title semantics.
- **Guided Narration Backend Expansion Route (P0 fix):** Added `POST /api/content/expand-script` to generate long-form guided narration payloads (paragraphs + segments) with strict duration alignment at `120 words/min` and a hard floor of `7 minutes` minimum. This prevents short 1–2 minute scripts on longer practice cards.
- **GuidedPracticeOverlay Stability Refactor:** Moved script expansion orchestration out of heavy frontend-only generation flow. Overlay now requests backend-expanded narration before auto-start, then streams segmented TTS continuously. This reduces UI blocking risk and keeps auto-guided flow fully hands-free.
- **Retreat Cleanup for Owner Control:** Legacy placeholder retreats were cleared so `/api/retreats` starts empty for owner-managed entries in admin.
- **App-Store Readiness Legal Sweep:** Added dedicated `/terms` page, wired Terms links in footer and support center, and refined mobile meta viewport/format-detection for stronger submission readiness.
- **Breathwork Soundscape Selector**: Breathwork now includes an in-player sound choice instead of only the healing pitch/tone. Added simple V1 nature sound options — Ocean Waves, Forest Rain, Forest & Birds, Gentle Wind, Crackling Fire, plus Silence — while keeping the original healing frequency tone available.
- **Element-Based Breathwork Defaults**: Active breathwork sessions now auto-suggest a soundscape by element (Earth=nature, Water=ocean, Fire=fire, Air=wind, Spirit=rain) and keep mute/play/pause/reset behavior working cleanly.
- **Single Admin Link UX**: `/admin` is now the main owner entry point, surfaced from the app with admin shortcuts in the navigation and dashboard for allowlisted owner emails. `/admin/login` remains as a hidden fallback.
- **Polished Demo Experience**: Added a public `/demo` route with a presentation-ready showcase of live spaces, courses, crystals, and Light Codes so the app can be shown without making viewers sign in first.
- **App-Store Readiness Polish**: Added a public `/support` center, improved install prompt copy and iOS handling, updated manifest shortcuts and mobile viewport behavior, and added signed-in account tools for privacy export and account deletion requests from Settings.
- **Account Compliance Tools**: Added backend endpoints for `/api/account/export`, `/api/account/deletion-status`, and `/api/account/delete-request`, plus admin visibility for `account_deletion_requests`.
- **Direct Admin Access for App Owner**: `/admin` now supports session-based admin access for allowlisted emails, including `mskatt78@gmail.com`, while still preserving the fallback password login at `/admin/login`.
- **Whole-App Admin Dashboard Upgrade**: Expanded admin quick access for Courses, 13 Moon Paths, Yoga Library, Live Client Spaces, and media management. Added admin collection support for `live_sessions` and `astrology_months`.
- **Live Client Spaces Added**: Added public live session APIs and frontend experiences for live yoga, workshops, and Q&A rooms with embedded video support via admin-provided embed URLs, RSVP capture, chat, and Q&A threads.
- **PracticeTimer Precision Fix**: Rewrote `PracticeTimer.jsx` to use a real-clock session countdown instead of step math that could freeze or finish early. This now keeps advertised durations exact across Shamanic, Grounding, Elemental, and Sunrise/Sunset guided timers, while still supporting skip, pause, ambient audio, and auto-narration.
- **GuidedPracticeOverlay Precision + Autostart**: Updated `GuidedPracticeOverlay.jsx` to use a real end-time countdown, auto-start the guided session, and let ambient audio continue after TTS finishes so the session remains active for the full advertised duration.
- **Light Codes Deep Content Expansion**: Enriched backend `LIGHT_CODES` entries with `why_this_heals`, `ancient_traditions`, `extended_teachings`, `practice_guide`, `lineage`, and `healing_lens`, with especially deep content for DNA Activation Helix and core sacred geometry symbols.
- **Light Codes UI Redesign**: Rebuilt `LightCodes.jsx` with richer category philosophy panels, deeper symbol cards, and a multi-tab modal experience (Essence, Why It Heals, Ancient Traditions, Practice Guide) to bring Light Codes in line with Crystals and 5 Elements.
- **Crystal Guide Deep Content**: All 27 crystals now have full depth matching the rest of the app — `why_this_heals` (philosophical/scientific explanation), `extended_teachings` (historical/cultural context across ancient Egypt, Greek, Roman, Indigenous etc.), `practice_guide` (step-by-step ritual instructions). Frontend switched from basic `/api/crystals` to `/api/crystals/deep`, rendering all rich content: healing properties (physical/emotional/spiritual), cleansing methods, chakra work, rituals, crystal combinations, zodiac/origins, warnings, and a "Begin Guided Crystal Practice" button launching GuidedPracticeOverlay.
- **Meditations.jsx**: Replaced inline timer with full-screen `GuidedPracticeOverlay`. Timer now shows exact countdown matching card duration.
- **SomaticMovement.jsx**: Same fix — replaced old elapsed-timer with `GuidedPracticeOverlay`.
- **Creative Processes Bug Fix**: Replaced inline PracticeTimer-inside-modal with GuidedPracticeOverlay. No more blank screen trap. All 12 processes now launch full-screen guided mode.
- **5 Elements Deep Content**: Added "Why It Heals" (scientific: earthing, vagus nerve, Bohr Effect, separation wound) + "Ancient Traditions" (cross-cultural: Egyptian, Chinese, Vedic, Celtic, Indigenous, Norse, Sufi) to all 5 elemental temples. Both tabs appear first in the navigation.

- **Production Optimizations**: GZip compression middleware (avg 58% size reduction), MongoDB indexes for users/practice_history/community/content, Service Worker upgraded to v2.

## Core Features (All Implemented)

### Sacred Rites — Premium Courses (Updated March 2026)
- **3 Sacred Rite courses** with Stripe payment integration:
  - Munay Ki ($197) — 9 Great Rites of Initiation
  - Nusta Karpay ($177) — 7 Goddess Rites of the Divine Feminine  
  - 13th Rite of the Womb ($147) — The most ancient feminine healing rite
- Each course has **7 tabs**: The Rites | Rituals | Embodiment | Prepare & Integrate | Daily Practice | 40-Day Journey | Safety
- **Premium lock UI**: "Sacred Course" badge, "Unlock Course" button
- `is_premium: True` flag on all 3 courses with Stripe checkout integration
- **Content locking**: Rites, Rituals, Embodiment, Daily, Calendar tabs locked for non-purchasers
- **Public tabs**: Safety and Prepare & Integrate always accessible

### Payment System
- Stripe Checkout integration via emergentintegrations library
- One-time course purchases stored in `user_purchases` collection
- Monthly ($19.99) and Yearly ($149.99) subscription plans
- PayPal as alternative payment method
- Payment status polling after Stripe redirect

### Dashboard (Updated March 2026)
- **Practice Streak Widget**: Flame + streak count + week dots (Mon-Sun) + milestone badges
  - Milestones: 3-Day Seeker, 7-Day Guardian, 14-Day Fortnight Keeper, 21-Day Initiation, Sacred 40
  - Reads from localStorage journal entries
  - Quick "Journal" CTA button

### Sound Healing (Updated March 2026)
- 17 sound frequency entries including 6 Shamanic Drum types
- **"Shamanic Drums" filter tab** in Sound Frequencies page

### Creative Processes (Deep Content)
- 9 comprehensive practices with safety, why_this_heals, preparation, integration
- **Sacred Smudging & Space Clearing** — standalone deep guide with 6 herb profiles

### Practice Journal (Updated)
- Streak milestones: 3, 7, 14, 21, 40-day badges
- **Share to Sacred Circle** → POST /api/community/posts

### Video Tutorials (Updated March 2026)
- **51 video entries** seeded across **13 categories** with real YouTube URLs
- **New categories added**:
  - Angel Guidance (4 videos) — Archangel meditations, angelic connection
  - Colour Therapy (5 videos) — Chromotherapy, color healing meditation
  - Aromatherapy (5 videos) — Essential oil meditation, breathwork with oils
  - Art Therapy (6 videos) — Mindful drawing, bilateral art, creative meditation
- Videos Library page with dark theme matching app aesthetic
- Category filters, YouTube thumbnail previews, embedded player modal

### Admin Database Seeding (NEW March 2026)
- **POST /api/admin/seed-database** — Admin endpoint to trigger database seeding
  - Can seed all collections or specific ones
  - `force=true` option to overwrite existing data
  - Safe for production with progress tracking
- **GET /api/admin/seed-status** — Shows current database state for all collections

## Key API Endpoints
- `GET /api/courses` — 3 Sacred Rites with prices and premium flags
- `GET /api/courses/{id}` — Full course content
- `POST /api/payments/create-checkout` — Create Stripe checkout session (auth required)
- `GET /api/payments/status/{session_id}` — Check payment status
- `GET /api/payments/course-access` — Get user's purchased courses (auth required)
- `GET /api/payments/check-access/{product_type}/{product_id}` — Check specific course access
- `GET /api/payments/plans` — Get subscription plans

## Key DB Schema
- `courses`: 3 sacred rites with prices, rites, rituals, embodiment_practices
- `user_purchases`: user_id, product_type, product_id, purchased_at
- `payment_transactions`: session_id, amount, status, metadata
- `user_subscriptions`: user_id, plan_id, status, expires_at

## Completed Work (March 2026)
- [x] Stripe payment integration for premium courses
- [x] Course access checking and content locking
- [x] Extended Munay Ki course with 2 new rituals (Fire Ceremony, Lineage Healing)
- [x] Updated course prices: $197, $177, $147
- [x] Frontend purchase flow with payment status polling
- [x] Fixed /auth route redirect issue
- [x] **Beautiful Feminine Aesthetic Redesign** for Sacred Rites:
  - Warm ivory background (#FDFBF7) with terracotta (#A96F6A) accents
  - Cormorant Garamond serif typography for elegant headings
  - Stunning hero with goddess imagery
  - Premium course cards with aspect-[4/5] images
  - Elegant tabs with clean underline styling
  - "Begin Your Initiation" CTA with soft gold accents
- [x] **Practice Journal Feminine Redesign**
- [x] **Sound Frequencies Feminine Redesign**
- [x] **Dashboard Feminine Redesign**
- [x] **31 Real YouTube Videos** across 12 categories:
  - Chakra healing (4), Kundalini (3), Feminine embodiment (5), Shamanic drumming (3)
  - Plus existing: meditation, breathwork, somatic, movement, sound, creative, shamanic
- [x] **Course Bundle Feature**: All 3 Sacred Rites for $397 (save $124)
  - Backend bundle support in payments.py
  - Auto-grants access to all courses on bundle purchase
  - Beautiful bundle CTA on courses page
- [x] **Landing Page Feminine Redesign**:
  - Full-screen yoga hero with mountain backdrop
  - "Shamanic Elements Soul Temple" elegant typography
  - Feature sections: Yoga, Sacred Rites, Sound Healing, Feminine Embodiment
  - Auth modal with Google + email login
- [x] **Menu Page Feminine Redesign**:
  - Featured "Sacred Rites & Initiations" banner
  - Organized sections with warm icon colors
  - Sign in button with soft styling
- [x] **Videos Library Page** (NEW):
  - Beautiful feminine aesthetic with mountain hero
  - 9 category filters: All, Feminine Embodiment, Chakra, Kundalini, Shamanic Drums, etc.
  - Video cards with YouTube thumbnails, duration, level badges
  - Embedded YouTube player modal with video info
  - "YouTube" external link button
- [x] **Deployment Fix**:
  - Fixed corrupted .gitignore (removed *.env patterns and -e artifacts)
  - Added test_credentials.md to .gitignore for security
  - All deployment checks now pass

## Remaining Backlog
- **P1**: Continue guided-section parity pass for remaining lighter sections (beyond Mantras/Mudras/Partner Yoga/Sunrise-Sunset) to match deep-content tone used in Crystals/Elements/Light Codes
- **P1**: Build a richer guided demo account layer if you want a seeded faux dashboard / onboarding journey beyond the current public polished demo route
- **P1**: Final app-store submission assets pass (store screenshots, icon pack QA, listing copy)
- **P1**: Extend strict type-hint coverage to remaining large routers (`content.py`, `user.py`, `admin.py`, `payments.py`, `gifts.py`, `oracle.py`, `numerology.py`, `birth_chart.py`)
- **P2**: Subscription-based access to all premium content (all-in-one membership)
- **P2**: Add a Sacred Journey Progress tracker to the dashboard if approved
- **P2**: Add a dedicated real-time video provider if true two-way in-app conferencing is desired beyond embed URLs + in-app RSVP/chat/Q&A
- **P3**: Add more crystal profiles (at 27, can expand to 30+)
- **P3**: Production deployment optimization

## Completed Work (March 2026 - Session 4 — Guided Practice Player)
- [x] **Full-Screen Guided Practice Player** (all practices):
  - `GuidedPracticeOverlay.jsx` — full-screen immersive player (z-200, covers TopNav)
  - Session timer (e.g. "14:56 remaining") + step counter ("Step 1 of 8") + per-step countdown
  - Step instruction text, step progress bar, overall progress bar
  - 5 controls: Restart, Play/Pause (large amber), Skip, Mute, Eye toggle
  - Practice Speed: Slow / Normal / Fast
  - Exit Practice button at bottom + X close at top
  - Element-themed gradient background (earth=emerald, water=blue, fire=orange, air=sky, spirit=violet)
- [x] **Auto TTS Narration per step** — each step auto-generates OpenAI TTS (nova voice) and plays automatically. Shows "Narrating step..." indicator. Added `autoNarrate` prop to `PracticeTimer.jsx`.
- [x] **Integrated into all practice pages:**
  - Chakra Cleansing: "Guided Practice" button in modal → parses `cleansing_guide` into steps
  - Water Practices: "Start Guided Practice" button → uses `steps` array directly  
  - Elemental Practices: sparkle button for full-screen mode (in addition to inline PracticeTimer)
  - Courses — Daily Practice tab: "Start Guided Practice" button (for purchased courses)


- [x] **27 Deep Crystal Profiles** (up from 20): Added Aquamarine, Kunzite, Iolite, Amazonite, Howlite, Kyanite, Angelite — each with full meditation, ritual, chakra, cleansing, and combination guidance
- [x] **"Share to Sacred Circle" button** on Chakra Cleansing and Courses modals:
  - Reusable `ShareToCircle.jsx` component with reflection textarea, author name, element selector
  - Posts to `/api/community/posts` with element, author_name, and tags now correctly persisted
  - Success toast + modal auto-close on submit


- [x] **Community Threading & Replies (P2)**:
  - Post cards show live like count + reply count badges
  - Post detail modal: Like button, toggle replies section, full replies list, reply form (name + content + submit)
  - Backend: `POST /api/community/posts/{post_id}/replies` — pushes to MongoDB comments array
  - Real-time UI update (no page reload needed)
- [x] **Today's Sacred Practice Widget (Dashboard Enhancement)**:
  - New `SacredPracticeWidget` component in `Dashboard.jsx` (authenticated users)
  - Fetches `/api/daily-practice` — shows moon phase, day theme, morning/evening practice cards
  - Each card navigates to relevant practice page
- [x] **20 Deep Crystal Profiles (P3 expanded)**:
  - Added 5 new full profiles: Lepidolite, Rhodonite, Fluorite, Chrysocolla, Sunstone
  - Total: 20 deep crystals with complete meditation, ritual, chakra, and combination guidance
  - Auto-seeded on backend startup from `crystals_deep.py`


- [x] **40-Day Journey now visible in Courses UI** (was P0 bug):
  - Added 3 missing tabs to course detail modal: Daily Practice, 40-Day Journey, Safety
  - 40-Day Journey tab: Phase 1 (teaser) always visible, Phases 2-4 locked for non-purchasers with blur + Unlock CTA
  - Daily Practice tab: First 3 steps visible as teaser, remaining locked for non-purchasers
  - Safety tab: Always fully visible (public precautions content)
  - All 3 tabs use existing backend data (already in DB from `sacred_rites_deep.py`)
- [x] **Chakra Guided Meditation Audio Narration** (was P1):
  - Volume2 "Listen" button added to every expandable section in Chakra Cleansing modal
  - Calls `/api/tts/generate-base64` with section text via Emergent LLM Key (OpenAI TTS nova voice)
  - Audio renders as inline HTML audio player when ready; toggle clicks stop playback
  - Blob URLs cleaned up on modal close

- [x] **Archangel Oracle System** (NEW - Full Divination Feature):
  - 15 Archangels with deep spiritual content matching Oracle/Tarot depth
  - Each archangel includes: Domain, Message, Love Guidance, Invocation, Prayer, Affirmation, Signs of Presence
  - Single Archangel and Trinity (3-card) reading spreads
  - AI-powered divine interpretations using Claude
  - Browse All feature to learn about each archangel
  - Shadow/reversed meanings for deeper guidance
  - Crystal, color, element, and chakra associations
  - Frontend page at `/archangels` with dark theme
  - Added to Main Menu under "Divination & Guidance"
- [x] **Admin Database Seeding Route**:
  - POST /api/admin/seed-database — Seeds all or specific collections
  - GET /api/admin/seed-status — Shows database collection counts
  - Safe for production with force flag option
- [x] **4 New Video Categories with 20+ Real YouTube Videos**:
  - Angel Guidance: Archangel Uriel, Archangel Michael meditations
  - Colour Therapy: Chromotherapy, color wash meditation, chakra colors
  - Aromatherapy: Essential oil meditation, citrus uplift, sacred oils
  - Art Therapy: Bilateral drawing, mindful art, intuitive scribble
- [x] **Videos Library Dark Theme Fix**:
  - Converted from light feminine theme to dark Shamanic Elements aesthetic
  - Category filters with unique icons for each new category
  - Consistent with app's dark theme CSS variables

## Earlier Completed Work (March 2026)

## Architecture
```
/app/
├── backend/
│   ├── data/
│   │   ├── sacred_rites_deep.py — 3 rites with extended rituals
│   │   ├── video_content.py — 51 video tutorials (13 categories)
│   │   ├── archangel_oracle.py — 15 Archangels with deep content (NEW)
│   │   ├── creative_processes_deep.py — 9 deep practices
│   │   ├── divination_content.py — Light Codes and symbolic systems, now enriched with deep teachings
│   ├── routers/
│   │   ├── admin.py — Admin auth, content CRUD, uploads, and owner access
│   │   ├── content.py — public content + live session APIs + Light Codes
│   │   ├── oracle.py — Oracle + Archangel Oracle endpoints
│   │   ├── payments.py — Stripe/PayPal checkout, course access
│   │   ├── user.py — settings, rituals, favorites, account export, and deletion requests
│   ├── server.py — startup seeding
├── frontend/
│   ├── src/components/
│   │   ├── admin/adminSession.js — owner /admin session bootstrap helper
│   │   ├── AppFooter.jsx — support/privacy/legal links
│   │   ├── AmbientSoundPlayer.jsx — shared sound catalog used by Breathwork soundscape selector
│   │   ├── GuidedPracticeOverlay.jsx — full-screen continuous guided sessions with exact countdown
│   │   ├── InstallPrompt.jsx — improved install messaging and iOS guidance
│   │   ├── PracticeTimer.jsx — shared guided timer for inline practice pages with exact duration handling
│   ├── src/pages/
│   │   ├── AdminDashboard.jsx — owner dashboard for whole-app content access
│   │   ├── AdminSection.jsx — collection editor for courses, moon paths, live sessions, yoga, and more
│   │   ├── Breathwork.jsx — now includes in-player nature sound selection
│   │   ├── Courses.jsx — 7-tab modal, Stripe purchase flow
│   │   ├── DemoExperience.jsx — polished public demo showcase
│   │   ├── LiveSessions.jsx — public live room listing with filters and stats
│   │   ├── LiveSessionRoom.jsx — embedded live room, RSVP, chat, and Q&A
│   │   ├── SupportCenter.jsx — install, privacy, support, and account action guidance
│   │   ├── VideosLibrary.jsx — 13 category filters, dark theme
│   │   ├── ArchangelOracle.jsx — Archangel readings & browse (NEW)
│   │   ├── LightCodes.jsx — deep symbolic teachings, category panels, and multi-tab modal redesign
│   │   ├── PaymentSuccess.jsx — payment verification
│   │   ├── Dashboard.jsx — streak widget
```
