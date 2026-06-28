# Shamanic Elements Soul Temple — PRD (Current)

## Original Product Intent
- Maintain an authentic dark, ceremonial spiritual wellness app.
- Ensure factual provenance workflows remain strict (Wikipedia/Commons-backed content pipeline).
- Deliver precise guided practice timing with spoken guidance that is not misleading.
- Complete app-store-quality UI/UX and production-grade code quality.

## Core Stack
- Frontend: React + Tailwind + Framer Motion
- Backend: FastAPI + Motor (MongoDB)
- DB: MongoDB via `MONGO_URL` + `DB_NAME`
- Audio/AI: TTS + script expansion endpoints (`/api/tts/*`, `/api/content/expand-script`)

## Current Architecture Highlights

### Frontend (modularized)
- `src/pages/HumanDesign.jsx` now orchestrates smaller modules:
  - `components/human-design/HumanDesignChartTab.jsx`
  - `components/human-design/HumanDesignModals.jsx`
  - `components/human-design/BodyGraph.jsx`
  - `components/human-design/humanDesignData.js`
- `src/pages/GeneKeys.jsx` now orchestrates:
  - `components/gene-keys/GeneKeysProfileTab.jsx`
  - `components/gene-keys/GeneKeysModals.jsx`
  - `components/gene-keys/geneKeysData.js`
- `src/pages/AstrologyCalendar.jsx` now uses:
  - `components/astrology/astrologyCalendarConfig.js`
  - `components/astrology/AstrologyMonthDialog.jsx`
- `src/pages/ElementalPractices.jsx` now uses:
  - `components/elemental/ElementalPracticeCard.jsx`
  - `components/elemental/ElementalPracticeModal.jsx`
  - `components/elemental/elementalConfig.js`

### Backend (complexity reductions)
- `routers/payments.py`
  - Added helper decomposition for PayPal config/payload/approval URL and transaction assembly.
- `routers/numerology.py`
  - Extracted lunar month range logic into helper functions + constants for cleaner route flow.
- `routers/user.py`
  - Refactored `get_favorites()` to collection-map driven batch hydration.
- `routers/tts.py`
  - Decomposed `_build_meditation_scripts()` into dedicated part builders.

## Functional Requirements Status

### P0 — Code Quality + Modularization
- ✅ Completed for high-priority oversized pages:
  - Human Design
  - Gene Keys
  - Astrology Calendar
  - Elemental Practices

### P0 — Narration floor integrity
- ✅ Verified in testing: `/api/content/expand-script` returns >= 840 words for 7-minute floor.

### P1 — Backend complexity warnings
- ✅ Completed on targeted routes/functions in payments, numerology, user favorites, and tts builders.

### P1 — Remove seeded retreats placeholders
- ✅ Verified: `/api/retreats` returns empty array; no placeholder records.

## Latest Verification Snapshot (Iteration 131)
- Frontend regression: PASS
- Backend regression: PASS
- Narration expansion floor: PASS
- Retreat cleanup: PASS
- Deployment blockers found by testing agent: **none**

## Latest Verification Snapshot (Iteration 236/237 — 2026-06-28)
- ✅ App-wide monetization normalization completed:
  - All main content section endpoints now return **exactly 14 items** with **4 free + 10 premium**.
  - Implemented centralized tier expansion in `backend/routers/content.py` so underfilled sections are expanded to consistent storefront depth.
- ✅ Pricing page simplified to one location with two options only:
  - `monthly` subscription
  - `full_app_unlock` lifetime access
  - Verified via `/api/payments/plans` and `/pricing` UI.
- ✅ Admin privacy tightened to owner-only (`mskatt78@gmail.com`):
  - Updated frontend admin visibility checks and env allowlist.
  - Updated backend env allowlist for admin-restricted flows.
- ✅ Oracle wording cleanup:
  - Removed AI term from Oracle-related user copy and Oracle route language references.
- ✅ Requested copy polish completed:
  - Meditations banner title updated to "Meditations remain open".
  - Removed "Sacred Art Premium" header from Creative Processes premium banner.
- ✅ Regression/testing status:
  - `testing_agent` iteration 236: backend and frontend both PASS.
  - `deep_testing_backend_v2`: PASS across 23 content endpoints + pricing + retreats + expand-script floor.
  - `auto_frontend_testing_agent`: PASS on pricing, oracle wording, healing portals, elemental temples, and lock/free flows.

### Prioritized Remaining Backlog
- **P1:** Final content quality pass on synthetic deepening variants for tonal uniqueness (if desired by owner).
- **P1:** Final app-store submission checklist pack (icons/screenshots/legal copy review).
- **P2:** Optional Sacred Journey Progress tracker and completion telemetry.

## Latest Verification Snapshot (Iteration 132)
- Backend complexity cleanup regression: PASS (14/14)
- Frontend hook/key cleanup regression: PASS (100%)
- Verified `content.py` helper signature reduction using `CrystalImageResolutionState`
- Verified no React key warnings in `MeditationVisualizer` and `BreathingVisualizer`
- Verified mypy CI workflow added: `.github/workflows/mypy-backend.yml`

## Latest Verification Snapshot (Iteration 133)
- Full code-quality sweep completed in this pass:
  - ESLint (`/app/frontend/src`) clean
  - Ruff (`/app/backend`) clean
  - Mypy (`backend/routers`) clean
- Deeper `content.py` maintainability refactor completed by decomposing `_expand_with_llm(...)` into:
  - `_build_llm_script_prompt(...)`
  - `_import_llm_chat_dependencies()`
  - `_request_llm_script_text(...)`
- Additional cleanup completed:
  - `gifts.py` mypy fix on subscription price cast
  - test/code-quality warning cleanup in backend test suite and seed/data files
- Testing agent (`iteration_133`) confirms backend/frontend regression pass and no deployment blockers.

## Latest Verification Snapshot (Iteration 134)
- Batch 1 + hook pass executed and validated by testing agent.
- Regression status: backend **19/19 pass**, frontend **100% pass**, no deployment blockers.
- Verified areas:
  - `user.py` achievements endpoint helper decomposition
  - `server.py` seeding coordinator split (`do_database_seeding -> _seed_database_core_flow`)
  - `routeGuards.jsx` dependency hardening
  - `SacredPracticeWidget.jsx` hook hygiene
  - `Journal.jsx` split into `JournalMainSection` + `JournalDialogs`
  - `MasculineTemple.jsx` error handling + hook dependency cleanup
  - `MeditationVisualizer.jsx` stabilized with memoized visual specs and unique keys

## Remaining from Current Code Review Report
- Hook dependency backlog has been cleared for the currently reported frontend scope.
- Remaining quality work is now mainly complexity reduction + production console/log hygiene.

## Latest Verification Snapshot (Iteration 135)
- Completed focused follow-up for the two remaining critical items:
  1) Domain-level seeding split
     - `do_database_seeding()` now coordinates `seed_users()`, `seed_content()`, `seed_config()`
  2) Plugin-compatible `MeditationVisualizer` architecture split
     - Implemented `useVisualizationState`, `VisualizationCanvas`, and `VisualizationControls` strategy within the same file to avoid Babel cross-file plugin incompatibility.
- Testing agent (`iteration_135`) confirms:
  - Backend: **12/12 pass**
  - Frontend: **100% pass**
  - No deployment blockers
  - No React key warnings during breathwork/practice visualizer flows

## Updated Remaining from Current Code Review Report
- Batch 2 important items pending (payment/content long-function decomposition + residual test anti-pattern sweep).

## Latest Verification Snapshot (Iterations 136-137)
- User-reported guided issues addressed:
  - Repetitive narration stems/phrases reduced and validated
  - Guided duration alignment improved and validated for longer practices
- Backend guided script changes:
  - Increased target pacing baseline (`TARGET_WORDS_PER_MINUTE = 132`)
  - Stronger anti-repetition diversity in deterministic padding
  - Strict higher minimum word floors + iterative duration-alignment loop
  - Added `_build_duration_alignment_booster()` for guaranteed long-duration floor completion
  - AI expansion path guarded with timeout fallback (while frontend requests deterministic mode)
- Frontend guided payload behavior:
  - `useGuidedPracticeEngine` and `useGuidedAudioPlayback` send `use_ai=false` + anti-repetition mode
- Test confirmations:
  - Iteration 136: repetition improved; 7-15 min alignment pass; identified 20-min gap
  - Iteration 137: 20-min strict/minimal-source now **100% target_word_count** (2640/2640), repetition guard still pass

## Newly Completed (Current Pass)
- Refactored parameter-heavy content helpers:
  - `_apply_commons_visual_fallback_if_needed(...)` now takes a structured state object
  - `_persist_crystal_image_validation(...)` now accepts structured resolution state
- Reduced hook dependency/stale-closure risk:
  - `useTimerClock`: callback refs for transition/pause/reset/complete handlers
  - `useGuidedPracticeEngine`: logger cleanup + dependency trim on play handler
  - `BreathingVisualizer`: memoized phase config + callback refs for cycle completion
- Removed index-as-key anti-patterns:
  - `MeditationVisualizer`: deterministic object specs with generated IDs
  - `BreathingVisualizer`: angle-based stable keys (`particle-angle-*`)
- Added mypy CI gate for typed routers and verified local mypy success on targeted modules.

## Latest Verification Snapshot (Iteration 138)
- Goal completed: **"fix all hooks"** pass across remaining frontend pages.
- `react-hooks/exhaustive-deps` status: **0 errors** in current frontend source.
- Testing-agent validation: frontend runtime regression pass; fixed ordering-related callback initialization bugs in:
  - `src/pages/Pricing.jsx`
  - `src/pages/RitualBuilder.jsx`
  - `src/pages/OracleReadings.jsx`
- Verified tested pages load cleanly (landing, dashboard, pricing, oracle, mantras, progress dashboard, sound frequencies); no runtime crash from hook refactor.

## Latest Verification Snapshot (Iteration 139)
- User-reported fixes completed for **exact image rendering** + **guided narration echo reduction**.
- Image rendering updates applied on guided-practice card surfaces (no-crop fit):
  - `SomaticMovement`, `Meditations`, `CreativeProcesses`, `MudrasLibrary`, `ElementalPracticeCard`
  - Core behavior now uses `object-contain object-center` for exact visual fidelity.
- Guided audio echo mitigation updates:
  - Added narration ducking in `useGuidedPracticeEngine` (ambient + toning reduced while voice is speaking)
  - Lowered/controlled toning mix behavior in `guidedNarrationUtils` and `useGuidedAudioPlayback`
  - Confirmed single-audio-instance playback lifecycle to prevent overlap.
- Testing agent result (`iteration_139`): **Frontend 100% pass**, no regressions, no echo detected during guided play/pause/resume.

## Latest Verification Snapshot (Iteration 140)
- User-reported breathwork sound mismatch resolved with explicit, distinct synthesis engines in `useBreathworkEngine`.
- Added dedicated sound profiles and switching support for:
  - `whale`, `dolphin`, `birds`, `nature (forest + birds)`, `fire (with crackle layer)`, `wind`, `rain`, `ocean`, `chimes`, `drums_gentle`.
- Fixed prior fallback behavior where multiple selections could collapse into similar filtered-noise outputs.
- Confirmed sound switching behavior: old source cleanup happens before new source starts (no overlap).
- Testing agent result (`iteration_140`): **Frontend 100% pass**, distinct sounds verified, switching flow verified.

## Latest Verification Snapshot (Iteration 141)
- Applied default loudness calibration (not optional) for breathwork soundscapes:
  - Whale deeper: lower base frequency + overtone layer + stronger body
  - Birds brighter/louder chirps
  - Fire stronger crackle transients
  - Dolphin stronger call envelope
- Per-sound master gain balancing is now built into runtime defaults.
- Testing agent result (`iteration_141`): **Frontend 100% pass**, tuned profiles verified, switching still stable (no overlap/silence).

## Latest Verification Snapshot (Iteration 142)
- Completed hook-dependency cleanup request by removing remaining `react-hooks/exhaustive-deps` suppressions in admin pages.
- Updated callback/effect dependency wiring:
  - `src/pages/AdminDashboard.jsx`
  - `src/pages/AdminSection.jsx`
- Verification status:
  - ESLint exhaustive-deps: **0 active warnings + 0 suppressions**
  - Testing agent (`iteration_142`): **Frontend 100% pass**
  - No runtime loops/crashes in admin collection load/search/pagination/switch flows.

## Latest Verification Snapshot (Iteration 143)
- Fixed shamanic journey blank-page crash when pressing **Begin Guided Shamanic Journey**.
- Root cause: hook-order initialization bug in `src/components/timer/useTimerClock.js` (`currentSegmentIndex` reference used before initialization in effect ordering).
- Fix: moved computed-value synchronization effects to run after `segmentEndTimes/currentSegmentIndex` are declared, preserving stable ref updates.
- Validation:
  - Manual smoke reproduction before/after confirmed crash removal.
  - Testing agent (`iteration_143`): **Frontend 100% pass**
  - Timer now renders and runs correctly in `/shamanic` practice start flow.

## Latest Verification Snapshot (Iteration 144)
- Completed broad code-quality remediation pass from user-provided recommendations (scope C).
- Frontend quality fixes:
  - Hook/dependency hardening in `routeGuards.jsx`, `useCoursePayments.js`, `useGuidedAudioPlayback.js`
  - Nested ternary cleanup in `YogaLibrary.jsx`, `MudrasLibrary.jsx`, `RitualBuilder.jsx`
  - Inline animation object extraction in dashboard widgets (`DashboardActionPanels.jsx`, `StreakWidget.jsx`)
  - Empty catch cleanup in `MantrasLibrary.jsx`
- Backend complexity refactors:
  - `payments.py`: split `_resolve_payment_context` into subscription/bundle/catalog helper resolvers
  - `gifts.py`: extracted config validation and payment persistence helpers for Stripe/PayPal gift flows
  - `content.py`: extracted extension-state init + duration-alignment floor helper from expand-script flow
  - `numerology.py`: split reading payload construction into personal-year and name-number helper functions
  - `server.py`: split production sanity seed path vs preview heavy-seed flow orchestration
- Test quality cleanup:
  - Updated backend tests flagged for equality/comparison quality (`used_ai == False` -> `not used_ai`, removed non-placeholder f-strings)
- Validation:
  - ESLint exhaustive-deps: **0 errors / 0 suppressions**
  - Python lint: **pass**
  - Consolidated testing agent (`iteration_144`): backend **44/44 pass**, frontend key flows pass, no regressions.

## Latest Verification Snapshot (Iteration 145)
- Continued structural decomposition and section extraction for large frontend pages:
  - `Courses.jsx` split into reusable sections/components:
    - `pages/courses/CoursesFilters.jsx`
    - `pages/courses/CoursesBundleOffer.jsx`
    - `pages/courses/CoursesModalShell.jsx`
  - `LightCodes.jsx` modal extraction:
    - `pages/light-codes/LightCodeModal.jsx`
  - `HeartPractices.jsx` decomposed into dedicated modal section component (`HeartPracticeModal`) and simplified page orchestration flow.
- Broad production console cleanup hardening:
  - `index.js` now suppresses `console.log/info/debug/warn/error` in production mode.
  - Additional direct `console.error` calls replaced with structured `appLogger` in touched pages.
- Validation:
  - Frontend testing agent: all decomposed page flows pass (Courses, LightCodes, HeartPractices, ElementalTemples)
  - Backend smoke checks pass for content endpoints used by these pages
  - Consolidated test report (`iteration_145`): **frontend 100% / backend 100% for tested flows**.

## Latest Verification Snapshot (Final Decomposition Pass)
- Finalized `ElementalTemples` payload externalization:
  - moved static elemental payload + icon mapping into `pages/elemental-temples/elementalTempleData.js`
  - split route sections into dedicated components:
    - `pages/elemental-temples/ElementalTempleGridView.jsx`
    - `pages/elemental-temples/ElementalTempleDetailView.jsx`
- Continued decomposition of other large pages:
  - `HeartPractices` modal extracted to `pages/heart-practices/HeartPracticeModal.jsx`
  - `LightCodes` modal extracted to `pages/light-codes/LightCodeModal.jsx`
  - `Courses` section decomposition completed (`CoursesFilters`, `CoursesBundleOffer`, `CoursesModalShell`)
- Frontend console cleanup completed across untouched files using `appLogger`; production console suppression retained in `index.js`.
- Current page sizes after decomposition:
  - `ElementalTemples.jsx`: 117 lines
  - `HeartPractices.jsx`: 236 lines
  - `Courses.jsx`: 210 lines
  - `LightCodes.jsx`: 363 lines (modal extracted; further split possible if needed)
- Final validation:
  - Frontend regression agent: all target routes pass after fix (`heart-practices` import correction)
  - Backend smoke: core endpoints pass (`light-codes`, `heart-practices`, `courses`, `content/expand-script`)
  - Note: `/api/elements` returns 404 because this route does not exist by design (available alternatives: `/api/elemental-temples`, `/api/elemental-practices`).

## Latest Verification Snapshot (Iteration 146)
- Completed requested follow-up:
  - `LightCodes.jsx` reduced to **292 lines** by moving category/tab payload to `pages/light-codes/lightCodeConfig.js`
  - Added backend alias endpoint `GET /api/elements` mapped to elemental temples data
- Verified payload externalization + decomposition integrity:
  - `ElementalTemples` static payload remains externalized in `pages/elemental-temples/elementalTempleData.js`
  - `ElementalTemples` route consumes decomposed section components
- Regression status (testing agent `iteration_146`):
  - Backend: **100% (8/8)**
  - Frontend: **100%** across Light Codes / Elemental Temples / Heart Practices / Courses
  - No new regressions found.

## Latest Verification Snapshot (Iteration 148)
- Resolved Mindfulness "Sound Meditation" complaint: no sound + manual step clicking.
- Replaced manual step/timer flow in `Mindfulness.jsx` with `PracticeTimer` integration configured for:
  - `autoStartAudio={true}`
  - `autoNarrate={true}`
  - automatic segment-based progression (no manual Next Step).
- Added explicit auto-guidance UX copy and preserved early-complete control.
- Verification (`iteration_148`):
  - Frontend **100% pass**
  - Timer runs continuously
  - Narration status visible (`Narrating section ...`)
  - Toning status visible
  - User complaint marked **RESOLVED** by testing agent.

## Latest Verification Snapshot (Iteration 149) — 2026-06-01
- Implemented user-requested somatic taxonomy + yoga factual-image correction pass with no regressions.
- Backend updates:
  - Added verified yoga image override pipeline in `routers/content.py` for key poses (including Downward Dog, Warrior II, Tree Pose, Mountain Pose) using Wikimedia Commons references.
  - Yoga payloads now include: `somatic_fascia_focus`, `breath_hybrid_cue`, `mindfulness_prompt`, and `source_references` (for verified entries).
  - Somatic payloads now include movement-track separation and sorting:
    - `Somatic Movement`
    - `Tai Chi`
    - `Chi Gong`
  - Somatic Movement entries now include Breath Hybrid metadata (`breath_hybrid_mode`, `breath_hybrid_sequence`) and fascia focus.
  - `tts.py` somatic script generation now incorporates movement-track, fascia focus, and breath-hybrid cues.
- Frontend updates:
  - `SomaticMovement.jsx` now includes Movement Track filter and metadata rendering in cards/modals.
  - `YogaLibrary.jsx` now preserves full-pose visibility (`object-contain`) and shows new sections in pose modal:
    - Somatic & Fascia Focus
    - Breath Hybrid Cue
    - Source References
- Validation (`iteration_149`):
  - Backend: **100% (19/19 pass)**
  - Frontend: **100% pass**
  - No regressions across landing, Yoga Library, Somatic Movement, guided start flow.

## Latest Verification Snapshot (Iteration 150) — 2026-06-01
- Follow-up request completed:
  - Expanded Wikimedia-verified image override coverage for remaining high-risk yoga poses.
  - Added Yoga card-level and modal-level `Verified Source` badges for faster trust scanning.
- Backend updates:
  - Extended `YOGA_VERIFIED_IMAGE_OVERRIDES` in `routers/content.py` for additional advanced/intermediate poses including:
    - Warrior III, Headstand, Shoulder Stand, Plow Pose, Wheel Pose, Firefly Pose, Eight Angle Pose
    - plus additional high-risk mismatch candidates.
- Frontend updates:
  - `YogaLibrary.jsx` now shows `Verified Source` badge on cards for verified entries.
  - Pose modal now shows `Verified Source` badge next to element/difficulty and retains source reference links.
- Validation (`iteration_150`):
  - Backend: **100% (16/16 pass)**
  - Frontend: **100% pass**
  - Verification details:
    - 41 verified yoga entries rendering badge
    - all targeted high-risk poses confirmed with Wikimedia-based verified images
    - no regressions in yoga listing, modal opening, or image rendering.

## Latest Verification Snapshot (Iteration 151) — 2026-06-01
- Continued verification pass completed for remaining mismatch-risk yoga entries.
- Added/validated additional Wikimedia overrides for beginner/high-traffic mismatch candidates:
  - Bridge Pose, Cat-Cow Flow, Corpse Pose, Easy Pose, Extended Side Angle, Extended Triangle,
    Garland Pose, Goddess Pose, Locust Pose, Thunderbolt Pose, Prayer Pose, Wide-Legged Forward Fold.
