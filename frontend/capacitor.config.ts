import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ittickets.app',
  appName: 'IT Ticketing System',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1976D2',
      showSpinner: true,
      spinnerColor: '#FFFFFF'
    }
  }
};

export default config;
