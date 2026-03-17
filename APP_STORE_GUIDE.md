# App Store Submission Guide - Shamanic Elemental Yoga

## Overview
Your app is configured as a Progressive Web App (PWA) which can be packaged for both Google Play Store and Apple App Store using TWA (Trusted Web Activity) for Android and PWABuilder for iOS.

---

## Google Play Store Submission

### Prerequisites
1. Google Play Developer Account ($25 one-time fee)
2. Your app deployed to a production URL with HTTPS
3. Digital Asset Links file for TWA verification

### Step 1: Generate TWA (Android) Bundle

**Using PWABuilder (Recommended):**
1. Go to https://www.pwabuilder.com/
2. Enter your production URL
3. Click "Start" and wait for analysis
4. Click "Package for stores" → "Android"
5. Configure options:
   - Package ID: `com.shamanicyoga.app`
   - App name: `Shamanic Elemental Yoga`
   - Launcher name: `Shamanic Yoga`
   - Version code: `1`
   - Version name: `1.0.0`
6. Download the generated AAB (Android App Bundle)

**Using Bubblewrap CLI:**
```bash
npm install -g @pwabuilder/pwabuilder-cli
pwa-cli init YOUR_PRODUCTION_URL
pwa-cli build
```

### Step 2: Create Digital Asset Links
Create file at `/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.shamanicyoga.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

### Step 3: Google Play Console Setup
1. Log into Google Play Console
2. Create new app
3. Fill in app details:
   - App name: Shamanic Elemental Yoga
   - Default language: English (US)
   - App category: Health & Fitness
   - Content rating: Everyone
4. Upload your AAB file
5. Add screenshots (see below)
6. Add privacy policy URL
7. Submit for review

### Required Screenshots (Google Play)
- Phone: 2-8 screenshots (1080x1920 or 1920x1080)
- Tablet 7": 1-8 screenshots (1200x1920)
- Tablet 10": 1-8 screenshots (1600x2560)
- Feature graphic: 1024x500px

---

## Apple App Store Submission

### Prerequisites
1. Apple Developer Account ($99/year)
2. Mac computer with Xcode
3. Your app deployed to a production URL with HTTPS

### Option A: Using PWABuilder (Easier)
1. Go to https://www.pwabuilder.com/
2. Enter your production URL
3. Click "Package for stores" → "iOS"
4. Download the generated Xcode project
5. Open in Xcode on Mac
6. Configure signing with your Apple Developer credentials
7. Build and archive
8. Upload to App Store Connect

### Option B: Using Capacitor (More Control)
```bash
npm install @capacitor/core @capacitor/ios
npx cap init "Shamanic Elemental Yoga" com.shamanicyoga.app
npx cap add ios
npx cap copy ios
npx cap open ios
```

### App Store Connect Setup
1. Log into App Store Connect
2. Create new app
3. Fill in app information:
   - Name: Shamanic Elemental Yoga
   - Primary language: English (US)
   - Bundle ID: com.shamanicyoga.app
   - SKU: shamanicyoga001
   - Primary category: Health & Fitness
   - Secondary category: Lifestyle
4. Add app description, keywords, screenshots
5. Submit for review

### Required Screenshots (App Store)
- iPhone 6.7": 1284x2778px (iPhone 14 Pro Max)
- iPhone 6.5": 1242x2688px (iPhone 11 Pro Max)
- iPhone 5.5": 1242x2208px (iPhone 8 Plus)
- iPad Pro 12.9": 2048x2732px

---

## App Store Descriptions

### Short Description (80 chars)
Sacred yoga, breathwork, and shamanic practices for spiritual wellness

### Full Description
Shamanic Elemental Yoga is your sacred companion on the path of spiritual wellness. 
Combining ancient shamanic wisdom with modern yoga practices, this app offers:

**Features:**
- 60+ Yoga Poses with element associations
- Guided Breathwork sessions for each element
- AI-powered Oracle Card readings
- Crystal healing guide with frequencies
- Mantra library with pronunciation guides
- Shamanic ceremonies and rituals
- Grounding practices with timers
- Mudra collection for meditation
- Personalized practice tracking
- Achievement system

**Elemental Practices:**
- Earth: Grounding, stability, abundance
- Water: Emotions, intuition, flow
- Fire: Transformation, passion, courage
- Air: Clarity, communication, breath
- Spirit: Connection, guidance, unity

Whether you're beginning your spiritual journey or deepening an established practice, 
Shamanic Elemental Yoga provides the tools for transformation.

### Keywords
yoga, shamanic, meditation, breathwork, chakra, oracle, spiritual, wellness, 
mindfulness, grounding, crystal healing, mantra, mudra, elemental, sacred

---

## Privacy Policy Requirements

Both stores require a privacy policy. Your policy should cover:
- What data is collected (email, practice history)
- How data is used (personalization, progress tracking)
- Data storage (MongoDB database)
- Third-party services (Google OAuth)
- User rights (data deletion, export)
- Contact information

Sample URL: `https://yourapp.com/privacy`

---

## Content Rating

**Google Play:**
- Apply for "Everyone" rating
- Answer questionnaire about violence, sexuality, etc. (all "No" for this app)

**Apple:**
- Age rating: 4+ (no objectionable content)
- No in-app purchases currently
- No unrestricted web access

---

## Post-Submission

### Google Play
- Initial review: 1-7 days
- Updates: 1-3 days
- Monitor crashes/ANRs in console

### Apple
- Initial review: 1-7 days (often faster)
- May request additional information
- Monitor for rejection reasons

---

## Common Rejection Reasons & Fixes

1. **Missing privacy policy**: Add privacy policy page
2. **Broken login**: Ensure auth works on production
3. **Incomplete app**: Make sure all features work
4. **Inappropriate content**: Remove any flagged content
5. **Guideline 4.2 (Minimum Functionality)**: Ensure app provides value beyond website

---

## Quick Commands Summary

```bash
# Generate Android AAB
npx pwabuilder --platform android

# Generate iOS project
npx pwabuilder --platform ios

# Alternative using Capacitor
npx cap add android
npx cap add ios
npx cap sync
```

Good luck with your submission! 🙏
