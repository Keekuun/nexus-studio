"use client";

import React, { useEffect, useRef } from "react";
import { useVoiceChat } from "../hooks/use-voice-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Trash2,
  Download,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReactMediaRecorder } from "react-media-recorder";

export default function VoiceChatDemo() {
  const {
    state,
    messages,
    transcript,
    volume,
    isMuted,
    start,
    stop,
    toggleMute,
    clearMessages,
  } = useVoiceChat({
    onError: (err) => alert(err),
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  const {
    status: recordingStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true });

  const handleStart = () => {
    start();
    startRecording();
  };

  const handleStop = () => {
    stop();
    stopRecording();
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const text = messages
      .map((m) => `${m.role === "user" ? "用户" : "助手"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state === "idle") return;

      // Space to toggle mute
      if (
        e.code === "Space" &&
        !e.repeat &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        toggleMute();
      }

      // ESC to stop
      if (e.code === "Escape") {
        handleStop();
      }

      // Ctrl+E Export
      if (e.ctrlKey && e.code === "KeyE") {
        e.preventDefault();
        handleExport();
      }

      // Ctrl+R Clear
      if (e.ctrlKey && e.code === "KeyR") {
        e.preventDefault();
        clearMessages();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, toggleMute, handleExport, clearMessages]); // Removed handleStop from deps to avoid cycle, or should wrap handleStop in useCallback

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">实时语音对话</h1>
        <div className="flex gap-2">
          {state === "idle" ? (
            <Button
              onClick={handleStart}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" /> 开始对话
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive">
              <Square className="mr-2 h-4 w-4" /> 结束对话
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Chat Area */}
        <Card className="flex h-[600px] flex-col shadow-md md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              {state === "idle" && (
                <span className="text-muted-foreground">空闲</span>
              )}
              {state === "listening" && (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                  </span>{" "}
                  正在聆听...
                </span>
              )}
              {state === "processing" && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> 思考中...
                </span>
              )}
              {state === "speaking" && (
                <span className="flex items-center gap-1 text-purple-600">
                  <span className="animate-pulse">🔊</span> 助手回答中...
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                title="清空对话"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                title="导出对话"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative flex-1 overflow-hidden p-0">
            <div
              ref={scrollRef}
              className="h-full space-y-4 overflow-y-auto scroll-smooth p-6"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground opacity-50">
                  <Mic className="h-12 w-12" />
                  <p>点击开始对话体验实时语音交互</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      msg.role === "user"
                        ? "rounded-br-none bg-blue-600 text-white"
                        : "rounded-bl-none bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Real-time transcript preview */}
              {transcript && (
                <div className="flex w-full justify-end">
                  <div className="max-w-[80%] animate-pulse rounded-2xl rounded-br-none bg-blue-600/50 px-4 py-2.5 text-sm italic text-white/80">
                    {transcript}...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>控制面板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  className="w-full justify-start"
                  onClick={toggleMute}
                  disabled={state === "idle"}
                >
                  {isMuted ? (
                    <MicOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Mic className="mr-2 h-4 w-4" />
                  )}
                  {isMuted ? "取消静音" : "静音麦克风"}
                </Button>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>音量监测</span>
                    <span>{(volume * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-green-500 transition-all duration-75 ease-out"
                      style={{ width: `${Math.min(volume * 500, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-2 text-sm font-medium">状态监控</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>系统状态:</span>
                    <span className="font-mono">{state.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>录音状态:</span>
                    <span className="font-mono">
                      {recordingStatus.toUpperCase()}
                    </span>
                  </div>
                  {mediaBlobUrl && (
                    <div className="pt-2">
                      <p className="mb-1">最近会话录音:</p>
                      <audio
                        src={mediaBlobUrl}
                        controls
                        className="h-8 w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快捷键</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>空格键</span>
                  <kbd className="rounded border bg-muted px-2 py-0.5">
                    静音/取消
                  </kbd>
                </li>
                <li className="flex justify-between">
                  <span>ESC</span>
                  <kbd className="rounded border bg-muted px-2 py-0.5">
                    结束对话
                  </kbd>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
