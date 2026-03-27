# Test Credentials

## Admin Access
- **Admin Panel:** `/admin`
- **Password:** `ShamanicAdmin2026!`

## User Testing
- No login required for most features (public access)
- Google OAuth available for account creation
- Practice Journal uses localStorage (no auth required)
- Community posting does not require auth

## Payment Testing
- Stripe test mode enabled (`sk_test_emergent`)
- Course purchases require Google OAuth login first
- Premium courses: Munay Ki ($197), Nusta Karpay ($177), 13th Rite of Womb ($147)

## Key Test Flows
1. Courses → Click any Sacred Rite → See "Unlock Course" button at $XXX
2. Click "Unlock Course" without login → Toast "Please sign in" → Redirect to landing
3. Login via Google → Return to Courses → Click "Unlock Course" → Redirects to Stripe Checkout
4. After payment → Redirect back → Payment verification → Content unlocked
5. Sound Frequencies → Filter "Shamanic Drums" → 5 drum journeys visible
6. Creative Processes → Click "Sacred Smudging" → See safety, herb profiles
7. Practice Journal → Add entry → Expand → "Share to Sacred Circle" button
