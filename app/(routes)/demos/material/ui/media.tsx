import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import Image from "next/image";

export interface MediaProps {
  /** 媒体资源 URL */
  src: string;
  /** 缩略图 URL (视频必填) */
  poster?: string;
  /** 媒体类型 */
  type: "image" | "video";
  /** 图片/视频的 Alt 文本 */
  alt: string;
  /** 圆角大小 */
  borderRadius?: "sm" | "md" | "lg" | "none";
  /** 宽高比 */
  aspectRatio?: string;
  /** 具体的 CSS 宽度 */
  width?: string | number;
  /** 具体的 CSS 高度 */
  height?: string | number;
  /** 点击回调 */
  onClick?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

const borderRadiusStyles = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
};

export function Media({
  src,
  poster,
  type,
  alt,
  borderRadius = "md",
  aspectRatio,
  width,
  height,
  onClick,
  className,
}: MediaProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    onClick?.();
  };

  const containerStyle: React.CSSProperties = {
    width: width,
    height: height,
    aspectRatio: aspectRatio,
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden bg-muted",
        borderRadiusStyles[borderRadius],
        className
      )}
      style={containerStyle}
      onClick={handlePlayClick}
    >
      {type === "image" ? (
        <Image
          src={src}
          alt={alt}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-cover"
            playsInline
            onEnded={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                <Play className="ml-1 h-6 w-6 fill-white text-white" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
