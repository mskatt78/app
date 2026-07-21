# Legal Links + Reviewer Notes

Replace `<PRODUCTION_URL>` with your non-preview deployed domain.

## Public Links
- App Home: `<PRODUCTION_URL>/`
- Privacy Policy: `<PRODUCTION_URL>/privacy`
- Terms of Service: `<PRODUCTION_URL>/terms`
- Support Center: `<PRODUCTION_URL>/support`
- Demo Route (optional reviewer quick path): `<PRODUCTION_URL>/demo`

## Admin Link
- Admin: `<PRODUCTION_URL>/admin`

## Android API Compliance (Play Store reference)
- Android API contract endpoint: `<PRODUCTION_URL>/api/user/mobile/android-api-config`
- Base API path: `<PRODUCTION_URL>/api`
- Privacy + deletion endpoints:
  - `<PRODUCTION_URL>/api/account/export`
  - `<PRODUCTION_URL>/api/account/delete-request`
  - `<PRODUCTION_URL>/api/account/deletion-status`

### Reviewer API Notes (optional)
- App uses secure session cookies and supports bearer token fallback for mobile auth transport.
- CORS is explicitly origin-controlled through backend environment configuration.
- Privacy policy and deletion-request pathways are publicly documented and reachable in-app.

## Reviewer Notes Template (Paste into Store Review Notes)

This app provides guided spiritual wellness practices (breathwork, meditation, mantra, mudra, and elemental ritual journeys).

Primary reviewer flow:
1. Open Home (`/`)
2. Enter temple experience
3. Open a guided session from Somatic/Meditation/Breathwork
4. Verify spoken guidance and timer behavior
5. Open Support + Privacy + Terms pages

Optional demo flow:
- Open `/demo` for a polished overview mode.

If reviewer needs administrative verification:
- Use `/admin` route.

## Support Contact
- Support email: skywatersacredembodiments@gmail.com
