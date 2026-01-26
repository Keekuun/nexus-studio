"use client";

/**
 * Visual Asset Card 组件
 * 基于 Figma 设计稿实现的 Visual Asset 模块详情卡片
 * 字段设计严格按照 asset.md 定义
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=356:143268
 */

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { AssetTable } from "../ui/asset-table";
import { AssetImageViewer } from "../ui/asset-image-viewer";
import type { FlexibleDocument, Asset } from "../creative-types";
import { AssetType } from "../creative-types";

// ==================== 图标组件 ====================
const Icons = {
  Palette: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
      <circle cx="7.5" cy="11.5" r="1.5" />
      <circle cx="12" cy="7.5" r="1.5" />
      <circle cx="16.5" cy="11.5" r="1.5" />
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
  ChevronDown: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface VisualAssetCardProps {
  /** Visual Asset 文档数据 */
  document: FlexibleDocument;
  /** 关闭回调 */
  onClose?: () => void;
  /** 批量反馈回调 */
  onBatchFeedback?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

/** Asset Group 类型定义（按照 asset.md） */
interface AssetGroup {
  blockType: "asset-group";
  groupTitle: string;
  assets: Array<{
    id: string;
    assetId?: string;
    title?: string;
    url?: string;
    thumbnailUrl?: string;
    type?: string;
    description?: string;
  }>;
}

// ==================== 子组件 ====================

/** Creative Concept 区块 - 可折叠 */
function CreativeConceptBlock({
  concept,
  coreCreative,
}: {
  concept: string;
  coreCreative: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-[8px] bg-[#f5f6f7] p-4">
      {/* 标题行 */}
      <p className="text-[16px] font-bold leading-[1.5] tracking-[-0.32px] text-black">
        Creative Concept： {concept}
      </p>

      {/* Core Creative */}
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-semibold leading-[1.35] text-black">
          Core Creative
        </p>
        <p
          className={cn(
            "text-[14px] leading-[1.35] text-black",
            !expanded && "line-clamp-2"
          )}
        >
          {coreCreative}
        </p>
      </div>

      {/* 展开/收起按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center gap-1 text-[14px] text-black"
      >
        <span>{expanded ? "Show less" : "Show more"}</span>
        {expanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
      </button>
    </div>
  );
}

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

// ==================== 主组件 ====================
export function VisualAssetCard({
  document,
  onClose,
  onBatchFeedback,
  className,
}: VisualAssetCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // 从 docs 中提取数据
  const conceptBlock = document.docs.find((d) => d.block === "creativeConcept");
  const coreCreativeBlock = document.docs.find(
    (d) => d.block === "coreCreative"
  );
  const assetGroupsBlock = document.docs.find((d) => d.block === "assetGroups");

  const concept =
    (conceptBlock?.data.find((d) => d.key === "concept")?.value as string) ||
    "";
  const coreCreative =
    (coreCreativeBlock?.data.find((d) => d.key === "description")
      ?.value as string) || "";

  const groupsItem = assetGroupsBlock?.data.find((d) => d.key === "groups");
  const assetGroups: AssetGroup[] = Array.isArray(groupsItem?.value)
    ? (groupsItem.value as AssetGroup[])
    : [];

  // 收集所有 assets 用于预览
  const allAssets: Asset[] = [];
  const groupStartIndices: number[] = [];

  assetGroups.forEach((group) => {
    groupStartIndices.push(allAssets.length);
    group.assets.forEach((asset) => {
      allAssets.push({
        id: asset.id,
        assetId: asset.assetId || asset.id,
        title: asset.title || "",
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        type: (asset.type as AssetType) || ("image" as AssetType),
        description: asset.description,
        createdAt: new Date().toISOString(),
      });
    });
  });

  const handleAssetClick = (index: number) => {
    setPreviewIndex(index);
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
            <Icons.Palette />
          </span>
          <span className="text-[16px] leading-[1.5] text-black">
            Visual Assets
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
        <div className="flex items-center gap-1">
          <span className="text-[14px] leading-[1.35] text-[rgba(0,0,0,0.7)]">
            {formatDateTime(document.createdAt)}
          </span>
        </div>
      </div>

      {/* Creative Concept Block */}
      {(concept || coreCreative) && (
        <CreativeConceptBlock concept={concept} coreCreative={coreCreative} />
      )}

      {/* Asset Groups */}
      <div className="flex flex-col gap-6">
        {assetGroups.map((group, groupIdx) => {
          // 将 group.assets 转换为 Asset[] 格式
          const groupAssets: Asset[] = group.assets.map((asset) => ({
            id: asset.id,
            assetId: asset.assetId || asset.id,
            title: asset.title || "",
            url: asset.url,
            thumbnailUrl: asset.thumbnailUrl,
            type: (asset.type as AssetType) || ("image" as AssetType),
            description: asset.description,
            createdAt: new Date().toISOString(),
          }));

          // 计算该分组在全局资产列表中的起始索引
          const startIndex = groupStartIndices[groupIdx];

          return (
            <AssetTable
              key={group.groupTitle}
              groupTitle={group.groupTitle}
              assets={groupAssets}
              columns={2}
              onAssetClick={(localIndex) => {
                handleAssetClick(startIndex + localIndex);
              }}
            />
          );
        })}
      </div>

      {/* Asset Preview */}
      <AssetImageViewer
        assets={allAssets}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

export default VisualAssetCard;
