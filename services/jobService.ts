import { MediaService } from "./mediaService";
import { config } from "@/lib/config";

export interface UploadJob {
  id: string;
  videoUri: string;
  userId: string;
  status: "pending" | "uploading" | "uploaded" | "failed" | "cancelled";
  progress: number;
  uploadedFileName?: string;
  createdAt: Date;
  uploadStartedAt?: Date;
  uploadCompletedAt?: Date;
  error?: string;
  eventIds?: string[];
}

class JobManager {
  private jobs: Map<string, UploadJob> = new Map();
  private uploadPromises: Map<string, Promise<any>> = new Map();
  // Use a more flexible type that works in both Node.js and browser
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, (_job: UploadJob) => void> = new Map();

  constructor() {
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Create a new upload job
   */
  createJob(videoUri: string, userId: string): string {
    const jobId = `job_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const job: UploadJob = {
      id: jobId,
      videoUri,
      userId,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.notifyListeners(jobId);

    return jobId;
  }

  /**
   * Start uploading for a job
   */
  async startUpload(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "pending") {
      throw new Error("Invalid job or job already started");
    }

    job.status = "uploading";
    job.uploadStartedAt = new Date();
    this.notifyListeners(jobId);

    const uploadPromise = this.performUpload(job);
    this.uploadPromises.set(jobId, uploadPromise);

    try {
      await uploadPromise;
    } catch (error) {
      // Error is already handled in performUpload
      console.error("Error in uploadPromise:", error);
    } finally {
      this.uploadPromises.delete(jobId);
    }
  }

  /**
   * Perform the actual upload
   */
  private async performUpload(job: UploadJob): Promise<void> {
    try {
      const result = await MediaService.uploadVideo(
        job.videoUri,
        job.userId,
        (progress) => {
          job.progress = progress;
          this.notifyListeners(job.id);
        }
      );

      job.status = "uploaded";
      job.uploadedFileName = result.video.videoPath;
      job.uploadCompletedAt = new Date();
      job.progress = 100;
      this.notifyListeners(job.id);
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Upload failed";
      this.notifyListeners(job.id);
      throw error;
    }
  }

  /**
   * Cancel a job and cleanup
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Mark as cancelled
    job.status = "cancelled";
    this.notifyListeners(jobId);

    // Cancel ongoing upload if any
    const uploadPromise = this.uploadPromises.get(jobId);
    if (uploadPromise) {
      // Note: We can't truly cancel the fetch request, but we can ignore the result
      this.uploadPromises.delete(jobId);
    }

    // Delete from R2 if upload was completed
    if (job.uploadedFileName) {
      try {
        await this.deleteFromR2(job.uploadedFileName, job.userId);
      } catch (error) {
        console.error("Failed to delete from R2:", error);
      }
    }

    // Remove job
    this.jobs.delete(jobId);
    this.listeners.delete(jobId);
  }

  /**
   * Associate events with a job
   */
  async associateEvents(jobId: string, eventIds: string[]): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "uploaded") {
      throw new Error("Job not found or not uploaded");
    }

    job.eventIds = eventIds;

    // Update video in backend with event associations
    await this.updateVideoEvents(job.uploadedFileName!, job.userId, eventIds);

    // Job is now complete, clean it up
    this.jobs.delete(jobId);
    this.listeners.delete(jobId);
  }

  /**
   * Delete video from R2
   */
  private async deleteFromR2(fileName: string, userId: string): Promise<void> {
    const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

    const response = await fetch(`${API_BASE_URL}/videos/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete from R2");
    }
  }

  /**
   * Update video with event associations
   */
  private async updateVideoEvents(
    fileName: string,
    userId: string,
    eventIds: string[]
  ): Promise<void> {
    const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

    const response = await fetch(`${API_BASE_URL}/videos/associate-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, userId, eventIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to associate events");
    }
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): UploadJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Subscribe to job updates
   */
  subscribe(jobId: string, callback: (_job: UploadJob) => void): () => void {
    this.listeners.set(jobId, callback);

    // Return unsubscribe function
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

  /**
   * Start interval to cleanup old jobs
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldJobs();
    }, 60000); // Check every minute
  }

  /**
   * Cleanup jobs older than 10 minutes
   */
  private cleanupOldJobs(): void {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < tenMinutesAgo && job.status !== "uploading") {
        this.cancelJob(jobId).catch(console.error);
      }
    }
  }

  /**
   * Destroy the job manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Cancel all jobs
    for (const jobId of this.jobs.keys()) {
      this.cancelJob(jobId).catch(console.error);
    }
  }
}

// Export singleton instance
export const jobManager = new JobManager();
