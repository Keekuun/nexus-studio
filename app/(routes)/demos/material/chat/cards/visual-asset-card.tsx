"use client";

/**
 * Visual Asset Card 组件
 * 用于对话页面显示的 Visual Asset 模块预览卡片
 * 设计稿: https://www.figma.com/design/Sq85xB6ku3wQ8fQkySXQUM node-id=312-126269
 * 严格按照 Figma 设计稿实现
 */

import { cn } from "@/lib/utils/cn";
import type { FlexibleDocument, DocumentBlock } from "../../creative-types";
import { Image } from "../../ui/image";

// ==================== 图标组件 ====================
const Icons = {
  VisualAssets: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
export interface VisualAssetCardProps {
  /** Visual Asset 文档数据 */
  document: FlexibleDocument;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否激活状态 */
  isActive?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

interface AssetPreview {
  id: string;
  url: string;
  title?: string;
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
 * 从 assetGroups 区块提取素材预览图片
 */
function getAssetPreviews(docs: DocumentBlock[]): AssetPreview[] {
  const previews: AssetPreview[] = [];

  // 查找 assetGroups 区块
  const assetGroupsBlock = docs.find((d) => d.block === "assetGroups");
  if (assetGroupsBlock) {
    const groupsItem = assetGroupsBlock.data.find((d) => d.key === "groups");
    if (groupsItem && Array.isArray(groupsItem.value)) {
      const groups = groupsItem.value as Array<{
        groupTitle?: string;
        assets?: Array<{
          id: string;
          url?: string;
          thumbnailUrl?: string;
          title?: string;
        }>;
      }>;

      // 从每个组中提取素材
      for (const group of groups) {
        if (group.assets) {
          for (const asset of group.assets) {
            if (asset.url || asset.thumbnailUrl) {
              previews.push({
                id: asset.id,
                url: asset.thumbnailUrl || asset.url || "",
                title: asset.title,
              });
            }
            if (previews.length >= 3) break;
          }
        }
        if (previews.length >= 3) break;
      }
    }
  }

  return previews.slice(0, 3);
}

// ==================== 图片预览卡片组件 ====================
function AssetPreviewCard({
  asset,
  rotation,
}: {
  asset: AssetPreview;
  rotation: number;
}) {
  return (
    <div
      className="h-[80px] w-[64px] overflow-hidden rounded-[2px] shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]"
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <Image
        src={asset.url}
        alt={asset.title || "asset"}
        width="100%"
        height="100%"
        className="h-full w-full"
        borderRadius="none"
        fit="cover"
      />
    </div>
  );
}

// ==================== 主组件 ====================
export function VisualAssetCard({
  document,
  onClick,
  isActive = false,
  className,
}: VisualAssetCardProps) {
  // 提取关键信息
  const assetPreviews = getAssetPreviews(document.docs);

  // 预览卡片的旋转角度和位置配置
  const cardConfigs = [
    { rotation: -30, translateX: -60, translateY: 25 },
    { rotation: 15, translateX: 0, translateY: 15 },
    { rotation: 30, translateX: 60, translateY: 35 },
  ];

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
        backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 360 202' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-9.376 16.068 -28.578 -13.981 311.87 -16.068)'><stop stop-color='rgba(255,250,233,1)' offset='0.042046'/><stop stop-color='rgba(255,255,255,1)' offset='1'/></radialGradient></defs></svg>")`,
      }}
    >
      {/* 顶部区域 */}
      <div className="flex w-full flex-col items-start gap-[4px]">
        {/* 类型标签行 */}
        <div className="flex w-full items-center justify-between">
          <div className="flex shrink-0 items-center gap-[2px] rounded-[4px]">
            <div className="relative h-[20px] w-[20px] overflow-clip text-[rgba(0,0,0,0.6)]">
              <Icons.VisualAssets />
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center">
              <p className="text-[10px] font-normal leading-normal text-[rgba(0,0,0,0.6)]">
                Visual Assets
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

      {/* 图片预览区域 - 扇形排列 */}
      <div className="relative flex h-[87px] w-[261px] items-center justify-center overflow-clip">
        {assetPreviews.length > 0 ? (
          assetPreviews.map((asset, index) => {
            const config = cardConfigs[index] || cardConfigs[0];
            return (
              <div
                key={asset.id}
                className="absolute"
                style={{
                  transform: `translate(${config.translateX}px, ${config.translateY}px)`,
                }}
              >
                <AssetPreviewCard asset={asset} rotation={config.rotation} />
              </div>
            );
          })
        ) : (
          // 默认空状态显示
          <div className="flex h-[80px] w-[64px] items-center justify-center rounded-[2px] bg-[#d9d9d9] shadow-[0px_1px_12px_0px_rgba(0,0,0,0.04)]">
            <p className="text-[8px] text-[rgba(0,0,0,0.5)]">No assets</p>
          </div>
        )}
      </div>
    </button>
  );
}

export default VisualAssetCard;
