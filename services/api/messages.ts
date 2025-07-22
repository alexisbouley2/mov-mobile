import { api } from "./client";
import {
  SendMessageRequest,
  EventMessagesResponse,
  EventMessagesResponseSchema,
  Message,
  MessageSchema,
} from "@movapp/types";

export const messagesApi = {
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
  ): Promise<Message> =>
    api.post(
      `/messages/event/${eventId}/user/${userId}`,
      messageData,
      MessageSchema
    ),

  // Get a single message by ID with sender information
  getMessageById: (
    messageId: string,
    userId: string
  ): Promise<Message | null> =>
    api.get(`/messages/${messageId}/user/${userId}`, MessageSchema),
};
