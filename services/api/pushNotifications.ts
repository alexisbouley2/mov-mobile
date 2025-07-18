import { z } from "zod";
import { api } from "./client";
import {
  CreatePushTokenRequest,
  RemovePushTokenRequest,
  PushTokenResponse,
  PushTokenResponseSchema,
  RemovePushTokenResponseSchema,
} from "@movapp/types";

export const pushNotificationsApi = {
  async createToken(data: CreatePushTokenRequest): Promise<PushTokenResponse> {
    return api.post("/push-tokens", data, PushTokenResponseSchema);
  },

  async removeToken(
    data: RemovePushTokenRequest
  ): Promise<{ success: boolean }> {
    return api.deleteWithBody(
      "/push-tokens",
      data,
      RemovePushTokenResponseSchema
    );
  },

  async removeAllUserTokens(userId: string): Promise<{ success: boolean }> {
    return api.delete(
      `/push-tokens/user/${userId}`,
      RemovePushTokenResponseSchema
    );
  },

  async getUserTokens(userId: string): Promise<PushTokenResponse[]> {
    return api.get(
      `/push-tokens/user/${userId}`,
      z.array(PushTokenResponseSchema)
    );
  },
};
