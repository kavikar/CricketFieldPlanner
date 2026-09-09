<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2b900d10-db08-48f9-b72a-fba1e7f37f9b

## Run Locally

**Prerequisites:**  [Android Studio](https://developer.android.com/studio)


1. Open Android Studio
2. Select **Open** and choose the directory containing this project
3. Allow Android Studio to fix any incompatibilities as it imports the project.
4. Run the app on an emulator or physical device

`.env` / `GEMINI_API_KEY` (see `.env.example`) is scaffolding for an AI Advisor feature that isn't wired up on Android yet — see the "AI Advice — Coming Soon" badge in the app. It's not needed to build or run the app today. The web version already has this feature; see [`web/`](web).

You can also build from the command line with the checked-in Gradle wrapper: `./gradlew assembleDebug`.

## Web version

A React + TypeScript web version of this app lives in [`web/`](web). See [`web/README.md`](web/README.md) for setup instructions.
