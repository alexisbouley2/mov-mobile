import { api } from "./client";
import {
  SendMessageRequest,
  SendMessageResponse,
  SendMessageResponseSchema,
  EventMessagesResponse,
  EventMessagesResponseSchema,
  MessagePreviewResponse,
  MessagePreviewResponseSchema,
} from "@movapp/types";

export const messagesApi = {
  // Get message preview for event detail page
  getMessagePreview: (
    eventId: string,
    userId: string
  ): Promise<MessagePreviewResponse> =>
    api.get(
      `/messages/preview/event/${eventId}/user/${userId}`,
      MessagePreviewResponseSchema
    ),

  // Get messages with pagination for an event
  getMessages: (
    eventId: string,
    userId: string,
    page?: number,
    limit?: number
  ): Promise<EventMessagesResponse> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = `/messages/event/${eventId}/user/${userId}${
      queryString ? `?${queryString}` : ""
    }`;

    return api.get(endpoint, EventMessagesResponseSchema);
  },

  // Send a message to an event
  sendMessage: (
    eventId: string,
    userId: string,
    messageData: SendMessageRequest
  ): Promise<SendMessageResponse> =>
    api.post(
      `/messages/event/${eventId}/user/${userId}`,
      messageData,
      SendMessageResponseSchema
    ),

  // Get a single message by ID with sender information
  getMessageById: (
    messageId: string,
    userId: string
  ): Promise<SendMessageResponse | null> =>
    api.get(`/messages/${messageId}/user/${userId}`, SendMessageResponseSchema),
};
