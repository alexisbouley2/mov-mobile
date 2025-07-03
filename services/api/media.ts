import { api } from "./client";
import {
  GetUploadUrlsResponse,
  GetUploadUrlsResponseSchema,
  MediaEntityType,
} from "@movapp/types";

export const mediaApi = {
  // Get upload URLs for media uploads
  getUploadUrls: (
    userId: string,
    entityType: MediaEntityType
  ): Promise<GetUploadUrlsResponse> => {
    const params = new URLSearchParams({
      userId,
      entityType,
    });

    return api.get(
      `/media/upload-urls?${params.toString()}`,
      GetUploadUrlsResponseSchema
    );
  },
};
