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

### P2
- Replace any remaining array index-as-key usage in visualizer components.
- Add `mypy` check to CI path for typed backend modules.
- Optional custom voice-upload pipeline for guided sessions.

## Next Execution Checklist
1. Run lint + targeted regression test after any new refactor wave.
2. Keep one-screen smoke check before full testing-agent pass.
3. Maintain `data-testid` coverage for all interactive/critical UI.
4. Keep retreat seeding disabled unless explicitly requested by owner.

## Owner/Admin
- Primary admin email: `mskatt78@gmail.com`
- Unified admin portal path: `/admin`
