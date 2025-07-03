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
    limit?: number
  ): Promise<EventParticipantsResponse> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = `/events/${eventId}/participants/user/${userId}${
      queryString ? `?${queryString}` : ""
    }`;

    return api.get(endpoint, EventParticipantsResponseSchema);
  },
};
