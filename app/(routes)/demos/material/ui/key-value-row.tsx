import React from "react";
import { cn } from "@/lib/utils";
import { Typography } from "./typography";
import { Id } from "../creative-types";

export interface KeyValueRowProps {
  /** 标签 (如 "Duration", "Resolution") */
  label: string;
  /** 值 (如 "15s", "1080p") */
  value: string | React.ReactNode;
  /** 唯一ID（用于评论绑定） */
  blockId?: Id;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 布局方向 (水平或垂直) */
  direction?: "row" | "column";
  /** 额外的 CSS 类名 */
  className?: string;
}

export function KeyValueRow({
  label,
  value,
  blockId,
  commentCount = 0,
  direction = "column",
  className,
}: KeyValueRowProps) {
  return (
    <div
      data-block-id={blockId}
      data-id={blockId}
      className={cn(
        "flex",
        direction === "column"
          ? "flex-col gap-1"
          : "flex-row items-center gap-2",
        className
      )}
    >
      <Typography
        variant="caption"
        className="font-medium uppercase tracking-wider text-muted-foreground/70"
      >
        {label}
      </Typography>

      <div className="flex items-center gap-2">
        {typeof value === "string" ? (
          <Typography variant="h3" className="font-semibold">
            {value}
          </Typography>
        ) : (
          value
        )}
        {commentCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({commentCount})
          </span>
        )}
      </div>
    </div>
  );
}
