import { z } from "zod";
import { api } from "./client";
import { config } from "@/lib/config";

const pushTokenResponseSchema = z.object({
  id: z.string(),
  token: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  lastUsedAt: z.date(),
  isActive: z.boolean(),
});

const createPushTokenRequestSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

const removePushTokenRequestSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

const successResponseSchema = z.object({
  success: z.boolean(),
});

export type PushTokenResponse = z.infer<typeof pushTokenResponseSchema>;
export type CreatePushTokenRequest = z.infer<
  typeof createPushTokenRequestSchema
>;
export type RemovePushTokenRequest = z.infer<
  typeof removePushTokenRequestSchema
>;

export const pushNotificationsApi = {
  async createToken(data: CreatePushTokenRequest): Promise<PushTokenResponse> {
    return api.post("/push-tokens", data, pushTokenResponseSchema);
  },

  async removeToken(
    data: RemovePushTokenRequest
  ): Promise<{ success: boolean }> {
    // Pour la méthode DELETE avec body, on doit faire un fetch manuel
    const response = await fetch(`${config.EXPO_PUBLIC_API_URL}/push-tokens`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to remove push token: ${response.statusText}`);
    }
    return response.json();
  },

  async removeAllUserTokens(userId: string): Promise<{ success: boolean }> {
    return api.delete(`/push-tokens/user/${userId}`, successResponseSchema);
  },

  async getUserTokens(userId: string): Promise<PushTokenResponse[]> {
    return api.get(
      `/push-tokens/user/${userId}`,
      z.array(pushTokenResponseSchema)
    );
  },
};
