import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kipi.swipeitgame',
  appName: 'Swipe It!',
  webDir: 'build',
  backgroundColor: '#f8f9fa',
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
      backgroundColor: '#f8f9fa',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      // Light style = dark icons, matching the light launch background
      style: 'LIGHT',
      backgroundColor: '#f8f9fa',
    },
  },
};

export default config;
