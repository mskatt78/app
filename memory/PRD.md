# Shamanic Elements Soul Temple 2.0 — Product Requirements Document

## Overview
A comprehensive full-stack spiritual wellness application featuring yoga, somatic movements, oracle readings, breathwork, meditations, shamanic practices, elemental healing, and advanced healing modalities. Built with React, FastAPI, and MongoDB.

## Tech Stack
- **Frontend:** React, Framer Motion, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI, MongoDB (Motor Async)
- **Auth:** Google OAuth (Emergent-managed) + Custom JWT Admin Auth
- **Payments:** Stripe Checkout (emergentintegrations library)
- **Integrations:** OpenAI TTS, Gemini Image Gen (Nano Banana), Emergent Object Storage
- **PWA:** Full manifest with app store ready icons

## Latest Changes (March 2026)
- **Final App Store Polish Sweep Completed (Iteration 80):**
  - Expanded `/app-readiness` into a two-track launch command center with both **Submission Asset Checklist** and **Release QA Checklist** (iOS Safari install, Android install, legal/mobile checks, guided-session smoke check, offline fallback).
  - Added persistent launch confidence summary and improved release navigation links to support final submission workflow.
  - Upgraded `/support` with dedicated **Android install instructions** in addition to iOS install guidance.
  - Refined `/privacy` layout and content structure for cleaner store-review readability and added explicit account export/deletion guidance.
  - Added final PWA metadata polish in `public/index.html` (`color-scheme: dark`, `apple-touch-fullscreen`) and global overflow safeguards in `index.css` to prevent horizontal clipping on mobile.
  - Navigation testability hardening: added missing `data-testid` coverage for critical `TopNav` interactions and menu actions.
  - Validation: **Iteration 80 passed 100% frontend checks** (App readiness, localStorage persistence, support/privacy flows, nav interactions, mobile/desktop overflow, PWA metadata).

- **Route-Layer Decomposition Completed (Iteration 79):** Split monolithic `App.js` into dedicated routing modules:
  - `frontend/src/routes/AppRoutes.jsx` (all route definitions)
  - `frontend/src/routes/routeGuards.jsx` (`AuthCallback`, `PublicRoute`, `ProtectedRoute`, `AdminRoute`)
  - `App.js` now focuses on app shell + nav visibility + providers only.
- **Full Regression Post-Split:** Iteration 79 passed 100% (backend 10/10, frontend 10/10) with no route regressions.
- **Full Continuation Pass Completed (Iteration 78):** Added CI security guardrails (`/app/security/security_guardrails.py` + `.github/workflows/security-guardrails.yml`) to automatically block MD5, `shell=True` subprocess, hardcoded test secret patterns, and unsafe token localStorage usage.
- **Oversized Component Modularization (Phase Progress):**
  - Extracted Guided narration helpers into `components/guided/guidedNarrationUtils.js`
  - Extracted PracticeTimer helper logic into `components/timer/practiceTimerUtils.js`
  - Extracted Courses constants into `pages/courses/courseConstants.js`
  - Extracted BirthChart utility logic into `pages/birthchart/birthChartUtils.js`
  - Added shared client storage utility `utils/clientStorage.js`
- **Frontend Security Hardening Expanded:** Migrated auth-token retrieval to session-first secure storage utility with localStorage backward migration path; integrated across Admin and Courses flows.
- **Hook Dependency Quality Sweep (additional):** Refactored `AdminCMS` and `BirthChart` fetch effects to `useCallback`-backed patterns with explicit dependencies.
- **Broad Regression Validation:** Iteration 78 completed with backend `45/45` and frontend `8/8` passes (no regressions).
- **Code Review Security Pass (Iteration 76):** Implemented all critical recommended fixes from static review:
  - Circular import removed (`routers/admin.py` now uses `routers/dependencies.get_db`)
  - Shell-injection risk removed in `tests/test_reviews.py` (`subprocess` now uses list args, `shell=False`, JSON-escaped payloads)
  - Hardcoded test credentials replaced with env-backed shared config (`backend/tests/test_security_config.py`) and updated priority test files
  - React hook dependency hardening in high-priority UI files (`YogaLibrary.jsx`, `GuidedPracticeOverlay.jsx`, `PracticeTimer.jsx`)
