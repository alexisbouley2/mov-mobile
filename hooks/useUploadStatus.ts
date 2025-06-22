import { useState, useEffect } from "react";
import { mediaUploadManager } from "@/services/upload";

interface UseUploadStatusProps {
  jobId: string | null;
}

export function useUploadStatus({ jobId }: UseUploadStatusProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setIsUploading(false);
      setProgress(0);
      setIsComplete(false);
      setError(null);
      return;
    }

    const job = mediaUploadManager.getJob(jobId);
    if (!job) {
      setError("Job not found");
      return;
    }

    // Set initial state
    setIsUploading(
      job.status === "created" ||
        job.status === "processing" ||
        job.status === "uploading"
    );
    setProgress(job.progress);
    setIsComplete(job.status === "uploaded");
    setError(job.error || null);

    // Subscribe to updates
    const unsubscribe = mediaUploadManager.subscribe(jobId, (updatedJob) => {
      setIsUploading(
        updatedJob.status === "created" ||
          updatedJob.status === "processing" ||
          updatedJob.status === "uploading"
      );
      setProgress(updatedJob.progress);
      setIsComplete(updatedJob.status === "uploaded");
      setError(updatedJob.error || null);
    });

    return unsubscribe;
  }, [jobId]);

  const waitForCompletion = async (timeoutMs: number = 30000) => {
    if (!jobId) return;

    try {
      await mediaUploadManager.waitForJob(jobId, timeoutMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    }
  };

  return {
    isUploading,
    progress,
    isComplete,
    error,
    waitForCompletion,
  };
}
