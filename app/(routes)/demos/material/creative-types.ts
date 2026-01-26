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

// ===================== 灵活数据结构（推荐使用） =====================
/**
 * 文档类型枚举
 */
export type DocumentType =
  | "brief"
  | "creative-planning"
  | "visual-asset"
  | "storyboard"
  | "final-video";

/**
 * 键值对数据项（用于区块内容）
 */
export interface KeyValuePair {
  /** 唯一标识（全局唯一） */
  id: Id;
  /** 字段键名 */
  key: string;
  /** 字段值（支持多种类型，包括对象和数组） */
  value:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Record<string, unknown>
    | unknown[]
    | null
    | undefined;
}

/**
 * 文档区块（block）
 */
export interface DocumentBlock {
  /** 唯一标识（全局唯一） */
  id: Id;
  /** 区块标识（如 "videoConfig", "contentRequirement"） */
  block: string;
  /** 区块数据（键值对数组） */
  data: KeyValuePair[];
}

/**
 * 灵活文档结构（推荐使用）
 *
 * 设计说明：
 * - 使用扁平化的 key-value 结构，便于扩展
 * - 区块（block）可以动态增减
 * - 每个区块内的字段（key-value）可以动态增减
 * - 完全支持评论绑定和序列化
 */
export interface FlexibleDocument extends BaseEntity {
  /** 文档类型 */
  type: DocumentType;
  /** 文档区块列表 */
  docs: DocumentBlock[];
}

// ===================== 模块类型定义（统一使用 FlexibleDocument 格式） =====================
/**
 * 1. Brief 模块
 * 使用 type: "brief" 和 docs 数组结构
 */
export type Brief = FlexibleDocument & {
  type: "brief";
};

/**
 * 2. CreativePlanning 模块
 * 使用 type: "creative-planning" 和 docs 数组结构
 */
export type CreativePlanning = FlexibleDocument & {
  type: "creative-planning";
};

/**
 * 3. VisualAsset 模块
 * 使用 type: "visual-asset" 和 docs 数组结构
 */
export type VisualAsset = FlexibleDocument & {
  type: "visual-asset";
};

/**
 * 4. Storyboard 模块
 * 使用 type: "storyboard" 和 docs 数组结构
 */
export type Storyboard = FlexibleDocument & {
  type: "storyboard";
};

/**
 * 5. FinalVideo 模块
 * 使用 type: "final-video" 和 docs 数组结构
 */
export type FinalVideo = FlexibleDocument & {
  type: "final-video";
};

// ===================== 全局联合类型 =====================
/** 所有创意内容模块的联合类型（统一为 FlexibleDocument 格式） */
export type CreativeContent =
  | Brief
  | CreativePlanning
  | VisualAsset
  | Storyboard
  | FinalVideo;

/** 所有文档类型的联合类型（统一为 FlexibleDocument） */
export type AnyDocument = FlexibleDocument;
