import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Firebase config
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    
    // API integration mode
    NEXT_PUBLIC_USE_REAL_APIS: process.env.NEXT_PUBLIC_USE_REAL_APIS || 'false',
    
    // API Keys
    NEXT_PUBLIC_CLIPDROP_API_KEY: process.env.NEXT_PUBLIC_CLIPDROP_API_KEY || '',
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    NEXT_PUBLIC_RUNWAY_API_KEY: process.env.NEXT_PUBLIC_RUNWAY_API_KEY || '',
    
    // Virtual Try-On API Keys
    NEXT_PUBLIC_REPLICATE_API_TOKEN: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '',
    NEXT_PUBLIC_HUGGING_FACE_API_KEY: process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY || '',
  },
  
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Handle Node.js modules that can't run in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;