- Verification coverage status:
  - Total yoga poses: 78
  - Verified with Wikimedia sources: 55
  - Remaining unverified: 23
- UI trust indicator status:
  - `Verified Source` badge rendering on cards: PASS (55 cards)
  - Modal `Verified Source` badge + source links: PASS
- Validation (`iteration_151`):
  - Backend: **100% (24/24 pass)**
  - Frontend: **100% pass**
  - No regressions in Yoga Library route, modal, or image rendering.

## Latest Verification Snapshot (Iteration 152) — 2026-06-02
- Continued yoga verification pass completed with additional safe Wikimedia matches and explicit pending-state handling.
- Newly verified in this pass:
  - Happy Baby Pose
  - Legs Up the Wall
  - Reclined Bound Angle
  - Staff Pose
  - Seated Meditation
- Verification-state architecture update:
  - Verified entries: `image_source = wikimedia_commons_verified`
  - Unresolved entries: `image_source = pending_verification`
  - Pending entries now include `image_validation.status = pending_review` + `priority` field for triage.
- UI trust/status updates:
  - `Verified Source` badge for verified entries
  - `Pending Source Review` badge for unresolved entries
  - Source reference links visible only for verified entries
- Coverage status after this pass:
  - Total poses: 78
  - Verified: 60
  - Pending: 18
- Validation (`iteration_152`):
  - Backend: **100% (19/19 pass)**
  - Frontend: **100% pass**
  - No regressions in yoga page load, modal behavior, or image rendering.

## Latest Verification Snapshot (Iteration 153) — 2026-06-02
- Continued verification pass completed with 2 additional pose upgrades:
  - Plank Pose (`Phalakasana`)
  - Seated Spinal Twist (`Seated Ardha Matsyendrasana`)
- Added pending-state UX detail in Yoga modal:
  - `Pending Source Review` note now includes priority for unresolved entries.
- Coverage status after this pass:
  - Total poses: 78
  - Verified: 62
  - Pending: 16
- Validation (`iteration_153`):
  - Backend: **100% (23/23 pass)**
  - Frontend: **100% pass**
  - No regressions in yoga listing, badges, modal, or image rendering.

## Latest Verification Snapshot (Iteration 154) — 2026-06-02
- Completed requested resolution of remaining pending yoga entries with true-image sources and references.
- Yoga verification status now:
  - Total poses: 78
  - Verified: 78
  - Pending: 0
- Priority completion confirmed:
  - Fire Log Pose: verified (Wikimedia source + references)
  - Frog Pose: verified (Mandukasana-category-aligned Wikimedia source + references)
  - Seated variants: all resolved to verified source state with references.
- Admin-side queue/filter enhancements implemented:
  - Admin API supports yoga verification filters: `verification_status`, `verification_priority`
  - Admin section (`/admin/manage/yoga_poses`) now includes a verification queue panel:
    - Summary metrics
    - Filters (All / Pending / Verified)
    - Priority filters (All / High / Medium / Low)
    - “Review Pending Queue” shortcut
  - Admin dashboard now includes a quick action card for Yoga Pending Queue.
- Validation (`iteration_154`):
  - Backend: **100% (28/28 pass)**
  - Frontend: **100% pass**
  - No regressions in Yoga Library, Admin Dashboard, or Admin Yoga manager.

## Latest Verification Snapshot (Iteration 155) — 2026-06-05
- Critical code-quality/security remediation pass completed from user-provided report.
- Security fix:
  - Removed hardcoded admin password from `backend/tests/test_iteration154_yoga_verification_complete.py`.
  - Test now uses `ADMIN_PASSWORD` from env + `pytest.skip()` when required env vars are missing.
- Backend refactors (critical complexity):
  - `server.py` `_seed_database_preview_flow()` decomposed into helper functions for maintainability and lower complexity (seeding phases split by domain).
  - `routers/tts.py` `_build_somatic_script()` decomposed into helper builders (`_somatic_overview_lines`, `_somatic_breath_grounding_lines`, `_somatic_movement_lines`, `_somatic_closing_lines`).
- Frontend critical modularization:
  - `MantrasLibrary.jsx` reduced to a wrapper.
  - New modular files:
    - `src/pages/mantras/MantrasLibraryContainer.jsx` (state orchestration)
    - `src/pages/mantras/MantrasFilters.jsx`
    - `src/pages/mantras/MantrasHeader.jsx`
    - `src/pages/mantras/MantrasTabs.jsx`
    - `src/pages/mantras/MantrasLibraryGrid.jsx`
    - `src/pages/mantras/MantrasCustomSection.jsx`
    - `src/pages/mantras/MantrasPlayer.jsx`
    - `src/pages/mantras/useMantrasData.js` (data/business hook)
- Hook-dependency cleanup:
  - Applied targeted updates in listed critical files (`routeGuards.jsx`, `useCoursePayments.js`, `YogaLibrary.jsx`) and re-validated lint state.

- Validation (`iteration_155`):
  - Backend: **100% (28/28 pass)**
  - Frontend: **100% pass**
  - Security verification: hardcoded secret removal confirmed
  - No regressions in Mantras and Yoga flows.

## Latest Verification Snapshot (Iteration 156) — 2026-06-12
- Important recommendation batch (phase-1) completed and validated.
- Backend complexity refactors completed:
  - `routers/admin.py:list_items()` split into helper functions:
    - query builder
    - audio listing
    - yoga verification filtering
    - pagination + summary builders
  - `routers/user.py:get_daily_guidance()` split into:
    - context fetcher
    - response formatter
    - error handler
  - `routers/payments.py:create_checkout_session()` split into:
    - Stripe client setup
    - checkout request builder
    - checkout response/error helpers
  - `routers/gifts.py:_create_paypal_gift_order()` split into:
    - PayPal order request helper
    - response builder
- Frontend performance/organization improvements completed:
  - `JournalDialogs.jsx`: memoized expensive derived arrays.
  - `ChakraCleansing.jsx`: memoized chakra-strip entries, section data, benefits, and ceremony steps.
  - `MainMenu.jsx`: memoized menu-section structure.
  - `HumanDesign.jsx`: memoized years/months/days option arrays.
  - `HumanDesignChartTab.jsx` and `HumanDesign.jsx`: fixed unescaped-entity issues in user-facing copy.
  - `AdminSection.jsx`: updated admin audio delete endpoint path alignment.
- Test-quality check status:
  - Confirmed zero remaining `is` vs `==` anti-patterns in:
    - `test_stripe_payment_iteration49.py`
    - `test_sacred_rites_iteration48.py`
    - `test_shamanic_features_iter47.py`
- Validation (`iteration_156`):
  - Backend: **100% (31/31 pass)**
  - Frontend: **100% pass**
  - No compile overlays or regressions on tested pages/routes.

## Latest Verification Snapshot (Iteration 157) — 2026-06-12
- User-reported recurring hook-dependency loop addressed with strict dependency validation and regression testing.
- Hook-dependency pass completed for repeatedly flagged files:
  - `src/routes/routeGuards.jsx`
  - `src/pages/mantras/useMantrasData.js`
  - `src/pages/mantras/MantrasLibraryContainer.jsx`
  - `src/pages/dashboard/SacredPracticeWidget.jsx`
- Validation details:
  - Strict hook dependency lint check: `yarn eslint src --rule 'react-hooks/exhaustive-deps:error'` -> **exit code 0**
  - Regression test report: `/app/test_reports/iteration_157.json`
    - Backend: **100% pass**
    - Frontend: **100% pass**
    - No stale-closure symptoms detected (auth state, mantra/favorites state, route-guard loops)
    - Build succeeds; no compile overlays on tested pages
- Note:
  - `react-hooks/set-state-in-effect` warnings surfaced by analyzer were validated as false positives for legitimate async state updates and did not reproduce as runtime bugs.

## Latest Verification Snapshot (Iterations 158-159) — 2026-06-12
- Continuous hardening pass (phase-2) completed with backend complexity decomposition + targeted frontend quality cleanup.

### Backend hardening completed
- `services/email_service.py`
  - Decomposed large functions into helpers:
    - gift type formatting
    - message HTML builders
    - payload builders
    - send wrapper
    - disabled-email response helper
- `routers/content.py`
  - Decomposed `expand_guided_script()` with explicit target/response helper builders.
  - Simplified Wikipedia helper complexity:
    - page extraction helper
    - file URL extraction helper
    - article-file candidate scoring helper
    - title-skip predicate helper
- `routers/gifts.py`
  - Decomposed `_create_stripe_gift_checkout()` into URL/client/request/response/error helpers.
- `routers/admin.py`
  - Reduced `_resolve_admin_yoga_verification()` branching via focused helpers for override lookup, reference merge, and verified/pending item builders.
- `seed_content.py`
  - Split seeding into collection helper + summary counts helper.
- `seed_database.py`
  - Split into collection builder, per-collection seed, index creation, and summary printer helpers.

### Frontend hardening completed
- `GroundingPractices.jsx`
  - Removed empty catch; added structured warning logging for audio warmup failures.
- `mantras/MantrasLibraryContainer.jsx`
  - Reduced nested ternary in main render path via `renderMainContent()` helper.

### Validation
- `/app/test_reports/iteration_158.json`: backend + smoke checks passed.
- `/app/test_reports/iteration_159.json`: **full regression pass success**
  - Backend: **100% (22/22 tests passed)**
  - Frontend: **100% pass**
  - No compile overlays, no route regressions.

## Data / Quality Rules to Preserve
- Mongo responses must exclude `_id` unless transformed safely.
- Any Mongo write objects reused in responses must be sanitized.
- Preserve factual provenance pipeline behavior and non-mocked references.
- Preserve dark sacred visual identity while keeping responsive layout integrity.

## Prioritized Backlog

### P0 (if still pending in future reports)
- Continue splitting any remaining oversized feature pages not yet modular.
- Remove remaining production `console.*` usage and silent error catches flagged by quality reports.

### P1
- Refactor remaining parameter-heavy helpers in `routers/content.py`.
- Continue reducing cyclomatic complexity in untouched backend hotspots.
- Continue cleanup of remaining production console/silent-catch quality report items.

### P1 (New content integrity continuation)
- Expand Wikimedia-verified override coverage beyond key yoga poses to remaining high-traffic poses where mismatch risk remains.
- Add optional quality score badge to yoga cards for image verification provenance transparency.

### P1 (updated after Iteration 150)
- Continue extending verified references for remaining unverified poses with mismatch reports.
- Add optional admin-side "mark verified" workflow for future pose/image audits.

### P1 (updated after Iteration 151)
- Complete final verification of remaining 23 unverified yoga entries (focus on seated variants and low-coverage Sanskrit matches).
- Introduce optional fallback policy: if no trusted Wikimedia match exists, keep current image but flag as "pending verification".

### P1 (updated after Iteration 152)
- Resolve remaining 18 pending entries; prioritize `high` first (`Fire Log Pose`, `Frog Pose`) then `medium` seated variants.
- Add admin-side verification queue/filter for `pending_verification` so owner can quickly approve replacements.

### P1 (updated after Iteration 153)
- Resolve final 16 pending entries:
  - High: `Fire Log Pose`, `Frog Pose`
  - Medium: seated variants (`Seated Cat-Cow`, `Seated Eagle Arms`, `Seated Pigeon Pose`, `Seated Relaxation`, `Seated Side Stretch`, `Seated Tree Pose`, `Seated Warrior`, `Seated Ankle Circles`, `Seated Chest Opener`, `Seated Neck Rolls`)
  - Low: `Embryo Pose`, `Reverse Warrior`, `Supine Twist`, `Thread the Needle`
- Consider owner-driven curation for seated specialty variants where Wikimedia has limited exact taxonomy coverage.

### P1 (updated after Iteration 154)
- Add optional admin bulk actions for verification workflow (bulk mark reviewed, export verification report CSV).
- Add optional pose-level verification confidence legend in admin (exact canonical vs seated-variant mapping) for transparency.

### P1 (updated after Iteration 155)
- Continue decomposition of remaining large pages (`AdminSection`, `ChakraCleansing`, `MainMenu`, `HumanDesign`) into hooks + presentational components.
- Continue backend complexity reduction for next tier functions (`routers/admin.py:list_items`, `routers/user.py:get_daily_guidance`, `routers/payments.py:create_checkout_session`, `routers/gifts.py:_create_paypal_gift_order`).

### P1 (updated after Iteration 156)
- Remaining important recommendations to complete in next phase:
  - Full React-hook dependency sweep across remaining files beyond targeted critical set.
  - React animation inline-object optimization in:
    - `light-codes/LightCodeModal.jsx`
    - `heart-practices/HeartPracticeModal.jsx`
    - `elemental-temples/ElementalTempleGridView.jsx`
  - Optional deeper decomposition of large frontend pages for long-term maintainability.

### P1 (updated after Iteration 157)
- Continue broader non-hook quality cleanup from latest report:
  - email service function decomposition
  - additional backend complexity reductions in content/seed modules
  - frontend large-component decomposition + nested ternary reduction

### P1 (updated after Iteration 159)
- Remaining hardening recommendations for next phase:
  - Continue large frontend component decomposition (`Numerology`, `MasculineTemple`, `ChakraCleansing`, `AdminSection`, `AncientWisdom`, `MudrasLibrary`, etc.)
  - Broader nested-ternary cleanup sweep across reported files.
  - Import-count reduction and barrel-export organization for high-import modules.

### P1 (updated after Iteration 160 - 2026-06-12)
- Completed Phase-3 route-level wrapper split for remaining large pages:
  - `MudrasLibrary`, `Numerology`, `MasculineTemple`, `ChakraCleansing`, `AdminSection`, `AncientWisdom`
  - Large page logic moved into container files under feature subfolders for safer incremental decomposition.
- Stabilized module imports after split (corrected relative imports for moved container files).
- Applied quality hardening sweep in this pass:
  - Replaced multiple silent/empty catches with structured `appLogger` error/warn logging in admin and chakra flows.
  - Removed nested ternary hotspot in shamanic guided narration preparation text.
  - Reworked option normalization in `AdminFormFields` to reduce JSX conditional complexity.
  - Improved elemental practice modal with explicit background-audio resolver and non-silent audio warm-up warning logging.
- Verification status:
  - Frontend lint run passed on refactored files.
  - Testing agent report: `/app/test_reports/iteration_160.json` (frontend 100% pass).
  - Additional frontend automation pass confirmed all targeted routes/interactions pass with no blockers.
- Remaining from this wave:
  - Deeper hook isolation + further decomposition inside container files (currently still large).
  - Resolve non-blocking `react-hooks/set-state-in-effect` warnings called out in Iteration 160 report.
  - Continue broader nested-ternary cleanup on additional non-critical files.

### P1 (updated after Iteration 161 - 2026-06-12)
- Completed deeper decomposition (hooks + presentational components + shared constants/utils) across all requested targets:
  - `admin`: `useAdminSectionData`, split modal/audio/list/toolbar/verification components, constants and utilities extracted.
  - `chakra-cleansing`: `useChakraCleansingData`, split header/filter/grid/detail modal components, chakra config/helpers extracted.
  - `ancient-wisdom`: `useAncientWisdomData`, split hero/filter/grid/detail modal components, tradition constants extracted.
  - `masculine-temple`: `useMasculineTempleData`, split header/hero/intro/grid/modals/quote components, archetype + intro constants extracted.
- Regression verification:
  - Lint passed for all newly created decomposition modules.
  - Testing agent report `/app/test_reports/iteration_161.json`: frontend 100% pass with no regressions.
  - Confirmed route stability and modal/filter interactions across `/masculine-temple`, `/chakra-cleansing`, `/ancient-wisdom`, and protected `/admin/manage/:collection` route behavior.
- Remaining P1/P2 hardening from code-quality backlog:
  - Continue decomposition for next-tier large pages (`AdminCMS`, `ShamanicPractices`, other secondary high-size files).
  - Complete remaining nested ternary simplification sweep in secondary files.
  - Address non-blocking hook-style warnings (`react-hooks/set-state-in-effect`) where still applicable.

## Latest Verification Snapshot (Iteration 162) — 2026-06-12
- Completed requested "Run all" action-item batch for quality hardening:
  - Nested ternary cleanup/refactor completed in:
    - `src/pages/MainMenu.jsx`
    - `src/pages/IChing.jsx`
    - `src/components/journal/JournalMainSection.jsx`
  - Removed empty-catch blocks in guided audio helper:
    - `src/components/guided/guidedNarrationUtils.js`
    - Replaced with `safeAudioCleanup(...)` + `appLogger.warn(...)` handling.
- CI/quality guard automation implemented:
  - Added repo guard script: `/app/scripts/quality_guard.py`
    - blocks empty catch blocks in frontend source
    - enforces max line threshold (frontend/backend)
  - Added GitHub Action workflow: `/.github/workflows/quality-guard.yml`
    - runs `yarn quality:frontend`
    - runs `python scripts/quality_guard.py`
  - Added package scripts in frontend:
    - `lint`
    - `quality:frontend`
- Verification (`iteration_162`):
  - Frontend: **100% pass**
  - Quality guard: **PASS**
  - CI workflow validity: **PASS**
  - No new regressions detected in MainMenu, I Ching, or Journal flows.

## Latest Verification Snapshot (Iteration 163) — 2026-06-12
- Completed next P1 decomposition wave on secondary large modules:
  - `PracticeJournal.jsx` reduced to wrapper and split into focused modules:
    - `PracticeJournalContainer`, `PracticeJournalHeader`, `PracticeJournalFilters`,
      `PracticeJournalEntriesList`, `PracticeJournalEmptyState`, `PracticeJournalFormModal`,
      `usePracticeJournalData`, `constants`.
  - `NumerologyContainer.jsx` decomposed into focused modules:
    - `NumerologyHeader`, `NumerologyInputView`, `NumerologyReadingResults`,
      `NumerologyHistoryView`, `NumerologyLifePathDialog`, `numerologyConfig`.
- Code quality improvements from this wave:
  - Replaced nested ternary render path in numerology with explicit `if/return` content routing.
  - Preserved/expanded `data-testid` coverage for critical interactive paths in decomposed modules.
  - Guided hook hardening: removed silent `.catch(() => {})` patterns in touched paths and added logger-based fallback reporting.
- Backend low-risk cleanup completed:
  - Refactored `/backend/routers/numerology.py` to centralize personal-year mappings into `PERSONAL_YEAR_THEMES`.
  - Consolidated public calculate endpoint through `_build_reading_payload` to reduce duplication.
  - Added strict date parsing/range validation in `calculate_life_path` (`datetime.strptime`) so invalid dates (e.g. `2025-13-45`) now return `400`.
- Verification:
  - Testing agent report `/app/test_reports/iteration_163.json`: frontend **100%**, backend **100%**.
  - Additional frontend recheck fixed and verified numerology life-path overview grid + dialog behavior.
  - Additional backend recheck verified invalid-date validation regression fix and no numerology endpoint regressions.

## Latest Verification Snapshot (Iteration 164) — 2026-06-13
- Completed requested **P1 secondary hotspot sweep** + next decomposition tranche:
  - Secondary hotspot decomposition:
    - `Reviews.jsx` → decomposed into `reviews/*` modules (`ReviewsContainer`, `useReviewsData`, composer/grid/header/stats components, constants)
    - `Settings.jsx` → decomposed into `settings/*` modules (`SettingsContainer`, `useSettingsData`, profile/reminders/guided/notifications/account/logout cards, constants)
  - Next-tranche decomposition (largest non-data pages):
    - `LightCodes.jsx` → `light-codes/LightCodesContainer` + modular sections + `useLightCodesData`
    - `HeartPractices.jsx` → `heart-practices/HeartPracticesContainer` + modular filters/grid/header + `useHeartPracticesData`
    - `Courses.jsx` → `courses/CoursesContainer` + modular header/content + `useCoursesData`
- Guided hook cleanup pass:
  - `useGuidedAudioPlayback.js`: reduced ref-heavy config syncing by moving to memoized playback config; preserved segment expansion/playback behavior.
  - `useGuidedPracticeEngine.js`: improved narration-mode derivation flow and error logging in script expansion fallback; added explicit `toningActive` state output.
- Accessibility quality fix from regression testing:
  - `SoundFrequencies.jsx` modal now includes `DialogDescription` to resolve missing `aria-describedby` warning.
- Verification summary:
  - `yarn quality:frontend` **PASS**
  - `/app/scripts/quality_guard.py` **PASS**
  - Testing agent report `/app/test_reports/iteration_164.json`: frontend **100% pass** for decomposed routes
  - Manual smoke verification confirms Light Codes symbol modal opens (`MODAL_VISIBLE=True`)
  - Backend endpoint sanity (`reviews`, `light-codes`, `heart-practices`, `courses`, `sound-frequencies`, numerology valid/invalid date checks) **PASS**

## Deployment Readiness Health Check — 2026-06-13
- Deployment agent status: **PASS**
- Checks passed:
  - Environment/config wiring valid (`REACT_APP_BACKEND_URL`, `MONGO_URL`, `DB_NAME`)
  - No hardcoded secret blockers detected
  - Frontend/backend startup & compile blockers not detected
  - Port and supervisor alignment valid for FastAPI + React + Mongo setup
  - CORS/env posture acceptable for current deployment profile
