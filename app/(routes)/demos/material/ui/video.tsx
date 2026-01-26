import React from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  /** 视频资源 URL */
  src: string;
  /** 缩略图 URL */
  poster?: string;
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

export function Video({
  src,
  poster,
  borderRadius = "md",
  aspectRatio,
  width,
  height,
  onClick,
  className,
  ...props
}: VideoProps) {
  const containerStyle: React.CSSProperties = {
    width: width,
    height: height,
    aspectRatio: aspectRatio?.toString().replace(":", "/"),
  };

  return (
    <div
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden bg-muted",
        borderRadiusStyles[borderRadius],
        className
      )}
      style={containerStyle}
      onClick={onClick}
    >
      <video
        src={src}
        poster={poster}
        className="h-full w-full object-cover"
        playsInline
        {...props}
      />
      {/* 播放图标覆盖层 */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
          <Play className="ml-1 h-6 w-6 fill-white text-white" />
        </div>
      </div>
    </div>
  );
}
