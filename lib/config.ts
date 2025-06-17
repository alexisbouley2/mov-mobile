// lib/config.ts
import { validateMobileEnv, type MobileEnvConfig } from "./validation.schema";

const getConfig = (): MobileEnvConfig => {
  return validateMobileEnv(process.env);
};

export const config = getConfig();
