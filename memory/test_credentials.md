# Test Credentials

## Admin Access
- **Admin Panel:** `/admin`
- **Direct Admin Access:** sign in with the allowlisted app account `mskatt78@gmail.com`, then open `/admin`
- **Fallback Admin Login:** `/admin/login`
- **Password:** `ShamanicAdmin2026!`
- **Admin Seeding API:** `POST /api/admin/seed-database` (requires admin JWT token)
- **Seed Status API:** `GET /api/admin/seed-status` (requires admin JWT token)
- **Live Session Manager:** `/admin/manage/live_sessions`
- **13 Moon Paths Manager:** `/admin/manage/astrology_months`

## Temporary QA User (March 2026)
- **Email:** `demoqa_740fefc1@example.com`
- **Password:** `DemoPass123!`
- **Use for:** `/settings` account export + deletion request verification, general authenticated smoke testing

## Voice Sync QA User (June 2026)
- **Email:** `voice.sync.qa@example.com`
- **Password:** `Pass1234!`
- **Use for:** object-storage voice notes, `/api/practice-journal` persistence, `/api/voice-files`, `/api/voice-profiles`

## User Testing
- No login required for most features (public access)
- Google OAuth available for account creation
- Practice Journal uses localStorage (no auth required)
- Community posting does not require auth

## Payment Testing
- Stripe test mode enabled (`sk_test_emergent`)
- Course purchases require Google OAuth login first
- Premium courses: Munay Ki ($197), Nusta Karpay ($177), 13th Rite of Womb ($147)
- Course Bundle: All 3 Sacred Rites ($397)

## Video Categories (51 total videos)
- Angel Guidance: 4 videos
- Aromatherapy: 5 videos
- Art Therapy: 6 videos
- Colour Therapy: 5 videos
- Plus 9 original categories: feminine, chakra, kundalini, drumming, etc.

## Key Test Flows
1. Courses → Click any Sacred Rite → See "Unlock Course" button at $XXX
2. Click "Unlock Course" without login → Toast "Please sign in" → Redirect to landing
3. Login via Google → Return to Courses → Click "Unlock Course" → Redirects to Stripe Checkout
4. After payment → Redirect back → Payment verification → Content unlocked
5. Sound Frequencies → Filter "Shamanic Drums" → 5 drum journeys visible
6. Creative Processes → Click "Sacred Smudging" → See safety, herb profiles
7. Practice Journal → Add entry → Expand → "Share to Sacred Circle" button
8. **Videos Library → Click "Angel Guidance" → See 4 angel meditation videos**
9. **Admin → Login → POST /api/admin/seed-database with {"force": true} → Reseeds videos**
