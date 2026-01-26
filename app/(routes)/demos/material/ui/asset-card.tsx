import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Asset, AssetType, Id } from "../creative-types";
import { Image } from "./image";
import { Video } from "./video";
import { Typography } from "./typography";
import { AssetImageViewer } from "./asset-image-viewer";

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
  /** 资产列表（用于图片预览，如果提供则支持多图片浏览） */
  assets?: Asset[];
  /** 是否启用图片预览功能 */
  enablePreview?: boolean;
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
  assets,
  enablePreview = true,
  className,
}: AssetCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAssetClick = () => {
    // 如果启用预览且是图片或视频类型，打开预览
    if (
      enablePreview &&
      (asset.type === AssetType.IMAGE || asset.type === AssetType.VIDEO) &&
      asset.url
    ) {
      setIsPreviewOpen(true);
    }
    onAssetClick?.(asset.id);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (assetBlockId) {
      onCommentClick?.(assetBlockId);
    }
  };

  // 用于预览的资产列表
  const previewAssets = assets && assets.length > 0 ? assets : [asset];
  const currentAssetIndex = assets
    ? assets.findIndex((a) => a.id === asset.id)
    : 0;

  const renderMedia = () => {
    // 当启用预览时，禁用媒体组件的点击事件，由覆盖层处理
    const mediaClassName =
      enablePreview &&
      (asset.type === AssetType.IMAGE || asset.type === AssetType.VIDEO) &&
      asset.url
        ? "w-full bg-muted/50 pointer-events-none"
        : "w-full bg-muted/50";

    if (asset.type === AssetType.VIDEO) {
      return (
        <Video
          src={asset.url || ""}
          poster={asset.thumbnailUrl}
          aspectRatio="16:9"
          borderRadius="md"
          onClick={enablePreview ? undefined : handleAssetClick}
          className={mediaClassName}
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
        onClick={enablePreview ? undefined : handleAssetClick}
        className={mediaClassName}
      />
    );
  };

  return (
    <>
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
              className="absolute right-2 top-2 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-transform hover:scale-110"
              title={`${commentCount} 条评论`}
            >
              {commentCount}
            </button>
          )}

          {/* 预览覆盖层（图片或视频类型且启用预览时显示） */}
          {enablePreview &&
            (asset.type === AssetType.IMAGE ||
              asset.type === AssetType.VIDEO) &&
            asset.url && (
              <div
                className="absolute inset-0 z-20 cursor-pointer bg-black/0 transition-colors group-hover:bg-black/20"
                onClick={(e) => {
                  // 如果点击的是评论按钮，不触发预览
                  const target = e.target as HTMLElement;
                  if (target.closest('button[class*="z-30"]')) {
                    return;
                  }
                  e.stopPropagation();
                  handleAssetClick();
                }}
              >
                <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    点击预览
                  </div>
                </div>
              </div>
            )}
        </div>

        {showDetails && (
          <div className="flex flex-col gap-1">
            <Typography
              variant="h5"
              className="line-clamp-1"
              title={asset.title}
            >
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

      {/* 预览组件（支持图片和视频） */}
      {enablePreview &&
        (asset.type === AssetType.IMAGE || asset.type === AssetType.VIDEO) && (
          <AssetImageViewer
            assets={previewAssets}
            initialIndex={currentAssetIndex >= 0 ? currentAssetIndex : 0}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
    </>
  );
}
