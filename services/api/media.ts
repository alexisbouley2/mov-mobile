import { api } from "./client";
import {
  GetUploadUrlsResponse,
  GetUploadUrlsResponseSchema,
  MediaEntityType,
  DeleteMediaRequest,
  DeleteMediaResponse,
  DeleteMediaResponseSchema,
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

  // Delete media files from R2
  deleteMedia: (
    deleteData: DeleteMediaRequest
  ): Promise<DeleteMediaResponse> => {
    return api.post("/media/delete", deleteData, DeleteMediaResponseSchema);
  },
};