- **Additional Security Hardening:**
  - Replaced MD5 cache keys with SHA-256 in `routers/tts.py` and `routers/audio.py`
  - Replaced insecure `random` usage with `secrets`-backed helpers in `routers/user.py`, `routers/oracle.py`, `routers/content.py`
  - Migrated admin token storage from `localStorage` to safer `sessionStorage` with backward-compatible migration in `adminSession.js`, plus corresponding usage updates in `AdminLogin`, `AdminSection`, and `App.js`
- **Test Suite Cleanup:** Fixed stale endpoint paths in `test_refactored_backend.py` (`/api/retreats`, `/api/videos`, `/api/live-sessions`, `/api/courses`).
- **Water Practices Empty-State Recurrence Fixed (Iteration 74):** Implemented robust frontend category normalization aliases (`rituals→ritual`, `moon water→moon`, etc.) and category-specific fallback refetch when a selected tab appears empty. Verified all 7 categories load correctly on desktop + mobile.
- **Apple Install Flow Hardened (Iteration 73):** Fixed iPhone/iPad install friction with robust iOS + iPadOS desktop-mode detection, Safari-vs-non-Safari handling, copy-link helper for non-Safari iOS browsers, persistent reopen install chip after dismiss, and explicit 4-step Apple install instructions in Support Center.
- **Downloadable App Store Submission Kit Created:** Added `/app/submission_kit/` with complete ready-to-use docs (store copy, screenshot shotlist, legal/reviewer notes, forms cheatsheet, release QA script, and asset tracker) and packaged as `/app/app_store_submission_kit.zip` for one-click handoff.
- **Natural Sound Options Restored (Iteration 72):** Reintroduced Breathwork-style natural sound set in Mantras (`Ocean Waves`, `Forest Rain`, `Forest & Birds`, `Gentle Wind`, `Crackling Fire`, `Silence`) and added matching selector to shared `PracticeTimer` where picker was missing.
- **Last-Used Sound Persistence:** Implemented persistent natural sound preference via `localStorage` key `preferred-natural-sound` (works across close/reopen and page reload).
- **Landing Cover Demo Script Removed (Iteration 71):** Removed all demo-related script elements from Landing cover per owner request — deleted demo badge/label and demo button while preserving core CTA (`Enter the Temple`) plus Support/Install actions. `/demo` route remains available separately.
- **Critical Audio Reliability Fix (Iteration 69):** Resolved "scripts visible but no audible guidance" by switching frontend expansion calls to `use_ai: false` for fast fallback mode, reducing first narration segment size for faster TTS startup, and adding playback retries/tap-to-enable fallback states. Verified narration starts in ~1.4s (previously 25+ seconds).
- **Install Option Restored Across Entry Points:** Added explicit `Install App` CTA on Landing page and persistent `Install` action in TopNav so install access no longer disappears even when install prompt is dismissed.
- **Guided Script Repetition Fully Resolved (Iteration 66):** Refactored backend fallback generator to use 4 structural paragraph variants, context queue consumption (instead of hard cycling), expanded phrase banks, and stronger de-duplication. Result: prior repetitive stems reduced to `0x`, source text repetition reduced from `11–22x` to `2–4x`, and long-form quality stabilized.
- **Frontend Narration Fallback Quality Upgrade:** Upgraded local `GuidedPracticeOverlay` narration planner with better step/context separation and less template-like repetition during pre-expansion display states.
- **Final App-Readiness Command Center Added:** New public `/app-readiness` route with persistent launch checklist (localStorage), progress tracking, reset flow, and direct links to Demo/Support/Privacy/Terms.
- **Submission Placeholder Workflow Enabled:** Added explicit asset-prep checklist items (icon, iPhone/iPad screenshots, listing copy, legal URLs, reviewer demo flow) so store submission requirements are tracked in-app.
- **Navigation Coverage for Launch Ops:** Linked app-readiness from Support Center and Footer to ensure owner/admin can quickly access launch status from anywhere.
- **PWA Manifest Polish:** Added maskable purpose to 1024 icon and added App Readiness shortcut entry.
- **Guided Parity Upgrade — Mantras + Mudras:** Added immersive "Begin Guided Practice" flows in both Mantras and Mudras detail dialogs, now launching the same full-screen `GuidedPracticeOverlay` used across core healing modules.
- **Therapeutic Depth Cards Added:** Both sections now include explicit `Why this heals` and `Integration` cards for stronger philosophical and practical alignment with deep-content standards.
- **Accessibility Polish:** Fixed Mudras dialog accessibility warning by adding required dialog title semantics.
- **Guided Narration Backend Expansion Route (P0 fix):** Added `POST /api/content/expand-script` to generate long-form guided narration payloads (paragraphs + segments) with strict duration alignment at `120 words/min` and a hard floor of `7 minutes` minimum. This prevents short 1–2 minute scripts on longer practice cards.
- **GuidedPracticeOverlay Stability Refactor:** Moved script expansion orchestration out of heavy frontend-only generation flow. Overlay now requests backend-expanded narration before auto-start, then streams segmented TTS continuously. This reduces UI blocking risk and keeps auto-guided flow fully hands-free.
- **Retreat Cleanup for Owner Control:** Legacy placeholder retreats were cleared so `/api/retreats` starts empty for owner-managed entries in admin.
- **App-Store Readiness Legal Sweep:** Added dedicated `/terms` page, wired Terms links in footer and support center, and refined mobile meta viewport/format-detection for stronger submission readiness.
- **Breathwork Soundscape Selector**: Breathwork now includes an in-player sound choice instead of only the healing pitch/tone. Added simple V1 nature sound options — Ocean Waves, Forest Rain, Forest & Birds, Gentle Wind, Crackling Fire, plus Silence — while keeping the original healing frequency tone available.
- **Element-Based Breathwork Defaults**: Active breathwork sessions now auto-suggest a soundscape by element (Earth=nature, Water=ocean, Fire=fire, Air=wind, Spirit=rain) and keep mute/play/pause/reset behavior working cleanly.
- **Single Admin Link UX**: `/admin` is now the main owner entry point, surfaced from the app with admin shortcuts in the navigation and dashboard for allowlisted owner emails. `/admin/login` remains as a hidden fallback.
- **Polished Demo Experience**: Added a public `/demo` route with a presentation-ready showcase of live spaces, courses, crystals, and Light Codes so the app can be shown without making viewers sign in first.
- **App-Store Readiness Polish**: Added a public `/support` center, improved install prompt copy and iOS handling, updated manifest shortcuts and mobile viewport behavior, and added signed-in account tools for privacy export and account deletion requests from Settings.
- **Account Compliance Tools**: Added backend endpoints for `/api/account/export`, `/api/account/deletion-status`, and `/api/account/delete-request`, plus admin visibility for `account_deletion_requests`.
- **Direct Admin Access for App Owner**: `/admin` now supports session-based admin access for allowlisted emails, including `mskatt78@gmail.com`, while still preserving the fallback password login at `/admin/login`.
- **Whole-App Admin Dashboard Upgrade**: Expanded admin quick access for Courses, 13 Moon Paths, Yoga Library, Live Client Spaces, and media management. Added admin collection support for `live_sessions` and `astrology_months`.
- **Live Client Spaces Added**: Added public live session APIs and frontend experiences for live yoga, workshops, and Q&A rooms with embedded video support via admin-provided embed URLs, RSVP capture, chat, and Q&A threads.
- **PracticeTimer Precision Fix**: Rewrote `PracticeTimer.jsx` to use a real-clock session countdown instead of step math that could freeze or finish early. This now keeps advertised durations exact across Shamanic, Grounding, Elemental, and Sunrise/Sunset guided timers, while still supporting skip, pause, ambient audio, and auto-narration.
- **GuidedPracticeOverlay Precision + Autostart**: Updated `GuidedPracticeOverlay.jsx` to use a real end-time countdown, auto-start the guided session, and let ambient audio continue after TTS finishes so the session remains active for the full advertised duration.
- **Light Codes Deep Content Expansion**: Enriched backend `LIGHT_CODES` entries with `why_this_heals`, `ancient_traditions`, `extended_teachings`, `practice_guide`, `lineage`, and `healing_lens`, with especially deep content for DNA Activation Helix and core sacred geometry symbols.
- **Light Codes UI Redesign**: Rebuilt `LightCodes.jsx` with richer category philosophy panels, deeper symbol cards, and a multi-tab modal experience (Essence, Why It Heals, Ancient Traditions, Practice Guide) to bring Light Codes in line with Crystals and 5 Elements.
- **Crystal Guide Deep Content**: All 27 crystals now have full depth matching the rest of the app — `why_this_heals` (philosophical/scientific explanation), `extended_teachings` (historical/cultural context across ancient Egypt, Greek, Roman, Indigenous etc.), `practice_guide` (step-by-step ritual instructions). Frontend switched from basic `/api/crystals` to `/api/crystals/deep`, rendering all rich content: healing properties (physical/emotional/spiritual), cleansing methods, chakra work, rituals, crystal combinations, zodiac/origins, warnings, and a "Begin Guided Crystal Practice" button launching GuidedPracticeOverlay.
- **Meditations.jsx**: Replaced inline timer with full-screen `GuidedPracticeOverlay`. Timer now shows exact countdown matching card duration.
- **SomaticMovement.jsx**: Same fix — replaced old elapsed-timer with `GuidedPracticeOverlay`.
- **Creative Processes Bug Fix**: Replaced inline PracticeTimer-inside-modal with GuidedPracticeOverlay. No more blank screen trap. All 12 processes now launch full-screen guided mode.
- **5 Elements Deep Content**: Added "Why It Heals" (scientific: earthing, vagus nerve, Bohr Effect, separation wound) + "Ancient Traditions" (cross-cultural: Egyptian, Chinese, Vedic, Celtic, Indigenous, Norse, Sufi) to all 5 elemental temples. Both tabs appear first in the navigation.

