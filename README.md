# Cricket Field Planner

A tactical field-setting designer for cricket captains and coaches. Place fielders on
an interactive ground, validate the setup against ICC fielding regulations for
T20 / ODI / Test, load tactical presets, mirror the field for left-handed batters,
and export a plan.

Two implementations live in this repo:

| | Path | Stack |
| --- | --- | --- |
| Android app | [`app/`](app) | Kotlin + Jetpack Compose |
| Web app | [`web/`](web) | React + TypeScript + Vite |

The web app's field logic (presets, ICC validation, zone labeling) is ported from the
Android app's `MainActivity.kt`.

## Android

**Prerequisites:** [Android Studio](https://developer.android.com/studio), JDK 21.

1. Open Android Studio, choose **Open**, and select this directory.
2. Run the app on an emulator or device.

Or from the command line, using the checked-in Gradle wrapper:

```bash
./gradlew assembleDebug        # debug APK
./gradlew testDebugUnitTest    # Robolectric unit tests
```

`testDebugUnitTest` also regenerates the Play Store screenshots in
[`assets/playstore_screenshots/`](assets/playstore_screenshots) via Roborazzi.

The app requests no permissions, makes no network calls, and stores its custom presets
in `SharedPreferences` on the device only.

## Web

```bash
cd web
npm install
npm run dev
```

See [`web/README.md`](web/README.md) for details. The web app additionally offers an
**AI Advice** tactical advisor on a bring-your-own-key basis: the visitor pastes their
own [Gemini API key](https://aistudio.google.com/apikey), it is kept only in their
browser's `localStorage`, and the browser calls Google's API directly — the key never
reaches a server of ours. There is nothing to configure at build time.

On Android the same feature is still a placeholder (the "AI Advice — Coming Soon"
badge), so it needs no key or configuration there either.

## Release

See [`PLAY_STORE_SUBMISSION.md`](PLAY_STORE_SUBMISSION.md) for the Play Console
content-rating and Data Safety answers, the store-listing asset checklist, and
signing notes.
