"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useVideoConverter } from "@/hooks/use-video-converter";

type CompressMode = "native" | "ffmpeg" | "webcodecs";

interface CompressResult {
  mode: CompressMode;
  blob: Blob;
  durationMs: number;
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms: number): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function getSupportedMimeType(): string | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return null;
  }

  const mimeCandidates = [
    'video/webm;codecs="vp9,opus"',
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const type of mimeCandidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return null;
}

async function compressWithNativeMediaRecorder(
  file: File,
  onProgress?: (ratio: number) => void
): Promise<Blob | null> {
  if (typeof window === "undefined") return null;
  if (typeof MediaRecorder === "undefined") return null;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;

  const mimeType = getSupportedMimeType();
  if (!mimeType) {
    URL.revokeObjectURL(objectUrl);
    return null;
  }

  const loaded = new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () =>
      reject(new Error("无法加载视频元数据，可能格式不被支持"));
  });

  await loaded;

  const duration = video.duration || 0;
  if (duration > 0 && onProgress) {
    const trackProgress = () => {
      const ratio = Math.min(video.currentTime / duration, 1);
      onProgress(ratio);
      if (!video.ended) {
        requestAnimationFrame(trackProgress);
      }
    };
    requestAnimationFrame(trackProgress);
  }

  const captureStream =
    (video as any).captureStream || (video as any).mozCaptureStream || null;

  if (!captureStream) {
    URL.revokeObjectURL(objectUrl);
    return null;
  }

  const stream: MediaStream = captureStream.call(video);

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 1_000_000,
  });

  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const resultPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => {
      reject(new Error("MediaRecorder 出错"));
    };
    recorder.onstop = () => {
      const result = new Blob(chunks, { type: mimeType.split(";")[0] });
      resolve(result);
    };
  });

  recorder.start(500);
  await video.play();

  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });

  recorder.stop();

  stream.getTracks().forEach((track) => track.stop());
  URL.revokeObjectURL(objectUrl);

  return resultPromise;
}

async function compressWithWebCodecsFrames(file: File): Promise<Blob | null> {
  // WebCodecs 路径用于演示帧级编码性能，目前不提供可播放容器，仅比较大小与耗时
  if (typeof window === "undefined") return null;
  const w = window as any;
  const VideoEncoderCtor = w.VideoEncoder;
  const VideoFrameCtor = w.VideoFrame;
  if (!VideoEncoderCtor || !VideoFrameCtor) return null;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () =>
      reject(new Error("无法加载视频元数据，可能格式不被支持"));
  });

  const sourceWidth = video.videoWidth || 0;
  const sourceHeight = video.videoHeight || 0;
  const width = sourceWidth || 1280;
  const height = sourceHeight || 720;
  const targetWidth = width > 0 ? Math.min(width, 1280) : 1280;
  const targetHeight = height > 0 ? Math.min(height, 720) : 720;
  const fps = 30;
  const bitrate = 1_000_000;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(objectUrl);
    return null;
  }

  const chunks: BlobPart[] = [];
  const encoder = new VideoEncoderCtor({
    output: (chunk: any) => {
      const buffer = new Uint8Array(chunk.byteLength);
      chunk.copyTo(buffer);
      chunks.push(buffer);
    },
    error: () => {},
  });

  encoder.configure({
    codec: "vp8",
    width: targetWidth,
    height: targetHeight,
    bitrate,
    framerate: fps,
  });

  let frameIndex = 0;
  await video.play();

  while (!video.ended) {
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const timestamp = Math.round((frameIndex / fps) * 1_000_000);
    const frame = new VideoFrameCtor(canvas, { timestamp });
    encoder.encode(frame);
    frame.close();
    frameIndex += 1;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );
  }

  await encoder.flush();
  encoder.close();
  video.pause();
  URL.revokeObjectURL(objectUrl);

  if (chunks.length === 0) return null;

  return new Blob(chunks, { type: "video/webm" });
}

