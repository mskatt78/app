SOUL TEMPLE — ANDROID RELEASE KIT (v1.0.2, API 36)
====================================================

WHAT'S IN THIS KIT
------------------
1. SoulTemple-v1.0.2-upload.aab   -> The ready-to-upload Android App Bundle (signed)
2. upload-keystore.jks            -> Your NEW upload keystore (KEEP THIS SAFE FOREVER)
3. upload_certificate.pem         -> The certificate to register with Google (upload key reset)

KEYSTORE CREDENTIALS (SAVE THESE — DO NOT LOSE)
-----------------------------------------------
Keystore file:      upload-keystore.jks
Keystore password:  SoulTemple2026!
Key alias:          upload
Key password:       SoulTemple2026!
New upload key SHA-256:
4F:2F:E4:86:E6:18:F6:82:FC:38:1E:11:CC:BF:AF:7E:C2:9A:6B:92:0E:8E:7C:FE:8B:58:2D:D2:6E:69:43:FD

WHAT WAS FIXED IN THIS BUILD (Play Console warnings)
----------------------------------------------------
- R8 code optimization ENABLED (minifyEnabled + shrinkResources + proguard-android-optimize)
- Edge-to-edge deprecated API warning FIXED (androidbrowserhelper upgraded to 2.7.3)
- targetSdkVersion 36 / compileSdkVersion 36 (API 36 compliant)
- versionCode 36002, versionName 1.0.2 (higher than your current production release)
- Package ID unchanged: host.emergent.embodiment_journey.twa

STEP-BY-STEP: FINISH THE UPLOAD KEY RESET
-----------------------------------------
1. Open the email/thread from Google Play support about your approved upload key reset.
   They ask for a new upload certificate — attach the file: upload_certificate.pem
   (If they gave you a link/form in Play Console, upload the same .pem file there.)
2. Google will confirm when the new upload key is ACTIVE (their email states the date —
   sometimes it is immediate, sometimes it activates after ~48 hours).

STEP-BY-STEP: UPLOAD THE NEW APP BUNDLE
---------------------------------------
1. Go to Play Console -> Your app -> Test and release -> Internal testing (recommended first)
2. Click "Create new release"
3. Upload: SoulTemple-v1.0.2-upload.aab
4. The previous warnings (R8 optimization + deprecated edge-to-edge APIs) should be gone.
5. Add release notes, click Next -> Save -> Send for review.
6. Once internal testing looks good, promote the release to Production.

FINAL STEP: FIX assetlinks.json (removes the browser address bar in the app)
----------------------------------------------------------------------------
1. In Play Console go to: Test and release -> Setup -> App integrity -> App signing
2. Copy the "SHA-256 certificate fingerprint" under **App signing key certificate**
   (NOT the upload key certificate)
3. Send that fingerprint to me in the chat — I will put it into your website's
   .well-known/assetlinks.json, then you redeploy the web app to production.

IF THE UPLOAD IS REJECTED WITH "wrong key" ERROR
------------------------------------------------
It means the upload key reset is not active yet. Wait for Google's confirmation
email (up to 48h after you send them upload_certificate.pem), then upload again.
The .aab file does not need to be rebuilt — just re-upload the same file.
