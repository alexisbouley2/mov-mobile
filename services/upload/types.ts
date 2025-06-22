export type UploadType = "video" | "user_photo" | "event_photo";

export interface UploadJob {
  id: string;
  originalUri: string;
  userId: string;
  uploadType: UploadType;
  status:
    | "created"
    | "processing"
    | "uploading"
    | "uploaded"
    | "failed"
    | "cancelled";
  progress: number;
  processedFiles?: {
    thumbnail?: string;
    image?: string;
    originalUri?: string;
  };
  uploadResult?: {
    thumbnailPath?: string;
    imagePath?: string;
    videoPath?: string;
  };
  createdAt: Date;
  error?: string;
  options?: UploadOptions;
}

export interface UploadOptions {
  quality?: number;
  time?: number; // For video thumbnails
}
