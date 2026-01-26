"use client";

/**
 * AssetTable 组件
 * 用于展示资产分组的表格布局（两列）
 * 严格按照 Figma 设计稿实现
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=356:143268
 */

import { cn } from "@/lib/utils/cn";
import { Image } from "./image";
import { Video } from "./video";
import type { Asset } from "../creative-types";
import { AssetType } from "../creative-types";

export interface AssetTableProps {
  /** 资产列表 */
  assets: Asset[];
  /** 分组标题 */
  groupTitle?: string;
  /** 点击资产的回调 */
  onAssetClick?: (index: number) => void;
  /** 表格列数（设计稿为 2 列） */
  columns?: 2;
  /** 图片区域高度（设计稿为固定高度） */
  mediaRowHeightPx?: number;
  /** 图片区域内边距（用于居中展示图片） */
  mediaPaddingPx?: number;
  /** 额外的 CSS 类名 */
  className?: string;
}

function AssetTableMedia({
  asset,
  onClick,
  mediaRowHeightPx,
  mediaPaddingPx,
}: {
  asset: Asset;
  onClick?: () => void;
  mediaRowHeightPx: number;
  mediaPaddingPx: number;
}) {
  const isVideo = asset.type === AssetType.VIDEO;
  const mediaUrl = asset.url || "";
  const posterUrl = asset.thumbnailUrl;

  return (
    <div
      className="flex w-full items-center justify-center"
      style={{ height: mediaRowHeightPx, padding: mediaPaddingPx }}
    >
      {isVideo ? (
        <Video
          src={mediaUrl}
          poster={posterUrl}
          width="100%"
          height="100%"
          fit="contain"
          borderRadius="none"
          className="rounded-[12px] bg-white"
          onClick={onClick}
        />
      ) : (
        <Image
          src={mediaUrl}
          alt={asset.title || "Asset"}
          width="100%"
          height="100%"
          fit="contain"
          borderRadius="none"
          className="rounded-[12px] bg-white"
          onClick={onClick}
        />
      )}
    </div>
  );
}

export function AssetTable({
  assets,
  groupTitle,
  onAssetClick,
  columns = 2,
  mediaRowHeightPx = 240,
  mediaPaddingPx = 24,
  className,
}: AssetTableProps) {
  const safeAssets = Array.isArray(assets) ? assets : [];

  // 设计稿是 2 列表格；若资产超过 2 个，按 2 个一组切成多张表格
  const chunkedAssets: Asset[][] = [];
  for (let i = 0; i < safeAssets.length; i += columns) {
    chunkedAssets.push(safeAssets.slice(i, i + columns));
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 分组标题 */}
      {groupTitle && (
        <p className="text-[20px] font-bold leading-[1.5] text-black">
          {groupTitle}
        </p>
      )}

      {/* 表格（严格按设计稿：外框+内分割线+三行结构） */}
      <div className="flex flex-col gap-4">
        {chunkedAssets.map((pair, pairIdx) => {
          const left = pair[0];
          const right = pair[1];
          const rightExists = Boolean(right);

          // 当前表格的起始索引（用于回调映射到分组内 index）
          const baseIndex = pairIdx * columns;

          return (
            <div
              key={`${groupTitle || "group"}-table-${pairIdx}`}
              className="overflow-hidden rounded-[12px] border border-[rgba(44,44,44,0.2)] bg-white"
            >
              <div className="grid grid-cols-2">
                {/* Row 1: Media */}
                <div className="border-b border-r border-[rgba(44,44,44,0.2)]">
                  {left && (
                    <AssetTableMedia
                      asset={left}
                      mediaRowHeightPx={mediaRowHeightPx}
                      mediaPaddingPx={mediaPaddingPx}
                      onClick={() => onAssetClick?.(baseIndex)}
                    />
                  )}
                </div>
                <div className="border-b border-[rgba(44,44,44,0.2)]">
                  {rightExists && right && (
                    <AssetTableMedia
                      asset={right}
                      mediaRowHeightPx={mediaRowHeightPx}
                      mediaPaddingPx={mediaPaddingPx}
                      onClick={() => onAssetClick?.(baseIndex + 1)}
                    />
                  )}
                </div>

                {/* Row 2: Title */}
                <div className="border-b border-r border-[rgba(44,44,44,0.2)] px-4 py-3">
                  <p className="text-[20px] font-semibold leading-[1.35] tracking-[-0.4px] text-black">
                    {left?.title || ""}
                  </p>
                </div>
                <div className="border-b border-[rgba(44,44,44,0.2)] px-4 py-3">
                  <p className="text-[20px] font-semibold leading-[1.35] tracking-[-0.4px] text-black">
                    {right?.title || ""}
                  </p>
                </div>

                {/* Row 3: Description */}
                <div className="border-r border-[rgba(44,44,44,0.2)] px-4 py-4">
                  <p className="text-[18px] leading-[1.35] tracking-[-0.36px] text-[rgba(0,0,0,0.9)]">
                    {left?.description || ""}
                  </p>
                </div>
                <div className="px-4 py-4">
                  <p className="text-[18px] leading-[1.35] tracking-[-0.36px] text-[rgba(0,0,0,0.9)]">
                    {right?.description || ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AssetTable;
