# Cricket Field Planner

A tactical field-setting designer and rule planner for cricket captains and
enthusiasts. Place fielders on an interactive pitch, check the placement against
ICC fielding restrictions, and export the plan.

The project exists in two independent implementations that share the same
domain rules:

| Implementation                     | Stack                                     |
| ---------------------------------- | ----------------------------------------- |
| [`app/`](app)                      | Android, Kotlin, Jetpack Compose          |
| [`web/`](web) — _FieldPlanner Pro_ | React, TypeScript, Vite, Cloudflare Pages |

The web version's field logic is a port of the Android app's `MainActivity.kt`,
so presets, validation rules and zone labelling behave the same on both.

## Features

Both implementations:

- **Interactive field.** Drag fielders around the pitch — a Compose `Canvas` on
  Android, an SVG surface on the web.
- **Rule validation.** Placements are checked against ICC fielding regulations
  as you move players. T20 and ODI cap the fielders outside the 30-yard circle
  by phase (powerplay, non-powerplay, death) and require at least two inside;
  Test has no circle restriction. The leg-side-behind-square limit of two
  applies to every format.
- **Tactical presets.** Built-in fields per format, bowler type and over type,
  plus three slots for your own — `SharedPreferences` on Android,
  `localStorage` on the web.
- **Left-hand mirror.** Flip an entire field for a left-handed batter in one
  action rather than repositioning every fielder.
- **Export.** Copy a plan as text, or download it as CSV.

Web only:

- **AI tactical advice.** Gemini-backed suggestions for the current field and
  match situation. The Android app has no AI advisor — its `firebase-ai`
  dependency is commented out in `app/build.gradle.kts`.

## Android app

Prerequisites: Android Studio.

1. Open the project in Android Studio and let the Gradle sync finish.
2. `debug.keystore` is git-ignored and not present in a fresh clone, so the
   debug build type cannot resolve its signing config. Either remove
   `signingConfig = signingConfigs.getByName("debugConfig")` from
   [`app/build.gradle.kts`](app/build.gradle.kts) or drop your own
   `debug.keystore` at the repository root.
3. Run on an emulator or a physical device.

The module is wired to the Secrets Gradle plugin, which reads `.env` (falling
back to [`.env.example`](.env.example)) — see [Configuration](#configuration).
No `GEMINI_API_KEY` is needed to build or run the app, since the Android build
consumes no AI key today.

## Web app

See [`web/README.md`](web/README.md) for full setup. In short:

```bash
cd web
npm install
npm run dev
```

The AI advisor calls `/api/tactical-advice`, a Cloudflare Pages Function. The
Gemini API key is read server-side from `GEMINI_API_KEY` and never reaches the
browser, so the advisor button only works once deployed, or locally under
Wrangler with the key in `.dev.vars`:

```bash
cp .env.example .dev.vars   # then add your key
npx wrangler pages dev -- npm run dev
```

## Repository layout

```
app/                       Android application (Kotlin, Jetpack Compose)
  src/main/java/com/example/MainActivity.kt   Field, presets, validation, export
  src/test/                                    Robolectric + Roborazzi screenshot tests

web/                       React + TypeScript web application
  src/components/          FieldCanvas, ControlsPanel, ValidationBanner, dialogs
  src/lib/validation.ts    ICC fielding-restriction rules
  src/lib/storage.ts       Custom preset slots in localStorage
  src/lib/gemini.ts        Client for the tactical-advice function
  src/data/presets.ts      Built-in field presets
  functions/api/           Cloudflare Pages Functions (server-side Gemini proxy)
  public/_redirects        SPA routing for Cloudflare Pages
```

## Configuration

| Variable         | Used by                | Notes                                |
| ---------------- | ---------------------- | ------------------------------------ |
| `GEMINI_API_KEY` | Web AI advisor only    | Server-side only. Never commit a key. |

`.env` is git-ignored at both the root and in `web/`; only the `.env.example`
files are tracked. Note that `web/.dev.vars` is not covered by
`web/.gitignore` yet — add it there before putting a real key in it.
