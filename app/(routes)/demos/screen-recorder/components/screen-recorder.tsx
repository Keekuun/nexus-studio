"use client";

import React, { useEffect, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
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
} from "lucide-react";

export default function ScreenRecorder() {
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    previewStream,
  } = useReactMediaRecorder({
    screen: true,
    audio: true, // Optional: capture system audio or microphone
    blobPropertyBag: {
      type: "video/mp4",
    },
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle preview stream
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  // Download handler
  const handleDownload = () => {
    if (mediaBlobUrl) {
      const a = document.createElement("a");
      a.href = mediaBlobUrl;
      a.download = `screen-recording-${Date.now()}.mp4`;
      a.click();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">屏幕录制 Demo</h1>
        <p className="text-muted-foreground">
          使用 React Media Recorder 实现的浏览器原生屏幕录制功能
        </p>
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

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" /> 下载视频
                </Button>
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
