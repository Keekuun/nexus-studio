"use client";

/**
 * MediaMasonry
 * - 瀑布流展示（CSS columns）
 * - 每个 item 宽度固定
 * - 仅支持 9:16 / 16:9 两种宽高比，高度自适应
 * - 图片/视频都可渲染
 */

import { cn } from "@/lib/utils/cn";
import { Image } from "./image";
import { Video } from "./video";
import type { Asset } from "../creative-types";
import { AssetType } from "../creative-types";

export type MediaMasonryAspectRatio = "9:16" | "16:9";

export interface MediaMasonryProps {
  assets: Asset[];
  /** 固定 item 宽度（px） */
  itemWidthPx: number;
  /** columns 间距（px） */
  columnGapPx?: number;
  /** item 纵向间距（px） */
  itemGapPx?: number;
  /** 默认宽高比（图片默认 9:16） */
  defaultAspectRatio?: MediaMasonryAspectRatio;
  /** 视频宽高比（默认 16:9） */
  videoAspectRatio?: MediaMasonryAspectRatio;
  /** 点击回调（传 index） */
  onItemClick?: (index: number) => void;
  className?: string;
}

export function MediaMasonry({
  assets,
  itemWidthPx,
  columnGapPx = 20,
  itemGapPx = 20,
  defaultAspectRatio = "9:16",
  videoAspectRatio = "16:9",
  onItemClick,
  className,
}: MediaMasonryProps) {
  return (
    <div
      className={cn(className)}
      style={{
        columnWidth: `${itemWidthPx}px`,
        columnGap: `${columnGapPx}px`,
      }}
    >
      {assets.map((asset, index) => {
        const isVideo = asset.type === AssetType.VIDEO;
        const aspectRatio = isVideo ? videoAspectRatio : defaultAspectRatio;
        const src = asset.url || asset.thumbnailUrl || "";

        return (
          <div
            key={asset.id}
            className="break-inside-avoid"
            style={{
              marginBottom: `${itemGapPx}px`,
              width: `${itemWidthPx}px`,
            }}
          >
            <div className="overflow-hidden rounded-[8px] border-2 border-[#f5f6f7] bg-white">
              {isVideo ? (
                <Video
                  src={asset.url || ""}
                  poster={asset.thumbnailUrl}
                  width={itemWidthPx}
                  aspectRatio={aspectRatio}
                  borderRadius="none"
                  fit="cover"
                  onClick={() => onItemClick?.(index)}
                />
              ) : (
                <Image
                  src={src}
                  alt={asset.title || "Reference"}
                  width={itemWidthPx}
                  aspectRatio={aspectRatio}
                  borderRadius="none"
                  fit="cover"
                  onClick={() => onItemClick?.(index)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MediaMasonry;
