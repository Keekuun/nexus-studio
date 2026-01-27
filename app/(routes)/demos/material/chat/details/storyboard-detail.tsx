"use client";

/**
 * Storyboard Detail 组件
 * 基于 Figma 设计稿实现的 Storyboard 模块详情卡片
 * 字段设计严格按照 asset.md 定义（block: "shots" / key: "shots"）
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=319:127357
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Image } from "../../ui/image";
import { AssetImageViewer } from "../../ui/asset-image-viewer";
import type { Asset, FlexibleDocument } from "../../creative-types";
import { AssetType } from "../../creative-types";

// ==================== 图标组件 ====================
const Icons = {
  Storyboard: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  Close: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface StoryboardDetailProps {
  /** Storyboard 文档数据 */
  document: FlexibleDocument;
  /** 关闭回调 */
  onClose?: () => void;
  /** 批量反馈回调 */
  onBatchFeedback?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

type StoryboardShot = {
  id: string;
  sequence: number;
  thumbnailUrl?: string;
  /** 设计稿支持单格多图（如第2、5行），在严格字段基础上做兼容扩展 */
  thumbnailUrls?: string[];
  duration: string;
  notes: string;
  relatedAssetId?: string;
};

// ==================== 工具函数 ====================
function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} · ${hours}:${minutes}`;
}

function getShots(document: FlexibleDocument): StoryboardShot[] {
  const shotsBlock = document.docs.find((d) => d.block === "shots");
  const shotsItem = shotsBlock?.data.find((d) => d.key === "shots");
  const shotsValue = shotsItem?.value;
  return Array.isArray(shotsValue) ? (shotsValue as StoryboardShot[]) : [];
}

function getShotThumbnails(shot: StoryboardShot): string[] {
  // 设计稿允许"单格双图"，且可能出现同一张图重复展示（例如第 2 行）
  // 所以这里不做去重，严格保留顺序与重复项
  const urls: string[] = [];
  if (Array.isArray(shot.thumbnailUrls) && shot.thumbnailUrls.length > 0) {
    urls.push(...shot.thumbnailUrls.filter(Boolean));
  } else if (shot.thumbnailUrl) {
    urls.push(shot.thumbnailUrl);
  }
  return urls.slice(0, 2);
}

// ==================== 主组件 ====================
export function StoryboardDetail({
  document,
  onClose,
  onBatchFeedback,
  className,
}: StoryboardDetailProps) {
  const shots = useMemo(() => getShots(document), [document]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const previewAssets = useMemo<Asset[]>(() => {
    const assets: Asset[] = [];
    shots.forEach((shot) => {
      const thumbnails = getShotThumbnails(shot);
      thumbnails.forEach((url, index) => {
        assets.push({
          id: `${shot.id}-thumb-${index}`,
          assetId: `${shot.id}-thumb-${index}`,
          title: `Shot ${shot.sequence}`,
          url,
          thumbnailUrl: url,
          type: AssetType.IMAGE,
          description: shot.notes,
          createdAt: document.createdAt,
        });
      });
    });
    return assets;
  }, [document.createdAt, shots]);

  const openPreviewByUrl = (url: string) => {
    const idx = previewAssets.findIndex((a) => a.url === url);
    setPreviewIndex(Math.max(idx, 0));
    setPreviewOpen(true);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[8px] border-[0.5px] border-[#c0c0c0] bg-white px-6 pb-6 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {/* Header */}
      <div className="-mx-6 flex items-center justify-between border-b border-[rgba(44,44,44,0.08)] px-4 py-3">
        <div className="flex items-center gap-2 rounded px-2 py-1">
          <span className="text-black">
            <Icons.Storyboard />
          </span>
          <span className="text-[16px] leading-[1.5] text-black">
            Storyboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onBatchFeedback && (
            <button
              onClick={onBatchFeedback}
              className="flex items-center gap-1 rounded border-[0.5px] border-[rgba(44,44,44,0.9)] px-3 py-1.5 text-[14px] leading-[1.35] text-black transition-colors hover:bg-black/5"
            >
              <Icons.Edit />
              <span>Batch Feedback</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded p-1.5 text-[rgba(0,0,0,0.6)] transition-colors hover:bg-black/5 hover:text-black"
            >
              <Icons.Close />
            </button>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div className="flex flex-col gap-1">
        <p className="text-[20px] font-bold leading-[1.5] text-black">
          {document.title}
        </p>
        <span className="text-[14px] leading-[1.35] text-[rgba(0,0,0,0.7)]">
          {formatDateTime(document.createdAt)}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border border-[rgba(44,44,44,0.2)] bg-white">
        <div className="grid grid-cols-[56px_240px_92px_1fr]">
          {/* Header row */}
          <div className="border-b border-r border-[rgba(44,44,44,0.2)] px-4 py-3 text-[14px] font-medium leading-[1.35] text-black">
            #
          </div>
          <div className="border-b border-r border-[rgba(44,44,44,0.2)] px-4 py-3 text-[14px] font-medium leading-[1.35] text-black">
            Shot
          </div>
          <div className="border-b border-r border-[rgba(44,44,44,0.2)] px-4 py-3 text-[14px] font-medium leading-[1.35] text-black">
            Duration
          </div>
          <div className="border-b border-[rgba(44,44,44,0.2)] px-4 py-3 text-[14px] font-medium leading-[1.35] text-black">
            Shot Notes
          </div>

          {shots.map((shot, rowIdx) => {
            const isLast = rowIdx === shots.length - 1;
            const rowBorder = isLast
              ? ""
              : "border-b border-[rgba(44,44,44,0.2)]";

            const thumbnails = getShotThumbnails(shot);

            return (
              <div key={shot.id} className="contents">
                {/* # */}
                <div
                  className={cn(
                    rowBorder,
                    "border-r border-[rgba(44,44,44,0.2)] px-4 py-4 text-[14px] leading-[1.35] text-black"
                  )}
                >
                  {shot.sequence}
                </div>

                {/* Shot thumbnails */}
                <div
                  className={cn(
                    rowBorder,
                    "border-r border-[rgba(44,44,44,0.2)] px-4 py-4"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {thumbnails.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Shot ${shot.sequence}`}
                        width={112}
                        height={140}
                        borderRadius="none"
                        fit="cover"
                        className="rounded-[8px] bg-white"
                        onClick={() => openPreviewByUrl(url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div
                  className={cn(
                    rowBorder,
                    "border-r border-[rgba(44,44,44,0.2)] px-4 py-4 text-[14px] leading-[1.35] text-black"
                  )}
                >
                  {shot.duration}
                </div>

                {/* Notes */}
                <div
                  className={cn(
                    rowBorder,
                    "px-4 py-4 text-[14px] leading-[1.5] text-black"
                  )}
                >
                  {shot.notes}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <AssetImageViewer
        assets={previewAssets}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

export default StoryboardDetail;