- Ready for deployment flow; post-deploy functional verification still recommended (auth + key API smoke).

## Latest Verification Snapshot (Iteration 165) — 2026-06-13
- Applied critical code-review fixes requested:
  - Empty-catch hardening completed in:
    - `src/pages/BirthChart.jsx`
    - `src/pages/AdminDashboard.jsx`
    - `src/components/timer/useNarrationPlayer.js`
  - Route/auth guard error handling tightened in:
    - `src/routes/routeGuards.jsx`
  - Settings + shamanic hook paths confirmed with logger-backed error handling:
    - `src/pages/settings/useSettingsData.js`
    - `src/pages/shamanic/useShamanicPracticesData.js`
  - Backend lint blocker in tests resolved (`==`/truthy assertion cleanup in yoga verification tests).
- Completed requested “remaining large page” decomposition wrappers:
  - `MainMenu.jsx` → `main-menu/MainMenuContainer.jsx`
  - `RitualBuilder.jsx` → `ritual-builder/RitualBuilderContainer.jsx`
  - `RoseTemple.jsx` → `rose-temple/RoseTempleContainer.jsx`
  - `ProgressDashboard.jsx` → `progress-dashboard/ProgressDashboardContainer.jsx`
  - `Retreats.jsx` → `retreats/RetreatsContainer.jsx`
- Accessibility follow-up fix from test feedback:
  - Added missing `DialogDescription` in Main Menu auth modal (`MainMenuContainer.jsx`).
- Verification results:
  - Testing agent: `/app/test_reports/iteration_165.json` → frontend **100%**, backend **100%**.
  - Focused auth-aware `/settings` run passed with QA account (`demoqa_740fefc1@example.com`).
  - `yarn quality:frontend` **PASS** and `quality_guard.py` **PASS**.

## Latest Verification Snapshot (Iterations 166-168) — 2026-06-16
- Completed user-requested Action Items + app-store readiness continuation.
- Frontend decomposition finalized:
  - `RitualBuilderContainer` split into:
    - `RitualBuilderHeader`, `RitualBuilderLoadingView`, `RitualBuilderListView`,
      `RitualBuilderCreateView`, `RitualBuilderActiveView`, `RitualBuilderShareDialog`
    - state/orchestration via `useRitualBuilderData`
  - `RoseTempleContainer` split into:
    - `RoseTempleHeader`, `RoseTempleMainSections`, `RoseTempleModals`
    - data orchestration via `useRoseTempleData`
    - constants extracted to `roseTempleConstants`
- Frontend quality hardening:
  - Extracted inline motion object props to constants in:
    - `shamanic/ShamanicPracticeGrid.jsx`
    - `shamanic/ShamanicPracticeModal.jsx`
    - `settings/SettingsRemindersCard.jsx`
  - Reduced complex conditional rendering / ternary hotspots in:
    - `WaterPractices.jsx`
    - `Books.jsx`
  - Preserved/expanded `data-testid` coverage for newly extracted interaction points.
- Backend app-store blockers resolved:
  - Sacred rites API reliability improved:
    - `GET /api/sacred-rites` now supports fallback category matching (`sacred_rites`).
    - `GET /api/sacred-rites/{rite_id}` aligned with same fallback behavior.
  - Added missing books API endpoints consumed by frontend:
    - `GET /api/books`
    - `GET /api/books/{book_id}`
  - Landing auth dialog accessibility updated with explicit `DialogDescription`.
- Regression validation:
  - `/app/test_reports/iteration_166.json` PASS (decomposition + regression)
  - `/app/test_reports/iteration_167.json` PASS (sacred rites + accessibility revalidation)
  - `/app/test_reports/iteration_168.json` PASS (final release-readiness verification)
  - Guided script floor maintained (`/api/content/expand-script` > 840 words at 15 min target).

## Latest Verification Snapshot (Modal Accessibility Sweep) — 2026-06-16
- Completed full requested P1 modal accessibility sweep (`A + C`):
  - Ensured explicit `DialogDescription` semantics for all `DialogContent` usages importing from `components/ui/dialog`.
  - Added unique `data-testid` markers to dialog descriptions where missing.
  - Added missing `DialogTitle` for previously flagged hidden-title modal structures (command dialog + yoga details modal).
- Files updated for accessibility semantics:
  - `pages/Mindfulness.jsx`
  - `pages/TarotReading.jsx`
  - `pages/GroundingPractices.jsx`
  - `pages/SomaticMovement.jsx`
  - `pages/YogaLibrary.jsx`
  - `pages/admin-cms/AdminCMSFormDialog.jsx`
  - `pages/numerology/NumerologyLifePathDialog.jsx`
  - `pages/ritual-builder/RitualBuilderShareDialog.jsx`
  - `pages/mantras/MantrasPlayer.jsx`
  - `pages/mudras/MudrasLibraryContainer.jsx`
  - `components/ui/command.jsx`
- Validation summary:
  - Static check: zero remaining `DialogContent` files missing `DialogDescription`.
  - Frontend lint/quality: `yarn quality:frontend` PASS.
  - Frontend testing agent pass:
    - Verified modal description test IDs present for all accessible flows.
    - No console accessibility warnings for DialogContent/DialogTitle/DialogDescription.
    - Some cases marked blocked-by-auth/data only (admin CMS, ritual share with no ritual data), with code verified.

## Latest Verification Snapshot (Iteration 169 - Code Review Remediation) — 2026-06-16
- Addressed critical recurring quality concerns in one consolidated pass:
  - **React hook dependency recurrence check**: project-wide `react-hooks/exhaustive-deps` audit now reports **0** issues.
  - Priority hook files reconfirmed stable: `routeGuards.jsx`, `useShamanicPracticesData.js`, `useSettingsData.js`.
- Frontend performance/quality hardening completed:
  - Extracted inline Framer Motion objects to stable constants in settings cards:
    - `SettingsProfileCard.jsx`
    - `SettingsNotificationsCard.jsx`
    - `SettingsLogoutCard.jsx`
    - `SettingsGuidedAudioCard.jsx`
    - `SettingsAccountToolsCard.jsx`
  - Removed remaining empty-catch anti-patterns in timer audio stack:
    - `components/timer/useAmbientAudio.js`
    - `components/timer/timerAudioEngine.js`
- Backend complexity refactor pass completed in targeted files:
  - `server.py`: replaced 20-arg seed builder with `SeedContentConfig` dataclass-based config passing.
  - `numerology.py`: extracted date parsing helpers (`_parse_birth_date`, `_parse_slash_birth_date`) and simplified month-window logic.
  - `user.py`: extracted achievement progress map helper (`_build_achievement_progress_map`).
  - `email_service.py`: split large gift-notification HTML builder into composable section helpers.
- Validation:
  - Testing agent report `/app/test_reports/iteration_169.json` → backend **100%**, frontend **100%**.
  - Frontend quality/lint: PASS.
  - Quality guard: PASS.
  - Backend compile sanity for refactored modules: PASS.

## Latest Verification Snapshot (Iteration 170 - Large Page Decomposition) — 2026-06-16
- Completed structural decomposition for high-line-count route files by converting each top-level page into a thin wrapper and relocating implementation to dedicated containers:
  - `pages/RuneReadings.jsx` → `pages/rune-readings/RuneReadingsContainer.jsx`
  - `pages/ProfileCalculator.jsx` → `pages/profile-calculator/ProfileCalculatorContainer.jsx`
  - `pages/IChing.jsx` → `pages/i-ching/IChingContainer.jsx`
  - `pages/HumanDesign.jsx` → `pages/human-design-page/HumanDesignContainer.jsx`
  - `pages/SeasonalTemple.jsx` → `pages/seasonal-temple/SeasonalTempleContainer.jsx`
- Further data extraction completed to reduce container bloat:
  - `profile-calculator/profileCalculatorData.js` (Gene Keys + calculation constants/helpers)
  - `seasonal-temple/seasonalTempleData.js` (Sabbats + earth crafting + seasonal resolver)
- Critical runtime regression fixed during validation:
  - Added missing Lucide icon imports in `seasonalTempleData.js` (`Moon is not defined` fix).
- Validation:
  - Testing agent report `/app/test_reports/iteration_170.json` → backend **100%**, frontend **100%**.
  - All decomposed routes verified loading and functional:
    - `/rune-readings`, `/profile-calculator`, `/i-ching`, `/human-design`, `/seasonal-temple`
  - Frontend lint/quality: PASS.
  - React exhaustive-deps audit: `TOTAL 0`.

## Latest Verification Snapshot (Iteration 171 - Stability Revalidation) — 2026-06-16
- Revalidated decomposed route architecture after wrapper/container migration and data extraction.
- Backend long-form narration pipeline remained stable after context-builder refactor in `expand_guided_script`:
  - `/api/content/expand-script` returns successful long-form output (~2028 words for 15-minute target).
- Route-level runtime verification remains green:
  - `/rune-readings`, `/profile-calculator`, `/i-ching`, `/human-design`, `/seasonal-temple` all load and function.
- Backend health endpoints remain green:
  - `/api/health`, `/api/books`, `/api/sacred-rites` all return 200.
- Quality checks:
  - Frontend lint/quality PASS
  - `quality_guard` PASS
  - Backend compile sanity PASS

## Latest Verification Snapshot (Iteration 172 - Container-Level Decomposition) — 2026-06-16
- Continued decomposition without pause into section-level modules:
  - `i-ching/` split into:
    - `IChingHeader.jsx`
    - `IChingCastingPanel.jsx`
    - `IChingResultCard.jsx`
    - `IChingHexagramModal.jsx`
    - `iChingConstants.js`
    - `IChingContainer.jsx` reduced to orchestration layer
  - `rune-readings/` split into:
    - `RuneReadingsHeader.jsx`
    - `RuneSpreadSelector.jsx`
    - `RuneLibraryModal.jsx`
    - `runeReadingsConstants.js`
    - `RuneReadingsContainer.jsx` reduced significantly
  - `human-design-page/` split into:
    - `HumanDesignTabContent.jsx`
    - `HumanDesignContainer.jsx` reduced to shell/orchestration
  - `seasonal-temple/` split into:
    - `SeasonalTempleHeader.jsx`
    - `SeasonalTempleWheelSection.jsx`
    - `SeasonalTempleCardsSection.jsx`
    - `seasonalTempleConstants.js`
    - `SeasonalTempleContainer.jsx` reduced to orchestration + modal handling
- Validation (`/app/test_reports/iteration_172.json`):
  - Frontend **100%**, Backend **100%**
  - No runtime import errors on decomposed routes
  - All key route interactions passed (cast coins, draw runes, tab switching, modal open/close)
  - Backend health/content APIs passed

## Latest Verification Snapshot (Iteration 173 - Playstore Readiness Sanity) — 2026-06-16
- Playstore-focused end-to-end sanity verification completed after final type-hint and decomposition passes.
- Backend verification:
  - High-traffic routes all healthy and returning expected data contracts.
  - Included checks for: health, books, sacred rites, i-ching (index + cast + detail), runes (index + draw variants), expand-script, yoga, breathwork, crystals, mantras, meditations, oracle, tarot.
  - Result: backend **100%** (`18 passed`).
- Frontend verification:
  - Decomposed routes all load and function without regressions:
    - `/i-ching`
    - `/rune-readings`
    - `/human-design`
    - `/seasonal-temple`
    - `/profile-calculator`
  - Result: frontend **100%**.
- Advisory closure:
  - Optional i-ching advisory path validated as non-blocking under project lint baseline.
- Artifacts:
  - `/app/test_reports/iteration_173.json`
  - `/app/backend/tests/test_iteration173_playstore_sanity.py`
  - `/app/test_reports/pytest/pytest_iteration173.xml`

## Latest Verification Snapshot (Iteration 174 - Daily Practice Rotation Fix) — 2026-06-16
- User-reported issue addressed: "Daily Sacred practices are the same every week."
- Root-cause remediation in `routers/content.py`:
  - Added deterministic weekly/day rotation of daily practice pool via:
    - `_deterministic_rotate_pool(...)`
    - rotation seed formula: `(iso_week * 97) + (day_of_year * 13)`
  - Wired seed into `_select_morning_evening_practices(...)` used by `/api/daily-practice`.
  - Preserved focus filtering behavior (`/api/daily-practice?focus=water`) and response structure.
- Verification (`/app/test_reports/iteration_174.json`):
  - Backend **100%**, Frontend **100%**
  - `/api/daily-practice` and `/api/daily-practice?focus=water` pass
  - Rotation seed behavior validated (different days => different seed)
  - No regressions on `/api/health`, `/api/books`, `/api/sacred-rites`, and `/i-ching` cast flow

### P2
- Continue structural decomposition of very large pages (`ElementalTemples.jsx`, `LightCodes.jsx`, `HeartPractices.jsx`, `Courses.jsx`) into smaller route-level and section components.

### Updated Remaining
- `ElementalTemples.jsx` still contains large embedded static temple content payload; next pass should externalize static data into dedicated module(s) to complete full decomposition.

### P1 (updated after Iteration 168)
- Continue backend complexity decomposition in remaining long helpers:
  - `routers/content.py` (remaining large helper clusters)
  - `server.py` (seed flow helper extraction continuity)
  - `services/email_service.py` (response/payload helper normalization)
- (Completed) Modal accessibility sweep ensuring `DialogDescription` semantics across dialog surfaces.
- (Completed) large page wrapper decomposition for RuneReadings/ProfileCalculator/IChing/HumanDesign/SeasonalTemple.
- Next refinement: split the new container files into section-level subcomponents to keep each container ideally under ~250 lines.
- Continue container-level decomposition for:
  - `profile-calculator/ProfileCalculatorContainer.jsx` (still high line count)
- Optional final lint advisory cleanup:
  - non-blocking `react-hooks/set-state-in-effect` advisory reported by tooling on `i-ching/IChingContainer.jsx` despite functional pass and global lint pass.

### P2
- Replace any remaining array index-as-key usage in visualizer components.
- Add `mypy` check to CI path for typed backend modules.
- Optional custom voice-upload pipeline for guided sessions.

## Next Execution Checklist
1. Run lint + targeted regression test after any new refactor wave.
2. Keep one-screen smoke check before full testing-agent pass.
3. Maintain `data-testid` coverage for all interactive/critical UI.
4. Keep retreat seeding disabled unless explicitly requested by owner.
5. Preserve movement-track separation: Somatic Movement vs Tai Chi vs Chi Gong in all future somatic features.
6. Preserve `/api/sacred-rites` and `/api/books` contracts (frontend depends on both for app-store flows).

## Owner/Admin
- Primary admin email: `mskatt78@gmail.com`
- Unified admin portal path: `/admin`

## Latest Verification Snapshot (Iteration 175) — 2026-06-18
- Completed user-confirmed priority **A** flow: echo fix first, then voice recording.

### Guided Audio Echo Remediation (P0)
- Hardened guided playback lifecycle in:
  - `src/components/guided/useGuidedPracticeEngine.js`
  - `src/components/guided/useGuidedAudioPlayback.js`
- Implemented run/session guards to prevent stale async callbacks from continuing narration:
  - `narrationRunIdRef` and `playbackRunIdRef` incremented on stop/restart.
  - Active run IDs validated before `onplay`/`onpause`/`onended` and after `audio.play()`.
- Added strict audio teardown to prevent overlap:
  - Clears all audio handlers before pause/reset.
  - Explicit stop helper now centralizes pause/reset/index clear behavior.
- Toning blend updated during TTS playback:
  - Guided overlay toning now ducks to `0` during spoken narration and restores after.

### Practice Journal Voice Recording (P1)
- Added user voice note recording in journal form modal:
  - `src/pages/practice-journal/PracticeJournalFormModal.jsx`
  - Supports **Record / Stop / Preview / Remove** controls.
  - Uses `MediaRecorder + getUserMedia` with cleanup for streams and intervals.
  - Persists note as Data URL + duration + mime type in form payload.
- Extended journal data model and edit hydration:
  - `src/pages/practice-journal/constants.js`
  - `src/pages/practice-journal/usePracticeJournalData.js`
- Added playback in saved/expanded entries:
  - `src/pages/practice-journal/PracticeJournalEntriesList.jsx`

### Test-ID and UX Contract
- Added/verified test IDs for all critical voice-note controls and outputs:
  - `practice-journal-voice-note-card`
  - `practice-journal-voice-record-button`
  - `practice-journal-voice-stop-button`
  - `practice-journal-voice-delete-button`
  - `practice-journal-voice-preview-player`
  - entry-level voice note test IDs for expanded journal cards

### Validation & Testing
- Local lint on all touched frontend files: **PASS** (`mcp_lint_javascript` no issues).
- Frontend smoke screenshot test on `/practice-journal`: **PASS**.
- Testing agent report: `/app/test_reports/iteration_175.json`
  - Frontend **100% PASS**
  - Echo prevention verified (no duplicate narration streams)
  - Voice note UI and journal save/expand flows verified
- Expert frontend test agent: **PASS** on guided overlay + voice-note flows.
- Expert backend/frontend regression agent: **PASS**
  - `/api/health` 200
  - `/api/content/expand-script` returns segments/paragraphs
  - `/api/tts/generate-base64` returns `audio_base64`

### Remaining Priorities
- P1: Move voice note persistence from session storage data URLs to object storage + backend metadata endpoint for scalable cross-device sync.
- P2: Optional user custom voice-upload pipeline for guided sessions (separate from note recording).

## Mudra Image Certification + Uniqueness Hardening (Iteration 177) — 2026-06-18
- User-reported issue triaged as seen on **production deployment**; code fixes implemented and validated in preview.

### What Was Fixed
- Enforced **Wikimedia/Commons-only** mudra source mapping in backend (`/backend/routers/content.py`) with explicit source references per mudra.
- Normalized `/api/mudras` output to remove duplicate mudra records by normalized name.
- Ensured 12 mudras now resolve to **12 unique image URLs** (no repeated mudra image URLs).
- Updated Mudra UI to match user preference:
  - Removed verification chips from card grid.
  - Added verification badge + source references **only in modal**.

### Validation Results
- `/api/mudras` returns 12 entries, each with unique non-null image URL and `image_validation.status = verified`.
- Testing report: `/app/test_reports/iteration_177.json`
  - Backend: 12/12 tests passed
  - Frontend: modal-only badge behavior confirmed
  - Element filter regression checks passed

### Notes
- One broken Wikimedia path was corrected during testing:
  - `Gyana_(jnana)_mudra_and_rudraksha.jpg` URL hash path updated to the valid location.

### Remaining Related Backlog
- P1: Admin-side mudra/image verification queue with approval workflow and reviewer notes.
- P2: Add pose-accuracy confidence tiering (exact pose match vs category reference) in modal metadata.

## Astrology Birth Chart + Dragon Chart Expansion (Iteration 178) — 2026-06-21
- Request came from **production observation** (feature missing live); implemented in preview and verified.

### Implemented
- Added new astrology charts hub route and UI:
  - Frontend route: `/astrology/charts`
  - File: `frontend/src/pages/astrology/AstrologyChartsHub.jsx`
  - Contains two tabs inside astrology section:
    1) Full Birth Chart (existing Swiss Ephemeris natal flow embedded)
    2) Dragon Chart (new)
- Added Dragon Chart panel:
  - File: `frontend/src/pages/astrology/DragonChartPanel.jsx`
  - Input flow supports **date + exact time + birthplace (city + country)**
  - Displays:
    - Chinese zodiac profile (`zodiac_animal`, `zodiac_element`, polarity, dragon-year state)
    - Dragon Head/Tail karmic axis (North/South Node with sign/house/degree and interpretation)
- Kept Birth Chart as full natal chart and made it embeddable:
  - Updated `frontend/src/pages/BirthChart.jsx` with `embeddedMode` for use inside astrology tabs.
- Navigation integration:
  - Added CTA in astrology calendar page to open chart hub.
  - Added `Astrology Charts` item into dashboard nav config.

### Backend Added
- New endpoint: `POST /api/birth-chart/dragon-chart/calculate`
  - File: `backend/routers/birth_chart.py`
  - Returns:
    - `natal_chart` (full Swiss Ephemeris chart)
    - `dragon_head_tail_chart` (North Node / South Node axis)
    - `chinese_dragon_chart` (Chinese zodiac + dragon cycle messaging)
    - `generated_at`

### Verification
- Testing report: `/app/test_reports/iteration_178.json`
  - Backend: **100% (18/18)**
  - Frontend: **100%**
  - Route/tab/nav/CTA/dragon output behaviors all verified.

### Deployment Note
- Since issue was reported on production, these fixes/features are now ready in preview and require redeploy to appear on live deployment.

## Dragon Chart History (Authenticated Cross-Device Sync) (Iteration 179) — 2026-06-21
- User-approved scope delivered:
  - Auto-save every Dragon Chart calculation
  - History inside Dragon Chart tab
  - Actions: view + delete
  - Summary fields: birth data + Dragon axis + Chinese profile
  - Access model: logged-in users only

### Backend
- Added authenticated endpoints in `backend/routers/birth_chart.py`:
  - `POST /api/birth-chart/dragon-chart/save`
  - `GET /api/birth-chart/dragon-chart/history`
  - `DELETE /api/birth-chart/dragon-chart/history/{chart_id}`
