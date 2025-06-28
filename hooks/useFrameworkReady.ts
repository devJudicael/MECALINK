import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export function useFrameworkReady() {
  useEffect(() => {
    // Hide the splash screen after the app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
      window.frameworkReady?.();
    };
    
    hideSplash();
  }, []);
}
