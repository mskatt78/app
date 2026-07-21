# Final Release QA Script (10–15 Minutes)

Run this on a real phone and one desktop browser before final submission.

## A. Navigation + Core Launch
- [ ] Home loads fast
- [ ] Main CTA enters app without blank states
- [ ] Top navigation works

## B. Guided Audio Reliability
- [ ] Start one guided session from Somatic/Meditation flow
- [ ] Confirm narration starts and timer runs
- [ ] Pause/resume works
- [ ] Exit closes immediately

## C. Scroll + Mobile UX
- [ ] Guided content panel scrolls on mobile
- [ ] No clipped/cutoff text on narrow screens

## D. Sound Options
- [ ] Mantras shows natural sound options
- [ ] PracticeTimer sound selector works
- [ ] Last selected sound persists after reopen/reload

## E. Legal + Support
- [ ] `/privacy` opens
- [ ] `/terms` opens
- [ ] `/support` opens

## F. Install Access
- [ ] Install CTA visible on landing
- [ ] Install action visible on inner pages (TopNav)

## G. Admin Path
- [ ] `/admin` route opens

## H. Final Copy Check
- [ ] No unwanted demo script on landing cover

## I. Android API Contract Verification
- [ ] Open `/api/user/mobile/android-api-config` and verify JSON contract returns 200
- [ ] Confirm `required_public_endpoints` include core guided routes (`/api/tts/generate-base64`, `/api/content/expand-script`)
- [ ] Confirm privacy/deletion endpoints are listed under `privacy_and_account_deletion`

When all checks are complete, proceed to store submission.
