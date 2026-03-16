# Google Play Store - App Bundle Creation Guide

## Step-by-Step Instructions

### Method 1: PWABuilder (Recommended - Easiest)

1. **Go to PWABuilder**
   - Visit: https://pwabuilder.com
   - Enter your URL: `https://mindful-shamanic-app.emergent.host`
   - Click "Start"

2. **Review Your PWA Score**
   - PWABuilder will analyze your app
   - Fix any issues it identifies (should be minimal)

3. **Generate Android Package**
   - Click "Package for stores"
   - Select "Android"
   - Choose "Google Play" option
   - Download the generated `.aab` (Android App Bundle)

4. **What You'll Get:**
   - `app-release.aab` - Upload this to Play Console
   - `assetlinks.json` - Add to your server (instructions below)
   - Signing key files - KEEP THESE SAFE!

---

### Method 2: Bubblewrap CLI (More Control)

**Requirements:**
- Node.js 14+
- Java JDK 8+
- Android SDK

**Installation:**
```bash
npm install -g @anthropic/anthropic
npm install -g @nicolo-ribaudo/chokidar-cli
```

**Generate Project:**
```bash
npx @nicolo-ribaudo/chokidar-cli init --manifest https://mindful-shamanic-app.emergent.host/manifest.json
```

**Build AAB:**
```bash
npx @nicolo-ribaudo/chokidar-cli build
```

---

## Required Assets for Play Store

### Already Created ✅
- App Icon 512x512: `/app/frontend/public/icon-512.png`
- App Icon 192x192: `/app/frontend/public/icon-192.png`

### You Need to Create:
1. **Feature Graphic** (1024 x 500 px)
   - Banner image for your Play Store listing
   
2. **Screenshots** (min 2, max 8)
   - Phone: 1080 x 1920 px (or 16:9 ratio)
   - Tablet: 1200 x 1920 px (optional)

3. **Privacy Policy URL**
   - Required for Play Store
   - Host on your website or use a generator

---

## Play Store Listing Information

**Package Name (Application ID):**
```
com.shamaniceleyoga.app
```

**App Name:**
```
Shamanic Elemental Yoga
```

**Short Description (80 chars max):**
```
Sacred yoga, breathwork & shamanic practices for spiritual wellness
```

**Full Description:**
```
Shamanic Elemental Yoga is your sacred companion for spiritual wellness, combining ancient shamanic wisdom with yoga, breathwork, and mindfulness practices.

✨ FEATURES:
• 60 Yoga Poses with sacred AI-generated imagery
• Oracle Readings powered by AI
• Breathwork Sessions with guided timers
• 13-Month Lunar Astrology Calendar
• Crystal Guide with healing frequencies
• Mantras Library with audio
• 12 Sacred Mudras with pronunciation
• Shamanic Journeys & Ceremonies
• Heart Practices & Creative Processes
• Daily Ritual Builder with timer
• Practice Log & Achievement System
• Sacred Journal

🌍 ELEMENTS:
Connect with Earth, Water, Fire, Air, and Spirit through practices designed to ground, heal, and transform your life.

⚠️ DISCLAIMER:
This app is for educational and spiritual wellness purposes only. Always consult a healthcare professional before beginning any new wellness practice.
```

**Category:** Health & Fitness

**Content Rating:** Everyone

**Tags/Keywords:**
```
yoga, meditation, shamanic, spiritual, breathwork, mindfulness, chakra, crystal, oracle, astrology, mantra, mudra, wellness, healing
```

---

## After Generating Your AAB

### 1. Create Google Play Developer Account
- Go to: https://play.google.com/console
- Pay $25 one-time registration fee
- Complete identity verification

### 2. Create New App
- Click "Create app"
- Enter app details
- Select "App" (not game)
- Select "Free" or "Paid"

### 3. Upload Your AAB
- Go to: Release > Production > Create new release
- Upload your `.aab` file
- Add release notes

### 4. Complete Store Listing
- Add screenshots
- Add feature graphic
- Write descriptions
- Set content rating
- Add privacy policy

### 5. Submit for Review
- Google typically reviews within 1-3 days
- First submission may take longer

---

## Digital Asset Links (Required for TWA)

After generating your AAB, PWABuilder will give you an `assetlinks.json` file.

You need to host this at:
```
https://mindful-shamanic-app.emergent.host/.well-known/assetlinks.json
```

**Template (replace SHA256 with your actual fingerprint):**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.shamaniceleyoga.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_HERE"]
  }
}]
```

---

## Cost Summary

| Item | Cost |
|------|------|
| Google Play Developer Account | $25 (one-time) |
| App Hosting (Emergent) | Your current plan |
| Total | $25 |

---

## Need Help?

1. PWABuilder has excellent documentation: https://docs.pwabuilder.com
2. Google Play Console Help: https://support.google.com/googleplay/android-developer
