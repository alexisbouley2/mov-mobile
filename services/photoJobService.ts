import {
  PhotoProcessingService,
  ProcessedPhoto,
} from "./photoProcessingService";
import { PhotoUploadService, PhotoUploadResult } from "./photoUploadService";
import log from "@/utils/logger";

export interface PhotoJob {
  id: string;
  originalUri: string;
  processedPhotos?: ProcessedPhoto;
  userId: string;
  entityType: "user" | "event";
  entityId: string;
  status:
    | "processing"
    | "ready"
    | "uploading"
    | "uploaded"
    | "failed"
    | "cancelled";
  progress: number;
  uploadResult?: PhotoUploadResult;
  createdAt: Date;
  error?: string;
}

class PhotoJobManager {
  private jobs: Map<string, PhotoJob> = new Map();
  private listeners: Map<string, (_job: PhotoJob) => void> = new Map();

  /**
   * Step 1: Create job and process image immediately
   */
  async createAndProcessJob(
    originalUri: string,
    userId: string,
    entityType: "user" | "event",
    entityId: string,
    onProgress?: (_progress: number) => void
  ): Promise<string> {
    const jobId = `photo_job_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const job: PhotoJob = {
      id: jobId,
      originalUri,
      userId,
      entityType,
      entityId,
      status: "processing",
      progress: 0,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.notifyListeners(jobId);

    // Subscribe to updates if callback provided
    if (onProgress) {
      this.subscribe(jobId, (job) => {
        onProgress(job.progress);
      });
    }

    try {
      // Process the image
      job.progress = 10;
      this.notifyListeners(jobId);

      const processedPhotos = await PhotoProcessingService.processImage(
        originalUri
      );

      job.processedPhotos = processedPhotos;
      job.status = "ready";
      job.progress = 100;
      this.notifyListeners(jobId);

      log.info("Photo processing completed for job:", jobId);
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Processing failed";
      this.notifyListeners(jobId);
      throw error;
    }
  }

  /**
   * Step 2: Upload processed photos (called on form submission)
   */
  async uploadJob(
    jobId: string,
    onProgress?: (_progress: number) => void
  ): Promise<PhotoUploadResult> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "ready") {
      throw new Error("Job not found or not ready for upload");
    }

    if (!job.processedPhotos) {
      throw new Error("No processed photos found");
    }

    // Subscribe to updates if callback provided
    if (onProgress) {
      this.subscribe(jobId, (job) => {
        onProgress(job.progress);
      });
    }

    try {
      job.status = "uploading";
      job.progress = 0;
      this.notifyListeners(jobId);

      const uploadResult = await PhotoUploadService.uploadPhotos(
        job.processedPhotos.thumbnail,
        job.processedPhotos.image,
        job.userId,
        job.entityType,
        (progress) => {
          job.progress = progress;
          this.notifyListeners(jobId);
        }
      );

      job.uploadResult = uploadResult;
      job.status = "uploaded";
      job.progress = 100;
      this.notifyListeners(jobId);

      return uploadResult;
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Upload failed";
      this.notifyListeners(jobId);
      throw error;
    }
  }

  /**
   * Get processed photo preview (200x200) for immediate display
   */
  getPreview(jobId: string): string | null {
    const job = this.jobs.get(jobId);
    return job?.processedPhotos?.thumbnail || null;
  }

  /**
   * Get job
   */
  getJob(jobId: string): PhotoJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Cancel job
   */
  cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "cancelled";
      this.notifyListeners(jobId);
      this.jobs.delete(jobId);
      this.listeners.delete(jobId);
    }
  }

  /**
   * Clean up completed job
   */
  cleanupJob(jobId: string): void {
    this.jobs.delete(jobId);
    this.listeners.delete(jobId);
  }

  /**
   * Subscribe to job updates
   */
  subscribe(jobId: string, callback: (_job: PhotoJob) => void): () => void {
    this.listeners.set(jobId, callback);
    return () => {
      this.listeners.delete(jobId);
    };
  }

  /**
   * Notify listeners of job updates
   */
  private notifyListeners(jobId: string): void {
    const job = this.jobs.get(jobId);
    const listener = this.listeners.get(jobId);

    if (job && listener) {
      listener(job);
    }
  }
}

// Export singleton instance
export const photoJobManager = new PhotoJobManager();