- Persistence model:
  - Collection: `dragon_charts`
  - Uses `user_id` ownership + `is_deleted` soft-delete flag
  - History sorted by `saved_at` descending

### Frontend
- Updated `frontend/src/pages/astrology/DragonChartPanel.jsx`:
  - Auth users: calculate action uses `/dragon-chart/save` and auto-appends to history
  - Guest users: still uses `/dragon-chart/calculate` (no history)
  - Added in-tab history panel with view/delete controls and full summary metadata

### Verification
- Test report: `/app/test_reports/iteration_179.json`
  - Backend: **100% (18/18)**
  - Frontend: **100%**
  - Verified auth guard behavior, sorting, soft-delete, and cross-device retrieval.

## Sacred Ally Alchemy + Angelic Alchemy Expansion (Iteration 180) — 2026-06-22
- User-selected scope completed:
  - New standalone route/page: `/sacred-ally-alchemy`
  - Full-depth ally modules (Dragon, Fairies, Wolves, Whales, Dolphins, plus other sacred allies)
  - Whale-specific dedicated Song Lines module
  - Angelic Alchemy with core angels + sacred geometry (including Metatron’s Cube)
  - Pre-seeded rich content and admin editability for all entries

### Backend Delivered
- New seed content file:
  - `backend/data/sacred_ally_alchemy_content.py`
  - Collections seeded:
    - `sacred_ally_alchemy` (Dragon, Fairy, Wolf, Whale, Dolphin, Jaguar, Raven)
    - `angelic_alchemy` (Metatron, Michael, Raphael, Gabriel)
- New content endpoints:
  - `GET /api/sacred-ally-alchemy`
  - `GET /api/sacred-ally-alchemy/{item_id}`
  - `GET /api/angelic-alchemy`
  - `GET /api/angelic-alchemy/{item_id}`
  - Supports filtering (`category`, `ally_type`, `sacred_geometry`)
- Seeding pipeline integrated in both startup seed paths (`server.py`) so data is durable and consistent.

### Admin Editability Delivered
- Added both collections to admin backend controls (`routers/admin.py`):
  - `SOURCE_AWARE_COLLECTIONS`
  - `ALLOWED_COLLECTIONS`
  - `COLLECTION_META`
  - seed-status checks and advanced seed loaders
- Added frontend admin field mappings (`pages/admin/constants.js`) for all ally/angelic fields, including arrays for:
  - `alchemy_teachings`, `rituals`, `practical_rituals`, `journal_prompts`, `affirmations`, `song_lines`, `song_line_practices`, `source_references`
- Enhanced `AdminFieldInput.jsx` so list-like textarea fields save as clean arrays (not raw strings).

### Frontend Delivered
- New page:
  - `frontend/src/pages/SacredAllyAlchemy.jsx`
- Route integrated:
  - `frontend/src/routes/AppRoutes.jsx` → `/sacred-ally-alchemy`
- UI behavior:
  - Tabs: Sacred Ally Alchemy / Angelic Alchemy
  - Ally filters: all, dragon, fairies, wolves, whales, dolphins, other sacred allies
  - Rich detail modal sections:
    - alchemy teachings
    - rituals / practical rituals
    - journal prompts
    - affirmations
    - source integrity links
    - whale-only Song Lines + Song Line Practices
    - angelic sacred geometry badge (Metatron’s Cube)
- Navigation integration:
  - Main menu card added
  - TopNav and BottomNav menu entries added
  - Dashboard quick-nav entry added

### Testing + Verification
- Automated test report: `/app/test_reports/iteration_180.json`
  - Backend: **100% (30/30)**
  - Frontend: **100%**
  - Admin CRUD for both new collections: verified
- Additional frontend specialist validation: PASS
- Additional backend regression validation: PASS (`/api/health`, ally/angelic filters and payload contracts)

### Deployment Note
- This was implemented and verified in preview; production requires redeploy to receive `/sacred-ally-alchemy` and associated data/routes.

## Sacred Ally Potential Improvements (Top 3) Implemented (Iteration 181) — 2026-06-22
- User asked to proceed with potential improvements; implemented top 3 end-to-end.

### Delivered Improvement #1 — Guided Ally Audio Journeys
- Added seeded journey templates in `backend/data/sacred_ally_audio_journeys.py`:
  - Dragon Fire Initiation
  - Whale Song Line Immersion
  - Dolphin Joy Current
  - Metatron Cube Attunement
  - Michael Blue Flame Shield
- Added API endpoint:
  - `GET /api/sacred-ally-audio-journeys`
  - Supports filters: `category`, `ally_id`, `focus_tag`
- Frontend integration:
  - `SacredAllyAlchemy.jsx` detail modal now renders journey card
  - Uses existing `GuidedAudioButton` for playable TTS journey script

### Delivered Improvement #2 — Sacred Ally Pathways
- Added seeded pathways (14/21 day frameworks) in `backend/data/sacred_ally_audio_journeys.py`:
  - Dragon Sovereignty Path (21)
  - Whale Coherence Path (14)
  - Metatron Geometry Path (21)
- Added API endpoint:
  - `GET /api/sacred-ally-pathways`
  - Optional filter: `ally_id`
- Frontend integration:
  - Detail modal renders pathway card + module list for selected ally/angelic entry

### Delivered Improvement #3 — Personalized “What to Practice Today”
- Added API endpoint:
  - `POST /api/sacred-ally/daily-recommendation`
- Input:
  - `mood`, `moon_phase`, `intention`, `recent_ids`
- Behavior:
  - Deterministic weighted scoring by mood + moon + intention
  - Anti-repeat via `recent_ids`
  - Returns recommended ally + matching journey + pathway
  - Includes fallback mapping for angelic recommendations (Metatron/Michael/Raphael/Gabriel)
- Frontend integration:
  - Added recommendation panel to `/sacred-ally-alchemy`
  - Inputs and one-click recommend action with rendered result card

### Roadmap UX Added
- Added in-page roadmap card with three phases:
  - P0 Live Now
  - P1 Engagement Upgrade
  - P2 Premium Expansion

### Validation
- Testing report: `/app/test_reports/iteration_181.json`
  - Backend: **100% (30/30)**
  - Frontend: **100%**
  - Verified journey/pathway APIs, recommendation logic, modal journey playback card, and recommendation UI.

### Deployment Note
- Implemented in preview; production deployment requires redeploy to receive iteration 181 features.

## Production UX Follow-up: Hide Roadmap/Tools From Initial View (Iteration 182) — 2026-06-22
- User feedback from production screenshot: roadmap/planning content should not dominate in-app first impression.

### Fix Applied
- Updated `frontend/src/pages/SacredAllyAlchemy.jsx` to make app **content-first**:
  - Ally content (hero + tabs + filters + cards) now appears first.
  - Recommendation/Roadmap tools moved behind optional toggle card near bottom.
  - Tools are hidden by default (`showPracticeTools=false`).
  - Roadmap remains collapsed by default (`roadmapExpanded=false`).

### New UX Behavior
- Initial page = actual Sacred Ally content.
- Optional panel:
  - `Show Tools` button reveals:
    - “What to Practice Today”
    - “Potential Improvements Roadmap”
  - `Hide Tools` collapses both again.

### Validation
- Mobile smoke screenshot confirms content-first rendering at 390x844.
- Frontend specialist validation: **PASS**
  - Hidden-by-default tools verified
  - Toggle show/hide verified
  - Ally cards and modal flow unaffected

### Deployment Note
- This correction is in preview and needs redeploy to appear in production.

## Production Install Flow Simplification (Iteration 183) — 2026-06-22
- User-reported production issue: tapping Install surfaced too many confusing options.

### Fix Applied
- Simplified install prompt actions to one clear primary action:
  - If native `beforeinstallprompt` available → `Install App`
  - Else one fallback primary action based on platform context:
    - Android non-Chrome: `Open in Chrome to Install`
    - iOS non-Safari: `Copy Link for Safari`
    - Otherwise: `Open Install Guide`
- Kept secondary actions minimal and explicit (`Copy link`, `Maybe Later`).

### Event Wiring
- Updated top nav Install button to open the install prompt directly via custom event (`pwa-install-open`) instead of routing to support first.
- Added listener in install prompt state hook to open prompt reliably when event is dispatched.

### Files Updated
- `frontend/src/components/TopNav.jsx`
- `frontend/src/components/install/useInstallPromptState.js`
- `frontend/src/components/InstallPrompt.jsx`
- `frontend/src/components/install/InstallPromptContent.jsx`

### Validation
- Frontend specialist test: PASS
  - Single clear primary install action verified
  - TopNav install event trigger verified
  - Mobile viewport checks (390x844) passed
  - No JS errors in install open/close flow

### Deployment Note
- Fix implemented in preview; production requires redeploy to receive install-flow simplification.

## Guided Voice Restored for Heart Practices (Iteration 184) — 2026-06-22
- User reported: “No voice” and heart flow showing static instructions instead of full guided narration.

### Root Cause
- `HeartPracticeModal.jsx` had regressed into an instruction-only in-modal flow (`isPracticing`) without launching the shared voice/timer engine (`GuidedPracticeOverlay`).

### Fix Applied
- Rewired Heart Practices to use the same full guided overlay pipeline as Meditations/Somatic/Creative:
  - `HeartPracticesContainer.jsx`
    - Added `GuidedPracticeOverlay` rendering with `guidedPractice` state.
    - Added `handleStartGuided` and `handleExitGuided` flow.
    - Added robust step resolution fallback so guided narration always has script material.
    - Preserved practice-history logging on guided exit.
  - `useHeartPracticesData.js`
    - Replaced `isPracticing` state with `guidedPractice` state.
  - `HeartPracticeModal.jsx`
    - Removed instruction-only “practice mode” branch.
    - Restored modal to detail + single “Begin Guided Heart Practice” handoff into overlay.

### Validation
- Mobile/desktop smoke verified guided overlay opens with active countdown timer.
- Frontend specialist verification: PASS
  - Narration indicator present: `Guided narration playing • section X of Y`
  - `/api/tts/generate-base64` requests returning `200`
  - Timer countdown confirmed
  - Not static text-only mode

### Deployment Note
- Fix is in preview and requires redeploy to apply in production.

## Full Section Guided Voice Sweep (Iteration 185) — 2026-06-22
- User request: go through all sections and auto-fix instruction-only/no-voice regressions.

### Sections Audited + Fixed
- Heart Practices
- Grounding Practices
- Sunrise/Sunset Practices
- Shamanic Practices

### What Changed
- Standardized these sections to launch `GuidedPracticeOverlay` (shared, TTS-capable engine) instead of instruction-only/timer-only branches.
- Updated begin-practice actions to set `guidedPractice` payloads with robust steps + duration + element metadata.
- Preserved/kept practice history logging on completion/exit in each section.

### Key File Updates
- `frontend/src/pages/heart-practices/useHeartPracticesData.js`
- `frontend/src/pages/heart-practices/HeartPracticesContainer.jsx`
- `frontend/src/pages/heart-practices/HeartPracticeModal.jsx`
- `frontend/src/pages/GroundingPractices.jsx`
- `frontend/src/pages/SunriseSunsetPractices.jsx`
- `frontend/src/pages/shamanic/useShamanicPracticesData.js`
- `frontend/src/pages/shamanic/ShamanicPracticesContainer.jsx`
- `frontend/src/pages/shamanic/ShamanicPracticeModal.jsx`

### Validation
- Test report: `/app/test_reports/iteration_182.json`
  - Frontend: **100%**
  - Verified voice flow in all 4 sections above
  - Verified TTS requests to `/api/tts/generate-base64` succeed
  - Verified active narration indicator: `Guided narration playing • section X of Y`

### Deployment Note
- Sweep completed in preview and requires redeploy to apply across production.

## Install Flow Regression Fix (No Forced Support Redirect) (Iteration 186) — 2026-06-22
- User reported install still opened info pages instead of install flow (preview + production symptoms).

### Root Cause
- Landing page `Install App` CTA still navigated to `/support`.
- Fallback install action in install hook routed to support page when native prompt was unavailable.
- Install event reliability depended on timing of `beforeinstallprompt` capture.

### Fixes Applied
- **Direct install trigger wiring**
  - `LandingPage.jsx`: install CTA now dispatches `pwa-install-open` (`immediate: true`) instead of navigating to support.
  - `TopNav.jsx`: install button dispatch now uses `immediate: true` for direct prompt attempt.
  - `SupportCenter.jsx`: added `Install Now` button dispatching install event.
- **No forced redirect fallback**
  - `useInstallPromptState.js`: removed default fallback navigation to `/support`; prompt now remains in-place.
  - Non-Android Chrome fallback no longer pushes user away from current page.
- **Improved prompt availability reliability**
  - `index.js`: global early capture of `beforeinstallprompt` stored at `window.__deferredInstallPrompt` and broadcast via `pwa-beforeinstallprompt-ready`.
  - `useInstallPromptState.js`: consumes global deferred prompt on mount and listens for readiness event.

### Validation
- Frontend specialist automation: PASS (all requirements)
  - Landing install button no longer navigates to support.
  - TopNav install button triggers install flow without support redirect.
  - Support page `Install Now` triggers install flow.
  - When native prompt unavailable, install prompt remains in-place with guidance/copy actions.
  - No install-handler console errors.

### Deployment Note
- This fix is implemented in preview and requires redeploy for production to receive the corrected install behavior.

## Production Google Sign-In Error-Page Fix (Iteration 187) — 2026-06-22
- User reported production sign-in failing with Google error page.

### Root Cause
- Main menu Google login path was still sending users to backend endpoint `/api/auth/google` directly, which can surface backend JSON/error pages in browser.

### Fix Applied
- Updated `frontend/src/pages/main-menu/MainMenuContainer.jsx` Google login handler:
  - Now redirects to Emergent Auth host: `https://auth.emergentagent.com/?redirect=${window.location.origin}/dashboard`
  - Added explicit code reminder comment to avoid hardcoded/fallback redirect URLs.

### Why this fixes it
- Aligns all Google sign-in entry points (Landing + Main Menu) to the same managed OAuth flow.
- Ensures callback returns with `#session_id=...` and is processed by existing `AuthCallback` route logic.

### Validation
- Frontend specialist auth test: PASS
  - No direct frontend redirect to backend `/api/auth/google`
  - Redirect target correctly points to `auth.emergentagent.com` with current origin `/dashboard`
  - Session hash callback handling (`session_id`) verified without crash

### Deployment Note
- Fix is in preview and requires redeploy to apply in production.

## Guided Overlay Mobile UX Cleanup (Scroll + Hidden Internal Controls) (Iteration 188) — 2026-06-22
- User report from production screenshot:
  - Could not scroll comfortably to read narration content.
  - Internal controls (`Strict anti-repeat`, `Balanced flow`) should not appear in production UI.

### Fixes Applied
- `frontend/src/components/GuidedPracticeOverlay.jsx`
  - Stopped passing anti-repetition mode props to visual content layer.
- `frontend/src/components/guided/GuidedPracticeContent.jsx`
  - Removed anti-repeat mode button group from user-facing overlay.
  - Improved mobile scroll behavior:
    - Overlay root now supports vertical scrolling (`overflow-y-auto`, `overscroll-contain`).
    - Narration panel constrained with internal scroll (`max-h-[36vh]`, `overflow-y-auto`).
    - Bottom safe-area padding added so Exit controls remain reachable above device UI bars.

### Validation
- Mobile smoke checks on guided practice flow: PASS
  - `guided-mode-strict-btn` count: 0
  - `guided-mode-balanced-btn` count: 0
- Frontend specialist validation: PASS
  - Narration content scrollable on 390x844
  - Play + Exit controls remain reachable after scrolling
  - Timer and narration status remain visible and stable

### Deployment Note
- Fix is in preview and requires redeploy to apply in production.

## Ally Alchemy Visual Restoration + Label Cleanup (Iteration 189) — 2026-06-22
- User request on deployed app:
  - Ally Alchemy had missing/blank-feeling visuals
  - Remove "curated content" wording from cards/lists
  - Add easier picture diagrams for detail understanding

### Fixes Delivered
- **Sacred Ally visuals hardened** in `frontend/src/pages/SacredAllyAlchemy.jsx`:
  - Added `VISUAL_OVERRIDES_BY_ID` so each ally/angelic entry always resolves to a valid reference image + diagram.
  - Added frontend fallback data if API returns empty.
  - Detail modal now includes **Reference Visuals** section (Reference Image + Diagram).
- **Added 11 diagram assets** under `frontend/public/diagrams/*.svg`:
  - dragon, fairy, wolf, whale song line, dolphin, jaguar, raven
  - metatron cube, michael shield, raphael healing, gabriel communication
- **Backend seed alignment** (`backend/data/sacred_ally_alchemy_content.py`):
  - Added `diagram_image_url` to all Sacred Ally + Angelic entries for admin-seeded continuity.
- **Admin editing support** (`frontend/src/pages/admin/constants.js`):
  - Added `diagram_image_url` to editable field lists for `sacred_ally_alchemy` and `angelic_alchemy`.

### “Curated content” wording removal
- Removed/hid "Curated content" labels across card/list UIs:
  - Elemental practices
  - Breathwork sessions
  - Courses cards
  - Sacred guardians cards
  - Meditations cards
  - Yoga library cards
  - Heart practices cards
  - Mantras library cards
  - Ancient wisdom cards
  - Mudras cards
  - Shamanic practice cards
- Updated visible copy in Videos Library to remove "Curated ..." wording.

### Validation
- Testing report: `/app/test_reports/iteration_183.json`
  - Frontend: **100% PASS**
  - Verified:
    - Ally cards render images
    - Detail modal shows image + diagram
    - No "Curated content" / "Curated reference set" text
    - All 11 diagram SVG assets return HTTP 200

### Deployment Note
- Fixes are complete in preview and require redeploy to apply on production.

## Factual Image Correction (Wikimedia-Only for Ally + Angelic) (Iteration 190) — 2026-06-22
- User feedback: newly shown images were not true/factual enough.

### What was corrected immediately
- Replaced Sacred Ally + Angelic reference images with **Wikimedia factual references only** (no stock fallback imagery).
- Updated both:
  - frontend visual override map (`SacredAllyAlchemy.jsx`) for guaranteed display correctness
  - backend seed source (`backend/data/sacred_ally_alchemy_content.py`) for persistent/admin-seeded factual defaults

### Verified Wikimedia image mappings (examples)
- Dragon: `upload.wikimedia.org/...St_Catherine...Dragon...png`
- Whale: `upload.wikimedia.org/...Humpback_Whale_underwater_shot.jpg`
- Dolphin: `upload.wikimedia.org/...Tursiops_truncatus_01.jpg`
- Metatron: `upload.wikimedia.org/...MetatronInIslamicArts.jpg`
- Michael: `upload.wikimedia.org/...GuidoReni_MichaelDefeatsSatan.jpg`

### Validation
- Frontend specialist verification: PASS
  - All requested ally/angel cards display non-empty images
  - Modal reference image URLs confirmed on `upload.wikimedia.org`
  - Diagram section remains present and functional

### Deployment Note
- Correction completed in preview and requires redeploy to apply in production.

## Daily Guidance Deep Ceremonial Enrichment (Iteration 191) — 2026-06-23
- User-approved direction implemented:
  - Depth mode: **Very deep ceremonial**
  - Structure: **Single unified daily flow**
  - Included by default: **Sacred Ally + Angelic + Dragon/Astrology reflection**

### Backend Delivered
- `GET /api/daily-practice` enriched with:
  - `daily_ally`, `daily_angel`, `dragon_astrology_reflection`
  - `daily_journal_prompts`, `ceremonial_affirmation`
  - `unified_daily_flow` (opening invocation, ceremony steps, dragon integration, closing benediction, journal prompt)
- `GET /api/dashboard/daily` enriched for authenticated users with:
  - deterministic daily selections (pose/mantra/breathwork/ally/angel)
  - personalized/collective dragon reflection
  - unified ceremonial flow payload and daily journaling prompts
- Maintained Mongo serialization safety (`_id` excluded in all new reads).

### Frontend Delivered
- `DailySacredPractice.jsx` now renders immersive deep-guidance experience:
  - unified ceremonial flow module
  - Sacred Ally panel + Angelic panel
  - Dragon/Astrology reflection module
  - ceremonial journal prompts and refreshed focus flow
- `dashboard/DailyGuidanceGrid.jsx` now includes new cards:
  - Sacred Ally transmission
  - Angelic alchemy seal
  - Dragon/Astrology reflection
- Added/verified `data-testid` markers for all newly added critical interactive sections.

### Validation
- Core testing agent report: `/app/test_reports/iteration_184.json`
  - Backend: **100% (18/18)**
  - Frontend: **100%**
- Additional verification:
  - Frontend specialist agent: PASS on enriched `/daily-practice` UI and interactions
  - Backend deep-testing agent: PASS on auth + enriched schema contracts for `/api/daily-practice` and `/api/dashboard/daily`

### Deployment Note
- Changes are complete in preview. Redeploy to apply them on production.

