"use client";

/**
 * Brief Card 组件
 * 用于对话页面显示的 Brief 模块预览卡片
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=312-124203
 * 严格按照 Figma 设计稿实现
 */

import { cn } from "@/lib/utils/cn";
import type { FlexibleDocument, DocumentBlock } from "../../creative-types";
import { Tag } from "../../ui/tag";

// ==================== 图标组件 ====================
const Icons = {
  FileDescription: () => (
    <svg
      width="16"
      height="16"
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
};

// ==================== 类型定义 ====================
export interface BriefCardProps {
  /** Brief 文档数据 */
  document: FlexibleDocument;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否激活状态 */
  isActive?: boolean;
  /** 是否已反馈 */
  hasFeedback?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ==================== 工具函数 ====================
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}

/**
 * 从 contentRequirement 区块提取产品名称
 */
function getProductName(block: DocumentBlock): string | null {
  const item = block.data.find((d) => d.key === "productName");
  return item ? String(item.value) : null;
}

/**
 * 从 contentRequirement 区块提取核心卖点
 */
function getCoreSellingPoints(block: DocumentBlock): string | null {
  const item = block.data.find((d) => d.key === "coreSellingPoints");
  return item ? String(item.value) : null;
}

/**
 * 从 contentRequirement 区块提取产品链接
 */
function getProductLink(block: DocumentBlock): string | null {
  const item = block.data.find((d) => d.key === "productLink");
  return item ? String(item.value) : null;
}

// ==================== 主组件 ====================
export function BriefCard({
  document,
  onClick,
  isActive = false,
  hasFeedback = true,
  className,
}: BriefCardProps) {
  // 提取关键信息
  const contentRequirementBlock = document.docs.find(
    (d) => d.block === "contentRequirement"
  );

  const productName = contentRequirementBlock
    ? getProductName(contentRequirementBlock)
    : null;
  const coreSellingPoints = contentRequirementBlock
    ? getCoreSellingPoints(contentRequirementBlock)
    : null;
  const productLink = contentRequirementBlock
    ? getProductLink(contentRequirementBlock)
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[200px] w-[360px] flex-col items-center gap-[24px] overflow-clip rounded-[8px] border-[0.5px] px-[16px] pt-[16px] text-left transition-all",
        isActive
          ? "border-[rgba(44,44,44,0.5)] shadow-md"
          : "border-[rgba(44,44,44,0.3)] hover:border-[rgba(44,44,44,0.5)] hover:shadow-sm",
        className
      )}
      style={{
        background: hasFeedback
          ? "radial-gradient(105.32% 83.7% at 86.63% -7.95%, #ECECFF 4.2%, #FFF 100%)"
          : "radial-gradient(105.32% 83.7% at 86.63% -7.95%, #FFFAE9 4.2%, #FFF 100%)",
      }}
    >
      {/* 顶部区域 */}
      <div className="relative flex w-full shrink-0 flex-col items-start gap-[4px]">
        {hasFeedback && (
          <div className="z-1 absolute right-0 top-0">
            <Tag label="Feedback" variant="purple" />
          </div>
        )}
        {/* 类型标签行 */}
        <div className="flex w-full items-center justify-between">
          <div className="flex shrink-0 items-center gap-[4px] rounded-[4px]">
            <div className="relative h-[16px] w-[16px] overflow-clip text-[rgba(0,0,0,0.6)]">
              <Icons.FileDescription />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center">
              <p className="text-[10px] font-normal leading-normal text-[rgba(0,0,0,0.6)]">
                Brief
              </p>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold leading-[1.5] tracking-[-0.32px] text-black">
          {document.title}
        </p>

        {/* 日期和时间行 */}
        <div className="flex w-full shrink-0 items-center">
          <div className="flex shrink-0 items-center gap-[3px]">
            <div className="flex shrink-0 flex-col items-center justify-center">
              <p className="text-[10px] font-normal leading-normal text-[rgba(0,0,0,0.6)]">
                {formatDate(document.createdAt)}
              </p>
            </div>
            <p className="text-[12px] font-normal leading-[1.5] text-[rgba(0,0,0,0.7)]">
              {formatTime(document.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* 内容预览卡片 */}
      <div className="relative h-[93px] w-[143px] shrink-0 overflow-clip rounded-tl-[4px] rounded-tr-[4px] border-[0.5px] border-[rgba(44,44,44,0.2)] bg-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]">
        {/* Core Information 标题 */}
        <p className="absolute left-[9px] top-[11px] w-[232px] text-[5.883px] font-bold leading-[1.35] text-[rgba(0,0,0,0.5)]">
          Core Information
        </p>

        {/* 内容列表 */}
        <div className="absolute left-[9.74px] top-[24.24px] flex w-[123.905px] flex-col items-start gap-[11.765px]">
          {/* Product Name */}
          {productName && (
            <div className="flex w-full shrink-0 flex-col items-start gap-[2.941px]">
              <p className="w-full shrink-0 text-[5.147px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                Product Name
              </p>
              <p className="line-clamp-2 w-full shrink-0 text-[5.883px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                {productName}
              </p>
            </div>
          )}

          {/* Core selling points */}
          {coreSellingPoints && (
            <div className="flex w-full shrink-0 flex-col items-start gap-[2.941px]">
              <p className="w-full shrink-0 text-[5.147px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                Core selling points
              </p>
              <p className="line-clamp-1 w-full shrink-0 text-[5.883px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                {coreSellingPoints}
              </p>
            </div>
          )}

          {/* Product link */}
          {productLink && (
            <div className="flex w-full shrink-0 flex-col items-start gap-[2.941px]">
              <p className="w-full shrink-0 text-[5.147px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                Product link
              </p>
              <p className="line-clamp-1 w-full shrink-0 text-[5.883px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                {productLink}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default BriefCard;
