import { useState, useRef, useCallback } from "react";
import { VideoConverter } from "@/lib/utils/video-converter";

interface UseVideoConverterReturn {
  isLoaded: boolean;
  isProcessing: boolean;
  error: string | null;
  loadFFmpeg: () => Promise<void>;
  /** Convert to MP4 (Video + Audio) */
  convertToMp4: (blob: Blob) => Promise<Blob | null>;
  /** Extract video track only (Pure Video) */
  extractVideoOnly: (
    blob: Blob,
    format: "webm" | "mp4"
  ) => Promise<Blob | null>;
  /** Extract audio track only (Pure Audio) */
  extractAudioOnly: (blob: Blob) => Promise<Blob | null>;
}

/**
 * Video Processing Hook (based on FFmpeg.wasm)
 *
 * Provides functionalities for:
 * 1. Loading FFmpeg core (from CDN)
 * 2. Converting video to MP4 (Both Video & Audio)
 * 3. Extracting video track only (Pure Video)
 * 4. Extracting audio track only (Pure Audio)
 *
 * @example
 * ```tsx
 * const {
 *   loadFFmpeg,
 *   convertToMp4,
 *   extractVideoOnly,
 *   extractAudioOnly,
 *   isLoaded,
 *   isProcessing,
 *   error
 * } = useVideoConverter();
 *
 * // 1. Load FFmpeg on mount
 * useEffect(() => {
 *   loadFFmpeg();
 * }, [loadFFmpeg]);
 *
 * // 2. Convert to MP4 (Video + Audio)
 * const handleConvertToMp4 = async (webmBlob: Blob) => {
 *   if (!isLoaded || isProcessing) return;
 *
 *   const mp4Blob = await convertToMp4(webmBlob);
 *   if (mp4Blob) {
 *     // Handle result (e.g., download)
 *     const url = URL.createObjectURL(mp4Blob);
 *     window.open(url);
 *   }
 * };
 *
 * // 3. Extract Video Only (No Audio)
 * const handleExtractVideo = async (webmBlob: Blob) => {
 *   const videoBlob = await extractVideoOnly(webmBlob, "mp4");
 *   // ...
 * };
 *
 * // 4. Extract Audio Only (MP3)
 * const handleExtractAudio = async (webmBlob: Blob) => {
 *   const audioBlob = await extractAudioOnly(webmBlob);
 *   // ...
 * };
 *
 * // 5. Error Handling UI
 * if (error) return <div>Error: {error}</div>;
 * ```
 */
export function useVideoConverter(): UseVideoConverterReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用 useRef 保持每个组件实例独立的 converter
  const converterRef = useRef<VideoConverter | null>(null);

  const getConverter = useCallback(() => {
    if (!converterRef.current) {
      converterRef.current = new VideoConverter();
    }
    return converterRef.current;
  }, []);

  const loadFFmpeg = useCallback(async () => {
    const converter = getConverter();
    try {
      if (!converter.isLoaded) {
        await converter.load();
      }
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error("FFmpeg load failed:", err);
      setError("FFmpeg 加载失败，转码功能不可用。请检查网络或刷新重试。");
    }
  }, [getConverter]);

  const convertToMp4 = useCallback(
    async (blob: Blob): Promise<Blob | null> => {
      if (!isLoaded) return null;
      setIsProcessing(true);
      setError(null);

      try {
        const result = await getConverter().convertToMp4(blob);
        return result;
      } catch (e: any) {
        console.error("MP4 conversion failed:", e);
        setError(`转码 MP4 失败: ${e.message || "未知错误"}`);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isLoaded, getConverter]
  );

  const extractVideoOnly = useCallback(
    async (blob: Blob, format: "webm" | "mp4"): Promise<Blob | null> => {
      if (!isLoaded) return null;
      setIsProcessing(true);
      setError(null);

      try {
        const result = await getConverter().extractVideoOnly(blob, format);
        return result;
      } catch (e: any) {
        console.error("Video extraction failed:", e);
        setError(`提取纯视频失败: ${e.message}`);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isLoaded, getConverter]
  );

  const extractAudioOnly = useCallback(
    async (blob: Blob): Promise<Blob | null> => {
      if (!isLoaded) return null;
      setIsProcessing(true);
      setError(null);

      try {
        const result = await getConverter().extractAudioOnly(blob);
        return result;
      } catch (e: any) {
        console.error("Audio extraction failed:", e);
        setError(`提取纯音频失败: ${e.message}`);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isLoaded, getConverter]
  );

  return {
    isLoaded,
    isProcessing,
    error,
    loadFFmpeg,
    convertToMp4,
    extractVideoOnly,
    extractAudioOnly,
  };
}