- **Production Optimizations**: GZip compression middleware (avg 58% size reduction), MongoDB indexes for users/practice_history/community/content, Service Worker upgraded to v2.

## Core Features (All Implemented)

### Sacred Rites — Premium Courses (Updated March 2026)
- **3 Sacred Rite courses** with Stripe payment integration:
  - Munay Ki ($197) — 9 Great Rites of Initiation
  - Nusta Karpay ($177) — 7 Goddess Rites of the Divine Feminine  
  - 13th Rite of the Womb ($147) — The most ancient feminine healing rite
- Each course has **7 tabs**: The Rites | Rituals | Embodiment | Prepare & Integrate | Daily Practice | 40-Day Journey | Safety
- **Premium lock UI**: "Sacred Course" badge, "Unlock Course" button
- `is_premium: True` flag on all 3 courses with Stripe checkout integration
- **Content locking**: Rites, Rituals, Embodiment, Daily, Calendar tabs locked for non-purchasers
- **Public tabs**: Safety and Prepare & Integrate always accessible

### Payment System
- Stripe Checkout integration via emergentintegrations library
- One-time course purchases stored in `user_purchases` collection
- Monthly ($19.99) and Yearly ($149.99) subscription plans
- PayPal as alternative payment method
- Payment status polling after Stripe redirect

