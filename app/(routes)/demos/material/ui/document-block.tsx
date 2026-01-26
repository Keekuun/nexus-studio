import React from "react";
import { cn } from "@/lib/utils";
import { DocumentBlock, KeyValuePair, Id } from "../creative-types";
import { Typography } from "./typography";
import { KeyValueItem } from "./key-value-item";

export interface DocumentBlockProps {
  /** 区块数据 */
  block: DocumentBlock;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 是否高亮（用于评论定位） */
  highlighted?: boolean;
  /** 区块标题渲染方式 */
  renderTitle?: (block: DocumentBlock) => React.ReactNode;
  /** 点击回调 */
  onClick?: (block: DocumentBlock) => void;
  /** 评论点击回调 */
  onCommentClick?: (blockId: Id) => void;
  /** 键值对点击回调 */
  onKeyValueClick?: (item: KeyValuePair) => void;
  /** 键值对评论映射 */
  keyValueComments?: Record<Id, number>;
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 文档区块组件
 * 用于展示单个 DocumentBlock，包含多个 KeyValueItem
 */
export function DocumentBlockComponent({
  block,
  commentCount = 0,
  highlighted = false,
  renderTitle,
  onClick,
  onCommentClick,
  onKeyValueClick,
  keyValueComments = {},
  className,
}: DocumentBlockProps) {
  const handleClick = () => {
    onClick?.(block);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCommentClick?.(block.id);
  };

  const defaultTitle = (
    <Typography variant="h4" className="font-semibold capitalize">
      {block.block}
    </Typography>
  );

  return (
    <div
      data-block-id={block.id}
      data-id={block.id}
      className={cn(
        "group relative rounded-lg border bg-card p-6 transition-colors",
        highlighted && "ring-2 ring-primary",
        onClick && "cursor-pointer hover:bg-muted/30",
        className
      )}
      onClick={handleClick}
    >
      {/* 区块标题 */}
      <div className="mb-4 flex items-center justify-between">
        <div>{renderTitle ? renderTitle(block) : defaultTitle}</div>

        {/* 评论角标 */}
        {commentCount > 0 && (
          <button
            onClick={handleCommentClick}
            className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-110"
            title={`${commentCount} 条评论`}
          >
            {commentCount}
          </button>
        )}
      </div>

      {/* 键值对列表 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {block.data.map((item) => (
          <KeyValueItem
            key={item.id}
            item={item}
            commentCount={keyValueComments[item.id] || 0}
            onClick={onKeyValueClick}
            onCommentClick={onCommentClick}
          />
        ))}
      </div>
    </div>
  );
}
