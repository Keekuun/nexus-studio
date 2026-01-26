"use client";

/**
 * Asset Grid 组件
 * 基于 Figma 设计稿实现的资产网格展示
 * 用于 Creative Planning 等模块中展示带序号和标题的资产列表
 *
 * 设计特点：
 * - 序号（01, 02, 03...）+ 标题（大写）+ 图片/视频
 * - 五列等宽网格布局
 * - 图片圆角边框
 * - 支持点击预览
 */

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Image } from "./image";
import { Video } from "./video";
import { AssetImageViewer } from "./asset-image-viewer";
import type { Asset, AssetType } from "../creative-types";

export interface AssetGridProps {
  /** 资产列表 */
  assets: Asset[];
  /** 额外的 CSS 类名 */
  className?: string;
  /** 每行显示的列数，默认 5 */
  columns?: number;
  /** 是否显示序号，默认 true */
  showIndex?: boolean;
  /** 是否显示标题，默认 true */
  showTitle?: boolean;
  /** 图片高度，默认 200px */
  imageHeight?: number;
}

/** 格式化序号为两位数 */
function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function AssetGrid({
  assets,
  className,
  columns = 5,
  showIndex = true,
  showTitle = true,
  imageHeight = 200,
}: AssetGridProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleAssetClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  // 根据列数生成 grid 样式
  const gridColsClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }[columns] || "grid-cols-5";

  return (
    <>
      <div className={cn("grid gap-4", gridColsClass, className)}>
        {assets.map((asset, index) => {
          const isVideo = asset.type === "video";
          const imageUrl = asset.thumbnailUrl || asset.url;

          return (
            <div key={asset.id} className="flex flex-col gap-2">
              {/* 序号和标题 */}
              {(showIndex || showTitle) && (
                <div className="flex flex-col gap-0.5">
                  {showIndex && (
                    <span className="text-[20px] font-bold leading-[1.5] text-black">
                      {formatIndex(index)}
                    </span>
                  )}
                  {showTitle && asset.title && (
                    <span className="text-[10px] font-normal uppercase leading-[1.35] tracking-[0.5px] text-[rgba(0,0,0,0.6)]">
                      {asset.title}
                    </span>
                  )}
                </div>
              )}

              {/* 图片/视频 */}
              <div
                className="relative overflow-hidden rounded border border-[rgba(44,44,44,0.08)]"
                style={{ height: imageHeight }}
              >
                {isVideo ? (
                  <Video
                    src={asset.url || ""}
                    poster={asset.thumbnailUrl}
                    className="h-full w-full object-cover"
                    onClick={() => handleAssetClick(index)}
                  />
                ) : (
                  <Image
                    src={imageUrl || ""}
                    alt={asset.title || `Asset ${index + 1}`}
                    className="h-full w-full object-cover"
                    onClick={() => handleAssetClick(index)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 资源预览弹窗 */}
      <AssetImageViewer
        assets={assets}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

export default AssetGrid;
