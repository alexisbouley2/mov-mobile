import { api } from "./client";
import {
  CreatePushTokenRequest,
  RemovePushTokenRequest,
  PushTokenResponse,
  PushTokenResponseSchema,
  RemovePushTokenResponseSchema,
  BadgeCountResponse,
  BadgeCountResponseSchema,
  MarkNotificationsReadResponse,
  MarkNotificationsReadResponseSchema,
} from "@movapp/types";

export const pushNotificationsApi = {
  async createToken(data: CreatePushTokenRequest): Promise<PushTokenResponse> {
    return api.post(
      "/push-notifications/tokens",
      data,
      PushTokenResponseSchema
    );
  },

  async removeToken(
    data: RemovePushTokenRequest
  ): Promise<{ success: boolean }> {
    return api.deleteWithBody(
      "/push-notifications/tokens",
      data,
      RemovePushTokenResponseSchema
    );
  },

  async getBadgeCount(userId: string): Promise<BadgeCountResponse> {
    return api.get(
      `/push-notifications/badges/${userId}`,
      BadgeCountResponseSchema
    );
  },

  async markEventNotificationsAsRead(
    userId: string,
    eventId: string
  ): Promise<MarkNotificationsReadResponse> {
    return api.patch(
      `/push-notifications/badges/${userId}/events/${eventId}/read`,
      {},
      MarkNotificationsReadResponseSchema
    );
  },
};
