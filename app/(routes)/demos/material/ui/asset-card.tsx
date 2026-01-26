import React from "react";
import { cn } from "@/lib/utils";
import { Asset, AssetType, Id } from "../creative-types";
import { Image } from "./image";
import { Video } from "./video";
import { Typography } from "./typography";

export interface AssetCardProps {
  /** 完整资产数据对象 */
  asset: Asset;
  /** 资产唯一ID（用于评论绑定） */
  assetBlockId?: Id;
  /** 是否显示标题和描述 */
  showDetails?: boolean;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 点击卡片的回调 */
  onAssetClick?: (assetId: string) => void;
  /** 评论点击回调 */
  onCommentClick?: (blockId: Id) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

export function AssetCard({
  asset,
  assetBlockId,
  showDetails = false,
  commentCount = 0,
  onAssetClick,
  onCommentClick,
  className,
}: AssetCardProps) {
  const handleAssetClick = () => {
    onAssetClick?.(asset.id);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (assetBlockId) {
      onCommentClick?.(assetBlockId);
    }
  };

  const renderMedia = () => {
    if (asset.type === AssetType.VIDEO) {
      return (
        <Video
          src={asset.url || ""}
          poster={asset.thumbnailUrl}
          aspectRatio="16:9"
          borderRadius="md"
          onClick={handleAssetClick}
          className="w-full bg-muted/50"
        />
      );
    }

    // 默认为图片处理
    return (
      <Image
        src={asset.url || ""}
        alt={asset.title}
        aspectRatio="16:9"
        borderRadius="md"
        onClick={handleAssetClick}
        className="w-full bg-muted/50"
      />
    );
  };

  return (
    <div
      data-block-id={assetBlockId}
      data-id={assetBlockId}
      className={cn("group relative flex flex-col gap-2", className)}
    >
      <div className="relative">
        {renderMedia()}

        {/* 评论角标 */}
        {commentCount > 0 && assetBlockId && (
          <button
            onClick={handleCommentClick}
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-transform hover:scale-110"
            title={`${commentCount} 条评论`}
          >
            {commentCount}
          </button>
        )}
      </div>

      {showDetails && (
        <div className="flex flex-col gap-1">
          <Typography variant="h5" className="line-clamp-1" title={asset.title}>
            {asset.title}
          </Typography>
          {asset.description && (
            <Typography
              variant="body"
              color="tertiary"
              className="line-clamp-2 text-sm"
            >
              {asset.description}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
