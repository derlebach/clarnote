/**
 * Mobile App Configuration
 * Handles platform-specific configurations for mobile app deployment
 */

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor
  if ((window as any).Capacitor) {
    return true;
  }
  
  // Check for React Native
  if ((window as any).ReactNativeWebView) {
    return true;
  }
  
  // Check for mobile user agents
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

export const isCapacitor = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor;
};

export const isReactNative = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).ReactNativeWebView;
};

export const getPlatform = () => {
  if (typeof window === 'undefined') return 'server';
  
  if (isCapacitor()) {
    const Capacitor = (window as any).Capacitor;
    return Capacitor.getPlatform(); // 'ios', 'android', or 'web'
  }
  
  if (isReactNative()) {
    return 'react-native';
  }
  
  return 'web';
};

export const getApiUrl = () => {
  // In production mobile apps, use the production API
  if (isCapacitor() || isReactNative()) {
    return process.env.NEXT_PUBLIC_API_URL || 'https://clarnote.com';
  }
  
  // In development or web, use relative URLs
  return '';
};

export const getAuthUrl = () => {
  // Mobile apps need full URLs for OAuth redirects
  if (isCapacitor() || isReactNative()) {
    return process.env.NEXT_PUBLIC_AUTH_URL || 'https://clarnote.com';
  }
  
  // Web can use relative URLs
  return '';
};

export const getStorageKey = (key: string) => {
  // Prefix storage keys for mobile to avoid conflicts
  const platform = getPlatform();
  if (platform === 'ios' || platform === 'android') {
    return `clarnote_mobile_${key}`;
  }
  return `clarnote_${key}`;
};

export const mobileConfig = {
  // File upload limits
  maxFileSize: isMobile() ? 25 * 1024 * 1024 : 50 * 1024 * 1024, // 25MB mobile, 50MB web
  
  // Audio recording settings
  audioFormat: getPlatform() === 'ios' ? 'm4a' : 'webm',
  audioQuality: isMobile() ? 0.7 : 0.9,
  
  // Performance settings
  chunkSize: isMobile() ? 1024 * 1024 : 5 * 1024 * 1024, // 1MB mobile, 5MB web
  requestTimeout: isMobile() ? 60000 : 30000, // 60s mobile, 30s web
  
  // UI settings
  showNativeControls: isMobile(),
  useNativeShare: isCapacitor(),
  useNativeCamera: isCapacitor(),
  
  // Feature flags
  enableOfflineMode: isCapacitor(),
  enablePushNotifications: isCapacitor(),
  enableBiometricAuth: isCapacitor(),
};

export default mobileConfig; 