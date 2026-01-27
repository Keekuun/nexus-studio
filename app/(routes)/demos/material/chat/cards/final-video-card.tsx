"use client";

/**
 * Final Video Card 组件
 * 用于对话页面显示的 Final Video 模块预览卡片
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=215-67480
 * 严格按照 Figma 设计稿实现
 */

import { cn } from "@/lib/utils/cn";
import type { FlexibleDocument, DocumentBlock } from "../../creative-types";
import { Image } from "../../ui/image";
import { Tag } from "../../ui/tag";

// ==================== 图标组件 ====================
const Icons = {
  Video: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <polygon
        points="10 9 15 12 10 15 10 9"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),
  Play: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.5)" />
      <polygon points="13 10 23 16 13 22" fill="white" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface FinalVideoCardProps {
  /** Final Video 文档数据 */
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

interface VideoPreview {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: string;
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
 * 从 video 区块提取视频预览信息
 */
function getVideoPreview(docs: DocumentBlock[]): VideoPreview | null {
  const videoBlock = docs.find((d) => d.block === "video");
  if (!videoBlock) return null;

  const videoItem = videoBlock.data.find((d) => d.key === "video");
  if (!videoItem || typeof videoItem.value !== "object") return null;

  const video = videoItem.value as {
    id?: string;
    url?: string;
    thumbnailUrl?: string;
    title?: string;
    duration?: string;
  };

  return {
    id: video.id || "video-1",
    url: video.url,
    thumbnailUrl: video.thumbnailUrl,
    title: video.title,
    duration: video.duration,
  };
}

// ==================== 主组件 ====================
export function FinalVideoCard({
  document,
  onClick,
  isActive = false,
  hasFeedback = false,
  className,
}: FinalVideoCardProps) {
  // 提取关键信息
  const videoPreview = getVideoPreview(document.docs);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[200px] w-[360px] flex-col items-center gap-[24px] overflow-clip rounded-[8px] border-[0.5px] px-[16px] pt-[16px] text-left transition-all",
        isActive
          ? "border-[rgba(44,44,44,0.5)] shadow-md"
          : "border-[rgba(44,44,44,0.2)] hover:border-[rgba(44,44,44,0.4)] hover:shadow-sm",
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
              <Icons.Video />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center">
              <p className="text-[10px] font-normal leading-normal text-[rgba(0,0,0,0.6)]">
                Final Video
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

      {/* 视频预览区域 */}
      <div className="relative h-[153px] w-[86px] shrink-0">
        {/* 视频缩略图 */}
        <div className="absolute left-0 top-0 h-[153px] w-[86px] overflow-hidden rounded-[8px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.16)]">
          {videoPreview?.thumbnailUrl ? (
            <Image
              src={videoPreview.thumbnailUrl}
              alt={videoPreview.title || "Video thumbnail"}
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

        {/* 播放按钮 */}
        <div className="absolute left-1/2 top-[49px] h-[32px] w-[32px] -translate-x-1/2">
          <Icons.Play />
        </div>
      </div>
    </button>
  );
}

export default FinalVideoCard;
