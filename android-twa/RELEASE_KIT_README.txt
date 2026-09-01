SOUL TEMPLE — ANDROID RELEASE KIT v2 (v1.0.2, API 36)
======================================================
This build is signed with YOUR registered upload key
(the one you created Aug 28 and sent to Google for the key reset).

WHAT'S IN THIS KIT
------------------
1. SoulTemple-v1.0.2-upload.aab   -> Ready-to-upload Android App Bundle (signed with your upload key)
2. upload-keystore.jks            -> Your upload keystore (same as your Aug 28 backup — keep safe)
3. upload_certificate.pem         -> The public certificate registered with Google

KEYSTORE CREDENTIALS
--------------------
Keystore password:  SkyWater*1978
Key alias:          upload
Key password:       SkyWater*1978
Upload key SHA-256:
74:23:90:E1:01:8F:6E:15:11:95:9D:FF:E5:C5:43:F1:8D:6D:45:8E:B0:85:4C:DE:DB:B2:BF:84:F4:C8:24:EB

WHAT WAS FIXED IN THIS BUILD (Play Console warnings)
----------------------------------------------------
- R8 code optimization ENABLED (minifyEnabled + shrinkResources + proguard-android-optimize)
- Edge-to-edge deprecated API warning FIXED (androidbrowserhelper upgraded to 2.7.3)
- targetSdkVersion 36 / compileSdkVersion 36 (API 36 compliant)
- versionCode 36002, versionName 1.0.2 (higher than current production)
- Package ID unchanged: host.emergent.embodiment_journey.twa

UPLOAD STEPS
------------
1. Make sure Google confirmed your upload key reset is ACTIVE
   (their email states the effective date — usually within 48h of approval).
2. Play Console -> Your app -> Test and release -> Internal testing
3. Create new release -> upload SoulTemple-v1.0.2-upload.aab
4. The R8 and edge-to-edge warnings should be gone. Save -> Send for review.
5. Test the internal build on your phone, then promote to Production.

WEBSITE STEP (already done for you)
-----------------------------------
Your website's .well-known/assetlinks.json has been updated with the
Google Play App Signing certificate (7D:FB:F6:D7:...:5F:AF).
IMPORTANT: Redeploy your web app to production so the live site serves it.
This is what removes the browser address bar inside the Android app.

IF UPLOAD IS REJECTED WITH "wrong key" ERROR
--------------------------------------------
The key reset is not active yet. Wait for Google's confirmation email,
then re-upload the SAME .aab — no rebuild needed.
