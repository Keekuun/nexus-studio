import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Asset, AssetType } from "../creative-types";

export interface AssetImageViewerProps {
  /** 资产列表 */
  assets: Asset[];
  /** 初始显示的资产索引 */
  initialIndex: number;
  /** 是否打开预览 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 资产图片预览组件
 * 支持多图片浏览、键盘导航、图片放大缩小、旋转功能
 */
export function AssetImageViewer({
  assets,
  initialIndex,
  isOpen,
  onClose,
}: AssetImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 同步内部状态与 prop 变化
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      // 重置变换状态
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // 切换资产时重置变换
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const nextAsset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % assets.length);
  };

  const prevAsset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + assets.length) % assets.length);
  };

  // 缩放功能
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 旋转功能
  const handleRotate = (clockwise: boolean) => {
    setRotation((prev) => (clockwise ? prev + 90 : prev - 90));
  };

  // 鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    const asset = assets[currentIndex];
    if (asset && asset.type === AssetType.IMAGE) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)));
    }
  };

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    const asset = assets[currentIndex];
    if (scale > 1 && asset && asset.type === AssetType.IMAGE) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 键盘导航和快捷键
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const asset = assets[currentIndex];
      if (e.key === "ArrowRight") nextAsset();
      if (e.key === "ArrowLeft") prevAsset();
      if (e.key === "Escape") onClose();
      if (asset && asset.type === AssetType.IMAGE) {
        if (e.key === "+" || e.key === "=") handleZoomIn();
        if (e.key === "-" || e.key === "_") handleZoomOut();
        if (e.key === "0") handleResetZoom();
        if (e.key === "r" || e.key === "R") handleRotate(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, assets, currentIndex, onClose]);

  if (!isOpen || assets.length === 0) return null;

  const currentAsset = assets[currentIndex];
  const isImage = currentAsset.type === AssetType.IMAGE;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center p-4 md:p-10"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
      >
        {/* 图片或视频 */}
        {currentAsset.type === AssetType.VIDEO ? (
          <video
            src={currentAsset.url || ""}
            poster={currentAsset.thumbnailUrl}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-sm object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            ref={imageRef}
            src={currentAsset.url || ""}
            alt={currentAsset.title || ""}
            className="max-h-full max-w-full rounded-sm object-contain shadow-2xl transition-transform duration-200"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              cursor:
                scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (scale === 1) {
                // 如果未放大，点击关闭
                onClose();
              }
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (scale === 1) {
                setScale(2);
              } else {
                handleResetZoom();
              }
            }}
          />
        )}

        {/* 关闭按钮 */}
        <button
          className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white md:right-6 md:top-6"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="h-6 w-6" />
        </button>

        {/* 图片控制工具栏 - 仅图片类型显示，放在底部 */}
        {isImage && (
          <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm">
            <button
              className="rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              title="缩小 (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              className="rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleResetZoom();
              }}
              title="重置 (0)"
            >
              {scale > 1 ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              className="rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              title="放大 (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="mx-2 h-6 w-px bg-white/20" />
            <button
              className="rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleRotate(false);
              }}
              title="逆时针旋转"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              className="rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleRotate(true);
              }}
              title="顺时针旋转 (R)"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            {/* 缩放比例显示 - 始终显示，避免容器抖动 */}
            <div className="mx-2 h-6 w-px bg-white/20" />
            <span className="min-w-[3rem] px-2 text-center text-sm font-medium text-white/80">
              {Math.round(scale * 100)}%
            </span>
          </div>
        )}

        {/* 导航控制 - 仅当有多个资产时显示 */}
        {assets.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white md:left-4"
              onClick={prevAsset}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white md:right-4"
              onClick={nextAsset}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* 计数器 - 如果有图片工具栏，放在工具栏上方，否则放在底部 */}
            <div
              className={`absolute ${isImage ? "bottom-20" : "bottom-4"} left-1/2 z-40 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white/80`}
            >
              {currentIndex + 1} / {assets.length}
            </div>
          </>
        )}

        {/* 资产信息 - 如果有图片工具栏，放在工具栏上方，否则放在底部左侧 */}
        {(currentAsset.title || currentAsset.description) && (
          <div
            className={`absolute ${isImage ? "bottom-20" : "bottom-4"} left-4 z-40 rounded-lg bg-black/50 p-4 text-white md:max-w-md`}
          >
            {currentAsset.title && (
              <h3 className="mb-1 text-lg font-semibold">
                {currentAsset.title}
              </h3>
            )}
            {currentAsset.description && (
              <p className="text-sm text-white/80">
                {currentAsset.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
