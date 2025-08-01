// lib/config.ts
import { validateMobileEnv, type MobileEnvConfig } from "./validation.schema";

const environments = {
  development: {
    NODE_ENV: "development",
    EXPO_PUBLIC_API_URL: "http://192.168.1.157:3000", //Rue de patay
    // EXPO_PUBLIC_API_URL: "http://192.168.1.55:3000", //Parallel
    // EXPO_PUBLIC_API_URL: "http://MacBook-Air-de-Alexis.local:3000", //Partage de co
    // EXPO_PUBLIC_API_URL: "http://192.168.1.172:3000", //La Ville du Bois
    // EXPO_PUBLIC_API_URL: "http://192.168.1.163:3000", //SGDB
    // EXPO_PUBLIC_API_URL: "http://192.168.178.58:3000", //Zurich

    EXPO_PUBLIC_SUPABASE_URL: "https://sqzpncgvzsmgynpnpvpu.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenBuY2d2enNtZ3lucG5wdnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTUwMTgsImV4cCI6MjA2NDk3MTAxOH0.Z_pXE8Y7jiMxQ8gUtqmk-30lZAK1sY-IhY2OK91t0ag",
    EXPO_PUBLIC_WEB_URL: "http://localhost:3001",
  },
  preview: {
    NODE_ENV: "preview",
    EXPO_PUBLIC_API_URL: "https://mov-backend-staging.up.railway.app",
    EXPO_PUBLIC_SUPABASE_URL: "https://jwqcqpsatykgqhyxclbv.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWNxcHNhdHlrZ3FoeXhjbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTYzOTYsImV4cCI6MjA2ODY3MjM5Nn0.AkcJSc8dSdHA4CMI4ehBX4ypC4wJ37orZsQGzJstSDs",
    EXPO_PUBLIC_WEB_URL:
      "https://mov-web-git-staging-alexis-projects-83365ee2.vercel.app",
  },
  production: {
    NODE_ENV: "production",
    EXPO_PUBLIC_API_URL: "https://mov-backend-production.up.railway.app",
    EXPO_PUBLIC_SUPABASE_URL: "https://zhdplkfardrfaaqknuvl.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZHBsa2ZhcmRyZmFhcWtudXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTY0NjYsImV4cCI6MjA2ODY3MjQ2Nn0.5X4-E9_Ec5G6Dlr5ECaj_LIMwIch3511APx0EZcCu0w",
    EXPO_PUBLIC_WEB_URL: "https://getmovapp.com",
  },
};

const getConfig = (): MobileEnvConfig => {
  const currentEnv = process.env.EXPO_PUBLIC_ENV;
  const env = environments[currentEnv as keyof typeof environments];
  return validateMobileEnv(env);
};

export const config = getConfig();