export default function MediaCompressDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [nativeSupported, setNativeSupported] = useState(false);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const [webCodecsSupported, setWebCodecsSupported] = useState(false);
  const [webCodecsError, setWebCodecsError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<CompressMode | null>(null);
  const [progressMode, setProgressMode] = useState<CompressMode | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);

  const {
    isLoaded: ffmpegLoaded,
    isProcessing: ffmpegProcessing,
    error: ffmpegError,
    convertToMp4,
  } = useVideoConverter();

  const processing = activeMode !== null || ffmpegProcessing;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasMediaRecorder =
      typeof MediaRecorder !== "undefined" && getSupportedMimeType() !== null;
    const w = window as any;
    const hasWebCodecs = !!w.VideoEncoder && !!w.VideoFrame;
    setNativeSupported(hasMediaRecorder || hasWebCodecs);
    setWebCodecsSupported(hasWebCodecs);
  }, []);

  const handleSelectFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0];
      if (!selected) return;

      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
      }

      const url = URL.createObjectURL(selected);
      setFile(selected);
      setFileUrl(url);
      setResult(null);
      setNativeError(null);
      setWebCodecsError(null);
      setProgressMode(null);
      setProgressValue(0);
    },
    [fileUrl, resultUrl]
  );

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setNativeError(null);
    setWebCodecsError(null);
    setActiveMode(null);
    setProgressMode(null);
    setProgressValue(0);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [fileUrl, resultUrl]);

  const handleNativeCompress = useCallback(async () => {
    if (!file || !nativeSupported) return;
    setActiveMode("native");
    setProgressMode("native");
    setProgressValue(0);
    setNativeError(null);

    const start = performance.now();
    try {
      const output = await compressWithNativeMediaRecorder(file, (ratio) => {
        setProgressMode("native");
        setProgressValue(Math.min(Math.max(ratio * 100, 0), 100));
      });
      const end = performance.now();

      if (!output) {
        setNativeError("当前环境不支持原生 MediaRecorder 压缩");
        setActiveMode(null);
        setProgressMode(null);
        return;
      }

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      const url = URL.createObjectURL(output);
      setResult({
        mode: "native",
        blob: output,
        durationMs: end - start,
      });
      setResultUrl(url);
    } catch (error) {
      setNativeError(error instanceof Error ? error.message : "原生压缩失败");
    } finally {
      setActiveMode(null);
      setProgressMode(null);
    }
  }, [file, nativeSupported, resultUrl]);

  const handleFfmpegCompress = useCallback(async () => {
    if (!file || !ffmpegLoaded) return;
    setActiveMode("ffmpeg");
    setProgressMode("ffmpeg");
    setProgressValue(0);

    const start = performance.now();
    try {
      const output = await convertToMp4(file, {
        quality: "720p",
        fps: 30,
      });
      const end = performance.now();

      if (!output) {
        setActiveMode(null);
        return;
      }

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      const url = URL.createObjectURL(output);
      setResult({
        mode: "ffmpeg",
        blob: output,
        durationMs: end - start,
      });
      setResultUrl(url);
    } finally {
      setActiveMode(null);
      setProgressMode(null);
    }
  }, [file, ffmpegLoaded, convertToMp4, resultUrl]);

  const handleWebCodecsCompress = useCallback(async () => {
    if (!file || !webCodecsSupported) return;
    if (!file.type.startsWith("video/")) {
      setWebCodecsError("WebCodecs 路径目前只支持视频文件");
      return;
    }
    setActiveMode("webcodecs");
    setProgressMode("webcodecs");
    setProgressValue(0);
    setWebCodecsError(null);

    const start = performance.now();
    try {
      const output = await compressWithWebCodecsFrames(file);
      const end = performance.now();

      if (!output) {
        setWebCodecsError("当前环境不支持 WebCodecs 视频编码");
        setActiveMode(null);
        return;
      }

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      const url = URL.createObjectURL(output);
      setResult({
        mode: "webcodecs",
        blob: output,
        durationMs: end - start,
      });
      setResultUrl(url);
    } catch (error) {
      setWebCodecsError(
        error instanceof Error ? error.message : "WebCodecs 压缩失败"
      );
    } finally {
      setActiveMode(null);
      setProgressMode(null);
    }
  }, [file, webCodecsSupported, resultUrl]);

  const compressionRatio = useMemo(() => {
    if (!file || !result?.blob) return null;
    const original = file.size;
    const compressed = result.blob.size;
    if (!original || !compressed) return null;
    const ratio = compressed / original;
    return `${(ratio * 100).toFixed(1)}%`;
  }, [file, result]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>选择待压缩的音视频文件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*,audio/*"
            onChange={handleSelectFile}
            disabled={processing}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
          />
          {file && (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {file.type || "未知类型"} · {formatFileSize(file.size)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={processing}
              >
                重新选择
              </Button>
            </div>
          )}
          {!file && (
            <p className="text-sm text-muted-foreground">
              支持常见视频与音频格式，如 MP4、WebM、MOV、MP3、WAV 等。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>压缩方式对比</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  浏览器原生压缩（MediaRecorder / WebCodecs）
                </span>
                <span className="text-xs text-muted-foreground">
                  {nativeSupported ? "当前环境支持" : "当前环境不完全支持"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                直接调用浏览器硬件编码器，通常比 FFmpeg.wasm 更快，CPU
                占用更低。
              </p>
              <Button
                className="mt-2 w-full"
                onClick={handleNativeCompress}
                disabled={!file || !nativeSupported || processing}
              >
                {activeMode === "native" ? "压缩中..." : "使用原生方案压缩"}
              </Button>
              {nativeError && (
                <p className="mt-2 text-xs text-red-500">{nativeError}</p>
              )}
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WebCodecs 帧级编码</span>
                <span className="text-xs text-muted-foreground">
                  {webCodecsSupported ? "当前环境支持" : "当前环境不支持"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                逐帧读取视频并通过 WebCodecs
                手动控制分辨率与码率，仅处理视频轨。
              </p>
              <Button
                className="mt-2 w-full"
                onClick={handleWebCodecsCompress}
                disabled={!file || !webCodecsSupported || processing}
              >
                {activeMode === "webcodecs"
                  ? "压缩中..."
                  : "使用 WebCodecs 压缩"}
              </Button>
              {webCodecsError && (
                <p className="mt-2 text-xs text-red-500">{webCodecsError}</p>
              )}
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FFmpeg.wasm 压缩</span>
                <span className="text-xs text-muted-foreground">
                  {ffmpegLoaded ? "核心已加载" : "首次使用会自动加载 FFmpeg"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                通过 FFmpeg.wasm 在前端完成转码与压缩，兼容性最好，功能最强。
              </p>
              <Button
                className="mt-2 w-full"
                onClick={handleFfmpegCompress}
                disabled={!file || !ffmpegLoaded || processing}
              >
                {activeMode === "ffmpeg" || ffmpegProcessing
                  ? "压缩中..."
                  : "使用 FFmpeg.wasm 压缩"}
              </Button>
              {ffmpegError && (
                <p className="mt-2 text-xs text-red-500">{ffmpegError}</p>
              )}
            </div>
          </div>

          {processing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>压缩进度</span>
                {progressMode && progressMode !== "ffmpeg" && (
                  <span>{progressValue.toFixed(0)}%</span>
                )}
                {progressMode === "ffmpeg" && <span>FFmpeg 压缩进行中...</span>}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                {progressMode && progressMode !== "ffmpeg" ? (
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(Math.max(progressValue, 0), 100)}%`,
                    }}
                  />
                ) : (
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (fileUrl || resultUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>结果对比</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">原始文件</div>
                {file.type.startsWith("video/") && fileUrl && (
                  <video
                    src={fileUrl}
                    controls
                    className="aspect-video w-full rounded-md border bg-black"
                  />
                )}
                {file.type.startsWith("audio/") && fileUrl && (
                  <audio src={fileUrl} controls className="w-full" />
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  大小: {formatFileSize(file.size)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">压缩后文件</span>
                  {result && (
                    <span className="text-xs text-muted-foreground">
                      {result.mode === "native"
                        ? "原生压缩"
                        : result.mode === "ffmpeg"
                          ? "FFmpeg.wasm 压缩"
                          : "WebCodecs 帧级编码"}
                    </span>
                  )}
                </div>
                {result &&
                  resultUrl &&
                  file.type.startsWith("video/") &&
                  (result.mode === "native" || result.mode === "ffmpeg") && (
                    <video
                      src={resultUrl}
                      controls
                      className="aspect-video w-full rounded-md border bg-black"
                    />
                  )}
                {result &&
                  resultUrl &&
                  file.type.startsWith("audio/") &&
                  (result.mode === "native" || result.mode === "ffmpeg") && (
                    <audio src={resultUrl} controls className="w-full" />
                  )}
                {result && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div>
                      大小: {formatFileSize(result.blob.size)}
                      {compressionRatio &&
                        `（约为原始文件的 ${compressionRatio}）`}
                    </div>
                    <div>压缩耗时: {formatDuration(result.durationMs)}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
