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

## Data / Quality Rules to Preserve
- Mongo responses must exclude `_id` unless transformed safely.
- Any Mongo write objects reused in responses must be sanitized.
- Preserve factual provenance pipeline behavior and non-mocked references.
- Preserve dark sacred visual identity while keeping responsive layout integrity.

## Prioritized Backlog

### P0 (if still pending in future reports)
- Resolve any newly surfaced hook dependency warnings in timer/guided/breathwork hooks.
- Continue splitting any remaining oversized feature pages not yet modular.

### P1
- Refactor remaining parameter-heavy helpers in `routers/content.py`.
- Continue reducing cyclomatic complexity in untouched backend hotspots.

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
