# Swipe It! 🎮

A fast-paced arcade game of swipes and taps — react to each block before the timer runs out. Built with React, shipped as a **native iOS and Android app** via [Capacitor](https://capacitorjs.com), with the web version still deployable to GitHub Pages.

## How it's put together

| Layer | What it is |
| --- | --- |
| `src/` | The game itself (React + Tailwind + framer-motion, Firebase for scores/shop) |
| `src/utils/native.js` | Native bridge: haptics, share sheet, durable storage, status bar, splash, app lifecycle |
| `ios/` | Native iOS app (Xcode project, Capacitor shell) |
| `android/` | Native Android app (Gradle project, Capacitor shell) |
| `capacitor.config.ts` | Shared native configuration (app id `com.kipi.swipeitgame`, splash/status bar) |

Native niceties already wired in:

- **Haptic feedback** — light tick on every cleared block, success pulse on coins/extra lives, heavy thud + error buzz on mistakes and game over
- **Native share sheet** for the referral link (falls back to web share/clipboard in browsers)
- **Durable player identity** — the `userId` (your coins, achievements, high score) lives in iOS `UserDefaults` / Android `SharedPreferences` via Capacitor Preferences, so it survives WebView storage eviction; old web saves are migrated automatically
- **Game-aware lifecycle** — auto-pause when the app is backgrounded; Android back button pauses/resumes instead of killing the game
- **Status bar** that flips between light/dark icons to stay readable as score themes change
- **Portrait-locked**, no rubber-band scrolling, no double-tap zoom, native splash screen

## Prerequisites

- Node 18+ (`npm install` once after cloning)
- A `.env` file in the project root with your Firebase web config:
  ```
  REACT_APP_FIREBASE_API_KEY=...
  REACT_APP_FIREBASE_AUTH_DOMAIN=...
  REACT_APP_FIREBASE_PROJECT_ID=...
  REACT_APP_FIREBASE_STORAGE_BUCKET=...
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
  REACT_APP_FIREBASE_APP_ID=...
  REACT_APP_FIREBASE_MEASUREMENT_ID=...
  ```
  (values are in Firebase Console → Project settings → Your apps)
- **iOS**: a Mac with Xcode 15+ and CocoaPods (`sudo gem install cocoapods`)
- **Android**: Android Studio with an SDK installed

## Development

```bash
npm start          # run the game in the browser at localhost:3000
```

## Run on iOS (device or simulator)

```bash
npm run ios
```

This builds the web bundle, syncs it into `ios/` (including `pod install`), and opens Xcode. In Xcode:

1. Select the `App` target → *Signing & Capabilities* → pick your Apple developer team (first time only)
2. Choose a simulator or your plugged-in iPhone and hit **Run** ▶

## Run on Android

```bash
npm run android
```

Same flow: builds, syncs into `android/`, opens Android Studio — then **Run** ▶ on an emulator or device.

> After pulling changes or editing web code, `npm run sync` refreshes both native projects without opening the IDEs.

## Ship it

- **TestFlight / App Store**: In Xcode: Product → Archive → Distribute. Bump `MARKETING_VERSION` for each release. `ITSAppUsesNonExemptEncryption` is already set, so no export-compliance questionnaire on upload.
- **Google Play**: In Android Studio: Build → Generate Signed App Bundle (create a keystore the first time — keep it safe!).
- **Web (GitHub Pages)**: `npm run deploy` still publishes to https://dalmog123.github.io/SwipeItGame

## Versioning

```bash
npm run update-version        # patch bump of the in-game version
npm run update-version:minor
npm run update-version:major
```
