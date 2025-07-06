import { z } from "zod";

// Mobile environment schema
export const mobileEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "preview", "production"])
    .default("development"),

  EXPO_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),

  EXPO_PUBLIC_SUPABASE_URL: z.string().url().includes("supabase.co"),

  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).startsWith("eyJ"), // JWT tokens start with eyJ
});

// Export the inferred type
export type MobileEnvConfig = z.infer<typeof mobileEnvSchema>;

// Validation function
export const validateMobileEnv = (
  env: Record<string, string | undefined>
): MobileEnvConfig => {
  try {
    return mobileEnvSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(
        `Mobile environment validation failed:\n${errorMessages.join("\n")}`
      );
    }
    throw error;
  }
};