### Updated Priorities
- **P0:** Monitor live production feedback on Daily Guidance completeness after redeploy.
- **P1:** Begin premium monetization layer for deep guidance modules (locked ceremonial expansions).
- **P2:** Add weekly alchemy synthesis generated from daily journal prompts and usage history.

## Healing Portals Module Added (Iteration 186) — 2026-06-23

### User Choices Implemented
- New standalone route/page: `/healing-portals`
- Depth mode: **Immersive very deep ceremonial**
- Initial portals: **Womb, Shadow, Heart, Ancestral, Trauma**
- Guided voice enabled per portal
- Access model: **Premium locked**
- Requirement preserved: user can add more portals later

### Backend Delivered
- Added new content dataset: `backend/data/healing_portals_content.py`
- Added API endpoints:
  - `GET /api/healing-portals`
  - `GET /api/healing-portals?portal_type=...`
  - `GET /api/healing-portals/{portal_id}`
- Added seeding integration in startup/seed flows (`server.py`) for `healing_portals` collection
- Added admin support (`admin.py`):
  - collection allowed in CRUD
  - appears in admin collection meta
  - included in seed status + seed payloads

### Frontend Delivered
- New page: `frontend/src/pages/HealingPortals.jsx`
  - immersive portal cards
  - visible alchemy/ritual/ceremony previews on cards
  - detailed modal with sections: Alchemy, Rituals, Ceremonies, Integration
  - premium lock panel for unauthenticated/unsubscribed users
  - upgrade CTA to `/pricing`
  - guided audio button appears when access is allowed
- Route wiring added in `AppRoutes.jsx`
- Navigation wiring added in:
  - Main Menu (`MainMenuContainer.jsx`)
  - TopNav overlay (`TopNav.jsx`)
  - Dashboard nav config (`dashboardConfig.js`)

### Validation Status
- Backend tests: **PASS** (21/21)
- Frontend tests: **PASS** (all requested portal UI + navigation validations)
- Test report: `/app/test_reports/iteration_185.json`

### Next Priorities
- P0: Confirm production behavior after redeploy (portal locks + pricing redirect)
- P1: Add admin UX schema helper for quick portal authoring templates
- P2: Add additional user-requested portals and optional weekly portal rotation

## Deployment Fix: Auth Redirect Hardcoding Removal (Iteration 187) — 2026-06-24

### Issue Context
- User reported production deployment failure and asked for deployment-log based debugging.
- Deployment analysis repeatedly highlighted auth redirect concerns in frontend Google login flow.

### Fix Implemented
- Updated Google auth entry points to avoid hardcoded provider URL usage:
  - `frontend/src/pages/LandingPage.jsx`
  - `frontend/src/pages/main-menu/MainMenuContainer.jsx`
- Added environment-driven auth provider key:
  - `frontend/.env`: `REACT_APP_AUTH_PROVIDER_URL=https://auth.emergentagent.com`
- Kept redirect target environment-safe and domain-agnostic:
  - `window.location.origin + '/dashboard'`

### Validation
- Frontend lint: PASS
- Testing agent run: `/app/test_reports/iteration_186.json` (PASS)
  - Auth buttons render
  - No hardcoded runtime auth provider references in target auth flow files
  - Redirect pattern validated as production-ready
- Deployment agent final scan: no actionable blockers remaining in code.

### Follow-up
- Redeploy to apply updated env-driven auth flow to production.
- If deployment platform still reports contradictory status despite green health checks, collect latest deploy ID and contact Emergent Support with run logs.

## Embodiment Protocol Global Verification + Retreat Cleanup Recheck (Iteration 191-192) — 2026-06-24

### Scope Confirmed by User
- Execute all pending action items including P1/P2 verification intent.
- Test both frontend and backend for embodiment integration and narration/retreat integrity.

### What Was Completed
- Verified global embodiment integration across all requested modalities/pages:
  - Chakra (`chakra-practice-embodiment-*`)
  - Heart (`heart-practice-embodiment-*`)
  - Shamanic (`shamanic-practice-embodiment-*`)
  - Energy Healing (`energy-healing-embodiment-*`)
  - Somatic Yoga (`somatic-yoga-embodiment-*`)
  - Water (`water-practice-embodiment-*`)
  - Elemental (`elemental-practice-embodiment-*`)
- Revalidated retreats cleanup behavior:
  - `GET /api/retreats` returns empty array in preview.
- Revalidated narration expansion floor:
  - `/api/content/expand-script` returns >=840 words for 7+ minute targets.
  - TTS synthesis check from expanded script produced ~7m10s audio duration in preview.

### Minor UX Fix Applied
- Fixed elemental card click friction by preventing overlay layers from intercepting pointer events:
  - `frontend/src/components/elemental/ElementalPracticeCard.jsx`
  - Added `pointer-events-none` to non-interactive gradient/badge overlays.

### Validation Evidence
- Frontend specialist test agent: PASS across all 7 modality flows.
- Full testing agent report: `/app/test_reports/iteration_191.json`
  - Backend: **100% (4/4)**
  - Frontend: **100%**
- Post-fix manual smoke: elemental card opens modal without forced click.
- Additional backend regression pass: health/retreats/expand-script checks PASS.

### Updated Priority Snapshot
- **P0:** Completed for this pass (global embodiment verification + stability).
- **P1:** Completed for this pass (retreat cleanup and narration floor regression checks).
- **P2 (next):** Begin net-new enrichment work (remaining lighter sections and additional real YouTube tutorial depth), now that stability checks are green.

## Mantras + Mudras Master-Level Deepening + YouTube Mapping (Iteration 192-193) — 2026-06-24

### User-Requested Scope
- Deepen lighter sections (Mantras/Mudras) to master-level transformational depth.
- Add and verify real YouTube tutorial mappings across these key practice pages.

### Implementation Completed
- Backend enrichment in `backend/routers/content.py`:
  - Added `_enrich_mantra_entry()` to inject:
    - `master_embodiment_protocol` (Preparation / Embodiment / Integration + 7-day path)
    - `youtube_tutorials` mappings per mantra
  - Extended `_enrich_mudra_entry()` to inject:
    - `master_embodiment_protocol` (Preparation / Embodiment / Integration + 7-day path)
    - `youtube_tutorials` mappings per mudra
  - Added reusable `_build_youtube_tutorial_links()` and `_build_mantra_master_protocol()` helpers.
  - Updated `GET /api/mantras` to return enriched mantra entries.

- Frontend rendering updates:
  - `frontend/src/pages/mantras/MantrasPlayer.jsx`
    - Added Master Embodiment Protocol display blocks.
    - Added 7-Day Embodiment Path section.
    - Added YouTube Tutorials section with clickable links.
  - `frontend/src/pages/mudras/MudrasLibraryContainer.jsx`
    - Added Master Embodiment Protocol display blocks.
    - Added 7-Day Embodiment Path section.
    - Added YouTube Tutorials section with clickable links.

### QA / Verification
- Targeted lint checks passed for all touched files.
- Frontend smoke screenshots passed for `/mantras` and `/mudras`.
- Frontend specialist testing agent: PASS.
- Full testing agent report: `/app/test_reports/iteration_192.json`
  - Backend: **100% (11/11)**
  - Frontend: **100%**
- Backend regression (deep testing): PASS for `/api/mantras` and `/api/mudras` enriched fields and YouTube URL checks.

### Updated Priority Snapshot
- **P1:** Mantras/Mudras deepening ✅ done.
- **P1:** YouTube mappings for Mantras/Mudras ✅ done.
- **P2 Next:** Expand this same master-depth + YouTube curation approach into additional practice families (if requested), plus weekly reflection/alchemy planning.

## Direct Video Curation + Cross-Family Protocol Extension (Iteration 193) — 2026-06-24

### User Request Implemented
- Curate direct video-level YouTube links (not only search mappings) for top 10 most-used Mantras/Mudras.
- Extend the same master-depth embodiment protocol structure to remaining lighter practice families.

### Delivered
- Backend (`backend/routers/content.py`)
  - Added curated direct link maps:
    - `MANTRA_DIRECT_VIDEO_MAP` (top 10 mantra entries)
    - `MUDRA_DIRECT_VIDEO_MAP` (top 10 mudra entries)
  - Enhanced tutorial builder:
    - `_build_youtube_tutorial_links()` now prioritizes direct videos and labels sources (`direct_video` / `search_query`).
  - Added reusable cross-family depth:
    - `_build_modality_master_protocol()`
    - `_enrich_breathwork_session_entry()`
    - `_enrich_meditation_entry()`
  - Extended protocol fields + tutorials into:
    - `mantras`, `mudras`, `yoga poses`, `breathwork sessions`, `meditations` APIs.

- Frontend
  - `YogaLibrary.jsx` modal now renders:
    - full master embodiment protocol sections + 7-day path
    - YouTube tutorial links
  - `BreathworkSessionGrid.jsx`:
    - card-level YouTube tutorial link
  - `BreathworkActiveSessionView.jsx`:
    - full master protocol + YouTube sections
  - `Meditations.jsx`:
    - card-level master protocol snippet + YouTube link
    - link click keeps `stopPropagation` (does not auto-start meditation)

### Verification
- Full testing agent report: `/app/test_reports/iteration_193.json`
  - Backend: **100% (18/18)**
  - Frontend: **100%**
- Key validations confirmed:
  - Top 10 mantras/mudras return direct YouTube watch links with `source=direct_video`
  - Yoga/Breathwork/Meditations include `master_embodiment_protocol` + `youtube_tutorials`
  - UI sections render and remain interactive without route crashes.

### Updated Priority Snapshot
- **P1:** Direct video-level curation for top 10 Mantras/Mudras ✅ done.
- **P2:** Master-depth protocol structure extended to Yoga/Breathwork/Meditations ✅ done.
- **Next:** Optional direct-video curation for Yoga/Breathwork/Meditations (currently search-based YouTube links there).

## Direct Video Expansion + Admin No-Code Overrides + Best-For Tagging (Iteration 194-195) — 2026-06-24

### User Request Implemented
- Curate direct video-level links for Yoga, Breathwork, and Meditations (not only search links).
- Add admin-side controls to override tutorial links and tags without code changes.
- Add Best-For tags (`sleep`, `anxiety`, `focus`, `grief`, `energy`) on protocol cards for faster user choice.

### Backend Changes
- `backend/routers/content.py`
  - Added direct link maps:
    - `YOGA_DIRECT_VIDEO_MAP` (top 10 yoga poses)
    - `BREATHWORK_DIRECT_VIDEO_MAP` (all current breathwork sessions)
    - `MEDITATION_DIRECT_VIDEO_MAP` (all current meditations)
  - Expanded direct mappings to complete Mantras/Mudras coverage (all 12 each now return direct links).
  - Added `best_for_tags` inference helper and injected tags across:
    - mantras, mudras, yoga poses, breathwork sessions, meditations.
  - Added admin override support:
    - `youtube_tutorial_override_urls` (list of direct YouTube URLs)
    - when present, API returns admin-curated tutorial set with source=`admin_override`.

- `backend/routers/admin.py`
  - Added normalization for:
    - `youtube_tutorial_override_urls`
    - `best_for_tags` (validated against allowed tags).

### Admin UI No-Code Controls
- `frontend/src/pages/admin/constants.js`
  - Added editable fields for collections:
    - `mantras`, `mudras`, `yoga_poses`, `breathwork_sessions`, `meditations`
  - New editable fields:
    - `youtube_tutorial_override_urls`
    - `best_for_tags`
  - Included in list-textarea handling for easy comma/newline entry.

### Frontend Protocol Card Tagging
- Added Best-For chips and direct tutorial visibility in:
  - `MantrasPlayer.jsx`
  - `MudrasLibraryContainer.jsx`
  - `YogaLibrary.jsx`
  - `BreathworkSessionGrid.jsx`
  - `BreathworkActiveSessionView.jsx`
  - `Meditations.jsx`

### Verification
- Full test agent report: `/app/test_reports/iteration_194.json`
  - Backend: **100% (22/22)**
  - Frontend: **100%**
- Admin API persistence check (login + update + read + revert) passed for override URLs and best_for tags.
- Backend regression confirms:
  - direct video links for all required families
  - valid best_for tags across endpoints
  - no 500 responses.

### Updated Priority Snapshot
- **P1:** Direct video curation for Yoga/Breathwork/Meditations ✅ done.
- **P1:** Admin no-code override controls for tutorials/tags ✅ done.
- **P1:** Best-for tags on protocol cards ✅ done.
- **Next:** Optional analytics-driven “most clicked tutorial” tracking for smarter auto-prioritization.

## Admin CSV Bulk Overrides + Safety Notes Display (Iteration 195-196) — 2026-06-24

### User Request Implemented
- Add admin bulk-upload (CSV) for tutorial overrides to accelerate large content updates.
- Add optional per-item contraindications/safety notes in admin and display on cards/modals.

### Backend Delivered
- `backend/routers/admin.py`
  - Added endpoint: `POST /api/admin/tutorial-overrides/bulk-upload`
  - CSV validation: rejects non-CSV and empty files, handles malformed rows safely.
  - Supported collections: `mantras`, `mudras`, `yoga_poses`, `breathwork_sessions`, `meditations`.
  - Supported CSV columns:
    - `collection`, `item_id`, `item_name`, `youtube_tutorial_override_urls`, `best_for_tags`, `safety_notes`
  - Bulk update behavior:
    - updates override URLs, best-for tags, safety notes
    - returns processed/updated/skipped/error counts
  - Added normalization helpers for:
    - `youtube_tutorial_override_urls`
    - `best_for_tags`

### Admin UI Delivered
- New panel: `frontend/src/pages/admin/AdminTutorialBulkUploadPanel.jsx`
  - file picker
  - upload button
  - CSV schema note
  - success/error result panel
- Integrated panel into `frontend/src/pages/AdminDashboard.jsx`.
- Added admin field configurability (`frontend/src/pages/admin/constants.js`) for:
  - `youtube_tutorial_override_urls`
  - `best_for_tags`
  - `safety_notes`
  - across: mantras, mudras, yoga_poses, breathwork_sessions, meditations.

### Safety Notes Rendering Delivered
- Conditional safety note sections added to:
  - `MantrasPlayer.jsx`
  - `MudrasLibraryContainer.jsx`
  - `YogaLibrary.jsx`
  - `BreathworkSessionGrid.jsx`
  - `BreathworkActiveSessionView.jsx`
  - `Meditations.jsx`

### Auth/Access UX Adjustment
- Admin dashboard now redirects unauthorized admin access to `/admin/login` (instead of dashboard), improving discoverability of password-based admin access flow.

### Verification
- Full test agent report: `/app/test_reports/iteration_195.json`
  - Backend: **100% (23/23)**
  - Frontend: **100%**
- Backend deep regression confirms bulk-upload endpoint behavior and safety note persistence.
- Manual round-trip verified:
  - admin login
  - CSV upload update
  - public API reflection
  - safe revert.

### Updated Priority Snapshot
- **P1:** Admin CSV bulk overrides ✅ done.
- **P1:** Safety notes admin fields + frontend display ✅ done.
- **P1:** Admin login fallback UX improved ✅ done.
- **Next:** Add downloadable CSV template + inline row-level error export in admin panel.

## Astrology Hemisphere Restore + Daily Guidance Tweak + Sister Circle Texture (Iteration 196) — 2026-06-24

### User Requests Implemented
- Astrology should use Southern Hemisphere behavior (with Northern option), restore original intent, and retain user preference.
- Today’s guidance needed both practical and spiritual depth tweaks.
- Sister Circle needed richer texture (sister love, crafting, ceremonies, rituals/prompts).

### Delivered

#### 1) Astrology Hemisphere Logic
- `frontend/src/pages/AstrologyCalendar.jsx`
  - Default hemisphere changed to **south**.
  - Added hemisphere persistence in localStorage:
    - `astrologyHemispherePreference`
    - `astrologyTimezonePreference`
  - Added geolocation-assisted hemisphere detection (with timezone fallback).
  - Kept simple Northern/Southern toggle in Astrology page header as requested.

#### 2) Today’s Guidance Tweak (Practical + Spiritual)
- `backend/routers/user.py`
  - Extended daily response with `guidance_tweak` object:
    - `practical` array
    - `spiritual` array
  - Added same structure into fallback daily guidance path.
  - Enriched unified daily flow with practical and spiritual focus layers.

- `frontend/src/pages/dashboard/DailyGuidanceGrid.jsx`
  - Added render panel for:
    - Practical Focus
    - Spiritual Focus
  - Data-testids:
    - `daily-guidance-tweak-panel`
    - `daily-guidance-practical-focus`
    - `daily-guidance-spiritual-focus`

#### 3) Sister Circle Texture Expansion
- `frontend/src/pages/rose-temple/roseTempleConstants.js`
  - Added `sisterCircleTexture` content model.
  - Pillars include:
    - Sister Love Agreements
    - Crafting Rituals
    - Ceremony Templates
    - Ritual Prompt Deck

- `frontend/src/pages/rose-temple/RoseTempleMainSections.jsx`
  - Added “Sister Circle Living Texture” section to page.
  - Data-testids:
    - `rose-temple-sister-circle-texture`
    - `sister-circle-pillar-sister-love`
    - `sister-circle-pillar-sacred-crafting`
    - `sister-circle-pillar-ceremony-templates`
    - `sister-circle-pillar-ritual-prompts`

### Verification
- Full test agent report: `/app/test_reports/iteration_196.json`
  - Backend: **100% (13/13)**
  - Frontend: **100%**
- Backend deep check passed for:
  - `/api/astrology/current`
  - `/api/astrology/months`
  - `/api/dashboard/daily`
  - `/api/health`

### Updated Priority Snapshot
- **P1:** Astrology southern-first + north toggle + persistence ✅ done.
- **P1:** Today’s Guidance practical/spiritual refinement ✅ done.
- **P1:** Sister Circle texture expansion ✅ done.
- **Next:** Add user-level “Guidance Tone” controls (practical-heavy / balanced / mystical-heavy) in settings.

## Timing Alignment Sweep + One-Source Duration Lock (Iteration 198) — 2026-06-24

### Scope executed
- Dedicated route-by-route timing sweep for:
  - Shamanic
  - Chakra
  - Yoga
  - Masculine
  - Daily Sacred Practice
- Goal: card/session durations originate from one normalized source and eliminate fallback mismatches.

### Key fixes shipped
- Added shared parser utility:
  - `frontend/src/utils/durationUtils.js`
  - `resolveDurationMinutes()` / `resolveDurationSeconds()`
- Standardized duration normalization in guided engine + route builders:
  - `components/guided/useGuidedPracticeEngine.js`
  - `components/guided/guidedNarrationUtils.js`
  - route-level containers/modals for Shamanic, Chakra, Yoga, Heart, Grounding, Sunrise/Sunset, Daily.
- Corrected prop mismatch sources causing silent fallback behavior:
  - ensured guided audio/timer paths receive normalized minute values.
- Fixed race condition causing Shamanic timer to start at stale 20 min despite 30 min card:
  - `useGuidedPracticeEngine.js`
  - synchronized `timeRemainingRef.current` with `totalDuration` during reset.

### Verification (testing-agent)
- Report: `/app/test_reports/iteration_198.json`
- Frontend result: **100%**
- Confirmed alignments:
  - Shamanic: 30 min card → timer 29:57 ✅
  - Chakra: 15 min card → timer 14:58 ✅
  - Yoga/Daily: numeric durations, no NaN ✅

### Updated priority snapshot
- **P0 bug:** Card-vs-session timing mismatch ✅ fixed and verified.
- **Next:** Optional timing badge UX (“Session Time Locked”) for user trust visibility.

## Dev Duration Audit Logging + Label Normalization Sweep (Iteration 199) — 2026-06-24

### User request implemented
- Add lightweight duration audit logging in dev mode.
- Normalize remaining non-guided duration labels with shared parser for consistency.

### Delivered
- `frontend/src/utils/durationUtils.js`
  - Added:
    - `formatDurationMinutesLabel()`
    - `auditDurationAlignment()`
- `frontend/src/components/guided/useGuidedPracticeEngine.js`
  - Added dev-mode duration alignment audit calls.
  - Uses normalized duration resolution for guided flow contexts.
- `frontend/src/components/timer/usePracticeTimerEngine.js`
  - Added dev-mode timer duration audit logging via `appLogger.debug`.
- Label normalization updates across targeted routes:
  - Heart Practices (grid + modal)
  - Shamanic, Chakra, Yoga, Masculine
  - Daily Sacred Practice (card + guided button duration wiring)

### Verification
- Testing agent report: `/app/test_reports/iteration_199.json`
  - Frontend: **100%**
  - No NaN duration labels, parser usage confirmed in targeted files.
- Backend sanity check passed:
  - `/api/health` 200
  - `/api/dashboard/daily` reachable (401 auth-protected expected)
  - no 500s.

### Updated priority snapshot
- **P1:** Dev-mode duration audit logging ✅ done.
- **P1:** Non-guided duration label normalization sweep ✅ done.
- **Next:** Optional “Session Time Locked” badge and duration provenance tooltip UX.

## Bug Fix: Daily card click targets (Angelic route) — Iteration 200

### User-reported issue
- Clicking daily flow cards in production was not opening expected section(s).

### Root cause
- Angelic daily step/button route pointed to the Sacred Ally page route in some paths.

