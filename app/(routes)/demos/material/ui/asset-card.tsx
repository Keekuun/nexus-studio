import React from "react";
import { cn } from "@/lib/utils";
import { Asset, AssetType } from "../creative-types";
import { Image } from "./image";
import { Video } from "./video";
import { Typography } from "./typography";

export interface AssetCardProps {
  /** 完整资产数据对象 */
  asset: Asset;
  /** 是否显示标题和描述 */
  showDetails?: boolean;
  /** 点击卡片的回调 */
  onAssetClick?: (assetId: string) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

export function AssetCard({
  asset,
  showDetails = false,
  onAssetClick,
  className,
}: AssetCardProps) {
  const handleAssetClick = () => {
    onAssetClick?.(asset.id);
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
    <div className={cn("flex flex-col gap-2", className)}>
      {renderMedia()}

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
