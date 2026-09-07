SOUL TEMPLE — ANDROID RELEASE KIT v3 (v1.1.0, API 36, GOOGLE PLAY BILLING)
===========================================================================
Signed with YOUR registered upload key (SHA-256 74:23:90:E1...:24:EB).

WHAT'S IN THIS KIT
------------------
1. SoulTemple-v1.1.0-playbilling-upload.aab  -> Ready-to-upload bundle (versionCode 36003)
2. upload-keystore.jks                        -> Your upload keystore (keep safe)
3. upload_certificate.pem                     -> Certificate registered with Google

KEYSTORE CREDENTIALS
--------------------
Keystore password:  SkyWater*1978
Key alias:          upload
Key password:       SkyWater*1978

WHAT'S NEW IN v1.1.0 (versionCode 36003)
-----------------------------------------
- GOOGLE PLAY BILLING support (Digital Goods API): users who install from
  Google Play now purchase Monthly/Yearly membership through Google Play
  checkout instead of Stripe/PayPal.
- Keeps all previous fixes: R8 optimization, edge-to-edge fix, API 36.

PLAY CONSOLE SETUP STILL NEEDED (one-time)
-------------------------------------------
1. Monetize -> Subscriptions -> create subscription with EXACT id:
     soul_temple_membership
   with two base plans (EXACT ids): monthly  and  yearly
   Set your AUD prices ($24.99/mo, $189.99/yr) there.
2. (Optional, for Lifetime on Android) Monetize -> In-app products -> create a
   one-time NON-CONSUMABLE product, e.g. id: soul_temple_lifetime ($369).
   Then tell the developer/agent the id so it can be switched on server-side
   (env var PLAY_LIFETIME_PRODUCT_ID). Until then, the Android app politely
   directs Lifetime buyers to the website.
3. Server verification credentials:
   - Play Console -> Setup -> API access -> link a Google Cloud project
   - In Google Cloud: enable "Google Play Android Developer API", create a
     service account, download its JSON key
   - In Play Console -> Users & permissions: invite the service account email
     with "View financial data" + "Manage orders and subscriptions"
   - Give the JSON to the agent to set as GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
     on the backend. Until this is set, Play purchases cannot be verified
     server-side (the app will show a clear error).
4. Upload SoulTemple-v1.1.0-playbilling-upload.aab to Internal testing.

HOW TO TEST SAFELY (no real charges)
-------------------------------------
1. Play Console -> Settings -> License testing: add your Gmail as a license
   tester. License testers see test payment methods and are NOT charged.
2. Install the app on a phone from the Internal testing link.
3. Open the app -> Pricing: prices shown come from Google Play (AUD localized).
4. Buy Monthly with the test card ("Test card, always approves").
5. Verify membership unlocks in the app; check Settings -> Membership.
6. Test subscriptions renew rapidly in test mode (monthly = 5 minutes),
   so you can watch renewal/expiry behaviour quickly.
7. Repeat for Yearly. Cancel from the Play Store subscription screen and
   confirm access remains until the (accelerated) period end.
