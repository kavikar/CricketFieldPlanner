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

## Beta tester signup (Cloudflare KV setup)

The 🧪 "Join Android Beta Testing" button opens a form (`src/components/BetaSignupDialog.tsx`) that posts an email address to a Cloudflare Pages Function (`functions/api/beta-signup.ts`), which writes it to a Cloudflare KV namespace. This needs one manual setup step in the Cloudflare dashboard before it'll work in production — it's a 404/500 without it, since Pages Functions can't create KV bindings on their own.

1. **Create the namespace**: Cloudflare dashboard → **Workers & Pages** → **KV** → **Create a namespace**. Name it `BETA_SIGNUPS` (any name works, but this doc assumes that one).
2. **Bind it to the Pages project**: open the `cricketfieldplanner` Pages project → **Settings** → **Functions** → **KV namespace bindings** → **Add binding**.
   - Variable name: `BETA_SIGNUPS` (must match exactly — this is what `env.BETA_SIGNUPS` in the Function reads).
   - KV namespace: the one you just created.
   - Add it under **both** Production and Preview environments (Preview is what powers PR/branch deploys).
3. **Redeploy** — an existing deployment won't pick up a binding added after the fact; trigger a new deployment (push a commit, or use "Retry deployment" in the dashboard).

To view signups afterward: dashboard → **Workers & Pages** → **KV** → open the `BETA_SIGNUPS` namespace → browse keys. Each key is a lowercased email address; the value is `{"email": "...", "submittedAt": "..."}`. There's no admin UI in the app itself — this is a manual, low-volume list meant to be copy-pasted into the Play Console closed-testing tester email list by hand.

If the `BETA_SIGNUPS` binding is missing, the Function returns a clear `500` ("Signup storage is not configured.") instead of failing silently.

## Notes

- Field logic (presets, ICC validation rules, zone labeling) is ported 1:1 from the Android app's `MainActivity.kt`.
- Custom preset slots are stored in `localStorage` (equivalent to the Android app's `SharedPreferences`).
- AI Advisor is bring-your-own-key: the visitor's Gemini API key lives only in their browser's `localStorage` (`src/lib/apiKey.ts`) and the browser calls `generativelanguage.googleapis.com` directly (`src/lib/gemini.ts`). This site has no server component in that request path and never sees anyone's key.
- Beta signup emails are stored in Cloudflare KV via `functions/api/beta-signup.ts` — see the section above for the one-time dashboard setup required.
