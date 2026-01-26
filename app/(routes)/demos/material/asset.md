# 交付物卡片结构化字段定义

## 语义化统一的 TypeScript 类型声明文件 (`creative-types.d.ts`)

````typescript
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
  /** 描述 */
  description?: string;
  /** 创建时间（ISO 8601格式） */
  createdAt: Timestamp;
}

/**
 * 通用资产类型（所有模块的资产都复用此类型）
 */
export interface Asset {
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
 *
 * 使用示例：
 * ```typescript
 * const doc: FlexibleDocument = {
 *   type: "brief",
 *   id: "brief-001",
 *   title: "Brief Title",
 *   createdAt: "2025-01-26T10:00:00Z",
 *   docs: [
 *     {
 *       id: "block-videoConfig-001",
 *       block: "videoConfig",
 *       data: [
 *         { id: "kv-duration-001", key: "duration", value: "15s" },
 *         { id: "kv-aspectRatio-001", key: "aspectRatio", value: "16:9" },
 *         { id: "kv-resolution-001", key: "resolution", value: "1080p" }
 *       ]
 *     },
 *     {
 *       id: "block-contentRequirement-001",
 *       block: "contentRequirement",
 *       data: [
 *         { id: "kv-productName-001", key: "productName", value: "Product Name" },
 *         { id: "kv-productLink-001", key: "productLink", value: "https://example.com" }
 *       ]
 *     }
 *   ]
 * };
 * ```
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
````

## 对应设计稿的语义化 JSON 示例

## JSON 示例（所有模块统一使用 FlexibleDocument 格式）

### 1. Brief 模块

```json
{
  "type": "brief",
  "id": "brief-001",
  "title": "Brief V2 Reference Picture Added",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "id": "block-videoConfig-001",
      "block": "videoConfig",
      "data": [
        { "id": "kv-duration-001", "key": "duration", "value": "15s" },
        { "id": "kv-aspectRatio-001", "key": "aspectRatio", "value": "16:9" },
        { "id": "kv-resolution-001", "key": "resolution", "value": "1080p" },
        { "id": "kv-frameRate-001", "key": "frameRate", "value": "30fps" },
        { "id": "kv-codec-001", "key": "codec", "value": "H.264" }
      ]
    },
    {
      "id": "block-contentRequirement-001",
      "block": "contentRequirement",
      "data": [
        {
          "id": "kv-productName-001",
          "key": "productName",
          "value": "Thank you for providing all the details"
        },
        {
          "id": "kv-productLink-001",
          "key": "productLink",
          "value": "blackhead.com/product/3082908blackhead.com/produc"
        },
        {
          "id": "kv-primaryPlatforms-001",
          "key": "primaryPlatforms",
          "value": ["TikTok", "Youtube"]
        },
        {
          "id": "kv-coreSellingPoints-001",
          "key": "coreSellingPoints",
          "value": "Thank you for providing all the details! I have summarized everything we've discussed for your review. Please confirm that all the information is accurate."
        },
        {
          "id": "kv-targetAudience-001",
          "key": "targetAudience",
          "value": "18-35"
        },
        { "id": "kv-budget-001", "key": "budget", "value": 10000 }
      ]
    },
    {
      "id": "block-referenceAssets-001",
      "block": "referenceAssets",
      "data": [
        {
          "id": "kv-assets-001",
          "key": "assets",
          "value": [
            {
              "id": "ref-001",
              "assetId": "asset-ref-001",
              "title": "Jewelry Design Sketch",
              "url": "https://example.com/assets/jewelry-sketch.png",
              "type": "image",
              "description": "珠宝设计草图参考"
            },
            {
              "id": "ref-002",
              "assetId": "asset-ref-002",
              "title": "Model Video Clip",
              "url": "https://example.com/assets/model-video.mp4",
              "thumbnailUrl": "https://example.com/assets/model-video-thumb.jpg",
              "type": "video",
              "description": "模特展示视频片段"
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. CreativePlanning 模块

```json
{
  "type": "creative-planning",
  "id": "creative-planning-001",
  "title": "V2 - Creative Confirmation",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "id": "block-concepts-001",
      "block": "concepts",
      "data": [
        {
          "id": "kv-concepts-001",
          "key": "concepts",
          "value": [
            {
              "id": "concept-001",
              "title": "The Morning Miracle",
              "tags": ["Product-First"],
              "coreCreative": "An organic construction of silver filaments in a white void that solidifies into body architecture on a cold, confident model.",
              "outline": [
                "Mascot walks along a sunny school path holding a slice of toast in its mouth."
              ],
              "assets": [
                {
                  "id": "asset-001",
                  "assetId": "asset-001",
                  "title": "CITY DUSK",
                  "url": "https://example.com/assets/city-dusk.jpg",
                  "type": "image"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 3. VisualAsset 模块

```json
{
  "type": "visual-asset",
  "id": "visual-asset-001",
  "title": "Assets V2 - Character changed",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "id": "block-creativeConcept-001",
      "block": "creativeConcept",
      "data": [
        {
          "id": "kv-concept-001",
          "key": "concept",
          "value": "The Morning Miracle"
        }
      ]
    },
    {
      "id": "block-coreCreative-001",
      "block": "coreCreative",
      "data": [
        {
          "id": "kv-description-001",
          "key": "description",
          "value": "An organic construction of silver filaments in a white void that solidifies into body architecture on a cold, confident model."
        }
      ]
    },
    {
      "id": "block-assetGroups-001",
      "block": "assetGroups",
      "data": [
        {
          "id": "kv-groups-001",
          "key": "groups",
          "value": [
            {
              "blockType": "asset-group",
              "groupTitle": "Character",
              "assets": [
                {
                  "id": "char-001",
                  "assetId": "asset-char-001",
                  "title": "White Male",
                  "url": "https://example.com/assets/white-male.jpg",
                  "thumbnailUrl": "https://example.com/assets/white-male-thumb.jpg",
                  "type": "image",
                  "description": "Use deep red tones with angled volumetric light cutting through subtle haze to create"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 4. Storyboard 模块

```json
{
  "type": "storyboard",
  "id": "storyboard-001",
  "title": "Keyframe V2 - 2 shots changed",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "id": "block-shots-001",
      "block": "shots",
      "data": [
        {
          "id": "kv-shots-001",
          "key": "shots",
          "value": [
            {
              "id": "shot-001",
              "sequence": 1,
              "thumbnailUrl": "https://example.com/assets/shot-1.jpg",
              "duration": "10s",
              "notes": "Use deep red tones with angled volumetric light cutting through subtle haze to create a premium, mysterious focal point that enhances the product's material quality.",
              "relatedAssetId": "asset-001"
            },
            {
              "id": "shot-002",
              "sequence": 2,
              "thumbnailUrl": "https://example.com/assets/shot-2.jpg",
              "duration": "8s",
              "notes": "Close-up shot of the product with dramatic lighting.",
              "relatedAssetId": "asset-002"
            }
          ]
        }
      ]
    }
  ]
}
```

### 5. FinalVideo 模块

```json
{
  "type": "final-video",
  "id": "final-video-001",
  "title": "Final Video Deliverable",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "id": "block-video-001",
      "block": "video",
      "data": [
        {
          "id": "kv-video-001",
          "key": "video",
          "value": {
            "id": "video-001",
            "assetId": "asset-video-001",
            "title": "Final Production Video",
            "url": "https://example.com/assets/final-video.mp4",
            "thumbnailUrl": "https://example.com/assets/final-video-thumb.jpg",
            "type": "video",
            "duration": "15s",
            "description": "最终交付视频"
          }
        }
      ]
    }
  ]
}
```

### 核心特点

1. **统一数据结构**：所有模块（Brief、CreativePlanning、VisualAsset、Storyboard、FinalVideo）统一使用 `FlexibleDocument` 格式
2. **完全动态扩展**：区块（block）和字段（key-value）都可以动态增减，无需修改类型定义
3. **唯一ID标识**：每个层级（Document、DocumentBlock、KeyValuePair）都有唯一ID，便于追踪和引用
4. **语义化清晰**：所有字段用完整英文单词（如 `createdAt`），无缩写，可读性强
5. **模块字段统一**：所有模块的基础字段（`id`/`title`/`createdAt`）完全一致，降低对接和维护成本
6. **支持评论绑定**：通过 BlockId 或 ID 实现评论与节点的双向绑定
7. **易于序列化**：扁平化的 key-value 结构，便于前端序列化和后端存储

### 灵活结构处理工具函数

```typescript
/**
 * 生成唯一ID（使用 nanoid 或类似库）
 * 实际使用时需要引入 nanoid: import { nanoid } from 'nanoid'
 */
export function generateId(prefix?: string): Id {
  // 实际实现应使用 nanoid() 或类似库
  // 这里仅作示例，实际使用时需要引入 nanoid
  const randomId = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}-${randomId}` : randomId;
}

/**
 * 从灵活结构中获取指定区块
 */
export function getBlock(
  doc: FlexibleDocument,
  blockName: string
): DocumentBlock | undefined {
  return doc.docs.find((d) => d.block === blockName);
}

/**
 * 通过ID获取区块
 */
export function getBlockById(
  doc: FlexibleDocument,
  blockId: Id
): DocumentBlock | undefined {
  return doc.docs.find((d) => d.id === blockId);
}

/**
 * 从区块中获取指定键的值
 */
export function getBlockValue(
  block: DocumentBlock,
  key: string
): KeyValuePair["value"] | undefined {
  const item = block.data.find((d) => d.key === key);
  return item?.value;
}

/**
 * 通过ID获取键值对
 */
export function getKeyValuePairById(
  block: DocumentBlock,
  kvId: Id
): KeyValuePair | undefined {
  return block.data.find((d) => d.id === kvId);
}

/**
 * 设置区块中的键值对（自动生成ID）
 */
export function setBlockValue(
  block: DocumentBlock,
  key: string,
  value: KeyValuePair["value"],
  id?: Id
): DocumentBlock {
  const existingIndex = block.data.findIndex((d) => d.key === key);
  const newItem: KeyValuePair = {
    id: id || generateId(`kv-${key}`),
    key,
    value,
  };

  if (existingIndex >= 0) {
    // 更新现有项（保留原有ID）
    const newData = [...block.data];
    newData[existingIndex] = { ...newItem, id: block.data[existingIndex].id };
    return { ...block, data: newData };
  } else {
    // 添加新项
    return { ...block, data: [...block.data, newItem] };
  }
}

/**
 * 移除区块中的键值对
 */
export function removeBlockValue(
  block: DocumentBlock,
  key: string
): DocumentBlock {
  return {
    ...block,
    data: block.data.filter((d) => d.key !== key),
  };
}

/**
 * 通过ID移除键值对
 */
export function removeBlockValueById(
  block: DocumentBlock,
  kvId: Id
): DocumentBlock {
  return {
    ...block,
    data: block.data.filter((d) => d.id !== kvId),
  };
}

/**
 * 添加新区块（自动生成ID）
 */
export function addBlock(
  doc: FlexibleDocument,
  block: Omit<DocumentBlock, "id">,
  id?: Id
): FlexibleDocument {
  const newBlock: DocumentBlock = {
    ...block,
    id: id || generateId(`block-${block.block}`),
    // 确保 data 中的每个 KeyValuePair 都有 id
    data: block.data.map((kv) => ({
      ...kv,
      id: kv.id || generateId(`kv-${kv.key}`),
    })),
  };
  return {
    ...doc,
    docs: [...doc.docs, newBlock],
  };
}

/**
 * 移除区块
 */
export function removeBlock(
  doc: FlexibleDocument,
  blockName: string
): FlexibleDocument {
  return {
    ...doc,
    docs: doc.docs.filter((d) => d.block !== blockName),
  };
}

/**
 * 通过ID移除区块
 */
export function removeBlockById(
  doc: FlexibleDocument,
  blockId: Id
): FlexibleDocument {
  return {
    ...doc,
    docs: doc.docs.filter((d) => d.id !== blockId),
  };
}
```
