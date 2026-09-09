# FieldPlanner Pro — Web

A React + TypeScript + Vite web version of the Cricket Field Planner (see the [Android app](../app) for the original). Drag fielders around an interactive pitch, validate placements against ICC fielding regulations for T20/ODI/Test, load tactical presets, mirror the field for left-handed batters, save custom presets locally, export a tactical plan (copy or CSV), and get AI tactical advice via the Gemini API.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

The "AI Advice" button works out of the box under plain `npm run dev` — the first time you use it, paste in your own free Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). It's saved only in your browser's `localStorage` and called directly from the browser; it never passes through any server this app runs.

## Build

```bash
npm run build
npm run preview
```

## Notes

- Field logic (presets, ICC validation rules, zone labeling) is ported 1:1 from the Android app's `MainActivity.kt`.
- Custom preset slots are stored in `localStorage` (equivalent to the Android app's `SharedPreferences`).
- AI Advisor is bring-your-own-key: the visitor's Gemini API key lives only in their browser's `localStorage` (`src/lib/apiKey.ts`) and the browser calls `generativelanguage.googleapis.com` directly (`src/lib/gemini.ts`). This site has no server component in that request path and never sees anyone's key.
