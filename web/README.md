# FieldPlanner Pro — Web

A React + TypeScript + Vite web version of the Cricket Field Planner (see the [Android app](../app) for the original). Drag fielders around an interactive pitch, validate placements against ICC fielding regulations for T20/ODI/Test, load tactical presets, mirror the field for left-handed batters, save custom presets locally, export a tactical plan (copy or CSV), and get AI tactical advice via the Gemini API.

## Setup

```bash
npm install
```

Optional — enable the AI Advisor locally (requires the Wrangler CLI to serve the API proxy function):

```bash
cp .env.example .dev.vars
# then add your Gemini API key from https://aistudio.google.com/apikey to .dev.vars
npx wrangler pages dev -- npm run dev
```

## Run

```bash
npm run dev
```

(The AI Advisor button will error out under plain `npm run dev` since it calls `/api/tactical-advice`, which only exists under Wrangler or once deployed to Cloudflare Pages.)

## Build

```bash
npm run build
npm run preview
```

## Notes

- Field logic (presets, ICC validation rules, zone labeling) is ported 1:1 from the Android app's `MainActivity.kt`.
- Custom preset slots are stored in `localStorage` (equivalent to the Android app's `SharedPreferences`).
- AI Advisor calls go through `functions/api/tactical-advice.ts`, a Cloudflare Pages Function. The Gemini API key is read server-side from the `GEMINI_API_KEY` environment variable/secret and never reaches the browser.