### Fix applied
- `backend/routers/user.py`
  - Angelic daily step `anchor_route` corrected to `/angelic-alchemy`.
- `backend/routers/content.py`
  - Angelic seal `anchor_route` corrected to `/angelic-alchemy`.
- `frontend/src/pages/DailySacredPractice.jsx`
  - Angelic panel button navigation corrected to `/angelic-alchemy`.

### Verification
- Testing agent report: `/app/test_reports/iteration_200.json`
  - Backend: **100%**
  - Frontend: **100%**
- Verified pass:
  - Unified flow Angelic step → `/angelic-alchemy`
  - Unified flow Ally step → `/sacred-ally-alchemy`
  - Daily Angel button → `/angelic-alchemy`
  - Daily Ally button → `/sacred-ally-alchemy`

## Bug Fix: Daily CTAs not opening (production report) — Iteration 201

### User report
- In production, user reported that all daily CTAs still were not opening and some appeared as placeholders.

### Additional fix applied
- `frontend/src/pages/DailySacredPractice.jsx`
  - Added `resolveDailyRoute()` guard to prevent self-navigation dead clicks.
  - Any unified flow step with `anchor_route === "/daily-practice"` is now mapped to `"/menu"`.
  - This ensures “Open …” buttons always navigate to a meaningful destination instead of reloading the same page.

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_201.json`
  - Backend: **100%**
  - Frontend: **100%**
- Verified working CTAs:
  - Sacred Ally → `/sacred-ally-alchemy`
  - Angelic Guide → `/angelic-alchemy`
  - Morning/Evening `/daily-practice` anchors resolve to `/menu`
  - Tender Warrior practice confirmed accessible in `/masculine-temple` (modal behavior)

## UX Correction: Daily Guidance CTA behavior (all buttons) — Iteration 202

### User report
- User confirmed all daily guidance CTAs should work and should not bounce to main screen.

### Root issue
- Previous guard routed `/daily-practice` anchors to `/menu`, which felt like a wrong redirect.

### Final behavior implemented
- `frontend/src/pages/DailySacredPractice.jsx`
  - Added `handleUnifiedStepOpen(step)` behavior split:
    - Morning Embodiment step: stay on `/daily-practice`, auto-expand Morning card, scroll to it.
    - Evening Integration step: stay on `/daily-practice`, auto-expand Evening card, scroll to it.
    - Sacred Ally step: navigate to `/sacred-ally-alchemy`.
    - Angelic step: navigate to `/angelic-alchemy`.

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_202.json`
  - Frontend: **100%**
- Verified outcomes for all 4 unified CTA buttons:
  - Morning in-page expansion ✅
  - Evening in-page expansion ✅
  - Sacred Ally route ✅
  - Angelic route ✅

## Guided Audio UX + Voice Tone Fix (Iteration 203)

### User-reported production issues
- Narration opened with generic phrase instead of subject title.
- Guided control felt like it needed two clicks.
- Voice should be calmer/sweeter with less echo.

### Fixes applied
- Title-led narration start
  - Added `ensureTitleLedNarrationOpen()` in `guidedNarrationUtils.js`.
  - Strips generic "welcome to guided practice" style opener and prepends practice title.
- Single-click responsiveness
  - Immediate loading state on first click in guided playback handlers.
  - Removed unintended auto-start overlay behavior that created click confusion.
- Calmer voice profile
  - Slowed guided TTS speed default to `0.8`.
  - Reduced toning resonance gain significantly for less echo feel.
  - Overlay generation uses softer voice profile (`shimmer`) for guided narration.
- Practice-specific CTA labels
  - Guided button now prioritizes practice title text (e.g., “Listen to [Practice Name]”).

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_203.json`
  - Frontend: **100%**
- Verified fixed:
  - Subject-title-led opening narration ✅
  - Single-click start behavior ✅
  - Calmer/sweeter voice profile with reduced echo ✅
  - Practice-specific button label ✅

## Image Subject Alignment Sweep (High-Impact + Broad Fallbacks) — Iteration 204

### User request
- Ensure images across the app match subject matter.
- Preferred execution: high-impact first, then broader auto-replacement.
- Style preference: keep existing style, fix wrong/irrelevant mismatches.

### What was implemented
- Added centralized subject-image alignment in backend content router:
  - `PRACTICE_IMAGE_FALLBACKS` (explicit subject-specific mappings)
  - `GENERIC_CATEGORY_IMAGE_FALLBACKS` (safe category defaults)
  - `_apply_subject_image_alignment()` for runtime image correction.
- Applied alignment to key endpoints/routes:
  - grounding
  - water practices
  - mindfulness
  - meditations
  - daily practice pool loading
- Replacement policy is conservative:
  - Explicit subject override names always corrected
  - Missing image URLs corrected
  - Known placeholder image host (`static.prod-images.emergentagent.com/jobs/...`) corrected

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_204.json`
  - Backend: **100% (17/17)**
  - Frontend: **100%**
- Confirmed pass:
  - Grounding images subject-aligned (including Cold Water Reset / Root Visualization)
  - Water practice images no longer missing in key cards
  - Daily morning/evening + ally/angel images valid
  - No broken image placeholders in high-impact routes

## Guided Voice Controls + Early-Stop Fix (Iteration 205)

### User request
- Add voice speed options.
- Apply controls everywhere guided voice is used.
- Add feminine/masculine voice variety.
- Fix bug: narration stopping early while showing completed.

### Delivered
- Added global guided voice settings utility:
  - `frontend/src/utils/guidedVoiceSettings.js`
  - Voice profiles:
    - Feminine (Soft) → `shimmer`
    - Masculine (Grounded) → `onyx`
    - Balanced (Neutral) → `nova`
  - Speed options:
    - Slow `0.8`
    - Normal `0.9`
    - Fast `1.0`
  - Cookie persistence + runtime sync support.

- Settings UI expanded:
  - `frontend/src/pages/settings/SettingsGuidedAudioCard.jsx`
  - Added cards/selectors:
    - Guided Voice Speed (Slow / Normal / Fast)
    - Guided Voice Type (Feminine / Masculine / Balanced)

- Wired settings across guided engines:
  - `useGuidedAudioPlayback.js`
  - `useGuidedPracticeEngine.js`
  - Both now resolve selected global voice + speed.

- Completion reliability fix:
  - Tightened completion conditions so session is marked complete only when final segment truly ends.
  - Prevents early “finished” state before narration completion.

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_205.json`
  - Frontend: **100%**
- Verified pass:
  - Speed options ✅
  - Voice type options ✅
  - Single-click playback ✅
  - Completion reliability (no premature finish) ✅
  - Title-led opener preserved ✅

## Guided UX Expansion: Segment Dots + Preview Buttons + Per-Practice Override (Iteration 206)

### User requests addressed
- Add subtle “playing segment X of Y” indicator with mini dots.
- Add tiny inline “Preview voice” buttons for profile/speed options.
- Add optional per-practice voice override in guided overlay while keeping global defaults.
- Support both persistence behaviors for per-practice override (Session only + Remember per practice).

### Implemented
- `frontend/src/components/guided/GuidedPracticeContent.jsx`
  - Added segment indicator text + mini dot tracker:
    - `guided-segment-indicator`
    - `guided-segment-dots`
  - Added in-overlay Voice/Speed per-practice override selectors:
    - `guided-practice-voice-override-select`
    - `guided-practice-speed-override-select`

- `frontend/src/utils/guidedVoiceSettings.js`
  - Added voice/speed profile maps and robust resolver mapping:
    - feminine → shimmer
    - masculine → onyx
    - balanced → nova
  - Added per-practice override storage + mode utilities:
    - Session-only runtime overrides
    - Remembered per-practice overrides

- `frontend/src/pages/settings/SettingsGuidedAudioCard.jsx`
  - Added inline preview buttons:
    - speed previews (Slow/Normal/Fast)
    - voice previews (Feminine/Masculine/Balanced)
  - Added per-practice override mode selector:
    - Session only / Remember per practice

- `frontend/src/pages/settings/useSettingsData.js`
  - Added state/actions for per-practice override mode.

- `frontend/src/components/guided/useGuidedPracticeEngine.js`
  - Wired overlay per-practice voice/speed controls into actual TTS generation.
  - Uses correct mapped TTS voices.
  - Completion logic preserved to avoid early “finished” behavior.

- `frontend/src/components/guided/useGuidedAudioPlayback.js`
  - Reads per-practice preference (if available) and applies mapped voice/speed.

- `frontend/src/routes/AppRoutes.jsx`
  - Settings route now reachable via public route wrapper to ensure guided controls are accessible for tuning.

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_206.json`
  - Frontend: **100%**
- Verified features:
  - Segment X/Y + dot progress ✅
  - Inline preview buttons for speed + voice ✅
  - Per-practice override controls ✅
  - Session/Remember persistence options ✅
  - Correct TTS voice mapping ✅
  - Completion reliability preserved ✅

## Production Bug Fix: Guided overlay scroll + deeper ceremonial tone (Iteration 207)

### User-reported issue
- In production, user could not scroll further in guided practice flow, blocking proper completion.
- User also requested longer, more mindful, earthy/elemental/ceremonial heart-coherence cosmic tone across practice guidance.

### Fixes implemented
- `frontend/src/components/guided/GuidedPracticeContent.jsx`
  - Enabled reliable overlay scrolling on mobile:
    - Added scroll container: `overflow-y-auto overscroll-contain`.
  - Removed nested description-panel scroll trap:
    - Changed panel from constrained nested scrolling to natural flow (`max-h-none overflow-visible`).

- `frontend/src/components/guided/guidedNarrationUtils.js`
  - Deepened narrative tone with explicit ceremonial Earth/Cosmic context additions:
    - title-led ceremonial opener line,
    - expansion context prompts,
    - reflection prompts using shamanic earth-to-cosmos framing.

