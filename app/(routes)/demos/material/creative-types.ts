/**
 * 创意内容管理系统 - 语义化统一类型声明
 * 设计原则：
 * 1. 字段命名语义化（避免缩写，保持可读性）
 * 2. 不同模块核心字段统一（如所有模块都用 `id`/`title`/`createdAt`）
 * 3. 类型分层清晰，复用通用结构
 */

// ===================== 基础通用类型 =====================
/** ISO 8601 时间戳格式，如 "2025-02-15T14:05:00Z" */
export type Timestamp = string;

/** 全局唯一ID类型 */
export type Id = string;

/** 资源URL类型（图片/视频/音频等） */
export type ResourceUrl = string;

/** 资产类型枚举（支持扩展） */
export enum AssetType {
  IMAGE = "image", // 图片
  VIDEO = "video", // 视频
  AUDIO = "audio", // 音频
  DOCUMENT = "document", // 文档（预留）
}

// ===================== 通用核心类型（所有模块复用） =====================
/**
 * 基础实体类型（所有业务模块的根类型）
 * 统一所有模块的基础字段
 */
export interface BaseEntity {
  /** 实体唯一标识（全局唯一） */
  id: Id;
  /** 实体标题/名称 */
  title: string;
  /** 创建时间（ISO 8601格式） */
  createdAt: Timestamp;
}

/**
 * 通用资产类型（所有模块的资产都复用此类型）
 */
export interface Asset extends BaseEntity {
  /** 资产ID */
  id: Id;
  /** 资产全局唯一标识 */
  assetId: Id;
  /** 资产标题/名称 */
  title: string;
  /** 资产原始URL */
  url?: ResourceUrl;
  /** 资产缩略图URL（图片/视频专用） */
  thumbnailUrl?: ResourceUrl;
  /** 资产描述/备注 */
  description?: string;
  /** 资产类型 */
  type: AssetType;
  /** 时长（视频/音频专用，如 "15s"） */
  duration?: string;
  /** 文件大小（如 "2.5MB"） */
  fileSize?: string;
}

/**
 * 资产分组类型（视觉资产、创意策划等模块复用）
 */
export interface AssetGroup {
  /** 分组类型标识（固定值） */
  blockType: "asset-group";
  /** 分组标题 */
  groupTitle: string;
  /** 分组下的资产列表 */
  assets: Asset[];
}

// ===================== 模块专属类型（基于通用类型扩展） =====================
/**
 * 1. Brief 模块
 */
// 视频配置
export interface VideoConfig {
  /** 视频时长（如 "15s"） */
  duration: string;
  /** 视频宽高比（如 "16:9"） */
  aspectRatio: string;
  /** 视频分辨率（如 "1080p"） */
  resolution: string;
}

// 内容需求
export interface ContentRequirement {
  /** 产品名称 */
  productName: string;
  /** 产品链接 */
  productLink: string;
  /** 主要投放平台列表 */
  primaryPlatforms: string[];
  /** 核心卖点 */
  coreSellingPoints: string;
}

// Brief 主结构（继承基础实体）
export interface Brief extends BaseEntity {
  /** 视频配置 */
  videoConfig: VideoConfig;
  /** 内容需求 */
  contentRequirement: ContentRequirement;
  /** 参考资产列表（仅支持图片/视频） */
  referenceAssets: (Omit<Asset, "duration" | "fileSize"> & {
    type: AssetType.IMAGE | AssetType.VIDEO;
  })[];
}

/**
 * 2. 视觉资产模块
 */
export interface VisualAsset extends BaseEntity {
  /** 创意概念 */
  creativeConcept: string;
  /** 核心创意描述 */
  coreCreative: string;
  /** 资产分组列表 */
  assetGroups: AssetGroup[];
}

/**
 * 3. 分镜脚本模块
 */
// 单条分镜
export interface StoryboardShot {
  /** 分镜ID */
  id: Id;
  /** 镜头序号 */
  sequence: number;
  /** 分镜缩略图URL */
  thumbnailUrl: ResourceUrl;
  /** 镜头时长（如 "10s"） */
  duration: string;
  /** 镜头说明 */
  notes: string;
  /** 关联资产ID（可选） */
  relatedAssetId?: Id;
}

// 分镜脚本主结构（继承基础实体）
export interface Storyboard extends BaseEntity {
  /** 分镜列表 */
  shots: StoryboardShot[];
}

/**
 * 4. 创意策划模块
 */
// 单个创意概念
export interface CreativeConcept {
  /** 概念ID */
  id: Id;
  /** 概念标题 */
  title: string;
  /** 概念标签 */
  tags: string[];
  /** 核心创意描述 */
  coreCreative: string;
  /** 创意大纲 */
  outline: string[];
  /** 关联资产列表 */
  assets: Asset[];
}

// 创意策划主结构（继承基础实体）
export interface CreativePlanning extends BaseEntity {
  /** 创意概念列表 */
  concepts: CreativeConcept[];
}

// ===================== 全局联合类型 =====================
/** 所有创意内容模块的联合类型 */
export type CreativeContent =
  | Brief
  | VisualAsset
  | Storyboard
  | CreativePlanning;
