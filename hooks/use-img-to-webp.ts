import { useState, useCallback } from "react";
import heic2any from "heic2any";
import UTIF from "utif";

// 类型定义
interface UseImageToWebpOptions {
  maxSize?: number;
  quality?: number;
}

interface UseImageToWebpReturn {
  convertToWebp: (
    file: File,
    options?: UseImageToWebpOptions
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
 *
 * tiff: https://file-examples.com/wp-content/storage/2017/10/file_example_TIFF_5MB.tiff
 *
 * heic: https://heic.digital/download-sample/shelf-christmas-decoration.heic
 * ```
 */
export function useImageToWebp(): UseImageToWebpReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const convertToWebp = useCallback(
    async (
      file: File,
      options?: UseImageToWebpOptions
    ): Promise<File | null> => {
      const maxSize = options?.maxSize ?? 2048;
      const quality = options?.quality ?? 0.8;

      if (!file || !(file instanceof File)) {
        const errMsg = "Please provide a valid file object";
        setError(errMsg);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        let bitmap: ImageBitmap;

        // 处理 HEIC / HEIF 格式
        if (
          file.type.includes("heic") ||
          file.type.includes("heif") ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif")
        ) {
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
          });
          // heic2any 可以返回 Blob 或 Blob[]，这里处理单个文件
          const blob = Array.isArray(converted) ? converted[0] : converted;
          bitmap = await createImageBitmap(blob);
        }
        // 处理 TIFF 格式
        else if (
          file.type.includes("tiff") ||
          file.name.toLowerCase().endsWith(".tiff") ||
          file.name.toLowerCase().endsWith(".tif")
        ) {
          const arrayBuffer = await file.arrayBuffer();
          const ifds = UTIF.decode(arrayBuffer);
          if (!ifds || ifds.length === 0) {
            throw new Error("Failed to decode TIFF file");
          }

          // 获取第一帧
          const ifd = ifds[0];
          UTIF.decodeImage(arrayBuffer, ifd);
          const rgba = UTIF.toRGBA8(ifd);

          // 使用 rgba 直接构造 Uint8ClampedArray，避免 buffer 大小不匹配问题
          const imageData = new ImageData(
            new Uint8ClampedArray(rgba),
            ifd.width,
            ifd.height
          );

          bitmap = await createImageBitmap(imageData);
        }
        // 其他格式 (JPG, PNG, WebP, etc.)
        else {
          bitmap = await createImageBitmap(file);
        }

        let { width, height } = bitmap;

        // 等比缩放
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Canvas 绘制
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get Canvas 2D context");
        }

        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        // 转换为 WebP Blob
        const webpBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to convert image to WebP"));
            },
            "image/webp",
            quality
          );
        });

        // 构造可上传的 File 对象
        const originalName =
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const newFileName = `${originalName}.webp`;

        const webpFile = new File([webpBlob], newFileName, {
          type: "image/webp",
          lastModified: Date.now(),
        });

        return webpFile;
      } catch (err) {
        console.error("Image conversion error:", err);
        const message =
          err instanceof Error ? err.message : "Image processing failed";
        // 对 TIFF 解码错误提供更具体的提示
        if (
          message.includes("tiff") ||
          (file.type.includes("tiff") && !message.includes("WebP"))
        ) {
          setError(
            `TIFF parsing failed: ${message}. Please try converting with another tool.`
          );
        } else {
          setError(message);
        }
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
