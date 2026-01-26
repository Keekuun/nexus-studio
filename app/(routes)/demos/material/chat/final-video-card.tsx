"use client";

/**
 * Final Video Card 组件
 * 基于 Figma 设计稿实现的 FinalVideo 模块详情卡片
 * 字段设计严格按照 asset.md 定义（block: "video" / key: "video"）
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=455:145523
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Image } from "../ui/image";
import type { Asset, FlexibleDocument } from "../creative-types";
import { AssetType } from "../creative-types";

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
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M17 10l4-2v8l-4-2v-4z" />
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
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" opacity="0.9" />
    </svg>
  ),
  Pause: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="7" y="7" width="3" height="10" rx="1" fill="currentColor" />
      <rect x="14" y="7" width="3" height="10" rx="1" fill="currentColor" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface FinalVideoCardProps {
  /** FinalVideo 文档数据 */
  document: FlexibleDocument;
  /** 关闭回调 */
  onClose?: () => void;
  /** 批量反馈回调 */
  onBatchFeedback?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

type FinalVideoBlockValue = {
  id: string;
  assetId: string;
  title: string;
  url?: string;
  thumbnailUrl?: string;
  type?: string;
  duration?: string;
  description?: string;
};

function formatTimeHHMM(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatSecondsToMMSS(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const wholeSeconds = Math.floor(seconds);
  const mm = Math.floor(wholeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(wholeSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

function parseDurationSeconds(duration?: string): number | null {
  if (!duration) return null;
  const trimmed = duration.trim();
  // 支持 "15s"
  const secondsMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*s$/i);
  if (secondsMatch) return Number(secondsMatch[1]);

  // 支持 "mm:ss" / "hh:mm:ss"
  const parts = trimmed.split(":").map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function getVideoAsset(document: FlexibleDocument): Asset | null {
  const videoBlock = document.docs.find((d) => d.block === "video");
  const videoItem = videoBlock?.data.find((d) => d.key === "video");
  const videoValue = videoItem?.value as FinalVideoBlockValue | undefined;
  if (!videoValue) return null;

  return {
    id: videoValue.id || "video-001",
    assetId: videoValue.assetId || videoValue.id || "asset-video-001",
    title: videoValue.title || "Final Production Video",
    url: videoValue.url,
    thumbnailUrl: videoValue.thumbnailUrl,
    type: AssetType.VIDEO,
    duration: videoValue.duration,
    description: videoValue.description,
    createdAt: document.createdAt,
  };
}

export function FinalVideoCard({
  document,
  onClose,
  onBatchFeedback,
  className,
}: FinalVideoCardProps) {
  const videoAsset = useMemo(() => getVideoAsset(document), [document]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isTimelineDragging, setIsTimelineDragging] = useState(false);

  const timelineDragRef = useRef<{
    isDown: boolean;
    startX: number;
    startScrollLeft: number;
    moved: boolean;
  }>({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const preventFrameClickRef = useRef(false);

  // 设计稿底部是“时间轴缩略图条”，这里用 poster 重复模拟（不扩展数据结构）
  const timelineThumbs = useMemo(() => {
    const poster = videoAsset?.thumbnailUrl || "";
    return Array.from({ length: 18 }).map((_, idx) => ({
      key: `${poster}-${idx}`,
      src: poster,
    }));
  }, [videoAsset?.thumbnailUrl]);

  useEffect(() => {
    // 没有 metadata 时，用 asset.duration 做兜底
    const fallback = parseDurationSeconds(videoAsset?.duration) || 0;
    setDurationSec((prev) => (prev > 0 ? prev : fallback));
  }, [videoAsset?.duration]);

  const handleTogglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const seekToByFrameIndex = (frameIndex: number) => {
    const el = videoRef.current;
    if (!el) return;
    const framesCount = Math.max(1, timelineThumbs.length);
    const d =
      Number.isFinite(el.duration) && el.duration > 0
        ? el.duration
        : durationSec;
    if (!d || d <= 0) return;

    const ratio =
      framesCount === 1 ? 0 : frameIndex / Math.max(framesCount - 1, 1);
    const nextTime = Math.max(0, Math.min(d, ratio * d));
    el.currentTime = nextTime;

    const container = timelineRef.current;
    if (container) {
      const target = container.querySelector<HTMLElement>(
        `[data-frame-index=\"${frameIndex}\"]`
      );
      target?.scrollIntoView({ block: "nearest", inline: "center" });
    }
  };

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const container = timelineRef.current;
    if (!container) return;

    timelineDragRef.current.isDown = true;
    timelineDragRef.current.startX = e.pageX;
    timelineDragRef.current.startScrollLeft = container.scrollLeft;
    timelineDragRef.current.moved = false;
    setIsTimelineDragging(true);

    // 防止文本/图片被选中或拖拽
    e.preventDefault();
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = timelineRef.current;
    if (!container) return;
    if (!timelineDragRef.current.isDown) return;

    const dx = e.pageX - timelineDragRef.current.startX;
    if (Math.abs(dx) > 3) timelineDragRef.current.moved = true;
    container.scrollLeft = timelineDragRef.current.startScrollLeft - dx;

    e.preventDefault();
  };

  const endTimelineDrag = () => {
    if (!timelineDragRef.current.isDown) return;
    const moved = timelineDragRef.current.moved;
    timelineDragRef.current.isDown = false;
    setIsTimelineDragging(false);

    // 鼠标拖动结束后的 click 事件会紧接着触发，这里用一帧时间屏蔽“误点击”
    if (moved) {
      preventFrameClickRef.current = true;
      requestAnimationFrame(() => {
        preventFrameClickRef.current = false;
      });
    }
  };

  const progressPercent = useMemo(() => {
    const d = durationSec || 0;
    if (!d) return 0;
    return Math.max(0, Math.min(100, (currentTimeSec / d) * 100));
  }, [currentTimeSec, durationSec]);

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
            <Icons.Video />
          </span>
          <span className="text-[16px] leading-[1.5] text-black">
            Final Video
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

      {/* Title + time */}
      <div className="flex flex-col gap-1">
        <p className="text-[20px] font-bold leading-[1.5] text-black">
          {document.title}
        </p>
        <span className="text-[14px] leading-[1.35] text-[rgba(0,0,0,0.7)]">
          {new Date(document.createdAt).toLocaleDateString("zh-CN")} ·{" "}
          {formatTimeHHMM(document.createdAt)}
        </span>
      </div>

      {/* Player (Figma-like) */}
      <div className="overflow-hidden rounded-[12px] bg-black">
        {/* video area */}
        <div className="relative flex items-center justify-center px-8 py-6">
          <div className="w-[240px] overflow-hidden rounded-[12px] bg-black">
            {videoAsset?.url ? (
              <video
                ref={videoRef}
                src={videoAsset.url}
                poster={videoAsset.thumbnailUrl}
                playsInline
                className="aspect-[9/16] w-full bg-black object-contain"
                onLoadedMetadata={(e) => {
                  const d = (e.currentTarget as HTMLVideoElement).duration;
                  if (Number.isFinite(d) && d > 0) setDurationSec(d);
                }}
                onTimeUpdate={(e) => {
                  setCurrentTimeSec(
                    (e.currentTarget as HTMLVideoElement).currentTime
                  );
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="flex aspect-[9/16] w-full items-center justify-center bg-[#111] text-[14px] text-white/60">
                No video
              </div>
            )}
          </div>
        </div>

        {/* bottom controls + timeline */}
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-white/90"
            onClick={handleTogglePlay}
          >
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
          </button>
          <div className="text-[14px] leading-[1.35] text-white/80">
            {formatSecondsToMMSS(currentTimeSec)} |{" "}
            {formatSecondsToMMSS(durationSec)}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="relative">
              {/* 进度条（绿色） */}
              <div className="absolute -top-[6px] left-0 right-0 h-[3px] bg-white/10">
                <div
                  className="h-full bg-[#15C15D]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div
                ref={timelineRef}
                className={cn(
                  "flex select-none items-center gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  isTimelineDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                onMouseDown={handleTimelineMouseDown}
                onMouseMove={handleTimelineMouseMove}
                onMouseUp={endTimelineDrag}
                onMouseLeave={endTimelineDrag}
              >
                {timelineThumbs.map((t, idx) => (
                  <div
                    key={t.key}
                    data-frame-index={idx}
                    className="h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[6px] bg-white/10"
                    onDragStart={(e) => e.preventDefault()}
                  >
                    {t.src ? (
                      <Image
                        src={t.src}
                        alt="frame"
                        width={44}
                        height={44}
                        borderRadius="none"
                        fit="cover"
                        className="bg-black"
                        draggable={false}
                        onClick={() => {
                          if (preventFrameClickRef.current) return;
                          seekToByFrameIndex(idx);
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalVideoCard;
