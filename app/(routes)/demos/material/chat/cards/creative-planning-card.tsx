"use client";

/**
 * Creative Planning Card 组件
 * 用于对话页面显示的 Creative Planning 模块预览卡片
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=284-115376
 * 严格按照 Figma 设计稿实现
 */

import { cn } from "@/lib/utils/cn";
import type { FlexibleDocument, DocumentBlock } from "../../creative-types";
import { Image } from "../../ui/image";

// ==================== 图标组件 ====================
const Icons = {
  Puzzle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.452-.937-.906-.135-.454-.163-1.018-.617-1.472-.684-.684-1.791-.684-2.475 0-.684.684-.684 1.791 0 2.475.454.454 1.018.482 1.472.617.454.135.836.467.906.937a.98.98 0 0 1-.276.837l-1.611 1.611c-.47.47-1.087.706-1.704.706s-1.233-.235-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.878-.289c-.423.069-.78.344-.94.761-.17.445-.266 1.12-.73 1.584-.684.684-1.791.684-2.475 0-.684-.684-.684-1.791 0-2.475.454-.454 1.018-.482 1.472-.617.454-.135.836-.467.906-.937a.98.98 0 0 0-.276-.837L4.27 13.939c-.47-.47-.706-1.087-.706-1.704s.235-1.233.706-1.704l1.611-1.611a.98.98 0 0 1 .837-.276c.47.07.802.452.937.906.135.454.163 1.018.617 1.472.684.684 1.791.684 2.475 0 .684-.684.684-1.791 0-2.475-.454-.454-1.018-.482-1.472-.617-.454-.135-.836-.467-.906-.937a.98.98 0 0 1 .276-.837l1.611-1.611c.47-.47 1.087-.706 1.704-.706s1.233.235 1.704.706l1.568 1.568c.23.23.556.338.878.289.423-.069.78-.344.94-.761.17-.445.266-1.12.73-1.584.684-.684 1.791-.684 2.475 0 .684.684.684 1.791 0 2.475-.464.464-1.139.56-1.584.73-.417.16-.692.517-.761.94Z" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface CreativePlanningCardProps {
  /** Creative Planning 文档数据 */
  document: FlexibleDocument;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否激活状态 */
  isActive?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

interface Concept {
  id: string;
  title: string;
  coreCreative?: string;
  outline?: string[];
  assets?: Array<{
    id: string;
    url?: string;
    thumbnailUrl?: string;
    title?: string;
  }>;
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
 * 从 concepts 区块提取概念列表
 */
function getConcepts(block: DocumentBlock): Concept[] {
  const conceptsItem = block.data.find((d) => d.key === "concepts");
  if (!conceptsItem || !Array.isArray(conceptsItem.value)) return [];

  return (
    conceptsItem.value as Array<{
      id: string;
      title?: string;
      coreCreative?: string;
      outline?: string[];
      assets?: Array<{
        id: string;
        url?: string;
        thumbnailUrl?: string;
        title?: string;
      }>;
    }>
  )
    .slice(0, 3)
    .map((item, index) => ({
      id: item.id || `concept-${index}`,
      title: item.title || `Concept ${index + 1}`,
      coreCreative: item.coreCreative,
      outline: item.outline,
      assets: item.assets,
    }));
}

// ==================== 概念预览卡片组件 ====================
function ConceptPreviewCard({
  concept,
  rotation,
}: {
  concept: Concept;
  rotation: number;
}) {
  const firstAsset = concept.assets?.[0];
  const firstOutline = concept.outline?.[0];

  return (
    <div
      className="h-[93px] w-[143px] overflow-clip rounded-tl-[4px] rounded-tr-[4px] border-[0.5px] border-[rgba(44,44,44,0.2)] bg-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]"
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Concept 标题 */}
      <p className="absolute left-[9px] top-[9px] text-[8px] font-bold leading-[1.35] text-[rgba(0,0,0,0.5)]">
        {concept.title}
      </p>

      {/* 内容区域 */}
      <div className="absolute left-[9px] top-[24px] flex w-[123.905px] flex-col items-start gap-[2px]">
        {/* Core creative */}
        <p className="w-full text-[6px] font-medium leading-[1.35] text-[rgba(0,0,0,0.5)]">
          Core creative
        </p>
        <p className="h-[8px] w-full overflow-hidden text-ellipsis whitespace-nowrap text-[6px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
          {concept.coreCreative || "No description"}
        </p>

        {/* Outline */}
        <p className="w-full text-[6px] font-medium leading-[1.35] text-[rgba(0,0,0,0.5)]">
          Outline
        </p>
        <p className="h-[9px] w-full overflow-hidden text-ellipsis whitespace-nowrap text-[6px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
          {firstOutline || "No outline"}
        </p>

        {/* 图片预览 */}
        {firstAsset?.url && (
          <div className="relative h-[30px] w-[126px] shrink-0 overflow-hidden rounded-[4px]">
            <Image
              src={firstAsset.thumbnailUrl || firstAsset.url}
              alt={firstAsset.title || "concept image"}
              width="100%"
              height="100%"
              className="h-full w-full"
              borderRadius="none"
              fit="cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
export function CreativePlanningCard({
  document,
  onClick,
  isActive = false,
  className,
}: CreativePlanningCardProps) {
  // 提取关键信息
  const conceptsBlock = document.docs.find((d) => d.block === "concepts");
  const concepts = conceptsBlock ? getConcepts(conceptsBlock) : [];

  // 预览卡片的旋转角度和层级
  const cardConfigs = [
    { rotation: -15, zIndex: 1, translateX: -60, translateY: 20 },
    { rotation: 0, zIndex: 2, translateX: 0, translateY: 0 },
    { rotation: 15, zIndex: 3, translateX: 60, translateY: 20 },
  ];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[200px] w-[360px] flex-col gap-[24px] overflow-clip rounded-[8px] border-[0.5px] px-[16px] pt-[16px] text-left transition-all",
        isActive
          ? "border-[rgba(44,44,44,0.5)] shadow-md"
          : "border-[rgba(44,44,44,0.2)] hover:border-[rgba(44,44,44,0.4)] hover:shadow-sm",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 360 200' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-9.376 15.909 -28.578 -13.842 311.87 -15.909)'><stop stop-color='rgba(255,250,233,1)' offset='0.042046'/><stop stop-color='rgba(255,255,255,1)' offset='1'/></radialGradient></defs></svg>")`,
      }}
    >
      {/* 顶部区域 */}
      <div className="flex w-full flex-col items-start gap-[4px]">
        {/* 类型标签行 */}
        <div className="flex w-full items-center justify-between">
          <div className="flex shrink-0 items-center gap-[4px] rounded-[4px]">
            <div className="relative h-[16px] w-[16px] overflow-clip text-[rgba(0,0,0,0.6)]">
              <Icons.Puzzle />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center">
              <p className="text-[10px] font-normal leading-normal text-[rgba(0,0,0,0.6)]">
                Creative Planning
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

      {/* 概念卡片预览区域 - 扇形排列 */}
      <div className="relative flex h-[130px] w-full items-center justify-center">
        {concepts.length > 0 ? (
          concepts.map((concept, index) => {
            const config = cardConfigs[index] || cardConfigs[0];
            return (
              <div
                key={concept.id}
                className="absolute"
                style={{
                  transform: `translate(${config.translateX}px, ${config.translateY}px)`,
                  zIndex: config.zIndex,
                }}
              >
                <ConceptPreviewCard
                  concept={concept}
                  rotation={config.rotation}
                />
              </div>
            );
          })
        ) : (
          // 默认空状态显示
          <div className="flex h-[93px] w-[143px] items-center justify-center rounded-[4px] border-[0.5px] border-[rgba(44,44,44,0.2)] bg-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]">
            <p className="text-[8px] text-[rgba(0,0,0,0.5)]">No concepts</p>
          </div>
        )}
      </div>
    </button>
  );
}

export default CreativePlanningCard;
