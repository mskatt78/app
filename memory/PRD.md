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
- **P2**: Subscription-based access to all premium content (all-in-one membership)
- **P3**: Add more crystal profiles (now at 20, can expand to 30+)
- **P3**: Production deployment optimization

## Completed Work (March 2026 - Session 2)
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
│   ├── routers/
│   │   ├── admin.py — Admin seeding routes, file uploads
│   │   ├── oracle.py — Oracle + Archangel Oracle endpoints
│   │   ├── payments.py — Stripe/PayPal checkout, course access
│   │   ├── content.py — course content endpoints
│   ├── server.py — startup seeding
├── frontend/
│   ├── src/pages/
│   │   ├── Courses.jsx — 7-tab modal, Stripe purchase flow
│   │   ├── VideosLibrary.jsx — 13 category filters, dark theme
│   │   ├── ArchangelOracle.jsx — Archangel readings & browse (NEW)
│   │   ├── PaymentSuccess.jsx — payment verification
│   │   ├── Dashboard.jsx — streak widget
```
