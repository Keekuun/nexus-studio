import { useState, useCallback } from "react";
import {
  convertImageToWebp,
  ImageToWebpOptions,
} from "@/lib/utils/image-converter";

// 类型定义
export interface UseImageToWebpReturn {
  convertToWebp: (
    file: File,
    options?: ImageToWebpOptions
  ) => Promise<File | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * 图片转换为 WebP Hook（严格TS版）
 * 支持 HEIC / HEIF / TIFF / JPG / PNG
 * 自动等比缩放 + 压缩
 *
 * @example
 * ```tsx
 * const { convertToWebp, loading, error } = useImageToWebp();
 *
 * const handleUpload = async (file: File) => {
 *   const webpFile = await convertToWebp(file, {
 *     maxSize: 1920,
 *     quality: 0.8
 *   });
 *
 *   if (webpFile) {
 *     // Upload webpFile...
 *   }
 * };
 * ```
 */
export function useImageToWebp(): UseImageToWebpReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const convertToWebp = useCallback(
    async (file: File, options?: ImageToWebpOptions): Promise<File | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await convertImageToWebp(file, options);
        return result;
      } catch (err) {
        console.error("Image conversion error:", err);
        const message =
          err instanceof Error ? err.message : "Image processing failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    convertToWebp,
    loading,
    error,
    clearError,
  };
}
