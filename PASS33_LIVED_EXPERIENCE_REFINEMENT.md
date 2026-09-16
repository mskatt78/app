# Pass 33 — Lived Experience Refinement

Built from Pass 32 current live master. Pass 32 remains untouched.

## Implemented
- Daily Sacred Practice now combines two rotating teaching lenses rather than one repetitive template.
- Added rotating Element focus, Spiritual Anatomy focus, embodied ritual, and reflection to the daily lens.
- Replaced remaining daily-lens emotional `release` wording with `shed / let go` language.
- Mindful Eating expanded into a complete 10-stage sensory/body-aware ritual; removed the promised `Better digestion` benefit.
- Mindfulness detail dialog now shows the actual step-by-step practice before starting.
- Existing database Mindful Eating entries receive the deeper version at API runtime, so a reseed is not required.
- Kapalabhati rewritten around active exhale/passive inhale, gentle beginner rounds, rest and clear stop/caution guidance; removed lung-cleansing, detox/DNA-repair and physiological kundalini claims from this entry.
- Existing database Kapalabhati receives the corrected version at API runtime.
- Yoga UI label changed from generic `Master Embodiment Protocol` to `Pose-Specific Embodiment Guide`; existing pose-specific protocol builder retained.
- Power Animal Journey now uses the bundled local subject-specific image and has an on-error fallback, preventing the broken remote image seen in mobile QA.
- Active seed wording for Shake and Release softened to body-memory/expression language rather than claiming stored trauma is expelled.

## Preserved
- Pass 32 home artwork and mobile drawer fixes.
- Iteration 277 audio controls, breath pacing, premium/access and route architecture.
- Existing admin role protections.
- Pass 32 genuine Shamanic deepening entries and Elemental duplicate suppression.

## Validation
- Python backend compileall: PASS.
- JSON parse checks: PASS.
- Frontend source syntax was inspected; a full production npm build was not run in this environment.

## Next refinement group
- Mantra authenticity/audio content audit.
- Guided audio behaviour/echo and duration behaviour audit.
- Broader Yoga pose-depth spot checks.
- Guardians/Shamanic content and route surfacing.
- Remaining broken image/route/session navigation audit.
