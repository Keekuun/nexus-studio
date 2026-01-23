import React from "react";
import { cn } from "@/lib/utils";
import ImageComponent from "next/image";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 图片资源 URL */
  src: string;
  /** 图片 Alt 文本 */
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

export function Image({
  src,
  alt,
  borderRadius = "md",
  aspectRatio,
  width,
  height,
  onClick,
  className,
  ...props
}: ImageProps) {
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
      onClick={onClick}
    >
      <ImageComponent
        src={src}
        alt={alt}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        fill
        {...props}
      />
    </div>
  );
}
