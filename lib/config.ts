// lib/config.ts
import { validateMobileEnv, type MobileEnvConfig } from "./validation.schema";

const environments = {
  development: {
    NODE_ENV: "development",
    // EXPO_PUBLIC_API_URL: "http://192.168.1.157:3000", //Rue de patay
    // EXPO_PUBLIC_API_URL: "http://192.168.1.55:3000", //Parallel
    EXPO_PUBLIC_API_URL: "http://MacBook-Air-de-Alexis.local:3000", //Partage de co
    // EXPO_PUBLIC_API_URL: "http://192.168.1.172:3000", //La Ville du Bois
    EXPO_PUBLIC_SUPABASE_URL: "https://sqzpncgvzsmgynpnpvpu.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenBuY2d2enNtZ3lucG5wdnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTUwMTgsImV4cCI6MjA2NDk3MTAxOH0.Z_pXE8Y7jiMxQ8gUtqmk-30lZAK1sY-IhY2OK91t0ag",
  },
  preview: {
    NODE_ENV: "preview",
    EXPO_PUBLIC_API_URL: "https://mov-backend-production.up.railway.app",
    EXPO_PUBLIC_SUPABASE_URL: "https://sqzpncgvzsmgynpnpvpu.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenBuY2d2enNtZ3lucG5wdnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTUwMTgsImV4cCI6MjA2NDk3MTAxOH0.Z_pXE8Y7jiMxQ8gUtqmk-30lZAK1sY-IhY2OK91t0ag",
  },
  production: {
    NODE_ENV: "production",
    EXPO_PUBLIC_API_URL: "https://mov-backend-production.up.railway.app",
    EXPO_PUBLIC_SUPABASE_URL: "https://sqzpncgvzsmgynpnpvpu.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenBuY2d2enNtZ3lucG5wdnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTUwMTgsImV4cCI6MjA2NDk3MTAxOH0.Z_pXE8Y7jiMxQ8gUtqmk-30lZAK1sY-IhY2OK91t0ag",
  },
};

const getConfig = (): MobileEnvConfig => {
  const currentEnv = process.env.EXPO_PUBLIC_ENV;
  const env = environments[currentEnv as keyof typeof environments];
  return validateMobileEnv(env);
};

export const config = getConfig();
