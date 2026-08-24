# FieldPlanner Pro — Web

A React + TypeScript + Vite web version of the Cricket Field Planner (see the [Android app](../app) for the original). Drag fielders around an interactive pitch, validate placements against ICC fielding regulations for T20/ODI/Test, load tactical presets, mirror the field for left-handed batters, save custom presets locally, export a tactical plan (copy or CSV), and get AI tactical advice via the Gemini API.

## Setup

```bash
npm install
```

Optional — enable the AI Advisor:

```bash
cp .env.example .env
# then add your Gemini API key from https://aistudio.google.com/apikey to .env
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Notes

- Field logic (presets, ICC validation rules, zone labeling) is ported 1:1 from the Android app's `MainActivity.kt`.
- Custom preset slots are stored in `localStorage` (equivalent to the Android app's `SharedPreferences`).
- The Gemini API key is read from `VITE_GEMINI_API_KEY` and used client-side — fine for local/personal use, but don't ship the built bundle publicly with a real key embedded. For a public deployment, proxy the Gemini call through a small backend.
