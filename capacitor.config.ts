import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.v0id.cryptoapp',
  appName: 'Crypto-Analyst',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
