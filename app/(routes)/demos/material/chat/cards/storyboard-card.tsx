"use client";

/**
 * Storyboard Card 组件
 * 用于对话页面显示的 Storyboard 模块预览卡片
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=373-143404
 * 严格按照 Figma 设计稿实现
 */

import { cn } from "@/lib/utils/cn";
import type { FlexibleDocument, DocumentBlock } from "../../creative-types";
import { Image } from "../../ui/image";
import { Tag } from "../../ui/tag";

// ==================== 图标组件 ====================
const Icons = {
  LayoutGrid: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface StoryboardCardProps {
  /** Storyboard 文档数据 */
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

interface ShotPreview {
  id: string;
  sequence: number;
  thumbnailUrl?: string;
  notes?: string;
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
 * 从 shots 区块提取分镜预览
 */
function getShotPreviews(docs: DocumentBlock[]): ShotPreview[] {
  const shotsBlock = docs.find((d) => d.block === "shots");
  if (!shotsBlock) return [];

  const shotsItem = shotsBlock.data.find((d) => d.key === "shots");
  if (!shotsItem || !Array.isArray(shotsItem.value)) return [];

  return (
    shotsItem.value as Array<{
      id: string;
      sequence?: number;
      thumbnailUrl?: string;
      notes?: string;
    }>
  )
    .slice(0, 2)
    .map((shot, index) => ({
      id: shot.id,
      sequence: shot.sequence || index + 1,
      thumbnailUrl: shot.thumbnailUrl,
      notes: shot.notes,
    }));
}

// ==================== 主组件 ====================
export function StoryboardCard({
  document,
  onClick,
  isActive = false,
  hasFeedback = false,
  className,
}: StoryboardCardProps) {
  // 提取关键信息
  const shotPreviews = getShotPreviews(document.docs);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[200px] w-[360px] flex-col items-center gap-[24px] overflow-clip rounded-[8px] border-[0.5px] px-[16px] pt-[16px] text-left transition-all",
        isActive
          ? "border-[#c0c0c0] shadow-md"
          : "border-[#c0c0c0] hover:border-[rgba(44,44,44,0.4)] hover:shadow-sm",
        className
      )}
      style={{
        background: hasFeedback
          ? "radial-gradient(105.32% 83.7% at 86.63% -7.95%, #ECECFF 4.2%, #FFF 100%)"
          : "radial-gradient(105.32% 83.7% at 86.63% -7.95%, #FFFAE9 4.2%, #FFF 100%)",
      }}
    >
      {/* 顶部区域 */}
      <div className="relative flex w-full flex-col items-start gap-[4px]">
        {hasFeedback && (
          <div className="z-1 absolute right-0 top-0">
            <Tag label="Feedback" variant="purple" />
          </div>
        )}
        {/* 类型标签行 */}
        <div className="flex w-full items-center justify-between">
          <div className="flex shrink-0 items-center gap-[2px] rounded-[4px]">
            <div className="relative h-[20px] w-[20px] overflow-clip text-[rgba(0,0,0,0.6)]">
              <Icons.LayoutGrid />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center">
              <p className="text-[10px] font-normal leading-normal text-[rgba(0,0,0,0.6)]">
                Storyboard
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

      {/* 分镜预览卡片 */}
      <div className="relative h-[116px] w-[143px] shrink-0 rounded-tl-[4px] rounded-tr-[4px] border-[0.5px] border-[rgba(44,44,44,0.2)] bg-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]">
        {shotPreviews.length > 0 ? (
          shotPreviews.map((shot, index) => {
            const isFirst = index === 0;
            const top = isFirst ? 13 : 75;
            const height = isFirst ? 54 : 46;

            return (
              <div key={shot.id}>
                {/* 序号 */}
                <p
                  className="absolute text-[14px] font-bold leading-[1.35] text-[rgba(44,44,44,0.3)]"
                  style={{ left: 8.5, top: isFirst ? 13 : 74 }}
                >
                  {shot.sequence}
                </p>

                {/* 缩略图 */}
                <div
                  className="absolute w-[38px] overflow-hidden rounded-[2px] shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]"
                  style={{ left: 27.5, top, height }}
                >
                  {shot.thumbnailUrl ? (
                    <Image
                      src={shot.thumbnailUrl}
                      alt={`Shot ${shot.sequence}`}
                      width="100%"
                      height="100%"
                      className="h-full w-full"
                      borderRadius="none"
                      fit="cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#d9d9d9]" />
                  )}
                </div>

                {/* 描述文字 */}
                <div
                  className="absolute flex w-[64px] flex-col items-start"
                  style={{ left: 71.5, top: isFirst ? 13 : 75 }}
                >
                  <p className="h-[39px] w-full overflow-hidden text-ellipsis whitespace-pre-wrap text-[5.883px] font-normal leading-[1.35] text-[rgba(0,0,0,0.5)]">
                    {shot.notes || "No description"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-[8px] text-[rgba(0,0,0,0.5)]">No shots</p>
          </div>
        )}
      </div>
    </button>
  );
}

export default StoryboardCard;
