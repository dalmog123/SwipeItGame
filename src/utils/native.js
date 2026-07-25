import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Preferences } from "@capacitor/preferences";
import { Share } from "@capacitor/share";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

// True when running inside the iOS/Android app shell, false in a browser.
export const isNative = Capacitor.isNativePlatform();

export const getPlatform = () => Capacitor.getPlatform();

/**
 * Haptic feedback. Fire-and-forget: never throws, no-ops where unsupported
 * (falls back to navigator.vibrate on web browsers that have it).
 */
export const haptics = {
  light: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
  medium: () => Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}),
  heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}),
  success: () =>
    Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
  warning: () =>
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {}),
  error: () =>
    Haptics.notification({ type: NotificationType.Error }).catch(() => {}),
};

/**
 * Durable key-value storage.
 *
 * On device this is backed by UserDefaults (iOS) / SharedPreferences (Android),
 * which survive the WebView data eviction that can silently wipe localStorage —
 * critical here because userId IS the player's account (coins, achievements).
 * On the web it degrades to localStorage. Values written by the pre-native web
 * game under plain localStorage keys are migrated on first read.
 */
export const storage = {
  async get(key) {
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null && value !== undefined) return value;
    } catch (error) {
      console.warn("Preferences.get failed, using localStorage:", error);
    }
    try {
      const legacy = window.localStorage.getItem(key);
      if (legacy !== null) {
        // Migrate the legacy value so future reads hit durable storage
        Preferences.set({ key, value: legacy }).catch(() => {});
      }
      return legacy;
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.warn("Preferences.set failed, using localStorage:", error);
    }
    try {
      // Mirror to plain localStorage so the value keeps working if the user
      // opens the web version (or an older build) with the same WebView data.
      window.localStorage.setItem(key, value);
    } catch {}
  },

  async remove(key) {
    try {
      await Preferences.remove({ key });
    } catch {}
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

/**
 * Open the native share sheet. Returns true if the native sheet was shown
 * (including the user cancelling it), false if the caller should fall back
 * to web sharing (navigator.share / clipboard).
 */
export async function shareContent({ title, text, url, dialogTitle }) {
  if (!isNative) return false;
  try {
    const { value: canShare } = await Share.canShare();
    if (!canShare) return false;
    await Share.share({ title, text, url, dialogTitle: dialogTitle || title });
    return true;
  } catch (error) {
    // A rejection here is almost always the user dismissing the sheet;
    // either way the native path handled it.
    console.log("Native share dismissed or failed:", error);
    return true;
  }
}

const hexLuminance = (hexColor) => {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return 1;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Keep the status bar readable as the game's background theme changes:
 * dark icons over light backgrounds, light icons over dark ones.
 * On Android the bar's background color is tinted to match the theme.
 */
export function setStatusBarForBackground(hexColor) {
  if (!isNative) return;
  const isLightBackground = hexLuminance(hexColor) > 0.5;
  StatusBar.setStyle({
    style: isLightBackground ? Style.Light : Style.Dark,
  }).catch(() => {});
  if (getPlatform() === "android") {
    StatusBar.setBackgroundColor({ color: hexColor }).catch(() => {});
  }
}

/**
 * Subscribe to native app foreground/background transitions.
 * callback receives isActive (boolean). Returns a cleanup function.
 */
export function onAppStateChange(callback) {
  if (!isNative) return () => {};
  const handle = CapacitorApp.addListener("appStateChange", ({ isActive }) =>
    callback(isActive)
  );
  return () => {
    handle.then((h) => h.remove()).catch(() => {});
  };
}

/**
 * Subscribe to the Android hardware/gesture back button.
 * Returns a cleanup function. No-op on iOS and web.
 */
export function onBackButton(callback) {
  if (!isNative) return () => {};
  const handle = CapacitorApp.addListener("backButton", callback);
  return () => {
    handle.then((h) => h.remove()).catch(() => {});
  };
}

export function minimizeApp() {
  if (!isNative) return;
  CapacitorApp.minimizeApp().catch(() => {});
}

/**
 * One-time native boot: style the status bar for the launch theme and
 * dismiss the splash screen (config uses launchAutoHide: false so the
 * splash stays up exactly until the game has rendered).
 */
export async function initNative() {
  if (!isNative) return;
  setStatusBarForBackground("#0E1117");
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.warn("SplashScreen.hide failed:", error);
  }
}
