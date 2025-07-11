import { api } from "./client";
import {
  CreateEventRequest,
  UpdateEventRequest,
  Event,
  EventSchema,
  EventWithDetails,
  EventWithDetailsSchema,
  CategorizedEventsResponse,
  CategorizedEventsResponseSchema,
  EventParticipantsResponse,
  EventParticipantsResponseSchema,
  UpdateEventResponse,
  UpdateEventResponseSchema,
  DeleteEventResponse,
  DeleteEventResponseSchema,
  GenerateInviteResponse,
  GenerateInviteResponseSchema,
  ValidateInviteResponse,
  ValidateInviteResponseSchema,
  AcceptInviteResponse,
  AcceptInviteResponseSchema,
  AcceptInviteRequest,
  DeleteParticipantResponse,
  DeleteParticipantResponseSchema,
} from "@movapp/types";

export const eventsApi = {
  // Create a new event
  create: (eventData: CreateEventRequest): Promise<Event> =>
    api.post("/events", eventData, EventSchema),

  // Get user events (categorized)
  getUserEvents: (userId: string): Promise<CategorizedEventsResponse> =>
    api.get(`/events/user/${userId}`, CategorizedEventsResponseSchema),

  // Get single event with details
  getEvent: (eventId: string): Promise<EventWithDetails | null> =>
    api.get(`/events/${eventId}`, EventWithDetailsSchema.nullable()),

  // Update an event
  update: (
    eventId: string,
    eventData: UpdateEventRequest
  ): Promise<UpdateEventResponse> =>
    api.patch(`/events/${eventId}`, eventData, UpdateEventResponseSchema),

  // Get event participants with pagination
  getEventParticipants: (
    eventId: string,
    userId: string,
    page?: number,
    limit?: number,
    confirmed?: boolean
  ): Promise<EventParticipantsResponse> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (typeof confirmed === "boolean")
      params.append("confirmed", String(confirmed));

    const queryString = params.toString();
    const endpoint = `/events/${eventId}/participants/user/${userId}${
      queryString ? `?${queryString}` : ""
    }`;

    return api.get(endpoint, EventParticipantsResponseSchema);
  },

  // Delete an event
  delete: (eventId: string, userId: string): Promise<DeleteEventResponse> =>
    api.delete(
      `/events/${eventId}?userId=${userId}`,
      DeleteEventResponseSchema
    ),

  // Generate event invite
  generateInvite: (
    eventId: string,
    userId: string
  ): Promise<GenerateInviteResponse> =>
    api.post(
      `/events/${eventId}/invite`,
      { userId },
      GenerateInviteResponseSchema
    ),

  // Validate event invite
  validateInvite: (token: string): Promise<ValidateInviteResponse> =>
    api.post(
      `/events/invite/validate`,
      { token },
      ValidateInviteResponseSchema
    ),

  // Accept event invite
  acceptInvite: ({
    token,
    userId,
  }: AcceptInviteRequest): Promise<AcceptInviteResponse> =>
    api.post(
      `/events/invite/accept`,
      { token, userId },
      AcceptInviteResponseSchema
    ),

  // Update participant confirmation status
  updateParticipantConfirmation: (
    eventId: string,
    userId: string,
    confirmed: boolean
  ): Promise<{ message: string }> =>
    api.patch(
      `/events/${eventId}/participants/${userId}/confirm`,
      { confirmed },
      UpdateEventResponseSchema
    ),

  // Add a participant to an event
  addParticipant: (
    eventId: string,
    participantUserId: string,
    userId: string
  ): Promise<{ message: string }> => {
    const endpoint = `/events/${eventId}/participants/${participantUserId}?userId=${userId}`;
    return api.post(endpoint, {}, UpdateEventResponseSchema);
  },

  // Delete a participant from an event
  deleteParticipant: (
    eventId: string,
    participantUserId: string,
    adminId: string
  ): Promise<DeleteParticipantResponse> => {
    const endpoint = `/events/${eventId}/participants/${participantUserId}?adminId=${adminId}`;
    return api.delete(endpoint, DeleteParticipantResponseSchema);
  },
};
