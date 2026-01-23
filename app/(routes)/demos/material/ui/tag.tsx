import React from "react";
import { cn } from "@/lib/utils";

export interface TagProps {
  /** 标签文本 */
  label: string;
  /** 预设样式风格 */
  variant?: "blue" | "orange" | "pink" | "default";
  /** 自定义背景色 (可选) */
  backgroundColor?: string;
  /** 自定义文字颜色 (可选) */
  textColor?: string;
  /** 额外的 CSS 类名 */
  className?: string;
}

const variantStyles = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  default: "bg-secondary text-secondary-foreground",
};

export function Tag({
  label,
  variant = "default",
  backgroundColor,
  textColor,
  className,
}: TagProps) {
  const style =
    backgroundColor || textColor
      ? { backgroundColor, color: textColor }
      : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10",
        !backgroundColor && variantStyles[variant],
        className
      )}
      style={style}
    >
      {label}
    </span>
  );
}
