import { api } from "./client";
import {
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  ConfirmUploadResponseSchema,
  AssociateEventsRequest,
  AssociateEventsResponse,
  AssociateEventsResponseSchema,
  DeleteVideoRequest,
  DeleteVideoResponse,
  DeleteVideoResponseSchema,
  VideoFeedResponse,
  VideoFeedResponseSchema,
} from "@movapp/types";

export const videosApi = {
  // Get paginated video feed for an event
  getEventVideoFeed: (
    eventId: string,
    cursor?: string,
    limit?: number,
    userId?: string
  ): Promise<VideoFeedResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", limit.toString());
    if (userId) params.append("userId", userId);

    const queryString = params.toString();
    const endpoint = `/videos/feed/${eventId}${
      queryString ? `?${queryString}` : ""
    }`;

    return api.get(endpoint, VideoFeedResponseSchema);
  },

  // Confirm upload and save to database with thumbnail
  confirmUpload: (
    uploadData: ConfirmUploadRequest
  ): Promise<ConfirmUploadResponse> =>
    api.post("/videos/confirm-upload", uploadData, ConfirmUploadResponseSchema),

  // Associate video with events and mark as published
  associateEvents: (
    associationData: AssociateEventsRequest
  ): Promise<AssociateEventsResponse> =>
    api.post(
      "/videos/associate-events",
      associationData,
      AssociateEventsResponseSchema
    ),

  // Delete video from R2 and database (only if no event associations)
  deleteVideo: (deleteData: DeleteVideoRequest): Promise<DeleteVideoResponse> =>
    api.post("/videos/delete", deleteData, DeleteVideoResponseSchema),
};
