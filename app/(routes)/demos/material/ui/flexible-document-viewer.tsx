import React from "react";
import { cn } from "@/lib/utils";
import {
  FlexibleDocument,
  DocumentBlock,
  KeyValuePair,
  Id,
} from "../creative-types";
import { Typography } from "./typography";
import { DocumentBlockComponent } from "./document-block";

export interface Comment {
  id: string;
  blockId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface FlexibleDocumentViewerProps {
  /** 文档数据 */
  document: FlexibleDocument;
  /** 评论映射表（blockId -> Comment[]） */
  comments?: Record<Id, Comment[]>;
  /** 是否显示评论角标 */
  showCommentBadges?: boolean;
  /** 文档点击回调 */
  onDocumentClick?: (doc: FlexibleDocument) => void;
  /** 区块点击回调 */
  onBlockClick?: (block: DocumentBlock) => void;
  /** 键值对点击回调 */
  onKeyValueClick?: (item: KeyValuePair) => void;
  /** 评论点击回调 */
  onCommentClick?: (blockId: Id) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 灵活文档查看器组件
 * 用于展示完整的 FlexibleDocument，支持所有模块类型
 */
export function FlexibleDocumentViewer({
  document,
  comments = {},
  showCommentBadges = true,
  onDocumentClick,
  onBlockClick,
  onKeyValueClick,
  onCommentClick,
  className,
}: FlexibleDocumentViewerProps) {
  const handleDocumentClick = () => {
    onDocumentClick?.(document);
  };

  // 计算每个区块的评论数量
  const getBlockCommentCount = (block: DocumentBlock): number => {
    const blockComments = comments[block.id] || [];
    const kvComments = block.data.reduce((count, item) => {
      return count + (comments[item.id]?.length || 0);
    }, 0);
    return blockComments.length + kvComments;
  };

  // 计算每个键值对的评论数量
  const getKeyValueCommentCounts = (
    block: DocumentBlock
  ): Record<Id, number> => {
    const counts: Record<Id, number> = {};
    block.data.forEach((item) => {
      counts[item.id] = comments[item.id]?.length || 0;
    });
    return counts;
  };

  return (
    <div
      data-block-id={document.id}
      data-id={document.id}
      className={cn("flex flex-col gap-6", className)}
      onClick={handleDocumentClick}
    >
      {/* 文档标题 */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Typography variant="h2" className="font-bold">
            {document.title}
          </Typography>
          {document.description && (
            <Typography variant="body" color="tertiary" className="mt-1">
              {document.description}
            </Typography>
          )}
          <Typography variant="caption" className="mt-2">
            {new Date(document.createdAt).toLocaleString("zh-CN")}
          </Typography>
        </div>

        {/* 文档级别的评论角标 */}
        {showCommentBadges &&
          comments[document.id] &&
          comments[document.id].length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick?.(document.id);
              }}
              className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground"
              title={`${comments[document.id].length} 条评论`}
            >
              {comments[document.id].length}
            </button>
          )}
      </div>

      {/* 区块列表 */}
      <div className="flex flex-col gap-6">
        {document.docs.map((block) => {
          const blockCommentCount = getBlockCommentCount(block);
          const kvCommentCounts = getKeyValueCommentCounts(block);

          return (
            <DocumentBlockComponent
              key={block.id}
              block={block}
              commentCount={showCommentBadges ? blockCommentCount : 0}
              onClick={onBlockClick}
              onCommentClick={onCommentClick}
              onKeyValueClick={onKeyValueClick}
              keyValueComments={showCommentBadges ? kvCommentCounts : {}}
            />
          );
        })}
      </div>
    </div>
  );
}
