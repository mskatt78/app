# Shamanic Elements Temple Of The Soul — PRD

## Original Problem Statement
Build a comprehensive full-stack spiritual wellness application with yoga, somatic movements, oracle readings, breathwork, guided meditations, ambient frequencies, healing modalities, and divination tools.

**Tech Stack:** React + FastAPI + MongoDB (Motor Async)

---

## Comprehensive App Audit (March 23, 2026)

### ✅ CONTENT WITH IMAGES (All Working)
| Section | Total | With Images | Status |
|---------|-------|-------------|--------|
| Breathwork Sessions | 6 | 6 | ✅ |
| Meditations | 6 | 6 | ✅ |
| Oracle Cards | 22 | 22 | ✅ |
| Tarot Cards | 22 | 22 | ✅ |
| Sound Frequencies | 12 | 12 | ✅ |
| Ancient Wisdom | 108 | 108 | ✅ |
| Sacred Guardians | 37 | 37 | ✅ |
| Runes | 25 | 25 | ✅ |

### ✅ DATE INPUT DROPDOWNS (All Updated)
- **Gene Keys**: Year/Month/Day dropdown selects ✅
- **Human Design**: Year/Month/Day dropdown selects ✅
- **Numerology**: Year/Month/Day dropdown selects ✅
- **Birth Chart**: Year/Month/Day/Hour/Minute dropdowns ✅ (Updated this session)

### ✅ GUIDED AUDIO/TTS (All Working)
- **Meditations**: TTS endpoint `/api/tts/meditation/{id}` ✅
- **Somatic Movement**: TTS endpoint `/api/tts/somatic/{id}` ✅
- **Ambient Soundscapes**: Web Audio API procedural generation ✅
  - Ocean Waves, Forest Rain, Tibetan Bowls, Crystal Bowls, Binaural Tones

### ✅ CROSS-LINKS (P1 Complete)
- Gene Keys → Human Design (Profile number bridge) ✅
- Human Design → Gene Keys (Profile number bridge) ✅

---

## What's Working

### Divination & Guidance
- **Tarot Reading** (22 Major Arcana with AI images, 3 spreads) ✅ NEW
- **Oracle Cards** (22 cards with images) ✅
- **Rune Readings** (25 Elder Futhark runes with AI images) ✅
- **I Ching** (64 hexagrams) ✅
- **Light Codes** (75 AI-generated sacred geometry) ✅
- **Gene Keys Calculator** (DOB → Profile) ✅
- **Human Design Calculator** (DOB → Body Graph) ✅
- **Numerology** (Life Path calculation) ✅
- **Birth Chart** (with dropdown date inputs) ✅

### Movement & Body
- **Yoga Poses** (78 poses, 66 with images) ⚠️
- **Somatic Movement** (39 practices with guided TTS audio) ✅
- **Partner Yoga** (8 poses with photos) ✅

### Mind & Spirit
- **Meditations** (6 with TTS audio + ambient soundscapes) ✅
- **Breathwork** (6 sessions with images) ✅
- **Mindfulness Practices** ✅
- **Grounding Exercises** ✅

### Shamanic Wisdom
- **Shamanic Practices** (21 entries) ✅
- **Elemental Practices** ✅
- **Heart Practices** ✅
- **Creative Processes** ✅
- **Earth Altars** ✅
- **Sacred Guardians** (37 with AI images) ✅
- **Ancient Wisdom** (108 entries - 9 traditions × 12) ✅
  - Egyptian, Avalon, Aboriginal, Celtic, Peruvian, International, Lemurian, Atlantean, Galactic

### Sound & Frequency
- **Sound Frequencies** (12 entries - Dolphin, Whale, Crystal Bowls, etc.) ✅ NEW
- **Ambient Soundscapes** (procedural audio) ✅

### Sacred Temples
- Rose Temple, Masculine Temple, Seasonal Temple ✅
- Sunrise/Sunset Temple ✅
- Elemental Temple ✅

### Other Features
- **Community Reviews** (POST/GET with ratings) ✅
- **User Profiles & Progress** ✅
- **Practice History Tracking** ✅
- **Crystals** (42 entries, 30 with images) ⚠️
- **Mantras** (12 entries) ⚠️
- **Mudras** ✅

---

## Known Issues (Minor)

### Images Partially Missing
- Yoga Poses: 78 total, 12 missing images (still functional)
- Crystals: 42 total, 12 missing images
- Mantras: 12 total, no images (text-based content)

### TTS Response Time
- TTS endpoints take 30-60 seconds to generate audio (OpenAI API)
- Frontend handles this with loading states

---

## Current Working URL
**https://breathwork-oracle.preview.emergentagent.com/menu**

---

## 3rd Party Integrations
- OpenAI TTS — Emergent LLM Key ✅
- Gemini Image Generation — Emergent LLM Key ✅
- Resend (emails) — user API key
- Google OAuth — Emergent-managed ✅

---

## Future Backlog
- 📝 Admin CMS for custom content uploads
- 📝 Video integration for practices
- 📝 Workshops/Playshops with socials/retreats
- 📝 Live & Recorded access courses
- 📝 Add remaining yoga pose images (12)
- 📝 Add mantra images
- 📝 Add remaining crystal images (12)

---

## Admin Access
- skywatersacredembodiments@gmail.com
- mskatt78@gmail.com
