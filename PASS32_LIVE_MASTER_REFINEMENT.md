# Pass 32 — Live Master Refinement

Baseline: `SoulTemple_CURRENT_LIVE_MASTER.zip` exported from the deployed Emergent codebase after Iteration 277.

## Implemented
- Added the approved Shamanic Elements Soul Temple 2.0 / SkyWater Sacred Embodiments home artwork as a local production asset.
- Added a mobile-safe dashboard hero using `object-contain` so title, animal guardians, central figure and SkyWater branding are not cropped.
- Hardened the dashboard's separate legacy mobile drawer for Android: `100dvh`, internal `overflow-y-auto`, `min-h-0`, touch pan, momentum scrolling and safe-area bottom padding.
- Preserved role-gated Admin rendering already present in the Iteration 277 source; backend admin router also retains authenticated admin checks.
- Added three genuine Shamanic deepening arcs that extend existing practices rather than repeating/renaming them: Ally Dialogue, Stone Council, and Tidal Listening.
- Marked `elemental_practices` uncapped so the generic tier-padding engine no longer manufactures repeated Elemental “Deepening” cards merely to hit a target count.
- Refined first-arrival wording from “release through the mouth” to “breathe out through the mouth”.

## Preserved from Iteration 277
- Six grouped dashboard subject sections.
- No Demo/Admin member tile for ordinary QA user.
- Guided player Voice/Speed/Duration controls and independent Voice/Ambient sliders.
- Slow & Soft breathwork pacing.
- Mindfulness linked practice routing.
- Mantra pronunciation audio behavior.
- Pose-specific yoga protocol work.

## Validation
- Python backend compileall: PASS.
- `backend/routers/content.py` compile: PASS.
- New artwork present under `frontend/public/images/`.
- Frontend production build not run in this environment because exported source does not include `frontend/node_modules`.
