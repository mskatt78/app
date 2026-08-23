# Android API 36 Upgrade Guide (Soul Temple)

This guide upgrades your Play Store bundle from **targetSdk 35** to **targetSdk 36**.

## What we verified from your previous AAB
- Package ID: `host.emergent.embodiment_journey.twa`
- Previous target SDK: `35`
- Previous compile SDK: `36`

## Required for next Play submission
- `targetSdkVersion = 36`
- `compileSdkVersion = 36`
- `versionCode` must be **higher** than your currently published Play production release

---

## Fastest path when source files are missing (PWABuilder)

You can rebuild directly from your live web app URL without local Android source.

1. Open: `https://www.pwabuilder.com/`
2. Enter your production app URL:
   - `https://temple-soul-dev.emergent.host`
3. Click **Package for Stores** → **Android**.
4. Set these values exactly:
   - **Package ID**: `host.emergent.embodiment_journey.twa`
   - **Version Code**: use a higher integer than current Play production (safe start: `36001`)
   - **Version Name**: e.g. `1.0.1`
5. Build and download new `.aab`.

---

## If you do have Android/Gradle source later

In `android/app/build.gradle`:

```gradle
android {
  compileSdkVersion 36

  defaultConfig {
    targetSdkVersion 36
    versionCode 36001
    versionName "1.0.1"
  }
}
```

Then rebuild signed bundle:

```bash
./gradlew clean bundleRelease
```

---

## Signing and update identity checks (critical)

To be accepted as an **update** to your existing Play app:

1. Package ID must stay exactly:
   - `host.emergent.embodiment_journey.twa`
2. Signing relationship must match Play App Signing expectations.
3. Version code must be higher than existing production.

If upload is rejected with key mismatch:
- In Play Console → **Setup** → **App Integrity**
- Check whether **Play App Signing** is enabled.
- If needed, request **Upload key reset** in Play Console support.

---

## TWA domain verification check

Ensure your website hosts:

`https://temple-soul-dev.emergent.host/.well-known/assetlinks.json`

With your package name:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "host.emergent.embodiment_journey.twa",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_PLAY_APP_SIGNING_CERT_SHA256"
      ]
    }
  }
]
```

---

## Before uploading to Play Console

- [ ] target SDK = 36
- [ ] compile SDK = 36
- [ ] package ID unchanged
- [ ] versionCode increased
- [ ] signed bundle generated
- [ ] assetlinks.json matches package + SHA256 fingerprint
