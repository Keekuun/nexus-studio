"use client";

/**
 * Brief Card 组件
 * 基于 Figma 设计稿实现的 Brief 模块详情卡片
 * 字段设计严格按照 asset.md 定义
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM
 */

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Image } from "../ui/image";
import { Video } from "../ui/video";
import { AssetImageViewer } from "../ui/asset-image-viewer";
import { MediaMasonry } from "../ui/media-masonry";
import type {
  FlexibleDocument,
  DocumentBlock,
  KeyValuePair,
  Asset,
  AssetType,
} from "../creative-types";

// ==================== 图标组件 ====================
const Icons = {
  FileText: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
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
export interface BriefCardProps {
  /** Brief 文档数据 */
  document: FlexibleDocument;
  /** 关闭回调 */
  onClose?: () => void;
  /** 批量反馈回调 */
  onBatchFeedback?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ==================== 字段名映射（按照 asset.md） ====================
const FIELD_LABELS: Record<string, string> = {
  // videoConfig 区块
  duration: "Duration",
  aspectRatio: "Aspect ratio",
  resolution: "Resolution",
  frameRate: "Frame Rate",
  codec: "Codec",
  // contentRequirement 区块
  productName: "Product Name",
  productLink: "Product link",
  primaryPlatforms: "Primary Platform",
  coreSellingPoints: "Core selling points",
  targetAudience: "Target Audience",
  budget: "Budget",
};

// ==================== 子组件 ====================

/**
 * Video Settings 区块 - 三列布局
 * 对应 asset.md 中的 videoConfig 区块
 */
function VideoConfigBlock({ block }: { block: DocumentBlock }) {
  // 提取关键配置项（按照 asset.md 字段名）
  const getValueByKey = (key: string): string => {
    const item = block.data.find((d) => d.key === key);
    return item ? String(item.value) : "-";
  };

  const settings = [
    { label: "Duration", value: getValueByKey("duration") },
    { label: "Aspect ratio", value: getValueByKey("aspectRatio") },
    { label: "Resolution", value: getValueByKey("resolution") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] font-bold leading-[1.35] tracking-[-0.32px] text-black">
        Video Settings
      </p>
      <div className="flex rounded-[8px] border border-[rgba(44,44,44,0.2)] py-4">
        {settings.map((setting, index) => (
          <div
            key={setting.label}
            className={cn(
              "flex flex-1 flex-col items-center gap-1",
              index < settings.length - 1 &&
                "border-r border-[rgba(44,44,44,0.2)]"
            )}
          >
            <span className="text-[16px] leading-[1.5] text-[rgba(0,0,0,0.9)]">
              {setting.label}
            </span>
            <span className="text-[20px] font-bold leading-[1.5] text-black">
              {setting.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Content Requirements 区块 - 表格布局
 * 对应 asset.md 中的 contentRequirement 区块
 */
function ContentRequirementBlock({ block }: { block: DocumentBlock }) {
  // 过滤掉 assets 类型的数据，只显示普通键值对
  const displayData = block.data.filter(
    (item) => item.key !== "assets" && !Array.isArray(item.value)
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] font-bold leading-[1.35] tracking-[-0.32px] text-black">
        Content Requirements
      </p>
      <div className="overflow-hidden rounded-[8px] bg-[#f5f6f7]">
        {displayData.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[193px_1fr]">
            <div
              className={cn(
                "flex items-center p-4",
                index < displayData.length - 1 &&
                  "border-b border-[rgba(44,44,44,0.12)]"
              )}
            >
              <span className="w-[160px] text-[16px] font-semibold leading-[1.35] text-black">
                {FIELD_LABELS[item.key] || item.key}
              </span>
            </div>
            <div
              className={cn(
                "flex items-center p-4",
                index < displayData.length - 1 &&
                  "border-b border-[rgba(44,44,44,0.12)]"
              )}
            >
              <span className="text-[16px] leading-[1.5] text-black">
                {formatValue(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reference Assets 区块 - 参考素材展示
 * 对应 asset.md 中的 referenceAssets 区块
 * 使用 ui 目录下的 Image、Video、AssetImageViewer 组件
 */
function ReferenceAssetsBlock({ block }: { block: DocumentBlock }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // 从 assets 字段获取资源（按照 asset.md 结构）
  const assetsItem = block.data.find((d) => d.key === "assets");
  const rawAssets = Array.isArray(assetsItem?.value)
    ? (assetsItem.value as Array<{
        id: string;
        assetId?: string;
        title?: string;
        url?: string;
        thumbnailUrl?: string;
        type?: string;
        description?: string;
        duration?: string;
      }>)
    : [];

  // 转换为 Asset 类型（ui 组件需要）
  const assets: Asset[] = rawAssets.map((item) => ({
    id: item.id,
    assetId: item.assetId || item.id,
    title: item.title || "",
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    type: (item.type as AssetType) || ("image" as AssetType),
    description: item.description,
    duration: item.duration,
    createdAt: new Date().toISOString(),
  }));

  // 如果没有 assets，显示空状态
  if (assets.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[16px] font-bold leading-[1.35] tracking-[-0.32px] text-black">
          Reference
        </p>
        <div className="flex items-center justify-center rounded-lg bg-[#f5f6f7] p-8 text-[rgba(0,0,0,0.5)]">
          No reference assets
        </div>
      </div>
    );
  }

  // 处理点击预览
  const handleAssetClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[16px] font-bold leading-[1.35] tracking-[-0.32px] text-black">
        Reference
      </p>

      <MediaMasonry
        assets={assets}
        itemWidthPx={225}
        columnGapPx={20}
        itemGapPx={20}
        defaultAspectRatio="9:16"
        videoAspectRatio="16:9"
        onItemClick={handleAssetClick}
      />

      {/* 资源预览弹窗 */}
      <AssetImageViewer
        assets={assets}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

/**
 * 通用区块 - 默认表格布局
 */
function GenericBlock({ block }: { block: DocumentBlock }) {
  const displayData = block.data.filter(
    (item) => item.key !== "assets" && !Array.isArray(item.value)
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] font-bold leading-[1.35] tracking-[-0.32px] text-black">
        {block.block}
      </p>
      <div className="overflow-hidden rounded-[8px] bg-[#f5f6f7]">
        {displayData.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[193px_1fr]">
            <div
              className={cn(
                "flex items-center p-4",
                index < displayData.length - 1 &&
                  "border-b border-[rgba(44,44,44,0.12)]"
              )}
            >
              <span className="w-[160px] text-[16px] font-semibold leading-[1.35] text-black">
                {FIELD_LABELS[item.key] || item.key}
              </span>
            </div>
            <div
              className={cn(
                "flex items-center p-4",
                index < displayData.length - 1 &&
                  "border-b border-[rgba(44,44,44,0.12)]"
              )}
            >
              <span className="text-[16px] leading-[1.5] text-black">
                {formatValue(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 工具函数 ====================
function formatValue(value: KeyValuePair["value"]): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} · ${hours}:${minutes}`;
}

/**
 * 根据区块名称获取对应的渲染组件
 * 按照 asset.md 定义的区块名称进行匹配
 */
function getBlockRenderer(
  blockName: string
): React.ComponentType<{ block: DocumentBlock }> {
  // 按照 asset.md 定义的区块名称进行精确匹配
  switch (blockName) {
    case "videoConfig":
      return VideoConfigBlock;
    case "contentRequirement":
      return ContentRequirementBlock;
    case "referenceAssets":
      return ReferenceAssetsBlock;
    default:
      return GenericBlock;
  }
}

// ==================== 主组件 ====================
export function BriefCard({
  document,
  onClose,
  onBatchFeedback,
  className,
}: BriefCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-[#c0c0c0] bg-white px-6 pb-6 shadow-[0px_1px_16px_0px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      {/* Header */}
      <div className="-mx-6 flex items-center justify-between border-b border-[rgba(44,44,44,0.08)] px-6 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[rgba(0,0,0,0.7)]">
            <Icons.FileText />
          </span>
          <span className="text-[16px] leading-[1.5] text-[rgba(0,0,0,0.9)]">
            Brief
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onBatchFeedback && (
            <button
              onClick={onBatchFeedback}
              className="flex items-center gap-1 rounded border border-[rgba(44,44,44,0.9)] px-3 py-1.5 text-[14px] leading-[1.35] text-black transition-colors hover:bg-black/5"
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
        <div className="flex items-center gap-1">
          <span className="text-[14px] leading-[1.35] text-[rgba(0,0,0,0.7)]">
            {formatDateTime(document.createdAt)}
          </span>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="flex flex-col gap-6">
        {document.docs.map((block) => {
          const BlockRenderer = getBlockRenderer(block.block);
          return <BlockRenderer key={block.id} block={block} />;
        })}
      </div>
    </div>
  );
}

export default BriefCard;