### Dashboard (Updated March 2026)
- **Practice Streak Widget**: Flame + streak count + week dots (Mon-Sun) + milestone badges
  - Milestones: 3-Day Seeker, 7-Day Guardian, 14-Day Fortnight Keeper, 21-Day Initiation, Sacred 40
  - Reads from localStorage journal entries
  - Quick "Journal" CTA button

### Sound Healing (Updated March 2026)
- 17 sound frequency entries including 6 Shamanic Drum types
- **"Shamanic Drums" filter tab** in Sound Frequencies page

### Creative Processes (Deep Content)
- 9 comprehensive practices with safety, why_this_heals, preparation, integration
- **Sacred Smudging & Space Clearing** — standalone deep guide with 6 herb profiles

### Practice Journal (Updated)
- Streak milestones: 3, 7, 14, 21, 40-day badges
- **Share to Sacred Circle** → POST /api/community/posts

### Video Tutorials (Updated March 2026)
- **51 video entries** seeded across **13 categories** with real YouTube URLs
- **New categories added**:
  - Angel Guidance (4 videos) — Archangel meditations, angelic connection
  - Colour Therapy (5 videos) — Chromotherapy, color healing meditation
  - Aromatherapy (5 videos) — Essential oil meditation, breathwork with oils
  - Art Therapy (6 videos) — Mindful drawing, bilateral art, creative meditation
