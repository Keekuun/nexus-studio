"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { MediaFile } from "@/types/media";

/**
 * 视频播放器组件Props接口
 */
export interface VideoPlayerProps {
  mediaFile: MediaFile;
  className?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: () => void;
}

/**
 * 视频播放器组件
 * 提供视频播放和控制功能
 */
export function VideoPlayer({
  mediaFile,
  className,
  controls = true,
  autoplay = false,
  loop = false,
  onTimeUpdate,
  onLoadedMetadata,
}: VideoPlayerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = (): void => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = (): void => {
      setDuration(video.duration);
      onLoadedMetadata?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onTimeUpdate, onLoadedMetadata]);

  const togglePlay = (): void => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (mediaFile.type !== "video") {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-muted-foreground">不支持的文件类型</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <video
        ref={videoRef}
        src={mediaFile.url}
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        className="w-full h-auto rounded-lg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {!controls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="rounded-full bg-black/50 p-4 text-white hover:bg-black/70"
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
      {duration > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}
    </div>
  );
}

/**
 * 格式化时间（秒转MM:SS）
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