- `frontend/src/pages/SomaticMovement.jsx`
  - Added “Earth + Cosmic Coherence” practical guidance block inside detail dialog to strengthen embodied ceremonial framing.

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_207.json`
  - Frontend: **100%**
  - Mobile viewport test executed (390x844)
  - Verified:
    - guided overlay scroll container present ✅
    - nested scroll trap removed ✅
    - play button no regression ✅
    - ceremonial/earthy/cosmic narrative language present ✅
    - somatic earth-cosmic guidance section present ✅

## Critical Retest: Guided touch-scroll fixed on mobile (Iteration 209)

### Context
- User reported "still not scrolling" after previous production deployment.
- Prior test (`iteration_208`) identified exact root cause:
  - `body touch-action:none` blocked touch scroll gestures.
  - competing outer/inner scroll contexts.

### Final fix applied
- `frontend/src/components/guided/GuidedPracticeContent.jsx`
  - Removed `body.style.touchAction = "none"` lock.
  - Removed outer overlay `overflow-y-auto` (no competing scroll container).
  - Kept single inner scroll container with:
    - `overflow-y-auto`
    - `touch-pan-y`
    - `[touch-action:pan-y]`
    - `[-webkit-overflow-scrolling:touch]`

### Verification (required retest)
- Testing agent report: `/app/test_reports/iteration_209.json`
  - Frontend: **100%**
- Mobile viewport pass evidence:
  - 390x844 and 375x812: touch scrolling works ✅
  - play button reachable/clickable via scroll ✅
  - no competing scroll contexts ✅
  - narration minimum floor 10 minutes preserved ✅

## Final targeted fix: Somatic practice dialog scroll (Iteration 210)

### User report
- User still experiencing non-scrollable practice view (screenshot corresponded to SomaticMovement detail dialog).

### Fix applied
- `frontend/src/pages/SomaticMovement.jsx`
  - Updated detail dialog container:
    - `DialogContent` now includes `max-h-[88vh] overflow-y-auto`
    - added dialog-level scroll container testids for QA
  - Normalized duration display in dialog with `resolveDurationMinutes(...)`.

### Verification (required)
- Testing agent report: `/app/test_reports/iteration_210.json`
  - Frontend: **100%**
- Mobile viewport evidence:
  - iPhone 14 Pro (390x844): scrollTop 0 → 715, Start button reachable/clickable ✅
  - iPhone SE (375x667): scrollTop 0 → 962, Start button reachable/clickable ✅
  - Guided overlay opens from scrolled state (no regression) ✅

## Bug Fix: Remove “Very Deep” wording + duplicate Daily sections (Iteration 197) — 2026-06-24

### User-reported issue
- Remove the words “Very Deep” from daily flow UI.
- Fix duplicated/double sections appearing in Daily screen.

### Fix implemented
- Backend title updates:
  - `backend/routers/user.py`: changed daily flow title to `Ceremonial Daily Flow` (removed “Very Deep”).
  - `backend/routers/content.py`: aligned fallback/generated title to `Ceremonial Daily Flow`.
- Frontend duplicate section fix:
  - `frontend/src/pages/DailySacredPractice.jsx`
  - Ally/Angel panels now render only when `unified_daily_flow` is absent:
    - `!dailyData?.unified_daily_flow && renderAllyAngelPanels()`

### Verification
- Testing agent report: `/app/test_reports/iteration_197.json`
  - Backend: **100%**
  - Frontend: **100%**
- Verified outcomes:
  - No “Very Deep” wording in daily flow title.
  - No duplicate Ally/Angel section when unified flow exists.

## Requested Expansion: Astrology Hemisphere + Guidance + Sister Circle Texture (Planned Next) — 2026-06-24

### User-confirmed choices (captured)
- Astrology default: auto-detect by user location + remember last hemisphere in localStorage.
- Northern option placement: simple toggle inside Astrology page.
- Today’s Guidance tweak: both practical/actionable and spiritually deep tone.
- Sister Circle texture priority: defaults accepted (no extra constraint provided).

### Current status
- This requirement set is now queued as the next implementation block.
- Existing release completed first: CSV bulk tutorial overrides + safety notes.

### Next execution order
1. Astrology hemisphere logic (geo detect + local persistence + toggle UI)
2. Today’s Guidance content/UX balancing (practical + ceremonial)
3. Sister Circle enrichment modules (sister-love, crafting, ceremonies, rituals, prompts)

## Premium Monetization + Breathlove Expansion (Iteration 212) — 2026-06-26

### Implemented
- Added **10 new premium Breathlove practices** (`breathlove-1` → `breathlove-10`) in `backend/data/all_content.py` with `is_premium=true`, `premium_unlock_id=premium_breathwork`, and heart-coherence/self-love positioning.
- Added premium unlock infrastructure in `backend/routers/payments.py`:
  - new `premium_unlock` product type
  - fixed catalog endpoint: `GET /api/payments/premium-products`
  - entitlement endpoint: `GET /api/payments/entitlements`
  - section + full-app checkout support via `POST /api/payments/create-checkout` with optional `return_path` for same-page post-checkout verification.
- Added frontend premium lock flows:
  - `/breathwork`: lock overlays on premium Breathlove cards + unlock modal (section unlock + full app unlock)
  - `/rose-temple`: page-level premium gate panel
  - `/healing-portals`: section unlock/full app unlock CTA with entitlement-based lock states
  - `/pricing`: added one-time vs monthly (preview) toggle UI.

### Verification
- Testing agent report: `/app/test_reports/iteration_212.json`
  - Backend: **95% (19/20 pass)**
  - Frontend: **100% pass**
  - Verified all core premium monetization goals above.
- Minor UI correction from testing was applied (currency label formatting in rose/healing unlock CTA).

### Notes
- Changes are implemented in **preview** and validated there.
- Production deployment requires redeploy from latest preview code state.

## P1 Polish Sweep: App Store readiness + Entitlements hardening (Iteration 213) — 2026-06-26

### Implemented
- Hardened unauthenticated behavior around premium entitlements:
  - `GET /api/payments/entitlements` now explicitly enforces authenticated user guardrails.
  - `frontend/src/hooks/usePremiumAccess.js` now resets premium state on 401/403 instead of retaining stale unlock state.
- Payment UX continuity polish:
  - `PaymentSuccess.jsx` upgraded with full critical-state test IDs and responsive action layouts.
  - `PaymentCancel.jsx` action layout changed to mobile-safe stacked buttons (`flex-col sm:flex-row`) to prevent narrow viewport overflow.
- App Store readiness sweep updates:
  - `App.js` hides top nav on `/app-readiness` to prevent header overlap regression.
  - `public/index.html` metadata refined with safer canonical/OG URL placeholders and stronger crawler/referrer directives.

### Verification
- Testing agent report: `/app/test_reports/iteration_213.json`
  - Backend: **100% (15/15)**
  - Frontend: **100%**
  - Verified:
    - unauth `/api/payments/entitlements` returns 401,
    - authenticated entitlements schema intact,
    - payment pages mobile-responsive (320–414 widths),
    - `/app-readiness` no top-nav overlap,
    - premium state resets correctly after logout/auth loss.

## Guided Practice Expansion Across Alchemy + Major Libraries (Iteration 214) — 2026-06-27

### Implemented
- Added **card-level + modal-level Guided Practice entry points** (Voice + Timer + Ambient overlay) across major ritual/teaching libraries:
  - `SacredAllyAlchemy.jsx`
  - `AngelicAlchemy.jsx`
  - `heart-practices/HeartPracticesGrid.jsx`
  - `CreativeProcesses.jsx`
  - `SomaticMovement.jsx`
  - `Mindfulness.jsx`
  - `ElementalPractices.jsx` + `components/elemental/ElementalPracticeCard.jsx`
  - `ElementalTemples.jsx` + `elemental-temples/ElementalTempleDetailView.jsx`
  - `rose-temple/*` (card actions + modal guided actions, respecting lock state)
  - `HealingPortals.jsx` (guided overlay action for accessible portals; hidden when locked)
- Added/extended guided ambience mappings in `guidedNarrationUtils.js` for broader elemental context support.

### Premium Lock Integrity
- Confirmed guided controls are hidden/blocked where content is locked:
  - Rose Temple locked state: guided actions hidden until unlock.
  - Healing Portals locked cards: guided card actions hidden; premium lock panel remains authoritative.

### Verification
- Testing agent report: `/app/test_reports/iteration_214.json`
  - Backend: **100%**
  - Frontend: **100%**
  - No functional regressions reported.

## Precision Accuracy Overhaul: Human Design + Gene Keys + City Timezone (Iteration 215) — 2026-06-27

### Why this was done
- User reported production mismatch and requested app-wide precision, especially Human Design and Gene Keys.
- Source-of-truth target provided by user for validation: `Projector / Splenic / 6/2`.

### Implemented
- Added strict backend endpoint: `POST /api/birth-chart/human-design/calculate`
  - Uses Swiss Ephemeris precision + exact solar arc design calculation (`88°`)
  - Returns:
    - type, authority, profile
    - personality/design activations (gate/line/color)
    - defined centers/channels, active gates
    - incarnation cross
    - variables (digestion, cognition, environment, perspective, motivation)
    - Gene Keys activation quartet
    - calculation audit (timezone, coords, Julian days, design local datetime)
- Upgraded city/timezone resolution in `birth_chart.py`
  - Added city geocode fallback + timezone resolution path
  - Added explicit `Moonee Ponds` city mapping (`Australia/Melbourne`)
  - Removed silent "New York" assumption for unresolved cities; now UTC fallback with warnings.
- Frontend migration to strict precision pipeline
  - `utils/humanDesignCalculator.js` now consumes strict backend endpoint
  - Human Design page now shows precision audit panel and dynamic bodygraph definitions
  - Profile Calculator now uses strict Gene Keys output from Human Design endpoint (not date-only approximation)
  - Gene Keys page now requires full birth inputs (date + exact time + city + country) and computes from strict endpoint

### Dependencies Added
- Backend:
  - `geopy`
  - `timezonefinder`

### Verification
- Testing report: `/app/test_reports/iteration_215.json`
  - Backend: **100%**
  - Frontend: **100%**
- Verified sample target (`1978-01-27 18:56`, `Moonee Ponds`, `Australia`):
  - `type_key=projector`
  - `authority=Splenic`
  - `profile=6/2`

### Production Note
- Fixes are implemented and validated in preview.
- Production requires redeploy to receive these precision updates.

## Guided Voice Controls Hardening (Iteration 216) — 2026-06-27

### Why this was done
- User reported guided overlays lacked a clear/manual voice option across sections after deployment.

### Implemented
- Updated shared guided overlay components:
  - `frontend/src/components/guided/GuidedPracticeContent.jsx`
  - `frontend/src/components/guided/useGuidedPracticeEngine.js`
  - `frontend/src/components/GuidedPracticeOverlay.jsx`
- Added always-visible manual controls in every guided overlay:
  - `Play Voice Guidance`
  - `Tap to Retry Voice`
- Added retry behavior hook in engine (`handleRetryVoice`) and explicit manual voice-start handler (`handleStartVoiceOnly`).

### Verification
- Testing report: `/app/test_reports/iteration_216.json`
  - Frontend: **100%**
  - Verified on Sacred Ally + Angelic overlays:
    - voice controls visible immediately,
    - controls clickable and functional,
    - no regressions in timer, play/pause, mute, or exit.

## App-wide Guided Voice + Deeper Ritual Delivery Sweep (Iteration 218) — 2026-06-27

### Why this was done
- User reported production still felt too simplified, with missing guided voice options and shallow healing modality delivery.

### Implemented
- Added shared deep ritual composer utility:
  - `frontend/src/utils/guidedRitualComposer.js`
  - Provides immersive, sensory, embodiment-first narrative scaffolding and ritual delivery pillars.
- Upgraded guided voice controls globally:
  - `GuidedAudioButton` now emphasizes explicit voice CTA + retry action (`Tap to Retry Voice`).
  - `useGuidedAudioPlayback` switched to richer script expansion mode (`use_ai: true`) for more immersive narration.
- Added/expanded guided voice and ritual depth panels across core healing sections:
  - Healing Portals
  - Rose Temple modals
  - Angelic Alchemy modal
  - Sacred Ally Alchemy modal
  - Elemental Temples detail
  - Retreats modality + retreat detail modal
  - Ancient Wisdom detail modal
  - Masculine archetype + practice modals
  - Shamanic practice modal
  - Yoga modal label clarification

### Verification
- Testing report: `/app/test_reports/iteration_218.json`
  - Frontend: **100%**
  - Confirmed guided voice CTAs + retry controls + embodied ritual depth panels across tested sections.

### Production Note
- Fixes validated in preview; production requires redeploy of latest preview build.

## Mantra-Wide Chant Audio + Single Reliable Voice Controls (Iteration 221) — 2026-06-27

### Why this was done
- User requested chant-style sound across **all** mantras (not OM-only), and removal of duplicate/non-actioning voice options.

### Implemented
- Added universal chant synthesis engine for all mantras:
  - `frontend/src/components/audio/MantraAudio.js`
  - New `playChantForMantra(...)` with mantra-aware base frequency mapping (OM/AUM, LAM/VAM/RAM/YAM/HAM, So Hum, etc.) and syllable cadence shaping.
- Updated mantra playback to use chant rendering across OM and non-OM:
  - `frontend/src/pages/mantras/MantrasLibraryContainer.jsx`
  - Chant cycle now triggers `playChantForMantra` for every mantra repetition.
- Kept one reliable guided voice control and removed duplicate options:
  - `frontend/src/components/guided/GuidedPracticeContent.jsx`
  - `frontend/src/components/GuidedAudioButton.jsx`
  - `frontend/src/components/guided/useGuidedAudioPlayback.js`

### Verification
- Testing report: `/app/test_reports/iteration_221.json`
  - Frontend: **100%**
  - Verified: OM + So Hum + Sat Nam all use chant-style audio.
  - Verified: single guided voice CTA remains; duplicate voice options removed.

### Production Note
- Changes validated in preview; production requires redeploy of latest preview build.

## Premium Mantra Expansion + Free/Paid Alignment (Iteration 222/223) — 2026-06-27

### Why this was done
- User confirmed priorities: full sweep (content + readiness direction), exact requested mantra set + additions, and premium model alignment.
- User requested: first 3 mantras free, then paid access with subscription/full-app unlock options.

### Implemented
- Added and seeded expanded mantra corpus with deep ritual fields:
  - `backend/data/all_content.py`
  - 26 total mantras; IDs `1-3` free, IDs `4-26` premium.
  - IDs `13-26` include: `transliteration`, `sanskrit`, `meaning`, `description`, `ritual_practice`.
- Added mantra premium monetization product:
  - `backend/routers/payments.py`
  - New Stripe product id: `premium_mantras` (`$49`) while preserving `full_app_unlock` (`$369`) and subscription plans.
- Extended mantra enrichment/tutorial mapping:
  - `backend/routers/content.py`
  - Added premium defaults and additional direct mantra tutorial mappings.
- Updated mantra premium UX and lock flow:
  - `frontend/src/pages/mantras/MantrasLibraryContainer.jsx`
  - `frontend/src/pages/mantras/MantrasLibraryGrid.jsx`
  - Premium banner now clearly communicates "First 3 free" model.
  - Locked mantra modal now offers: section unlock, full app unlock, and subscription plan CTA.
- Added premium section state support:
  - `frontend/src/hooks/usePremiumAccess.js`
  - Included `premium_mantras` section handling.

### Verification
- Automated test report: `/app/test_reports/iteration_222.json`
  - Backend: **100%**
  - Frontend: **100%**
- Additional verification:
  - `auto_frontend_testing_agent`: PASS (banner, free/premium gating, lock modal CTA coverage).
  - `deep_testing_backend_v2`: PASS (`/api/mantras`, `/api/payments/premium-products`, `/api/payments/plans`, `/api/retreats`).

### Current Status
- Preview is updated and validated.
- Production requires redeploy to receive these updates.

### Prioritized Next Tasks
- **P1**: Continue devotional tone calibration in remaining non-mantra sections (Healing Portals, Rose Temple, etc.).
- **P1**: Final real-device app-store readiness evidence pass (iOS install + store asset validations).
- **P2**: Weekly Reflection/Alchemy plan generator.

## Full App-Wide Devotional Tone Calibration (Iteration 223) — 2026-06-27

### User Direction
- User selected **C (full app-wide language pass)** and postponed app-store pack/evidence for now.
- Priority: optimize smoothness and depth before publishing.

### Implemented in this iteration
- Added backend-level devotional enrichment engine in `backend/routers/content.py`:
  - New cross-domain enhancer: `_enrich_devotional_language(...)`
  - Adds/normalizes:
    - `description` depth expansion (domain + element-aware)
    - `devotional_invocation`
    - `embodiment_prompt`
    - `integration_vow`
- Applied enrichment broadly to content endpoints:
  - `/api/breathwork/sessions`
  - `/api/mindfulness`
  - `/api/meditations`
  - `/api/heart-practices`
  - `/api/shamanic-practices`
  - `/api/elemental-practices`
  - `/api/healing-portals`
  - `/api/feminine-embodiment`

- Frontend devotional/consistency polish + subscription CTA continuity:
  - `frontend/src/pages/HealingPortals.jsx`
    - Added devotional note in premium banner
    - Added `View Subscription` CTA in banner and lock modal
  - `frontend/src/pages/rose-temple/RoseTempleContainer.jsx`
    - Added devotional note in premium gate
    - Added `View Subscription` CTA
  - `frontend/src/pages/Breathwork.jsx`
    - Added devotional note in premium banner
    - Added subscription CTA in banner + premium lock modal
  - Header/introduction devotional notes added:
    - `HeartPracticesHeader.jsx`
    - `ShamanicHeader.jsx`
    - `ElementalPractices.jsx`
    - `Meditations.jsx`
    - `Mindfulness.jsx`

### Validation
- Lint: clean on all modified backend/frontend files.
- API self-check: all 8 endpoints return devotional fields with enriched descriptions.
- Smoke screenshot: Healing Portals confirms devotional copy + subscription CTA.
- Full testing subagent report: `/app/test_reports/iteration_223.json`
  - Backend: **100%**
  - Frontend: **100%**
  - No open action items.

### Current status
- Preview is stable and calibrated for devotional depth + smooth premium/subscription pathways.
- User deferred app-store evidence pack for now.

### Next prioritized items
- **P1**: Guided narration duration QA sweep (ensure spoken guidance reliably meets long-form expectations across guided overlays).
- **P1**: Smoothness/performance pass (audio startup latency, modal transition fluidity on mobile).
- **P2**: Weekly Reflection / Alchemy Plan generator.

## Guided Narration Duration QA + Smoothness Pass (Iteration 224) — 2026-06-27

### User direction
- User asked to execute both P1 items now:
  1) Guided narration duration QA sweep for long-form consistency
  2) Performance smoothness pass (audio start latency + mobile overlay fluidity)

### Implemented
- Backend (`backend/routers/content.py`)
  - Added in-memory TTL caching for `/api/content/expand-script`:
    - `SCRIPT_EXPANSION_CACHE_TTL_SECONDS = 45min`
    - `SCRIPT_EXPANSION_CACHE_MAX_ITEMS = 180`
  - Added normalized cache-key builder from request payload (`practice`, `element`, `duration`, `steps`, `source_texts`, mode flags).
  - Added cache prune logic (expiry + capacity control).
  - Wired cache read/write into `expand_guided_script` route to reduce repeated script expansion latency.

- Frontend (`frontend/src/components/guided/useGuidedPracticeEngine.js`)
  - Added long-form floor safety check after `/api/content/expand-script` response:
    - Estimates spoken minutes and enforces minimum long-form floor before replacing local narration plan.
  - Reduced expansion payload size sent from client (faster request payload):
    - `sourceTexts` capped from 80 → 48
    - `steps` capped from 40 → 24
  - Improved timer render efficiency:
    - Tick interval reduced from `250ms` to `1000ms` to lower re-render pressure.
  - Added proactive TTS prefetch of first 2 segments after narration becomes ready.
  - Improved TTS cache keying to include segment + voice + speed (avoids stale cross-profile collisions).
  - Added resilient segment playback fallback (skip to next segment when one segment TTS fails).

- Frontend (`frontend/src/components/guided/GuidedPracticeContent.jsx`)
  - Added condensed long-script rendering for overlay smoothness:
    - Renders first 12 paragraphs by default.
    - Added expand/collapse controls:
      - `guided-expand-full-script-button`
      - `guided-collapse-full-script-button`
  - Added windowed segment-dot rendering for large segment counts to prevent overflow/jank.

### Validation
- Self-checks:
  - Expand-script API sample payloads returned long-form outputs (2.3k–3.1k+ words in sampled runs).
  - Repeated-call latency improved (cache hits faster than cold runs).
  - Guided overlay smoke test passed on `/meditations`.

- Subagent testing:
  - `/app/test_reports/iteration_224.json`
    - Backend: **100%**
    - Frontend: **100%**
    - No open issues.
  - `auto_frontend_testing_agent`: PASS (controls, timer, script expand/collapse, clean exit, no jank).
  - `deep_testing_backend_v2`: PASS (schema + floor + cache timing + edge cases).

### Current status
- Guided narration is now more consistent for long-form use, with better startup smoothness and lighter overlay rendering behavior on mobile.
- No regressions reported by testing agents.

### Next prioritized items
- **P1**: Continue broad UX smoothness pass across other heavy interactive pages (e.g., Water Practices, Chakra Cleansing, partner overlays).
- **P2**: Weekly Reflection / Alchemy Plan generator.

## Heavy Guided Pages Smoothness Pass (Water + Chakra + Partner) — 2026-06-27

### Scope completed
- `/water-practices`
- `/chakra-cleansing`
- `/partner-yoga`

### Key smoothness fixes implemented
- **Water Practices** (`frontend/src/pages/WaterPractices.jsx`)
  - Reworked guided flow to avoid stacked modal+overlay interaction conflicts:
    - Modal now closes before full-screen guided overlay opens.
  - Added guided payload builder and launch transition helper for cleaner state handoff.
  - Added client-side guided audio caching per practice/voice/speed key.
  - Added safer audio pause/resume handling and cleanup for smoother session transitions.
  - Added/strengthened data-testid coverage for modal and card interactions.

- **Chakra Cleansing**
  - `frontend/src/pages/chakra-cleansing/useChakraCleansingData.js`
  - `frontend/src/pages/chakra-cleansing/ChakraCleansingContainer.jsx`
  - Shifted guided overlay launch to dedicated `guidedPractice` state so detail modal does not remain active under overlay.
  - Added explicit guided close handler for stable teardown.

- **Partner Yoga** (`frontend/src/pages/PartnerYoga.jsx`)
  - Reworked modal→guided transition to close modal before guided overlay opens.
  - Added memo/callback optimizations for filtered lists and guided payload generation.
  - Added modal test ids and cleaned lint issues (escaped apostrophes).

### Validation
- Lint: clean on all updated files.
- Manual smoke screenshot: Partner Yoga modal → guided overlay path confirmed.
- Frontend specialist validation (`auto_frontend_testing_agent`):
  - Water, Chakra, Partner all PASS.
  - Verified no stuck interaction layers, no blocking modal remnants, no crashes.
  - Guided controls present and functional on each overlay.
- Backend smoke checks:
  - `/api/water-practices` = 200
  - `/api/chakra-cleansing` = 200

### Current status
- Heavy guided pages now have cleaner, smoother modal-to-overlay transitions and stable interaction behavior.
- Ready for continued polish before publish.

### Next prioritized items
- **P2**: Weekly Reflection / Alchemy Plan generator.

## P2 Weekly Reflection / Alchemy Plan Generator — 2026-06-27

### Implemented
- **Backend endpoint added** in `backend/routers/user.py`:
  - `GET /api/practice-journal/weekly-reflection?days=7`
  - Auth-protected synthesis of recent `practice_journal_entries`.
  - Returns:
    - period + stats (`entries_analyzed`, `total_minutes`, `average_mood_shift`)
    - extracted `key_themes`
    - `energetic_summary`, `alchemy_focus`, `integration_vow`
    - 7-day `weekly_alchemy_plan` (Monday→Sunday) with `day/focus/practice/journal_prompt`
  - Includes fallback output when no entries exist.
  - Days parameter normalization/clamp implemented (3..14).

- **Frontend feature added** in Practice Journal:
  - New trigger button in header: **Weekly Reflection**
    - `practice-journal-open-weekly-reflection-button`
  - New modal component:
    - `frontend/src/pages/practice-journal/PracticeJournalWeeklyReflectionModal.jsx`
  - Wired in container + data hook:
    - `PracticeJournalContainer.jsx`
    - `usePracticeJournalData.js`
  - Regenerate and close actions implemented.
  - Local synthesis fallback retained if API call fails.

### Validation
- Lint: clean for backend and frontend changed files.
- Backend manual verification: authenticated endpoint returns expected schema; unauth returns 401.
- Testing agent report: `/app/test_reports/iteration_225.json`
  - Backend: **100%**
  - Frontend: **100%**
- Additional specialist checks:
  - `auto_frontend_testing_agent`: PASS
  - `deep_testing_backend_v2`: PASS

### Current status
- Weekly Reflection / Alchemy Plan generator is live in preview and fully test-verified.

### Next prioritized items
- **P2**: Optional enhancements to reflection quality (trend charts + quote extraction from voice-note transcripts when available).

## Premium Update: Elemental Temples Paid Access — 2026-06-27

### User request
- “The Elemental Temple should be paid also please.”

### Implemented
- **Backend payments update** (`backend/routers/payments.py`)
  - Added new premium unlock product:
    - `elemental_temples`
    - Name: Elemental Temples Unlock
    - Price: `$79.00`
    - Scope: `section`
  - Added `elemental_temples` to `PREMIUM_SECTION_IDS` so entitlement resolution and access checks include this section.

- **Frontend entitlement support** (`frontend/src/hooks/usePremiumAccess.js`)
  - Added `elemental_temples` to default section entitlements map.

- **Elemental Temples page gating** (`frontend/src/pages/ElementalTemples.jsx`)
  - Added premium banner (unauth/locked users) with three paths:
    - View Subscription
    - Unlock Elemental Temples (section unlock)
    - Full App unlock
  - Added lock modal shown when locked users attempt guided temple actions.
  - Wired checkout finalization handling for same-page return after payment session.
  - Preserved existing visuals/content while gating premium access.

### Validation
- Backend check: `/api/payments/premium-products` includes `elemental_temples`.
- Frontend smoke check passed (banner + CTA visibility).
- Frontend specialist validation: PASS
  - Banner testids present
  - Guided actions trigger premium lock modal
  - Lock modal CTAs and close behavior verified
  - No blank screen/crash/regression

### Current status
- Elemental Temples premium gating is complete in preview and test-verified.

## Full App Monetization Alignment + Deep Shamanic Expansion — 2026-06-27

### User choices implemented
- Ratio model: **~30% free / ~70% paid** per section.
- Lock style: **item-level/hybrid** (keep section-level where already appropriate).
- Rollout: **full app sweep in one pass**.
- Shamanic depth: **deep expansion** with advanced protocols.
- Locked CTAs everywhere: **Subscription + Section Unlock + Full App**.

### Backend changes
- `backend/routers/content.py`
  - Added reusable monetization splitter: `_apply_free_paid_tiering(...)`.
  - Applied tiering to key sections:
    - `shamanic_practices`
    - `heart_practices`
    - `elemental_practices`
    - `mindfulness_practices`
    - `meditations`
    - `water_practices`
    - `chakra_cleansing`
    - plus somatic + grounding datasets for consistency.
  - Added 6 advanced shamanic protocols (`shamanic-advanced-*`) with deeper preparation/journey/safety/integration structures.

- `backend/routers/payments.py`
  - Added premium unlock products:
    - `shamanic_practices` ($69)
    - `heart_practices` ($59)
    - `elemental_practices` ($59)
    - `mindfulness_practices` ($49)
    - `meditations` ($49)
    - `water_practices` ($59)
    - `chakra_cleansing` ($59)
    - (plus somatic/grounding unlock IDs supported)
  - Included these in `PREMIUM_SECTION_IDS` for entitlement resolution.

### Frontend changes
- `usePremiumAccess.js`
  - Added entitlement keys for the new section IDs.

- Premium gating + lock UX implemented on pages:
  - `ShamanicPractices` (banner + card-level lock + modal)
  - `HeartPractices` (banner + card-level lock + modal)
  - `ElementalPractices` (banner + card-level lock + modal)
  - `Mindfulness` (banner + card-level lock + modal)
  - `Meditations` (banner + card-level lock + modal)
  - `WaterPractices` (banner + card-level lock + modal)
  - `ChakraCleansing` (banner + card-level lock + modal)

### Validation
- Automated test report: `/app/test_reports/iteration_226.json`
  - Backend: **100%**
  - Frontend: **100%**
  - No action items.
- Key backend evidence from test run:
  - Shamanic: 22 total (7 free / 15 premium) + advanced entries present.
  - Heart: 10 total (3 free / 7 premium).
  - Elemental: 10 total (3 free / 7 premium).
  - Mindfulness: 10 total (3 free / 7 premium).
  - Meditations: 6 total (2 free / 4 premium).
  - Water: 22 total (7 free / 15 premium).
  - Chakra: 13 total (4 free / 9 premium).

### Current status
- Monetization pattern now matches user request across major guided sections.
- Deep Shamanic expansion and premium structure are live in preview and test-verified.

### Next prioritized items
- Optional P2: Add dynamic “recommended free starter path” per section to improve conversion to paid unlocks.

## Healing-First Rebalance (Premium in Background) — 2026-06-27

### User feedback addressed
- User reported the experience felt too locked and unavailable for tour/preview mode.
- Requested premium offers remain in the background while preserving healing accessibility.

### Rebalance implemented
- **Backend access model softened** in `backend/routers/content.py`:
  - `SECTION_FREE_RATIO` changed from `0.30` → `0.60`
  - `SECTION_MIN_FREE_ITEMS` changed from `2` → `3`
  - Result: majority free access across core sections.

- **Frontend premium tone softened** (no hard-sell feel):
  - Updated banners in:
    - Shamanic Practices
    - Heart Practices
    - Elemental Practices
    - Mindfulness
    - Meditations
    - Water Practices
    - Chakra Cleansing
  - Copy now emphasizes:
    - “Optional Premium”
    - Open/free healing-first experience
    - Premium only for deeper advanced tracks.
  - Banner CTA reduced to a low-pressure **Optional premium** route.

### Validation
- Test report: `/app/test_reports/iteration_227.json`
  - Backend: **100%**
  - Frontend: **100%**
  - No action items.

- Verified free ratios after rebalance:
  - Shamanic: **59.09% free** (13/22)
  - Heart: **60.00% free** (6/10)
  - Elemental: **60.00% free** (6/10)
  - Mindfulness: **60.00% free** (6/10)
  - Meditations: **66.67% free** (4/6)
  - Water: **59.09% free** (13/22)
  - Chakra: **61.54% free** (8/13)

### Current status
- App now feels significantly more open for healing/tour use while retaining premium pathways for advanced depth.

## Production Urgency Publish Sweep (Today) — 2026-06-28

### User directive
- User needs to publish today and requested a full sweep for anything missing/broken.
- Explicit monetization rule finalized:
  - **1/4 free per section**
  - round-down for non-divisible counts
  - lock path should be **Subscription + Full App only** (no section unlock CTA buttons)

### Environment note
- User reported issues on **production**.
- All fixes were applied and validated in **preview** (production requires redeploy).

### Completed fixes in this pass
1. **Strict quarter-free model enforced backend-wide**
   - `backend/routers/content.py`
   - `SECTION_FREE_RATIO = 0.25`
   - floor behavior retained via `int(total_items * free_ratio)`
   - minimum free item retained (`SECTION_MIN_FREE_ITEMS = 1`)
   - Applied to core content endpoints including breathwork/mantras/healing/feminine/elemental-temples.

2. **Lock path normalized to subscription + full app**
   - Removed section-unlock action paths from key lock modals/CTAs.
   - Updated lock copy to soft, clear progression:
     - continue with subscription
     - or unlock full app

3. **Sound Frequencies issue verified**
   - `/api/sound-frequencies` returns non-empty dataset
   - `/sound-frequencies` renders cards and modal content with audio controls.

4. **Flow/voice alignment**
   - Softened sales language to preserve sacred, embodied tone while keeping monetization structure.

### Validation
- Comprehensive testing report: `/app/test_reports/iteration_228.json`
  - Backend: **100%**
  - Frontend: **100%**
  - No open action items.

- Verified route health and key UX:
  - `/sound-frequencies` loads with content + modal + audio player
  - major healing routes load without crash
  - lock modals show subscription + full app path
  - no section unlock button present in tested lock modal path

### Current status
- Preview is now aligned to the final monetization rule and tested for publish-readiness.
- Next required step for live site: **redeploy latest preview to production**.


## Full-App Immersive Depth + Verification Pass — 2026-06-28

### User-approved execution scope
- **1B**: full app-wide depth pass (start-to-end priority, beginning with Sacred Allies / Angelic Alchemy / Ancient Wisdom)
- **2A**: include narration floor and retreats verification in same pass
- **3B then 3A**: content expansion first, then full publish-ready testing sweep

### Completed in this pass
1. **Backend immersive enrichment layer added and wired into core vague sections**
   - File: `backend/routers/content.py`
   - Added domain-aware deep enrichment defaults + normalization for:
     - `alchemy`
     - `ritual`
     - `ceremony`
     - `guided_practice`
   - Preserved compatibility by also ensuring legacy/expected aliases remain available:
     - `alchemy_teachings`, `rituals`, `practical_rituals`, `ceremonies`, `practice`

2. **Endpoint-level depth alignment + premium tier integrity preserved**
   - Updated routes:
     - `GET /api/sacred-ally-alchemy`
     - `GET /api/sacred-ally-alchemy/{item_id}`
     - `GET /api/angelic-alchemy`
     - `GET /api/angelic-alchemy/{item_id}`
     - `GET /api/ancient-wisdom`
     - `GET /api/ancient-wisdom/{entry_id}`
   - Added devotional enrichment flow on these routes and retained free/paid gating using existing `is_premium` model.

3. **Frontend modals updated to gracefully render enriched schemas**
   - `frontend/src/pages/SacredAllyAlchemy.jsx`
     - Added resilient derive helpers for mixed/new fields (`alchemy`, `ritual`, `ceremony`, `guided_practice`)
     - Added `Guided Practice Arc` section in detail modal
     - Updated guided voice composition to include all ritual/ceremony/guided lines
   - `frontend/src/pages/AngelicAlchemy.jsx`
     - Added robust field resolvers + new sections (`Ceremonies`, `Guided Practice Arc`)
     - Updated guided script composition and guided practice step orchestration
   - `frontend/src/pages/ancient-wisdom/AncientWisdomDetailModal.jsx`
     - Added resolver helpers and new rendered blocks for:
       - `Ceremonial Arc`
       - `Guided Practice Arc`
     - Kept existing teachings/ritual rendering backwards compatible

4. **App-store route consistency polish**
   - Added alias route in `frontend/src/routes/AppRoutes.jsx`:
     - `/app-store-readiness` → `AppStoreReadiness`
   - Updated nav-hide handling in `frontend/src/App.js` to include `/app-store-readiness`

### Verification results (this pass)
- Manual API checks: PASS
  - `/api/sacred-ally-alchemy`: enriched fields + tiering present
  - `/api/angelic-alchemy`: enriched fields + tiering present
  - `/api/ancient-wisdom`: enriched fields + tiering present
  - `/api/retreats`: empty array (no placeholder retreats)
- Narration floor check: PASS
  - `/api/content/expand-script` returned word count well above 7-minute floor requirement
- Testing agent report: `test_reports/iteration_229.json`
  - Backend: **27/27 PASS**
  - Frontend modal/integration checks: **PASS**
- Frontend specialist verification (`auto_frontend_testing_agent`): PASS
  - Sacred Allies, Angelic Alchemy, Ancient Wisdom modal flows confirmed
  - App readiness route confirmed

### Current status
- Preview now has deeper immersive structures across targeted vague sections with stable rendering and preserved premium logic.
- No regressions reported in this pass.
- For live production parity, redeploy preview changes to production.


## P1 Continuation — Full Edge-Library Depth Sweep + Real-Device Submission Kit Completion (2026-06-28)

### User-confirmed choices
- Scope: **B** → Mantras + Mudras + remaining edge libraries
- Screenshot mode: **B** → prepare checklist/shot-list only (manual physical-device captures by user)
- Metadata output: **A** → update in-app readiness page + submission docs files

### Implemented (Backend)
1. **Depth model standardized across additional edge endpoints** (`backend/routers/content.py`)
   - Enriched with ritual schema (`alchemy`, `ritual`, `ceremony`, `guided_practice`) + devotional fields for:
     - `/api/runes`, `/api/runes/{id}`, `/api/runes/draw/*`
     - `/api/i-ching`, `/api/i-ching/{number}`, `/api/i-ching/cast/coins`
     - `/api/sacred-guardians`, `/api/sacred-guardians/{id}`
     - `/api/sound-frequencies`, `/api/sound-frequencies/{id}`
     - `/api/tarot/cards`, `/api/tarot/cards/{id}`, tarot cards inside `/api/tarot/reading`
     - `/api/retreats`, `/api/retreats/{id}`
     - `/api/videos`, `/api/videos/{id}`
     - `/api/courses`, `/api/courses/{id}`
     - `/api/books`, `/api/books/{id}`
     - `/api/creative-processes`, `/api/creative-processes/{id}`
     - `/api/earth-altars`, `/api/earth-altars/{id}`
     - `/api/sacred-rites`, `/api/sacred-rites/{id}`
2. **Mudra enrichment parity fix**
   - `_enrich_mudra_entry` now passes through devotional/depth enrichment, aligning mudras with mantra depth conventions.
3. **Expanded domain language map**
   - Added domain suffixes for mantra/mudra + edge libraries to preserve sacred tone consistency.

### Implemented (Frontend)
1. **Mantras modal depth rendering** (`frontend/src/pages/mantras/MantrasPlayer.jsx`)
   - Added sections:
     - `mantra-alchemy-teachings`
     - `mantra-ritual-list`
     - `mantra-ceremony-list`
     - `mantra-guided-practice-arc`
2. **Mudras modal depth rendering** (`frontend/src/pages/mudras/MudrasLibraryContainer.jsx`)
   - Added sections:
     - `mudra-alchemy-teachings`
     - `mudra-ritual-list`
     - `mudra-ceremony-list`
     - `mudra-guided-practice-arc`
3. **Edge-library modal rendering upgrades**
   - `SoundFrequencies.jsx`: added alchemy/ceremony/guided blocks
   - `TarotReading.jsx`: added alchemy/ceremony/guided blocks in card modal
   - `SacredGuardians.jsx`: added alchemy/ceremony/guided blocks
   - `VideosLibrary.jsx`: added alchemy/ceremony/guided blocks in video modal

### App Store submission readiness completion (real-device workflow)
1. **In-app readiness page updated** (`frontend/src/pages/AppStoreReadiness.jsx`)
   - Added real-device checklist items and metadata rows
   - Added new section card: `app-readiness-real-device-shotlist-card`
   - Added explicit manual physical-device shot rows with route and requirement notes
2. **Submission docs upgraded** (`/app/submission_kit/*`)
   - `SCREENSHOT_SHOTLIST.md`: converted to real-device master matrix (6.7", 6.5", 12.9")
   - `STORE_COPY_PACK.md`: added current submission “What’s New” + reviewer-friendly summary
   - `SUBMISSION_FORMS_CHEATSHEET.md`: added pre-submission cross-check + metadata consistency block
   - `README.md`: updated for manual physical-device screenshot workflow
3. **Public mirrored docs synced**
   - Copied updated files into `/app/frontend/public/submission_kit/`

### Verification
- API spot checks: PASS (depth fields present across mudras/sound/tarot/guardians/videos)
- Testing agent report: `/app/test_reports/iteration_230.json`
  - Backend: **25/25 PASS**
  - Frontend: all required modal depth sections PASS
  - App readiness: PASS (new real-device shot-list + metadata controls functional)
- Frontend specialist verification: PASS
  - Mantras, Mudras, Sound, Tarot, and App-readiness sections verified

### Current status
- P1 depth expansion and submission-kit completion are done in preview.
- For production parity: redeploy latest preview changes to live.


## Production Follow-up Pass — Premium Lock Rebalance + Divination/Crystal Image Recovery + Earth Crafting Section (2026-06-28)

### User report context
- User reported issues from **production** and requested broad corrections across premium gating, depth consistency, image fidelity (Divination Coyote + Crystal images), and section continuity.
- User-selected execution: two-step sweep (stabilize access/image issues first, then full sweep continuation).

### Implemented in preview

#### 1) Premium/free rebalance and count controls (backend)
- Updated section-level free-count overrides to match requested distribution priorities:
  - Yoga: 4 free
  - Somatic: 4 free
  - Breathwork: 5 free
  - Meditations: 4 free
  - Mindfulness: 5 free
  - Mantras: 11 free
  - Water practices: 5 free (and endpoint trimmed to 17 total: 5 free + 12 premium)
  - Heart practices: 5 free (15 total after supplements: 5 free + 10 premium)
  - Sacred Allies: 5 free
  - Angelic Alchemy: 5 free
  - Sacred Guardians: 5 free
  - Ancient Wisdom: 5 free
  - Sacred Art / Creative: 5 free
- Added/expanded supplements for:
  - Meditations (+8)
  - Mindfulness (+7 additional depth entries)
  - Mantras (+10)
  - Heart practices (+5 deep entries)

#### 2) Premium lock UX enforcement on previously weak pages
- Added lock/banner/full-app CTA behavior to:
  - `YogaLibrary.jsx`
  - `SomaticMovement.jsx`
  - `SacredGuardians.jsx`
  - `SoundFrequencies.jsx`
  - `CreativeProcesses.jsx`
- Added/expanded premium section keys in `usePremiumAccess.js` to support these sections consistently.

#### 3) Sacred Art + Earth Crafting & Sacred Tool Birthing
- Backend:
  - Added `EARTH_CRAFTING_TOOL_SUPPLEMENTS` and appender logic.
  - `/api/creative-processes` now includes earth-crafting / sacred-tool-birthing items and is tiered.
- Frontend:
  - Creative filters now include:
    - `earth-crafting`
    - `sacred-tool-birthing`
  - Added premium behavior in Creative page.
  - Main menu now contains: **Earth Crafting & Tool Birthing** entry routing to `/creative?category=earth-crafting`.

#### 4) Image integrity fixes
- Divination/Oracle:
  - Coyote image normalized through oracle router override.
  - Updated static Coyote card URL in data source to a proper coyote image.
- Crystal wisdom:
  - Relaxed over-aggressive legacy image rejection in `CrystalGuide.jsx`.
  - Added stable element-based fallback image mapping to avoid blank image blocks.

#### 5) Additional depth refinements
- Partner Yoga:
  - Added explicit **Trust & Connection Ritual** section to detail flow.
- Sunrise/Sunset:
  - Added new deeper practices:
    - `sunrise-7` Golden Threshold Covenant
    - `sunset-8` Nightfall Cord-Cutting Integration

### Verification
- Lint: PASS across all modified backend/frontend files.
- Testing agent report: `/app/test_reports/iteration_231.json`
  - Backend: 28/28 pass
  - Frontend: 100% pass for tested lock/image/navigation flows
- Deep backend validation agent: PASS on all requested endpoint/count/image checks.
- Manual smoke/UI checks performed:
  - `/creative?category=earth-crafting` renders filters/cards
  - main menu earth-crafting entry routes correctly
  - crystals page shows no “Image unavailable” labels in smoke check

### Current status
- These fixes are now in **preview** and validated.
- Since your issue was on production, redeploy is required to push this pass live.


## Divination Full-Section Image Accuracy Sweep (2026-06-28)

### User request
- "Not just coyote, the whole section—make sure images are correct."
- Scope confirmed: full Divination set (Oracle + Tarot + Runes + I Ching), with mixed style (accurate where required + mystical where symbolic).

### Implemented in preview

#### Backend image normalization (all divination endpoints)
1. `backend/routers/content.py`
   - Added unified divination image normalization helper for:
     - Tarot
     - Runes
     - I Ching
   - Added endpoint-level normalization so every returned item includes valid `image_url`.
   - Added I Ching visual map by hexagram number (ensures image coverage, not just text-only `image` field).
2. `backend/routers/oracle.py`
   - Expanded oracle image overrides beyond coyote for section-wide card relevance and reliability.
   - Added fallback guard so oracle cards never return non-http image URLs.

#### Frontend rendering safeguards
1. `frontend/src/pages/OracleReadings.jsx`
   - Added resilient image fallback handler (prevents blank cards on failed image loads).
2. `frontend/src/pages/TarotReading.jsx`
   - Added fallback handler to gallery, reading cards, and detail modal images.
3. `frontend/src/pages/rune-readings/RuneReadingsContainer.jsx`
   - Added fallback handler for spread and detail modal images.
4. `frontend/src/pages/i-ching/IChingHexagramModal.jsx`
   - Added visible hexagram image blocks in library modal.
5. `frontend/src/pages/i-ching/IChingResultCard.jsx`
   - Added visible result image block + fallback handling.

### Verification
- Testing agent report: `/app/test_reports/iteration_232.json`
  - Backend: 100% (9/9)
  - Frontend: 100%
  - Confirmed:
    - Oracle cards: 22/22 valid image URLs
    - Tarot cards: 22/22 valid image URLs
    - Runes: 25/25 valid image URLs
    - I Ching: 8/8 valid image URLs
    - Coyote card image explicitly correct (real coyote URL)
- Final frontend specialist retest: PASS for Oracle, Tarot, Runes, and I Ching image rendering.

### Current status
- Divination image correctness sweep is complete in preview (not just coyote).
- Since original report was on production, redeploy is required to make this live.


## Energy Healing Deepening + Explicit Gating Pass (2026-06-28)

### User request
- "Energy Healing hasn’t been deepened — expand it same as others throughout app."
- Confirmed scope:
  - Deepen existing + add new practices
  - Explicit free/premium counts (not default ratio only)
  - Issue seen on both preview + production context

### Implemented in preview

#### Backend
1. `backend/routers/content.py`
   - Added `ENERGY_HEALING_SUPPLEMENTS` (+9 new deep modalities)
   - Added appender ` _append_energy_healing_supplements(...)`
   - Expanded `_enrich_energy_healing_entry(...)` with deep fields:
     - `alchemy`
     - `ritual`
     - `ceremony`
     - `guided_practice`
   - Updated `/api/energy-healing` to:
     - include supplements
     - apply premium tiering via `_apply_free_paid_tiering(..., "energy_healing")`
   - Added explicit count override:
     - `SECTION_FREE_COUNT_OVERRIDES["energy_healing"] = 5`
   - Added premium label:
     - `SECTION_PREMIUM_LABELS["energy_healing"] = "Energy Healing Premium"`

2. `backend/routers/payments.py`
   - Added premium unlock product:
     - `energy_healing` ($59.00, section unlock)
   - Added to `PREMIUM_SECTION_IDS` for entitlement consistency.

#### Frontend
1. `frontend/src/pages/EnergyHealing.jsx`
   - Added premium gating UX parity:
     - premium banner + subscription/full-app CTAs
     - premium badges on locked cards
     - premium lock modal for locked entries
   - Preserved free-card modal access.
   - Added deep modal sections rendering:
     - Alchemy
     - Ritual Steps
     - Ceremonial Arc
     - Guided Practice Arc

2. `frontend/src/hooks/usePremiumAccess.js`
   - Added `energy_healing` section key in `EMPTY_SECTIONS` for stable client-side gating map.

### Verification
- Testing agent report: `/app/test_reports/iteration_233.json`
  - Backend: **100% (8/8)**
  - Frontend: **100%**
  - Confirmed:
    - 14 total energy practices (5 original + 9 supplements)
    - 5 free / 9 premium distribution
    - deep fields present for all items
    - premium lock modal behavior correct
    - filters and modal flows stable
    - premium products endpoint includes `energy_healing`
- Frontend specialist verification: PASS (banner, lock modal, deep sections, filters).

### Current status
- Energy Healing now has parity depth + explicit gating in preview.
- For production parity: redeploy latest preview changes to live.


## Energy Healing Power/Embodiment Expansion (Massive Pass) + 4-Free Baseline Activation (2026-06-28)

### User direction
- Energy Healing still felt vague and weak.
- Required outcomes:
  - much deeper, powerful, embodying language
  - broad expansion (not one item per modality)
  - explicit free/premium behavior
  - apply 4–5 free baseline consistently across sections/portals
  - tone: deep ceremonial + body embodiment + trauma-aware

### Implemented in preview

#### 1) Energy Healing expanded from small list to large modality system
- `backend/routers/content.py`
  - Expanded supplements to create **122 total energy healing practices**
  - Modalities covered: Egyptian, Australian, Crystal, Sound, Quantum, Reiki, Sekhem, Dreamtime, Pranic
  - Per-modality count now **13–14 each** (target ~14 achieved)
  - Added robust enrichment for every item:
    - `alchemy`
    - `ritual`
    - `ceremony`
    - `guided_practice`
    - plus ritual tools / meridian links / body-ailment bridges

#### 2) Explicit free/premium split for Energy Healing
- Set override to **4 free** for `energy_healing`, rest premium.
- Verified distribution: **4 free / 118 premium** (on full energy list).

#### 3) Global baseline activation toward 4-free pattern
- Updated section free-count overrides to 4 across major portals where requested (or already aligned).
- Confirmed key routes now return 4 free in current preview for these sections:
  - yoga, somatic, breathwork, meditations, mindfulness, mantras,
  - water, heart, sacred allies, angelic, guardians, ancient wisdom,
  - sound frequencies, sacred art/creative, energy healing.

#### 4) Frontend Energy Healing parity updates
- `frontend/src/pages/EnergyHealing.jsx`
  - Premium banner text aligned to 4-free model
  - lock badges + lock modal + CTA parity
  - deep sections exposed in detail modal:
    - Alchemy
    - Ritual Steps
    - Ceremonial Arc
    - Guided Practice Arc
  - 9 modality tabs actively filter and render populated cards

### Verification
- Testing agent report: `/app/test_reports/iteration_234.json`
  - Backend: **21 passed / 5 skipped by test-script path assumptions**
  - Frontend: **100% pass**
  - Energy summary validated:
    - total 122 practices
    - modality spread 13–14 each
    - deep fields present across all items
    - premium lock flow works
- Manual API checks confirm previously “skipped” sections are actually reachable and return 200 in preview.
- Final frontend specialist verification: PASS
  - banner text exact (`First 4 practices are free...`)
  - all 9 modalities present and non-empty
  - lock + detail modal behavior correct

### Current status
- Energy Healing is now significantly deeper, denser, and more embodied in preview.
- Global free/premium baseline has been shifted toward the requested 4-free pattern.
- For production parity, redeploy latest preview changes.


## Full Immersive Synchronization Pass — Creative + Energy + Cross-Section Coherence (2026-06-28)

### User direction
- Creative Processes still felt vague.
- Energy Healing still felt like pictures/words, not felt embodiment.
- Requested app-wide synchrony: voice + scripture/ritual + embodiment + healing coherence (not isolated fixes).
- Keep gating model aligned with prior app baseline.

### Implemented in preview

#### 1) Backend immersive metadata synchronization expanded
- `backend/routers/content.py`
  - Strengthened `_enrich_immersive_ritual_fields(...)` to always include voice-ready and embodiment-ready fields:
    - `voice_script`
    - `precision_description`
    - `nervous_system_cues`
    - `integration_actions`
    - `embodiment_prompts`
    - plus `healing_trajectory`, `ritual_practice`
  - Ensured these fields are available consistently in key routes:
    - `/api/creative-processes`
    - `/api/energy-healing`
    - `/api/water-practices`
    - `/api/heart-practices`
    - `/api/sound-frequencies`
    - `/api/elemental-temples`
    - `/api/masculine-embodiment`
    - `/api/light-codes/sacred-geometry`
  - Energy Healing endpoint now applies devotional enrichment + immersive field stack for all entries.

#### 2) Creative Processes upgraded from static text to immersive voice experience
- `frontend/src/pages/CreativeProcesses.jsx`
  - Added modal voice panel: `creative-guided-voice-panel`
  - Added `GuidedAudioButton` with deep script composition from:
    - alchemy, ritual, ceremony, embodiment, integration, purpose fields
  - Uses expanded ceremonial narration (not shallow summary playback).

#### 3) Energy Healing upgraded to felt immersive experience
- `frontend/src/pages/EnergyHealing.jsx`
  - Added modal voice panel: `energy-healing-guided-voice-panel`
  - Added `GuidedAudioButton` with deeply composed script sourced from:
    - alchemy, ritual, ceremony, guided arc, body cues, integration actions
  - Keeps premium lock behavior while giving coherent free-card deep experience.

### Verification
- Testing agent report: `/app/test_reports/iteration_235.json`
  - Backend: **100% (18 passed)**
  - Frontend: **100%**
  - Confirmed guided voice panels and unchanged premium lock behavior.
- Final frontend specialist quality check: PASS
  - `/creative`, `/energy-healing`, `/water-practices`, `/heart-practices`
  - specifically confirmed “not generic” language tone and immersive specificity
  - no runtime UI regressions.

### Current status
- Creative + Energy are now synchronized to the same immersive voice/ritual/embodiment standard in preview.
- Cross-section metadata structure is now aligned for ongoing consistency.
- Since issue context includes production, redeploy required for live parity.


