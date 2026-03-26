# Shamanic Elements Soul Temple 2.0 — Product Requirements Document

## Overview
A comprehensive full-stack spiritual wellness application featuring yoga, somatic movements, oracle readings, breathwork, meditations, shamanic practices, elemental healing, and advanced healing modalities. Built with React, FastAPI, and MongoDB.

## Tech Stack
- **Frontend:** React, Framer Motion, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI, MongoDB (Motor Async)
- **Auth:** Google OAuth (Emergent-managed) + Custom JWT Admin Auth
- **Integrations:** OpenAI TTS, Gemini Image Gen, Emergent Object Storage
- **PWA:** Full manifest with app store ready icons

## Core Features (All Implemented)

### Divination & Guidance
- Oracle Card Readings (with AI-generated images)
- 22 Major Arcana Tarot
- Rune Readings (Elder Futhark)
- I Ching (64 Hexagrams)
- Light Codes (Sacred Geometry with How-to-Draw guides, Ancient Alphabets, Light Language, Galactic Codes, 13 Chakra Activations incl. Causal Chakra)

### Movement & Healing
- Yoga Library (78 poses by element)
- Somatic Movement (with practice videos support)
- Breathwork (6 guided sessions)
- Shamanic Practices (21 practices with drums, auto-start, step descriptions)
- Grounding Practices
- Heart Practices
- Creative Processes
- Sunrise/Sunset Practices

### Sacred Spaces
- Elemental Temples (Earth, Water, Fire, Air, Spirit — 8 sections each)
- Rose Temple
- Water Practices (ceremonies & rituals)
- Sound Frequencies (including whale songs, singing bowls, drums)
- Crystal Guide
- Mantras Library (108 rep chanting timer with transition bells)

### Discovery & Profiles
- Star Lineage Quiz (12 questions, 8 lineage results, shareable URLs)
- Birth Chart Calculator
- Numerology
- Gene Keys
- Human Design
- Sacred Guardians (37 spirit guides)
- Ancient Wisdom (108 teachings)

### Retreats & Events
- Retreats page with Elemental Healing & Womb Healing modality sections
- CMS-managed retreats (add/edit/delete via Admin)
- Detail modal with full retreat info

### Admin CMS
- JWT-based admin auth (password in .env)
- Dashboard with 13+ content collections
- CRUD operations for all collections
- Object Storage integration for file uploads
- Retreats management
- Practice Videos management

### App & Sharing
- Links page (Linktree-style, 23 links across 5 sections)
- Share Star Lineage (WhatsApp, Twitter, Facebook, Email, copy link)
- Open Graph meta tags for social sharing
- PWA with all icon sizes (16px to 1024px)
- App Store Guide (Google Play & Apple App Store via PWABuilder)

### Audio System
- Background audio for all practices (drums, nature, bowls, ocean, wind, fire)
- Mobile audio unlock (silent buffer technique)
- Bell chimes at step transitions
- Whale song frequencies (phone-audible range)
- Mantra chanting timer with rep transition bells
- Volume boosted for mobile speakers

## Key Pages & Routes
| Route | Page |
|-------|------|
| / | Dashboard |
| /links | All Links (Linktree) |
| /star-lineage | Star Lineage Quiz |
| /star-lineage/result/:id | Shared Lineage Result |
| /retreats | Retreats & Healing |
| /courses | Courses Portal |
| /community | Sacred Circle (Community) |
| /oracle | Oracle Readings |
| /tarot | Tarot Reading |
| /light-codes | Light Codes |
| /shamanic | Shamanic Practices |
| /somatic | Somatic Movement |
| /yoga | Yoga Library |
| /breathwork | Breathwork |
| /meditations | Meditations |
| /mindfulness | Mindfulness |
| /sound-frequencies | Sound Frequencies |
| /elemental-temples | Elemental Temples |
| /admin/login | Admin Login |
| /admin | Admin Dashboard |

## API Endpoints
- GET /api/retreats, /api/retreats/:id
- GET /api/videos, /api/videos/:id
- GET /api/courses, /api/courses/:id
- GET /api/community/posts, /api/community/posts/:id
- GET /api/sacred-geometry
- GET /api/light-codes
- GET /api/oracle/readings
- GET /api/shamanic-practices
- GET /api/sound-frequencies
- GET /api/mindfulness
- POST /api/admin/login
- GET /api/admin/collections (25 collections)
- CRUD /api/admin/{collection}/items

## Recent Changes
- **2026-03-26**: Fixed Guided Meditation TTS timeout (4-part chunking, ~18-29s per part).
- **2026-03-26**: Added images to Mindfulness (8) and Grounding (8). Fixed Grounding timer NaN bug. Added 3 new exercises.
- **2026-03-26**: Built Courses Portal (/courses) with level/category filters, detail modals, enrollment links, video previews.
- **2026-03-26**: Built Community/Sacred Circle (/community) with journey/insight/gratitude/question post types.
- **2026-03-26**: Expanded Admin CMS from 14 to 25 manageable collections.
- **2026-03-26**: Added custom audio_url support to Sound Frequencies.
- **2026-03-26**: Added "Learn & Connect" section to main menu.

## Backlog / Future Tasks

### P2 (Medium Priority)
- [ ] Migrate hardcoded frontend data (ElementalTemples, WaterPractices) to MongoDB
- [ ] Daily Sacred Practice feature on home dashboard

### P3 (Low Priority / Backlog)
- [ ] Seed initial Sacred Geometry drawing guides into CMS

## Admin Access
- URL: /admin/login
- Password: Set via ADMIN_PASSWORD in backend .env
