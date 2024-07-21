import { defineConfig } from 'vite';

export default defineConfig({
  // 다른 설정들...
  define: {
    'import.meta.env': {
      VITE_WEATHER_API_KEY: process.env.VITE_WEATHER_API_KEY,
      VITE_CLIENT_ID: process.env.VITE_CLIENT_ID,
      VITE_CLIENT_SECRET: process.env.VITE_CLIENT_SECRET,
    },
  },
});
