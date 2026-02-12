"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Monitor,
  StopCircle,
  Download,
  Trash2,
  Video,
  Volume2,
  FileAudio,
  Film,
  Loader2,
} from "lucide-react";

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
});

export default function ScreenRecorder() {
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  // Add error state for FFmpeg loading
  const [ffmpegError, setFfmpegError] = useState<string | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    previewStream,
  } = useReactMediaRecorder({
    screen: true,
    audio: true,
    blobPropertyBag: {
      type: "video/mp4",
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
        setIsFFmpegLoaded(true);
      } catch (err) {
        console.error("FFmpeg load failed:", err);
        setFfmpegError(
          "FFmpeg 加载失败，转码功能不可用。请检查网络或刷新重试。"
        );
      }
    };
    load();
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle preview stream
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  // Helper: Download Blob
  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper: cleanup files
  const cleanup = (files: string[]) => {
    files.forEach((f) => {
      try {
        ffmpeg.FS("unlink", f);
      } catch (e) {
        // ignore
      }
    });
  };

  // 1. Export Complete MP4
  const handleDownloadMp4 = async () => {
    if (!mediaBlobUrl || !isFFmpegLoaded) return;
    setProcessing(true);
    setFfmpegError(null);
    try {
      console.log("Start downloading MP4...");
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      console.log("Original blob size:", blob.size, blob.type);

      if (blob.size === 0) {
        throw new Error("录制数据为空");
      }

      // Cleanup previous runs to avoid OOM
      cleanup(["input.webm", "output.mp4"]);

      ffmpeg.FS("writeFile", "input.webm", await fetchFile(blob));

      // Try to convert to MP4 using default codecs (usually h264/aac)
      // Note: direct copy (-c:v copy) from webm(vp8/9) to mp4 is often problematic
      console.log("Running ffmpeg...");
      // Try using libx264 if available, otherwise fallback might happen or fail
      // Using -preset ultrafast to speed up
      // Using -crf 28 to reduce memory/cpu usage
      await ffmpeg.run(
        "-i",
        "input.webm",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "28",
        "-c:a",
        "aac",
        "output.mp4"
      );

      const data = ffmpeg.FS("readFile", "output.mp4");
      console.log("Output MP4 size:", data.length);

      if (data.length === 0) throw new Error("转码生成了空文件");

      // Copy data to a new Uint8Array to ensure it uses a standard ArrayBuffer (not SharedArrayBuffer)
      // which avoids TypeScript type errors without using 'any'
      const mp4Blob = new Blob([new Uint8Array(data)], { type: "video/mp4" });
      downloadBlob(mp4Blob, `recording-full-${Date.now()}.mp4`);

      // Cleanup after success
      cleanup(["input.webm", "output.mp4"]);
    } catch (e: any) {
      console.error("MP4 conversion failed:", e);
      setFfmpegError(
        `转码 MP4 失败: ${e.message || "未知错误"}。尝试下载原始 WebM 文件。`
      );

      // Fallback: download original blob as .webm
      try {
        const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
        downloadBlob(blob, `recording-fallback-${Date.now()}.webm`);
      } catch (err) {
        console.error("Fallback download failed", err);
      }
    } finally {
      setProcessing(false);
    }
  };

  // 2. Export Video Only (No Audio) - WebM (Copy)
  const handleDownloadVideoOnly = async () => {
    if (!mediaBlobUrl || !isFFmpegLoaded) return;
    setProcessing(true);
    setFfmpegError(null);
    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      cleanup(["input.webm", "video_only.webm"]);
      ffmpeg.FS("writeFile", "input.webm", await fetchFile(blob));

      // Output as mp4 (transcode) or webm (copy)
      // Trying copy to webm first as it's faster and safer
      console.log("Extracting video only (WebM)...");
      await ffmpeg.run(
        "-i",
        "input.webm",
        "-an",
        "-c:v",
        "copy",
        "video_only.webm"
      );

      const data = ffmpeg.FS("readFile", "video_only.webm");
      if (data.length === 0) throw new Error("生成文件为空");

      const videoBlob = new Blob([new Uint8Array(data)], {
        type: "video/webm",
      });
      downloadBlob(videoBlob, `recording-video-only-${Date.now()}.webm`);

      cleanup(["input.webm", "video_only.webm"]);
    } catch (e: any) {
      console.error("Video only extraction failed:", e);
      setFfmpegError(`提取纯视频失败: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // 2.1 Export Video Only (No Audio) - MP4 (Transcode)
  const handleDownloadVideoOnlyMp4 = async () => {
    if (!mediaBlobUrl || !isFFmpegLoaded) return;
    setProcessing(true);
    setFfmpegError(null);
    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      cleanup(["input.webm", "video_only.mp4"]);
      ffmpeg.FS("writeFile", "input.webm", await fetchFile(blob));

      console.log("Extracting video only (MP4)...");
      // -an: remove audio
      // Transcode to h264 for MP4 container
      await ffmpeg.run(
        "-i",
        "input.webm",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "28",
        "video_only.mp4"
      );

      const data = ffmpeg.FS("readFile", "video_only.mp4");
      if (data.length === 0) throw new Error("生成文件为空");

      const videoBlob = new Blob([new Uint8Array(data)], { type: "video/mp4" });
      downloadBlob(videoBlob, `recording-video-only-${Date.now()}.mp4`);

      cleanup(["input.webm", "video_only.mp4"]);
    } catch (e: any) {
      console.error("Video only MP4 extraction failed:", e);
      setFfmpegError(`提取纯视频(MP4)失败: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // 3. Export Audio Only (MP3)
  const handleDownloadAudioOnly = async () => {
    if (!mediaBlobUrl || !isFFmpegLoaded) return;
    setProcessing(true);
    setFfmpegError(null);
    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      cleanup(["input.webm", "audio.mp3"]);
      ffmpeg.FS("writeFile", "input.webm", await fetchFile(blob));

      console.log("Extracting audio...");
      await ffmpeg.run(
        "-i",
        "input.webm",
        "-vn",
        "-c:a",
        "libmp3lame",
        "-q:a",
        "4",
        "audio.mp3"
      );

      const data = ffmpeg.FS("readFile", "audio.mp3");
      if (data.length === 0) throw new Error("生成文件为空");

      const audioBlob = new Blob([new Uint8Array(data)], {
        type: "audio/mpeg",
      });
      downloadBlob(audioBlob, `recording-audio-${Date.now()}.mp3`);

      cleanup(["input.webm", "audio.mp3"]);
    } catch (e: any) {
      console.error("Audio extraction failed:", e);
      setFfmpegError(`提取纯音频失败: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">屏幕录制 Demo</h1>
        <p className="text-muted-foreground">
          使用 React Media Recorder 实现的浏览器原生屏幕录制功能
        </p>
        {ffmpegError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/10">
            {ffmpegError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="shadow-md md:col-span-2">
          <CardHeader className="border-b bg-muted/30 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              预览 / 回放
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex aspect-video items-center justify-center overflow-hidden rounded-b-lg bg-black/90 p-0">
            {status === "recording" ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="h-full w-full object-contain"
              />
            ) : mediaBlobUrl ? (
              <video
                src={mediaBlobUrl}
                controls
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="rounded-full bg-muted/20 p-4">
                  <Video className="h-12 w-12 opacity-50" />
                </div>
                <p>点击开始录制后选择要分享的屏幕或窗口</p>
              </div>
            )}

            {status === "recording" && (
              <div className="absolute right-4 top-4 flex animate-pulse items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                <div className="h-2 w-2 rounded-full bg-white" />
                REC
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>控制面板</CardTitle>
            <CardDescription>
              当前状态:{" "}
              <span className="font-mono font-bold uppercase">{status}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "idle" || status === "stopped" ? (
              <Button
                onClick={startRecording}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Monitor className="mr-2 h-4 w-4" /> 开始录制
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <StopCircle className="mr-2 h-4 w-4" /> 停止录制
              </Button>
            )}

            {mediaBlobUrl && status === "stopped" && (
              <div className="space-y-3 border-t pt-4">
                <div className="space-y-2 pb-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Volume2 className="h-4 w-4" />
                    音频回放
                  </p>
                  <audio src={mediaBlobUrl} controls className="h-8 w-full" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={handleDownloadMp4}
                    disabled={processing || !isFFmpegLoaded}
                    className="w-full bg-slate-800 text-white hover:bg-slate-700"
                  >
                    {processing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {processing ? "处理中..." : "下载完整 MP4"}
                  </Button>

                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={handleDownloadVideoOnly}
                      disabled={processing || !isFFmpegLoaded}
                      variant="outline"
                      className="w-full"
                    >
                      <Film className="mr-2 h-4 w-4" /> 纯视频(WebM)
                    </Button>
                    <Button
                      onClick={handleDownloadVideoOnlyMp4}
                      disabled={processing || !isFFmpegLoaded}
                      variant="outline"
                      className="w-full"
                    >
                      <Film className="mr-2 h-4 w-4" /> 纯视频(MP4)
                    </Button>
                  </div>
                  <Button
                    onClick={handleDownloadAudioOnly}
                    disabled={processing || !isFFmpegLoaded}
                    variant="outline"
                    className="w-full"
                  >
                    <FileAudio className="mr-2 h-4 w-4" /> 纯音频(MP3)
                  </Button>
                </div>

                <Button
                  onClick={clearBlobUrl}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> 清除录像
                </Button>
              </div>
            )}

            <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
              <p className="font-medium">使用说明:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>点击开始录制后，浏览器会弹出选择窗口</li>
                <li>你可以选择全屏、特定应用窗口或浏览器标签页</li>
                <li>录制过程中请勿刷新页面</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
