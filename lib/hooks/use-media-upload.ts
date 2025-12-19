"use client";

import { useState, useCallback } from "react";
import type { MediaFile, ApiResponse } from "@/types";

/**
 * 媒体文件上传Hook
 * 提供文件上传功能
 */
export function useMediaUpload(): {
  uploading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<MediaFile | null>;
} {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<MediaFile | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const result: ApiResponse<MediaFile> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload failed");
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploading,
    error,
    uploadFile,
  };
}

