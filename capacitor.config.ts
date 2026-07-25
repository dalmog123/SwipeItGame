import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kipi.swipeitgame',
  appName: 'Swipe It!',
  webDir: 'build',
  backgroundColor: '#0E1117',
  ios: {
    // The game manages its own layout; kill WebView rubber-band scrolling
    scrollEnabled: false,
    contentInset: 'never',
  },
  plugins: {
    SplashScreen: {
      // Splash stays up until the game calls SplashScreen.hide() (initNative)
      launchAutoHide: false,
      launchFadeOutDuration: 200,
      backgroundColor: '#0E1117',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      // Dark style = light icons, matching the dark neon launch background
      style: 'DARK',
      backgroundColor: '#0E1117',
    },
  },
};

export default config;
