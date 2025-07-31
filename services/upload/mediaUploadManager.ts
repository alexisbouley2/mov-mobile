import log from "@/utils/logger";
import { UploadProcessor } from "./baseProcessor";
import { VideoUploadProcessor } from "./videoProcessor";
import {
  UserPhotoUploadProcessor,
  EventPhotoUploadProcessor,
} from "./photoProcessor";
import { UploadJob, UploadType, UploadOptions } from "./types";

// Main media upload manager
export class MediaUploadManager {
  private jobs: Map<string, UploadJob> = new Map();
  private listeners: Map<string, (_job: UploadJob) => void> = new Map();
  private processors: Map<UploadType, UploadProcessor> = new Map();

  constructor() {
    // Initialize processors
    this.processors.set("video", new VideoUploadProcessor());
    this.processors.set("user_photo", new UserPhotoUploadProcessor());
    this.processors.set("event_photo", new EventPhotoUploadProcessor());
  }

  /**
   * Create a job immediately and return jobId
   */
  createJob(
    originalUri: string,
    userId: string,
    uploadType: UploadType,
    options: UploadOptions = {}
  ): string {
    const jobId = `upload_${uploadType}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const job: UploadJob = {
      id: jobId,
      originalUri,
      userId,
      uploadType,
      status: "created",
      progress: 0,
      createdAt: new Date(),
      options,
    };

    this.jobs.set(jobId, job);
    this.notifyListeners(jobId);

    log.debug(`Created job ${jobId} for ${uploadType}`);
    return jobId;
  }

  /**
   * Start upload for an existing job
   */
  async startUpload(
    jobId: string,
    onProgress?: (_progress: number) => void
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Subscribe to updates if callback provided
    if (onProgress) {
      this.subscribe(jobId, (job) => {
        onProgress(job.progress);
      });
    }

    // Start upload in background
    this.uploadJob(jobId).catch((error) => {
      log.error(`Upload failed for job ${jobId}:`, error);
    });
  }

  /**
   * Internal method to handle the actual upload process
   */
  private async uploadJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    try {
      // Update status to processing
      job.status = "processing";
      this.notifyListeners(jobId);

      // Get the appropriate processor
      const processor = this.processors.get(job.uploadType);
      if (!processor) {
        throw new Error(`Unknown upload type: ${job.uploadType}`);
      }

      // Process files based on type
      job.progress = 10;
      this.notifyListeners(jobId);

      const processedFiles = await processor.processFiles(
        job.originalUri,
        job.options || {}
      );
      job.processedFiles = processedFiles;
      job.status = "uploading";
      job.progress = 30;
      this.notifyListeners(jobId);

      // Upload to R2
      const uploadResult = await processor.uploadToR2(
        processedFiles,
        job.userId,
        (progress) => {
          // Map upload progress to 30% -> 90%
          const mappedProgress = 30 + progress * 0.6;
          job.progress = mappedProgress;
          this.notifyListeners(jobId);
        }
      );

      job.uploadResult = uploadResult;
      job.status = "uploaded";
      job.progress = 100;
      this.notifyListeners(jobId);
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Upload failed";
      this.notifyListeners(jobId);

      // Delete uploaded files if the job failed after some files were uploaded
      const processor = this.processors.get(job.uploadType);
      if (processor && processor.getUploadedFiles().length > 0) {
        try {
          await processor.deleteUploadedFiles(job.userId);
          log.info(`Deleted uploaded files for failed job ${jobId}`);
        } catch (deleteError) {
          log.error(
            `Failed to delete uploaded files for failed job ${jobId}:`,
            deleteError
          );
          // Don't throw error - we still want to mark the job as failed
        }
      }

      throw error;
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): UploadJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get preview (thumbnail) for immediate display
   */
  getPreview(jobId: string): string | null {
    const job = this.jobs.get(jobId);
    return job?.processedFiles?.thumbnail || null;
  }

  /**
   * Check if job is uploaded and ready
   */
  isJobReady(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    return job?.status === "uploaded" && !!job.uploadResult;
  }

  /**
   * Wait for job to complete
   */
  async waitForJob(
    jobId: string,
    timeoutMs: number = 30000
  ): Promise<UploadJob> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Job ${jobId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      const checkJob = () => {
        const job = this.jobs.get(jobId);
        if (!job) {
          clearTimeout(timeout);
          reject(new Error(`Job ${jobId} not found`));
          return;
        }

        if (job.status === "uploaded") {
          clearTimeout(timeout);
          resolve(job);
        } else if (job.status === "failed") {
          clearTimeout(timeout);
          reject(new Error(job.error || "Upload failed"));
        } else {
          // Check again in 100ms
          setTimeout(checkJob, 100);
        }
      };

      checkJob();
    });
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      log.info(`Cancelling job ${jobId} (${job.uploadType})`);
      job.status = "cancelled";
      this.notifyListeners(jobId);

      // Delete uploaded files from R2 if any were uploaded
      const processor = this.processors.get(job.uploadType);
      if (processor) {
        const uploadedFiles = processor.getUploadedFiles();
        if (uploadedFiles.length > 0) {
          log.info(
            `Job ${jobId} has ${uploadedFiles.length} uploaded files to delete:`,
            uploadedFiles
          );
          try {
            await processor.deleteUploadedFiles(job.userId);
            log.info(
              `Successfully deleted ${uploadedFiles.length} uploaded files for cancelled job ${jobId}`
            );
          } catch (error) {
            log.error(
              `Failed to delete uploaded files for cancelled job ${jobId}:`,
              error
            );
            // Don't throw error - we still want to cancel the job even if cleanup fails
          }
        } else {
          log.info(`Job ${jobId} has no uploaded files to delete`);
        }
      }

      this.jobs.delete(jobId);
      this.listeners.delete(jobId);
      log.info(`Job ${jobId} cancelled and cleaned up`);
    } else {
      log.warn(`Attempted to cancel non-existent job ${jobId}`);
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
  subscribe(jobId: string, callback: (_job: UploadJob) => void): () => void {
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
