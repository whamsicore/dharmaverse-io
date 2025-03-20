/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_GOOGLE_CLIENT_SECRET: string;
    readonly VITE_NEXTAUTH_SECRET: string;
    readonly VITE_NEXTAUTH_URL: string;
    readonly [key: string]: string;
  };
} 