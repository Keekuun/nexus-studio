"use client";

/**
 * Creative Planning Card 组件
 * 基于 Figma 设计稿实现的 Creative Planning 模块详情卡片
 * 字段设计严格按照 asset.md 定义
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=312:125460
 */

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { AssetGrid } from "../ui/asset-grid";
import type { FlexibleDocument, Asset, AssetType } from "../creative-types";

// ==================== 图标组件 ====================
const Icons = {
  Puzzle: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.452-.802-.932 0-.77-.63-1.4-1.4-1.4a1.4 1.4 0 0 0-1.4 1.4c0 .48-.332.863-.802.933a.98.98 0 0 1-.837-.276l-1.611-1.611a2.408 2.408 0 0 1 0-3.408l1.568-1.568a.98.98 0 0 0 .289-.878 1.4 1.4 0 0 1 1.381-1.63h.001c.77 0 1.4-.629 1.4-1.4a1.4 1.4 0 0 1 2.8 0c0 .77.63 1.4 1.4 1.4a1.4 1.4 0 0 1 1.381 1.63Z" />
      <path d="M4.561 16.15c.049-.322-.059-.648-.289-.878L2.704 13.704A2.408 2.408 0 0 1 2 12c0-.617.235-1.233.706-1.704l1.611-1.611a.98.98 0 0 1 .837-.276c.47.07.802.452.802.932 0 .77.63 1.4 1.4 1.4a1.4 1.4 0 0 0 1.4-1.4c0-.48.332-.863.802-.933a.98.98 0 0 1 .837.276l1.611 1.611a2.408 2.408 0 0 1 0 3.408l-1.568 1.568a.98.98 0 0 0-.289.878 1.4 1.4 0 0 1-1.381 1.63h-.001c-.77 0-1.4.629-1.4 1.4a1.4 1.4 0 0 1-2.8 0c0-.77-.63-1.4-1.4-1.4a1.4 1.4 0 0 1-1.381-1.63Z" />
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
export interface CreativePlanningCardProps {
  /** Creative Planning 文档数据 */
  document: FlexibleDocument;
  /** 关闭回调 */
  onClose?: () => void;
  /** 批量反馈回调 */
  onBatchFeedback?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

/** Concept 类型定义（按照 asset.md） */
interface Concept {
  id: string;
  title: string;
  tags?: string[];
  coreCreative: string;
  outline: string[];
  assets?: Array<{
    id: string;
    assetId?: string;
    title?: string;
    url?: string;
    thumbnailUrl?: string;
    type?: string;
    description?: string;
  }>;
}

// ==================== 标签颜色配置 ====================
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  "Product-First": { bg: "bg-[#d3edff]", text: "text-[#0a87e1]" },
  "Story-Driven": { bg: "bg-[#f2e3dd]", text: "text-[#60330f]" },
  "High-Impact": { bg: "bg-[#fff6dd]", text: "text-[#a97a00]" },
  default: { bg: "bg-[#f5f6f7]", text: "text-[rgba(0,0,0,0.7)]" },
};

// ==================== 子组件 ====================

/** Concept 选择卡片 */
function ConceptTab({
  concept,
  index,
  isSelected,
  onClick,
}: {
  concept: Concept;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const tag = concept.tags?.[0] || "";
  const tagColor = TAG_COLORS[tag] || TAG_COLORS.default;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-start justify-center gap-[6px] overflow-hidden rounded-[8px] border px-4 py-[13px] text-left transition-colors",
        isSelected
          ? "border-[rgba(44,44,44,0.08)] bg-[#f5f6f7]"
          : "border-[rgba(44,44,44,0.08)] bg-white hover:bg-[#fafafa]"
      )}
    >
      <p className="text-[16px] font-bold leading-[1.5] tracking-[-0.32px] text-black">
        Concept {index + 1}
      </p>
      {tag && (
        <div
          className={cn("flex items-center rounded px-2 py-0.5", tagColor.bg)}
        >
          <span className={cn("text-[12px] leading-[1.5]", tagColor.text)}>
            {tag}
          </span>
        </div>
      )}
    </button>
  );
}

/** Concept 详情区块 */
function ConceptDetail({ concept }: { concept: Concept }) {
  // 转换 assets 为 Asset 类型
  const assets: Asset[] = (concept.assets || []).map((item) => ({
    id: item.id,
    assetId: item.assetId || item.id,
    title: item.title || "",
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    type: (item.type as AssetType) || ("image" as AssetType),
    description: item.description,
    createdAt: new Date().toISOString(),
  }));

  return (
    <div className="flex w-full flex-col gap-4 rounded-[8px] bg-[#f5f6f7] p-6">
      {/* Concept 标题 */}
      <p className="text-[24px] font-bold leading-[1.5] text-black">
        {concept.title}
      </p>

      {/* Core Creative */}
      <div className="flex flex-col gap-1">
        <p className="text-[20px] font-bold leading-[1.5] text-black">
          Core Creative
        </p>
        <p className="text-[16px] leading-[1.5] text-[rgba(0,0,0,0.9)]">
          {concept.coreCreative}
        </p>
      </div>

      {/* Outline */}
      {concept.outline && concept.outline.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[20px] font-bold leading-[1.5] text-black">
            Outline
          </p>
          <ol className="ml-6 list-decimal space-y-0.5">
            {concept.outline.map((item, idx) => (
              <li
                key={idx}
                className="text-[16px] leading-[1.5] text-[rgba(0,0,0,0.9)]"
              >
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Assets 展示 - 使用 AssetGrid 组件 */}
      {assets.length > 0 && (
        <AssetGrid
          assets={assets}
          columns={Math.min(assets.length, 5)}
          showIndex={true}
          showTitle={true}
          imageHeight={200}
        />
      )}
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
export function CreativePlanningCard({
  document,
  onClose,
  onBatchFeedback,
  className,
}: CreativePlanningCardProps) {
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);

  // 从 concepts 区块获取 concepts 数据
  const conceptsBlock = document.docs.find((d) => d.block === "concepts");
  const conceptsItem = conceptsBlock?.data.find((d) => d.key === "concepts");
  const concepts: Concept[] = Array.isArray(conceptsItem?.value)
    ? (conceptsItem.value as Concept[])
    : [];

  const selectedConcept = concepts[selectedConceptIndex];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[8px] border-[0.5px] border-[#c0c0c0] bg-white px-8 pb-8 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      {/* Header */}
      <div className="-mx-8 flex items-center justify-between border-b border-[rgba(44,44,44,0.08)] px-6 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[rgba(0,0,0,0.7)]">
            <Icons.Puzzle />
          </span>
          <span className="text-[16px] leading-[1.5] text-[rgba(0,0,0,0.9)]">
            Creative Planning
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
          <span className="text-[12px] leading-[1.5] text-[rgba(0,0,0,0.7)]">
            {formatDateTime(document.createdAt)}
          </span>
        </div>
      </div>

      {/* Concept Tabs */}
      {concepts.length > 0 && (
        <div className="flex gap-2">
          {concepts.map((concept, index) => (
            <ConceptTab
              key={concept.id}
              concept={concept}
              index={index}
              isSelected={index === selectedConceptIndex}
              onClick={() => setSelectedConceptIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Concept Details */}
      <div className="flex flex-col gap-6">
        {selectedConcept && <ConceptDetail concept={selectedConcept} />}
      </div>
    </div>
  );
}

export default CreativePlanningCard;
