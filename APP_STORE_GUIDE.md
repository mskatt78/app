# App Store Submission Guide — Shamanic Elements Soul Temple 2.0

## Your App is PWA-Ready!

Your app is a Progressive Web App (PWA) which means it can:
- Be installed directly on phones from the browser ("Add to Home Screen")
- Be submitted to both the **Apple App Store** and **Google Play Store**

---

## Files Generated for App Stores

### Icons (in `/frontend/public/`)
| File | Size | Purpose |
|------|------|---------|
| `app-icon-1024.png` | 1024x1024 | Apple App Store (required) |
| `icon-512.png` | 512x512 | Google Play Store, PWA |
| `icon-384.png` | 384x384 | Android splash |
| `icon-192.png` | 192x192 | PWA install, Android |
| `icon-180.png` | 180x180 | iPhone (Retina HD) |
| `icon-167.png` | 167x167 | iPad Pro |
| `icon-152.png` | 152x152 | iPad |
| `icon-144.png` | 144x144 | Android (legacy) |
| `icon-128.png` | 128x128 | Chrome Web Store |
| `icon-96.png` | 96x96 | Android (legacy) |
| `icon-72.png` | 72x72 | Android (legacy) |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `favicon-32.png` | 32x32 | Browser tab |
| `favicon-16.png` | 16x16 | Browser tab |
| `favicon.ico` | 32x32 | Legacy browser |

### Manifest & Meta
- `manifest.json` — Full PWA manifest with all icons, shortcuts, and metadata
- `index.html` — Updated with Apple meta tags, Open Graph tags for sharing

---

## Option 1: Google Play Store (via PWABuilder)

1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your deployed app URL
3. PWABuilder will analyze your PWA manifest
4. Click "Package for stores" -> Choose "Android"
5. Download the generated `.aab` (Android App Bundle)
6. Upload to [Google Play Console](https://play.google.com/console/)

### Google Play Store Listing Info:
- **App Name:** Shamanic Elements Soul Temple 2.0
- **Short Description:** Sacred yoga, oracle readings, star lineage quiz & shamanic practices
- **Full Description:** Discover your star lineage, explore oracle & tarot readings, practice breathwork & somatic movement, journey through elemental healing temples, and connect with ancient wisdom traditions. Features 40+ spiritual practices including guided meditations, sound frequencies, crystal guides, and womb healing retreats.
- **Category:** Health & Fitness
- **Content Rating:** Everyone

---

## Option 2: Apple App Store (via PWABuilder)

1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your deployed app URL
3. Click "Package for stores" -> Choose "iOS"
4. Download the generated Xcode project
5. Open in Xcode, configure your Apple Developer account
6. Submit via Xcode -> App Store Connect

### Apple App Store Listing Info:
- **App Name:** Soul Temple — Shamanic Elements
- **Subtitle:** Sacred Practices & Star Lineage
- **Keywords:** yoga, oracle, tarot, breathwork, meditation, shamanic, crystals, numerology, astrology, star lineage, womb healing, retreats
- **Category:** Health & Fitness
- **Age Rating:** 4+

### Requirements:
- Apple Developer Account ($99/year) — [developer.apple.com](https://developer.apple.com)
- Mac with Xcode installed

---

## Option 3: Install Directly (No App Store)

Users can install the app directly from the browser:
- **iOS Safari:** Tap Share -> "Add to Home Screen"
- **Android Chrome:** Tap menu -> "Install App" / "Add to Home Screen"
- **Desktop Chrome:** Click install icon in address bar

---

## Your Important Links

| Link | URL |
|------|-----|
| All Links (Linktree) | `your-domain.com/links` |
| Star Lineage Quiz | `your-domain.com/star-lineage` |
| Retreats | `your-domain.com/retreats` |
| Oracle Reading | `your-domain.com/oracle` |
| Dashboard | `your-domain.com/dashboard` |
| Admin CMS | `your-domain.com/admin/login` |

---

## Screenshots Needed for App Stores

For app store submission, you'll need:
- **iPhone 6.7"** (1290 x 2796) — 3-5 screenshots
- **iPhone 6.5"** (1242 x 2688) — 3-5 screenshots
- **iPad 12.9"** (2048 x 2732) — 3-5 screenshots (if targeting iPad)
- **Android Phone** (1080 x 1920) — 2-8 screenshots

Take screenshots of your best pages: Dashboard, Star Lineage Quiz, Oracle Reading, Retreats, Elemental Temples.
