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

### Video Tutorials
- 16 video entries seeded across 8 categories with real YouTube URLs

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

## Remaining Backlog
- **P1**: Add real YouTube video IDs to video tutorials (currently placeholders)
- **P2**: Subscription-based access to all premium content
- **P2**: Community page improvements (reply threading, post filtering)
- **P3**: Admin dashboard for managing purchases and users
- **P3**: Production deployment fix (awaiting Emergent platform support)

## Architecture
```
/app/
├── backend/
│   ├── data/
│   │   ├── sacred_rites_deep.py — 3 rites with extended rituals
│   │   ├── video_content.py — 16 video tutorials
│   │   ├── creative_processes_deep.py — 9 deep practices
│   ├── routers/
│   │   ├── payments.py — Stripe/PayPal checkout, course access
│   │   ├── content.py — course content endpoints
│   ├── server.py — startup seeding
├── frontend/
│   ├── src/pages/
│   │   ├── Courses.jsx — 7-tab modal, Stripe purchase flow
│   │   ├── PaymentSuccess.jsx — payment verification
│   │   ├── Dashboard.jsx — streak widget
```
