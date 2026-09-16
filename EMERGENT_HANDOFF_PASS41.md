# Shamanic Elements Soul Temple 2.0 — Emergent Handoff (Pass 41)

## Purpose
This archive is the current approved source master after Passes 32–41. Integrate/deploy THIS codebase without rolling back verified working features.

## Non-negotiable preservation
- Preserve current Google Play/TWA production architecture and package identity.
- Preserve Play Billing/subscription/lifetime purchase implementation already present.
- Preserve authentication/session handling and admin role protection.
- Preserve the Iteration 277 improvements that remain in this master.
- Do not regenerate or replace the content library with older seed/template content.
- Do not reintroduce Demo as a member-facing production tile.
- Do not replace deepened practices with generic generated templates.

## Production identity
- App: Shamanic Elements Soul Temple 2.0
- Brand: SkyWater Sacred Embodiments
- Android package: host.emergent.embodiment_journey.twa
- Production web host: https://temple-soul-dev.emergent.host/
- Privacy policy: https://temple-soul-dev.emergent.host/privacy-policy.html

## Pass 32–41 work included
- New Shamanic home/dashboard hero artwork and mobile-safe presentation.
- Android dashboard drawer scrolling refinements.
- Removed manufactured Elemental deepening filler; added genuine Shamanic deepening journeys.
- Richer Today's Sacred Practice rotation and embodied guidance.
- Full Mindful Eating practice and safer linked-practice behavior.
- Safer technique-specific Kapalabhati pacing and wording.
- Pose-Specific Embodiment Guide and yoga wording refinement.
- Mantra pronunciation/authentic-audio integrity; no oscillator presented as authentic chant.
- Guardian discernment and Shamanic journey integrity refinements.
- Power Animal image fallback repair and local asset audit.
- Guided audio voice/speed cache reset and duplicate-audio cleanup preservation.
- Session handling: temporary network failures should not force logout.
- Broken Daily Guidance and Mantra sign-in routes corrected; dashboard route audit passed.
- Somatic, Fire Temple, forest/earth/stone and other legacy health-claim refinements.
- Rose Lineage, Munay-Ki/13th Rite, Mystery School and lineage integrity work.
- Distinct Hathor, Seven Sisters/Pleiades, Sophia Dragons and Magdalene streams.
- Dedicated Isis, Bardon-inspired Hermetic and Merlin/Pagan/Avalon streams.
- Cosmic/Akashic/Light Code/DNA/Light Body integrity framing.
- Crystal, water, sound, colour and galactic legacy-modality integrity sweep.

## What Emergent should do now
1. Treat this archive as the source baseline; do NOT merge an older project snapshot over it.
2. Install dependencies using the project's existing lockfiles/tooling.
3. Run backend and frontend production builds/tests.
4. Fix only genuine build/runtime errors required for deployment; do not rewrite content or redesign working screens.
5. Test at Android/mobile width, including dashboard drawer scroll, dashboard subject cards, practice opening, Back/Home behavior, auth persistence, guided audio controls, mantra pronunciation, breathwork pacing and image loading.
6. Verify Admin is invisible/inaccessible to ordinary users and backend admin endpoints remain role protected.
7. Verify Demo is absent from member-facing production UI.
8. Verify /privacy-policy.html and /.well-known/assetlinks.json remain publicly reachable after deployment.
9. Redeploy the web app to the existing production host only after checks pass.
10. Report exactly what was changed during build/deploy. Do not mark an item fixed merely because a control renders; test its behavior.

## Important deployment note
This is a TWA-backed app. Web/content changes can reach the installed Play app through the deployed production web host. Do not create or upload a new Android AAB unless an Android wrapper/native/version change actually requires one.

## Validation before packaging
Pass 41 archive ZIP integrity passed. Earlier pass validation included backend compilation and JSON validation. A full frontend production build still needs to be run in an environment with dependencies/network available.
