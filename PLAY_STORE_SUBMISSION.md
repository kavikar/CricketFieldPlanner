# Play Store submission — reference answers

Concrete answers for the Play Console forms, based on what this app actually does
(audited against the code, not assumed). Re-check this file if the app's behavior
changes — especially when AI Advice ships on Android (see the note in each section).

## Content rating questionnaire

Play Console → your app → **Policy → App content → Content ratings**.

The questionnaire is generated per-category. For this app (a cricket field-diagram
utility — no user content, no network features, no in-app purchases):

| Question area | Answer |
| --- | --- |
| Violence | None |
| Sexuality / nudity | None |
| Profanity / crude humor | None |
| Controlled substances (alcohol, tobacco, drugs) | None |
| Gambling (simulated or real) | None |
| User-generated content (text, images shared with others) | No — custom presets are stored locally only, never shared or visible to other users |
| User-to-user communication / social features | No |
| Personal info shared with other users | No |
| Location sharing | No — the app doesn't request location |
| Digital purchases | No |
| Ability to share content outside the app | Yes, if asked — "Export Plan" copies/shares a text summary the user explicitly triggers. This is user-initiated export, not user-generated content shared with other app users. |

This should land the app at the lowest rating tier in every region (e.g., **PEGI 3 /
Everyone**). Answer honestly per the actual questionnaire wording — the table above
is a guide to your app's real behavior, not the exact on-screen phrasing.

## Data Safety form

Play Console → your app → **Policy → App content → Data safety**.

**Does your app collect or share any of the required user data types?**
→ **No** — for the Android app as it stands today. Verified from the codebase:
- No network permission (`INTERNET`) is requested.
- No analytics, crash reporting, or ad SDKs are integrated.
- No accounts, sign-in, or user identifiers of any kind.
- The only persisted data (custom field presets) lives in the app's own
  `SharedPreferences`, is not transmitted anywhere, and is deleted when the app is
  uninstalled.

Select **"No, this app doesn't collect any user data"** and skip the per-data-type
questions.

**Is all of the collected data encrypted in transit? / Do you provide a way for
users to request data deletion?**
→ These questions won't apply once you've declared no data collection. If asked
anyway: encryption in transit — N/A (no data leaves the device); deletion —
uninstalling the app deletes everything.

**Privacy policy URL:**
```
https://cricketfieldplanner.com/privacy.html
```

### When AI Advice ships on Android

The web app's AI Advice feature calls Google's Gemini API directly from the
browser using a key the visitor supplies. If the Android app gets the same
feature, the Data Safety form will need to change:
- Declare **"App data sent"** → the field layout being analyzed (fielder
  positions, match format) is sent to Google, initiated by the user, over an
  encrypted connection (HTTPS).
- Purpose: **App functionality**.
- Whether it's optional: **Yes** — the feature is off until the user supplies
  their own key.
- The `INTERNET` permission will need to be added to `AndroidManifest.xml` at
  that point.
- Update `web/public/privacy.html` if Android's implementation differs from
  web's (it currently already documents this for the web app and anticipates
  Android catching up — see the "AI Advice" section of that page).

## Store listing assets checklist

- [ ] App icon (512×512 PNG, no alpha) — decide between the existing vector icon
      (`drawable/ic_launcher_foreground.xml` + `ic_launcher_background.xml`,
      already wired as a proper adaptive icon) and a newly-generated one
- [ ] Feature graphic (1024×500 PNG/JPG) — not started
- [ ] Phone screenshots — min 2, recommend 4-6, PNG/JPG, aspect ratio between
      16:9 and 9:16 (longer side ≤ 2× shorter side). **Fix pushed, not yet
      regenerated.** `PlayStoreScreenshotTest` now renders at `.size(412.dp,
      780.dp)` (≈1078×2035px, ≈1.89:1), instead of the old 412x915dp
      (≈1078×2399px, ≈2.23:1) that Play was rejecting. Run
      `./gradlew testDebugUnitTest --tests "*PlayStoreScreenshotTest*"` (or
      let Android CI do it) to regenerate the four PNGs in
      `assets/playstore_screenshots/` and confirm the layout still composes
      sensibly at the shorter height before uploading them.
- [x] Short + full description — drafted (see chat history / ask to regenerate here)
- [x] Privacy policy URL: `https://cricketfieldplanner.com/privacy.html`
- [x] Category: **Sports**
- [x] Contact email: `support@cricketfieldplanner.com` (Cloudflare Email Routing,
      forwards to the developer's inbox — set up and verified)
- [x] In-app feedback: both apps now have a "Send Feedback" link next to
      Privacy Policy, opening a pre-addressed email to the same support address
      (Android also includes device/app-version info in the draft body)

## Signing

See the comment above `signingConfigs.create("release")` in `app/build.gradle.kts`
for the `keytool` command and environment variable wiring. Strongly recommend
opting into **Play App Signing** on first upload (Play Console offers this
automatically) — Google then holds the actual release signing key, and your
local keystore only needs to sign the *upload*. That makes losing your local
keystore recoverable (request a reset from Google) instead of catastrophic.
