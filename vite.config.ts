import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_'); // Ensure only VITE_ prefixed variables are loaded
  return {
    build: {
      chunkSizeWarningLimit: 1000 // Set limit to 1000KB
    },
    plugins: [react()],
    define: {
      'import.meta.env': JSON.stringify(env), // Ensure env variables are stringified
    },
  };
});