- Videos Library page with dark theme matching app aesthetic
- Category filters, YouTube thumbnail previews, embedded player modal

### Admin Database Seeding (NEW March 2026)
- **POST /api/admin/seed-database** — Admin endpoint to trigger database seeding
  - Can seed all collections or specific ones
  - `force=true` option to overwrite existing data
  - Safe for production with progress tracking
- **GET /api/admin/seed-status** — Shows current database state for all collections

## Key API Endpoints
- `GET /api/courses` — 3 Sacred Rites with prices and premium flags
- `GET /api/courses/{id}` — Full course content
- `POST /api/payments/create-checkout` — Create Stripe checkout session (auth required)
- `GET /api/payments/status/{session_id}` — Check payment status
- `GET /api/payments/course-access` — Get user's purchased courses (auth required)
- `GET /api/payments/check-access/{product_type}/{product_id}` — Check specific course access
- `GET /api/payments/plans` — Get subscription plans

## Key DB Schema
- `courses`: 3 sacred rites with prices, rites, rituals, embodiment_practices
- `user_purchases`: user_id, product_type, product_id, purchased_at
- `payment_transactions`: session_id, amount, status, metadata
- `user_subscriptions`: user_id, plan_id, status, expires_at

## Completed Work (March 2026)
- [x] Stripe payment integration for premium courses
- [x] Course access checking and content locking
- [x] Extended Munay Ki course with 2 new rituals (Fire Ceremony, Lineage Healing)
- [x] Updated course prices: $197, $177, $147
- [x] Frontend purchase flow with payment status polling
- [x] Fixed /auth route redirect issue
- [x] **Beautiful Feminine Aesthetic Redesign** for Sacred Rites:
  - Warm ivory background (#FDFBF7) with terracotta (#A96F6A) accents
  - Cormorant Garamond serif typography for elegant headings
  - Stunning hero with goddess imagery
  - Premium course cards with aspect-[4/5] images
  - Elegant tabs with clean underline styling
  - "Begin Your Initiation" CTA with soft gold accents
- [x] **Practice Journal Feminine Redesign**
- [x] **Sound Frequencies Feminine Redesign**
- [x] **Dashboard Feminine Redesign**
- [x] **31 Real YouTube Videos** across 12 categories:
  - Chakra healing (4), Kundalini (3), Feminine embodiment (5), Shamanic drumming (3)
  - Plus existing: meditation, breathwork, somatic, movement, sound, creative, shamanic
- [x] **Course Bundle Feature**: All 3 Sacred Rites for $397 (save $124)
  - Backend bundle support in payments.py
  - Auto-grants access to all courses on bundle purchase
  - Beautiful bundle CTA on courses page
- [x] **Landing Page Feminine Redesign**:
  - Full-screen yoga hero with mountain backdrop
  - "Shamanic Elements Soul Temple" elegant typography
  - Feature sections: Yoga, Sacred Rites, Sound Healing, Feminine Embodiment
  - Auth modal with Google + email login
- [x] **Menu Page Feminine Redesign**:
  - Featured "Sacred Rites & Initiations" banner
  - Organized sections with warm icon colors
  - Sign in button with soft styling
- [x] **Videos Library Page** (NEW):
  - Beautiful feminine aesthetic with mountain hero
  - 9 category filters: All, Feminine Embodiment, Chakra, Kundalini, Shamanic Drums, etc.
  - Video cards with YouTube thumbnails, duration, level badges
  - Embedded YouTube player modal with video info
  - "YouTube" external link button
- [x] **Deployment Fix**:
  - Fixed corrupted .gitignore (removed *.env patterns and -e artifacts)
  - Added test_credentials.md to .gitignore for security
  - All deployment checks now pass

## Remaining Backlog
- **P1**: Continue guided-section parity pass for remaining lighter sections (beyond Mantras/Mudras) to match deep-content tone used in Crystals/Elements/Light Codes
- **P1**: Build a richer guided demo account layer if you want a seeded faux dashboard / onboarding journey beyond the current public polished demo route
- **P1**: Final app-store submission assets pass (store screenshots, icon pack QA, listing copy)
- **P2**: Subscription-based access to all premium content (all-in-one membership)
- **P2**: Add a Sacred Journey Progress tracker to the dashboard if approved
- **P2**: Add a dedicated real-time video provider if true two-way in-app conferencing is desired beyond embed URLs + in-app RSVP/chat/Q&A
- **P3**: Add more crystal profiles (at 27, can expand to 30+)
- **P3**: Production deployment optimization

## Completed Work (March 2026 - Session 4 — Guided Practice Player)
- [x] **Full-Screen Guided Practice Player** (all practices):
  - `GuidedPracticeOverlay.jsx` — full-screen immersive player (z-200, covers TopNav)
  - Session timer (e.g. "14:56 remaining") + step counter ("Step 1 of 8") + per-step countdown
  - Step instruction text, step progress bar, overall progress bar
  - 5 controls: Restart, Play/Pause (large amber), Skip, Mute, Eye toggle
  - Practice Speed: Slow / Normal / Fast
  - Exit Practice button at bottom + X close at top
  - Element-themed gradient background (earth=emerald, water=blue, fire=orange, air=sky, spirit=violet)
- [x] **Auto TTS Narration per step** — each step auto-generates OpenAI TTS (nova voice) and plays automatically. Shows "Narrating step..." indicator. Added `autoNarrate` prop to `PracticeTimer.jsx`.
- [x] **Integrated into all practice pages:**
  - Chakra Cleansing: "Guided Practice" button in modal → parses `cleansing_guide` into steps
  - Water Practices: "Start Guided Practice" button → uses `steps` array directly  
  - Elemental Practices: sparkle button for full-screen mode (in addition to inline PracticeTimer)
  - Courses — Daily Practice tab: "Start Guided Practice" button (for purchased courses)


- [x] **27 Deep Crystal Profiles** (up from 20): Added Aquamarine, Kunzite, Iolite, Amazonite, Howlite, Kyanite, Angelite — each with full meditation, ritual, chakra, cleansing, and combination guidance
- [x] **"Share to Sacred Circle" button** on Chakra Cleansing and Courses modals:
  - Reusable `ShareToCircle.jsx` component with reflection textarea, author name, element selector
  - Posts to `/api/community/posts` with element, author_name, and tags now correctly persisted
  - Success toast + modal auto-close on submit


- [x] **Community Threading & Replies (P2)**:
  - Post cards show live like count + reply count badges
  - Post detail modal: Like button, toggle replies section, full replies list, reply form (name + content + submit)
  - Backend: `POST /api/community/posts/{post_id}/replies` — pushes to MongoDB comments array
  - Real-time UI update (no page reload needed)
- [x] **Today's Sacred Practice Widget (Dashboard Enhancement)**:
  - New `SacredPracticeWidget` component in `Dashboard.jsx` (authenticated users)
  - Fetches `/api/daily-practice` — shows moon phase, day theme, morning/evening practice cards
  - Each card navigates to relevant practice page
- [x] **20 Deep Crystal Profiles (P3 expanded)**:
  - Added 5 new full profiles: Lepidolite, Rhodonite, Fluorite, Chrysocolla, Sunstone
  - Total: 20 deep crystals with complete meditation, ritual, chakra, and combination guidance
  - Auto-seeded on backend startup from `crystals_deep.py`


- [x] **40-Day Journey now visible in Courses UI** (was P0 bug):
  - Added 3 missing tabs to course detail modal: Daily Practice, 40-Day Journey, Safety
  - 40-Day Journey tab: Phase 1 (teaser) always visible, Phases 2-4 locked for non-purchasers with blur + Unlock CTA
  - Daily Practice tab: First 3 steps visible as teaser, remaining locked for non-purchasers
  - Safety tab: Always fully visible (public precautions content)
  - All 3 tabs use existing backend data (already in DB from `sacred_rites_deep.py`)
- [x] **Chakra Guided Meditation Audio Narration** (was P1):
  - Volume2 "Listen" button added to every expandable section in Chakra Cleansing modal
  - Calls `/api/tts/generate-base64` with section text via Emergent LLM Key (OpenAI TTS nova voice)
  - Audio renders as inline HTML audio player when ready; toggle clicks stop playback
  - Blob URLs cleaned up on modal close

- [x] **Archangel Oracle System** (NEW - Full Divination Feature):
  - 15 Archangels with deep spiritual content matching Oracle/Tarot depth
  - Each archangel includes: Domain, Message, Love Guidance, Invocation, Prayer, Affirmation, Signs of Presence
  - Single Archangel and Trinity (3-card) reading spreads
  - AI-powered divine interpretations using Claude
  - Browse All feature to learn about each archangel
  - Shadow/reversed meanings for deeper guidance
  - Crystal, color, element, and chakra associations
  - Frontend page at `/archangels` with dark theme
  - Added to Main Menu under "Divination & Guidance"
- [x] **Admin Database Seeding Route**:
  - POST /api/admin/seed-database — Seeds all or specific collections
  - GET /api/admin/seed-status — Shows database collection counts
  - Safe for production with force flag option
- [x] **4 New Video Categories with 20+ Real YouTube Videos**:
  - Angel Guidance: Archangel Uriel, Archangel Michael meditations
  - Colour Therapy: Chromotherapy, color wash meditation, chakra colors
  - Aromatherapy: Essential oil meditation, citrus uplift, sacred oils
  - Art Therapy: Bilateral drawing, mindful art, intuitive scribble
- [x] **Videos Library Dark Theme Fix**:
  - Converted from light feminine theme to dark Shamanic Elements aesthetic
  - Category filters with unique icons for each new category
  - Consistent with app's dark theme CSS variables

## Earlier Completed Work (March 2026)

## Architecture
```
/app/
├── backend/
│   ├── data/
│   │   ├── sacred_rites_deep.py — 3 rites with extended rituals
│   │   ├── video_content.py — 51 video tutorials (13 categories)
│   │   ├── archangel_oracle.py — 15 Archangels with deep content (NEW)
│   │   ├── creative_processes_deep.py — 9 deep practices
│   │   ├── divination_content.py — Light Codes and symbolic systems, now enriched with deep teachings
│   ├── routers/
│   │   ├── admin.py — Admin auth, content CRUD, uploads, and owner access
│   │   ├── content.py — public content + live session APIs + Light Codes
│   │   ├── oracle.py — Oracle + Archangel Oracle endpoints
│   │   ├── payments.py — Stripe/PayPal checkout, course access
│   │   ├── user.py — settings, rituals, favorites, account export, and deletion requests
│   ├── server.py — startup seeding
├── frontend/
│   ├── src/components/
│   │   ├── admin/adminSession.js — owner /admin session bootstrap helper
│   │   ├── AppFooter.jsx — support/privacy/legal links
│   │   ├── AmbientSoundPlayer.jsx — shared sound catalog used by Breathwork soundscape selector
│   │   ├── GuidedPracticeOverlay.jsx — full-screen continuous guided sessions with exact countdown
│   │   ├── InstallPrompt.jsx — improved install messaging and iOS guidance
│   │   ├── PracticeTimer.jsx — shared guided timer for inline practice pages with exact duration handling
│   ├── src/pages/
│   │   ├── AdminDashboard.jsx — owner dashboard for whole-app content access
│   │   ├── AdminSection.jsx — collection editor for courses, moon paths, live sessions, yoga, and more
│   │   ├── Breathwork.jsx — now includes in-player nature sound selection
│   │   ├── Courses.jsx — 7-tab modal, Stripe purchase flow
│   │   ├── DemoExperience.jsx — polished public demo showcase
│   │   ├── LiveSessions.jsx — public live room listing with filters and stats
│   │   ├── LiveSessionRoom.jsx — embedded live room, RSVP, chat, and Q&A
│   │   ├── SupportCenter.jsx — install, privacy, support, and account action guidance
│   │   ├── VideosLibrary.jsx — 13 category filters, dark theme
│   │   ├── ArchangelOracle.jsx — Archangel readings & browse (NEW)
│   │   ├── LightCodes.jsx — deep symbolic teachings, category panels, and multi-tab modal redesign
│   │   ├── PaymentSuccess.jsx — payment verification
│   │   ├── Dashboard.jsx — streak widget
```
