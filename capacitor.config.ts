import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clarnote.app',
  appName: 'Clarnote',
  webDir: 'out',
  server: {
    // Allow requests to external APIs during development
    allowNavigation: [
      'https://api.openai.com',
      'http://localhost:3000'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
