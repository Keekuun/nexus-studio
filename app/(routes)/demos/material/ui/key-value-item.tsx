import React from "react";
import { cn } from "@/lib/utils";
import { KeyValuePair, Id } from "../creative-types";
import { Typography } from "./typography";
import { KeyValueRow } from "./key-value-row";

export interface KeyValueItemProps {
  /** 键值对数据 */
  item: KeyValuePair;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 是否高亮（用于评论定位） */
  highlighted?: boolean;
  /** 点击回调 */
  onClick?: (item: KeyValuePair) => void;
  /** 评论点击回调 */
  onCommentClick?: (itemId: Id) => void;
  /** 布局方向 (水平或垂直) */
  direction?: "row" | "column";
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 键值对项组件
 * 用于展示单个 KeyValuePair，支持评论绑定和唯一ID标识
 */
export function KeyValueItem({
  item,
  commentCount = 0,
  highlighted = false,
  onClick,
  onCommentClick,
  direction = "column",
  className,
}: KeyValueItemProps) {
  const handleClick = () => {
    onClick?.(item);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCommentClick?.(item.id);
  };

  const renderValue = () => {
    if (typeof item.value === "string" || typeof item.value === "number") {
      return (
        <Typography variant="h3" className="font-semibold">
          {item.value}
        </Typography>
      );
    }

    if (typeof item.value === "boolean") {
      return <Typography variant="body">{item.value ? "是" : "否"}</Typography>;
    }

    if (Array.isArray(item.value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {item.value.map((val, index) => (
            <Typography key={index} variant="body">
              {String(val)}
            </Typography>
          ))}
        </div>
      );
    }

    if (item.value && typeof item.value === "object") {
      return (
        <Typography variant="body" className="text-muted-foreground">
          {JSON.stringify(item.value)}
        </Typography>
      );
    }

    return (
      <Typography variant="body" className="text-muted-foreground">
        {item.value === null ? "空" : "未设置"}
      </Typography>
    );
  };

  return (
    <div
      data-block-id={item.id}
      data-id={item.id}
      className={cn(
        "group relative rounded-lg border p-4 transition-colors",
        highlighted && "ring-2 ring-primary",
        onClick && "cursor-pointer hover:bg-muted/50",
        className
      )}
      onClick={handleClick}
    >
      <KeyValueRow
        label={item.key}
        value={renderValue()}
        direction={direction}
        blockId={item.id}
        commentCount={commentCount}
      />

      {/* 评论角标 */}
      {commentCount > 0 && (
        <button
          onClick={handleCommentClick}
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-transform hover:scale-110"
          title={`${commentCount} 条评论`}
        >
          {commentCount}
        </button>
      )}
    </div>
  );
}
