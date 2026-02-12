import { useState, useRef, useCallback, useEffect } from "react";
import {
  VideoConverter,
  VideoQuality,
  TranscodeOptions,
} from "@/lib/utils/video-converter";

interface UseVideoConverterReturn {
  isLoaded: boolean;
  isProcessing: boolean;
  error: string | null;
  /** Convert to MP4 (Video + Audio) */
  convertToMp4: (
    blob: Blob,
    options?: TranscodeOptions
  ) => Promise<Blob | null>;
  /** Extract video track only (Pure Video) */
  extractVideoOnly: (
    blob: Blob,
    format: "webm" | "mp4",
    options?: TranscodeOptions
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
 *   convertToMp4,
 *   extractVideoOnly,
 *   extractAudioOnly,
 *   isLoaded,
 *   isProcessing,
 *   error
 * } = useVideoConverter();
 *
 * // 1. Auto FFmpeg on mount
 * useEffect(() => {
 *   loadFFmpeg();
 * }, [loadFFmpeg]);
 *
 * // 2. Convert to MP4 (Video + Audio)
 * const handleConvertToMp4 = async (webmBlob: Blob) => {
 *   if (!isLoaded || isProcessing) return;
 *
 *   // Optional: Control quality, fps, bitrate
 *   // quality: "original" | "1080p" | "720p" | "480p"
 *   // fps: target frame rate (e.g. 30, 60)
 *   // bitrate: target bitrate (e.g. "2500k"), overrides default CRF
 *   const options = {
 *     quality: "1080p" as const,
 *     fps: 30
 *   };
 *
 *   const mp4Blob = await convertToMp4(webmBlob, options);
 *   if (mp4Blob) {
 *     // Handle result (e.g., download)
 *     const url = URL.createObjectURL(mp4Blob);
 *     window.open(url);
 *   }
 * };
 *
 * // 3. Extract Video Only (No Audio)
 * const handleExtractVideo = async (webmBlob: Blob) => {
 *   // Support same options for MP4 format
 *   const videoBlob = await extractVideoOnly(webmBlob, "mp4", { quality: "720p" });
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
      setError(
        "FFmpeg failed to load. Transcoding is unavailable. Please check your network or refresh."
      );
    }
  }, [getConverter]);

  // Auto-load on mount if configured
  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  const convertToMp4 = useCallback(
    async (
      blob: Blob,
      options: TranscodeOptions = {}
    ): Promise<Blob | null> => {
      if (!isLoaded) return null;
      setIsProcessing(true);
      setError(null);

      try {
        const result = await getConverter().convertToMp4(blob, options);
        return result;
      } catch (e: any) {
        console.error("MP4 conversion failed:", e);
        setError(`MP4 conversion failed: ${e.message || "Unknown error"}`);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isLoaded, getConverter]
  );

  const extractVideoOnly = useCallback(
    async (
      blob: Blob,
      format: "webm" | "mp4",
      options: TranscodeOptions = {}
    ): Promise<Blob | null> => {
      if (!isLoaded) return null;
      setIsProcessing(true);
      setError(null);

      try {
        const result = await getConverter().extractVideoOnly(
          blob,
          format,
          options
        );
        return result;
      } catch (e: any) {
        console.error("Video extraction failed:", e);
        setError(`Video extraction failed: ${e.message}`);
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
        setError(`Audio extraction failed: ${e.message}`);
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
    convertToMp4,
    extractVideoOnly,
    extractAudioOnly,
  };
}
