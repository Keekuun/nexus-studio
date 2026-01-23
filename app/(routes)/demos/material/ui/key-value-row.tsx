import React from "react";
import { cn } from "@/lib/utils";
import { Typography } from "./typography";

export interface KeyValueRowProps {
  /** 标签 (如 "Duration", "Resolution") */
  label: string;
  /** 值 (如 "15s", "1080p") */
  value: string | React.ReactNode;
  /** 布局方向 (水平或垂直) */
  direction?: "row" | "column";
  /** 额外的 CSS 类名 */
  className?: string;
}

export function KeyValueRow({
  label,
  value,
  direction = "column",
  className,
}: KeyValueRowProps) {
  return (
    <div
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

      {typeof value === "string" ? (
        <Typography variant="h3" className="font-semibold">
          {value}
        </Typography>
      ) : (
        value
      )}
    </div>
  );
}
