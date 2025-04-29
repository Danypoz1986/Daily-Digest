/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEWSDATA_API_KEY_1: string;
  readonly VITE_NEWSDATA_API_KEY_2: string;
  readonly VITE_NEWSDATA_API_KEY_3: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_MESSAGING_SENDER_ID: string;
  readonly VITE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}