import type { CapacitorConfig } from "@capacitor/cli";

// appId must match the bundle ID in App Store Connect and the package name in the Play Console.
const config: CapacitorConfig = {
  appId: "com.zappstudio.galaxeed",
  appName: "Galaxeed",
  // 'dist-www' is the Vite build output (see vite.config.js / docs/BUILD_IOS.md) -
  // it bundles native-bridge.js's plugin imports. Point this at 'www' directly
  // only if you strip native-bridge.js and don't need Ads/IAP/GameCenter/Haptics.
  webDir: "dist-www",
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#05040dff",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      overlaysWebView: false,
    },
    // Android only. Without the hint, Capacitor pads the WebView for the system bars at
    // launch, then removes the padding once it reads viewport-fit=cover from index.html
    // (WebView 140+): the whole page jumps. "css" also injects --safe-area-inset-*,
    // read by --safe-top / --safe-bottom in style.css.
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
    },
  },
};

export default config;
