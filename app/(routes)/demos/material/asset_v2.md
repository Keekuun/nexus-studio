# 交付物卡片结构化字段定义 V2 - 支持评论双向绑定

## 设计目标

1. **统一数据结构**：所有模块（Brief、VisualAsset、Storyboard、CreativePlanning）统一使用 `FlexibleDocument` 格式
2. **DOM 节点绑定**：每个 JSON 节点对应一个 DOM 节点，通过 `data-block-id` 属性关联
3. **评论双向绑定**：评论与 JSON 节点双向绑定，支持框选和评论功能
4. **高效序列化**：前端可方便地序列化和反序列化，便于后端存储
5. **层级路径标识**：使用层级路径作为 blockId，便于定位和查询
6. **完全动态扩展**：区块（block）和字段（key-value）都可以动态增减，无需修改类型定义

## 核心协议设计

### 1. BlockId 生成规则

BlockId 采用**层级路径格式**，从根节点到目标节点的完整路径：

#### 传统结构 BlockId 格式

```
格式: {moduleType}.{path1}.{path2}...{fieldName}
示例:
  - brief.videoConfig.duration
  - brief.contentRequirement.productName
  - visual-asset.assetGroups[0].groupTitle
  - visual-asset.assetGroups[0].assets[1].title
```

#### 灵活结构 BlockId 格式（推荐）

```
格式: {type}.docs[{blockIndex}].block 或 {type}.docs[{blockIndex}].data[{dataIndex}].key
示例:
  - brief.docs[0].block                    (videoConfig 区块)
  - brief.docs[0].data[0].key              (duration 字段)
  - brief.docs[0].data[1].key              (aspectRatio 字段)
  - brief.docs[1].block                     (contentRequirement 区块)
  - brief.docs[1].data[0].key              (productName 字段)
```

**规则说明**：

- **传统结构**：
  - 根节点使用模块类型（brief, visual-asset, storyboard, creative-planning）
  - 对象属性使用点号 `.` 分隔
  - 数组元素使用 `[index]` 表示索引
  - 最终字段名作为路径的最后一节
- **灵活结构**（推荐）：
  - 根节点使用文档类型（`{type}`）
  - 区块通过 `docs[{blockIndex}]` 访问
  - 区块标识通过 `.block` 访问
  - 数据项通过 `.data[{dataIndex}]` 访问
  - 字段键名通过 `.key` 访问
  - **优势**：完全支持动态区块和字段，无需修改类型定义

### 2. 评论数据结构

```typescript
/**
 * 评论协议 - 支持双向绑定和高效存储
 */

/** 评论作者信息 */
export interface CommentAuthor {
  /** 用户ID */
  id: string;
  /** 用户名称 */
  name: string;
  /** 用户头像URL */
  avatar?: string;
}

/** 单条评论 */
export interface Comment {
  /** 评论唯一ID */
  id: string;
  /** 绑定的 BlockId（层级路径） */
  blockId: string;
  /** 评论作者 */
  author: CommentAuthor;
  /** 评论内容 */
  content: string;
  /** 创建时间（ISO 8601格式） */
  createdAt: string;
  /** 更新时间（ISO 8601格式） */
  updatedAt?: string;
  /** 回复列表 */
  replies?: Comment[];
  /** 是否已读 */
  isRead?: boolean;
  /** 评论状态（用于协同编辑） */
  status?: "active" | "resolved" | "deleted";
}

/** 评论集合（按 blockId 索引） */
export interface CommentMap {
  /** blockId -> Comment[] 映射 */
  [blockId: string]: Comment[];
}

/** 文档评论数据（完整结构） */
export interface DocumentComments {
  /** 文档ID */
  documentId: string;
  /** 文档类型 */
  documentType: "brief" | "visual-asset" | "storyboard" | "creative-planning";
  /** 评论映射表 */
  comments: CommentMap;
  /** 最后更新时间 */
  updatedAt: string;
}
```

### 3. 序列化协议

**前端序列化格式**（发送给后端）：

```typescript
// 序列化：将评论数据转换为后端存储格式
interface SerializedCommentData {
  documentId: string;
  documentType: string;
  // 扁平化存储：blockId -> comments[]
  commentIndex: Record<string, Comment[]>;
  metadata: {
    totalComments: number;
    lastUpdated: string;
  };
}
```

**后端存储格式**（推荐使用 JSONB 或文档数据库）：

```json
{
  "documentId": "brief-001",
  "documentType": "brief",
  "commentIndex": {
    "brief.videoConfig.duration": [
      {
        "id": "comment-001",
        "blockId": "brief.videoConfig.duration",
        "author": {
          "id": "user-1",
          "name": "张三",
          "avatar": "https://example.com/avatar.jpg"
        },
        "content": "这个时长需要调整",
        "createdAt": "2025-01-26T10:00:00Z",
        "replies": []
      }
    ],
    "brief.contentRequirement.productName": [
      {
        "id": "comment-002",
        "blockId": "brief.contentRequirement.productName",
        "author": {
          "id": "user-2",
          "name": "李四"
        },
        "content": "产品名称需要更具体",
        "createdAt": "2025-01-26T11:00:00Z",
        "replies": [
          {
            "id": "reply-001",
            "blockId": "brief.contentRequirement.productName",
            "author": {
              "id": "user-1",
              "name": "张三"
            },
            "content": "已更新",
            "createdAt": "2025-01-26T12:00:00Z"
          }
        ]
      }
    ]
  },
  "metadata": {
    "totalComments": 2,
    "lastUpdated": "2025-01-26T12:00:00Z"
  }
}
```

### 4. 双向绑定实现

**前端实现要点**：

1. **JSON -> DOM 绑定**：

   ```tsx
   // 渲染时自动添加 data-block-id 属性
   <div data-block-id="brief.videoConfig.duration">{videoConfig.duration}</div>
   ```

2. **DOM -> 评论绑定**：

   ```tsx
   // 框选时获取 blockId
   const handleSelection = (element: HTMLElement) => {
     const blockId = element.getAttribute("data-block-id");
     if (blockId) {
       openCommentPanel(blockId);
     }
   };
   ```

3. **评论 -> DOM 定位**：
   ```tsx
   // 点击评论时定位到对应 DOM 节点
   const handleCommentClick = (blockId: string) => {
     const element = document.querySelector(`[data-block-id="${blockId}"]`);
     if (element) {
       element.scrollIntoView({ behavior: "smooth", block: "center" });
       element.classList.add("highlight-comment-target");
     }
   };
   ```

## V2 类型定义（扩展原有类型）

### 基础类型扩展

```typescript
/**
 * 带 BlockId 的基础实体（所有可评论节点的基础类型）
 */
export interface CommentableEntity {
  /** BlockId（层级路径，用于 DOM 绑定和评论关联） */
  blockId: string;
}

/**
 * 带 BlockId 的资产类型
 */
export interface AssetV2 extends Asset, CommentableEntity {
  blockId: string;
}

/**
 * 带 BlockId 的资产分组
 */
export interface AssetGroupV2 extends AssetGroup, CommentableEntity {
  blockId: string;
  assets: AssetV2[];
}
```

### 模块类型扩展

```typescript
/**
 * Brief V2（支持评论）
 */
export interface BriefV2 extends BaseEntity, CommentableEntity {
  blockId: string;
  videoConfig: VideoConfigV2;
  contentRequirement: ContentRequirementV2;
  referenceAssets: AssetV2[];
}

export interface VideoConfigV2 extends VideoConfig, CommentableEntity {
  blockId: string;
  duration: string & CommentableEntity; // 字段级别也支持评论
  aspectRatio: string & CommentableEntity;
  resolution: string & CommentableEntity;
}

export interface ContentRequirementV2
  extends ContentRequirement, CommentableEntity {
  blockId: string;
  productName: string & CommentableEntity;
  productLink: string & CommentableEntity;
  primaryPlatforms: (string & CommentableEntity)[];
  coreSellingPoints: string & CommentableEntity;
}

/**
 * 视觉资产 V2
 */
export interface VisualAssetV2 extends BaseEntity, CommentableEntity {
  blockId: string;
  creativeConcept: string & CommentableEntity;
  coreCreative: string & CommentableEntity;
  assetGroups: AssetGroupV2[];
}

/**
 * 分镜脚本 V2
 */
export interface StoryboardV2 extends BaseEntity, CommentableEntity {
  blockId: string;
  shots: StoryboardShotV2[];
}

export interface StoryboardShotV2 extends StoryboardShot, CommentableEntity {
  blockId: string;
  notes: string & CommentableEntity;
}

/**
 * 创意策划 V2
 */
export interface CreativePlanningV2 extends BaseEntity, CommentableEntity {
  blockId: string;
  concepts: CreativeConceptV2[];
}

export interface CreativeConceptV2 extends CreativeConcept, CommentableEntity {
  blockId: string;
  title: string & CommentableEntity;
  coreCreative: string & CommentableEntity;
  outline: (string & CommentableEntity)[];
  assets: AssetV2[];
}
```

## V2 JSON 示例（灵活结构格式，所有模块统一）

### 1. Brief 模块

```json
{
  "type": "brief",
  "id": "brief-001",
  "title": "Brief V2 Reference Picture Added",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "block": "videoConfig",
      "data": [
        { "key": "duration", "value": "15s" },
        { "key": "aspectRatio", "value": "16:9" },
        { "key": "resolution", "value": "1080p" },
        { "key": "frameRate", "value": "30fps" }
      ]
    },
    {
      "block": "contentRequirement",
      "data": [
        {
          "key": "productName",
          "value": "Thank you for providing all the details"
        },
        {
          "key": "productLink",
          "value": "blackhead.com/product/3082908blackhead.com/produc"
        },
        { "key": "primaryPlatforms", "value": ["TikTok", "Youtube"] },
        {
          "key": "coreSellingPoints",
          "value": "Thank you for providing all the details! I have summarized everything we've discussed for your review. Please confirm that all the information is accurate."
        }
      ]
    },
    {
      "block": "referenceAssets",
      "data": [
        {
          "key": "assets",
          "value": [
            {
              "id": "ref-001",
              "assetId": "asset-ref-001",
              "title": "Jewelry Design Sketch",
              "url": "https://example.com/assets/jewelry-sketch.png",
              "type": "image",
              "description": "珠宝设计草图参考"
            }
          ]
        }
      ]
    }
  ]
}
```

**BlockId 示例**：

- `brief` - 文档根节点
- `brief.docs[0].block` - videoConfig 区块
- `brief.docs[0].data[0].key` - duration 字段
- `brief.docs[1].block` - contentRequirement 区块
- `brief.docs[1].data[0].key` - productName 字段

### 2. CreativePlanning 模块

```json
{
  "type": "creative-planning",
  "id": "creative-planning-001",
  "title": "V2 - Creative Confirmation",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "block": "concepts",
      "data": [
        {
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

**BlockId 示例**：

- `creative-planning` - 文档根节点
- `creative-planning.docs[0].block` - concepts 区块
- `creative-planning.docs[0].data[0].key` - concepts 字段

### 3. VisualAsset 模块

```json
{
  "type": "visual-asset",
  "id": "visual-asset-001",
  "title": "Assets V2 - Character changed",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "block": "creativeConcept",
      "data": [{ "key": "concept", "value": "The Morning Miracle" }]
    },
    {
      "block": "coreCreative",
      "data": [
        {
          "key": "description",
          "value": "An organic construction of silver filaments in a white void that solidifies into body architecture on a cold, confident model."
        }
      ]
    },
    {
      "block": "assetGroups",
      "data": [
        {
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

**BlockId 示例**：

- `visual-asset` - 文档根节点
- `visual-asset.docs[0].block` - creativeConcept 区块
- `visual-asset.docs[2].data[0].key` - groups 字段

### 4. Storyboard 模块

```json
{
  "type": "storyboard",
  "id": "storyboard-001",
  "title": "Keyframe V2 - 2 shots changed",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "block": "shots",
      "data": [
        {
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

**BlockId 示例**：

- `storyboard` - 文档根节点
- `storyboard.docs[0].block` - shots 区块
- `storyboard.docs[0].data[0].key` - shots 字段

**关键点**：

- 所有模块统一使用 `type` + `docs` 数组结构
- BlockId 通过 `{type}.docs[{blockIndex}].block` 和 `{type}.docs[{blockIndex}].data[{dataIndex}].key` 格式生成
- 区块和字段都可以动态增减，无需修改类型定义

## 前端工具函数

### BlockId 生成工具

```typescript
/**
 * 生成 BlockId（层级路径）- 传统结构
 */
export function generateBlockId(
  moduleType: string,
  path: string[],
  fieldName?: string,
  index?: number
): string {
  const parts = [moduleType, ...path];
  if (index !== undefined) {
    parts.push(`[${index}]`);
  }
  if (fieldName) {
    parts.push(fieldName);
  }
  return parts.join(".");
}

/**
 * 生成 BlockId（灵活结构）- 推荐使用
 */
export function generateFlexibleBlockId(
  type: string,
  blockIndex: number,
  dataIndex?: number
): string {
  if (dataIndex !== undefined) {
    return `${type}.docs[${blockIndex}].data[${dataIndex}].key`;
  }
  return `${type}.docs[${blockIndex}].block`;
}

/**
 * 为灵活文档生成所有 BlockId
 */
export function generateAllBlockIds(doc: FlexibleDocument): string[] {
  const blockIds: string[] = [];

  // 文档根节点
  blockIds.push(doc.type);

  // 遍历所有区块
  doc.docs.forEach((block, blockIndex) => {
    // 区块标识 BlockId
    blockIds.push(generateFlexibleBlockId(doc.type, blockIndex));

    // 区块内所有数据项的 BlockId
    block.data.forEach((item, dataIndex) => {
      blockIds.push(generateFlexibleBlockId(doc.type, blockIndex, dataIndex));
    });
  });

  return blockIds;
}

/**
 * 从 DOM 元素获取 BlockId
 */
export function getBlockIdFromElement(element: HTMLElement): string | null {
  return element.getAttribute("data-block-id");
}

/**
 * 根据 BlockId 查找 DOM 元素
 */
export function findElementByBlockId(blockId: string): HTMLElement | null {
  return document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
}

/**
 * 遍历动态字段对象，生成所有字段的 BlockId
 * 用于支持 VideoConfig、ContentRequirement 等动态字段类型
 */
export function generateBlockIdsForDynamicFields<
  T extends Record<string, DynamicFieldValue>,
>(moduleType: string, parentPath: string[], obj: T): string[] {
  const blockIds: string[] = [];
  const currentPath = [...parentPath];

  for (const [key, value] of Object.entries(obj)) {
    const fieldBlockId = generateBlockId(moduleType, currentPath, key);
    blockIds.push(fieldBlockId);

    // 如果值是对象，递归处理嵌套结构
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      const nestedBlockIds = generateBlockIdsForDynamicFields(
        moduleType,
        [...currentPath, key],
        value as Record<string, DynamicFieldValue>
      );
      blockIds.push(...nestedBlockIds);
    }
  }

  return blockIds;
}
```

### 评论序列化工具

```typescript
/**
 * 序列化评论数据（前端 -> 后端）
 */
export function serializeComments(
  documentId: string,
  documentType: string,
  comments: CommentMap
): SerializedCommentData {
  const totalComments = Object.values(comments)
    .flat()
    .reduce((count, comment) => {
      return count + 1 + (comment.replies?.length || 0);
    }, 0);

  return {
    documentId,
    documentType,
    commentIndex: comments,
    metadata: {
      totalComments,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * 反序列化评论数据（后端 -> 前端）
 */
export function deserializeComments(
  data: SerializedCommentData
): DocumentComments {
  return {
    documentId: data.documentId,
    documentType: data.documentType as any,
    comments: data.commentIndex,
    updatedAt: data.metadata.lastUpdated,
  };
}
```

## 后端存储建议

### 数据库设计（PostgreSQL + JSONB）

```sql
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  comment_index JSONB NOT NULL, -- 存储 commentIndex
  metadata JSONB NOT NULL, -- 存储 metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, document_type)
);

-- 索引优化（支持按 blockId 查询）
CREATE INDEX idx_document_comments_block_id
ON document_comments USING GIN ((comment_index -> 'blockId'));

-- 查询示例
SELECT comment_index->'brief.videoConfig.duration'
FROM document_comments
WHERE document_id = 'brief-001';
```

### API 接口设计

```typescript
// GET /api/comments/:documentId
// 获取文档的所有评论
async function getDocumentComments(
  documentId: string
): Promise<DocumentComments>;

// POST /api/comments/:documentId
// 添加评论
async function addComment(
  documentId: string,
  blockId: string,
  comment: Omit<Comment, "id" | "createdAt">
): Promise<Comment>;

// PUT /api/comments/:documentId/:commentId
// 更新评论（标记已读、解决等）
async function updateComment(
  documentId: string,
  commentId: string,
  updates: Partial<Comment>
): Promise<Comment>;

// DELETE /api/comments/:documentId/:commentId
// 删除评论
async function deleteComment(
  documentId: string,
  commentId: string
): Promise<void>;
```

## 使用示例

### 前端渲染组件

#### 灵活结构渲染（推荐）

```tsx
// 灵活文档渲染组件
function FlexibleDocumentRenderer({
  doc,
  comments,
}: {
  doc: FlexibleDocument;
  comments: CommentMap;
}) {
  return (
    <div data-block-id={doc.type}>
      <h1 data-block-id={`${doc.type}.title`}>{doc.title}</h1>

      {/* 渲染所有区块 */}
      {doc.docs.map((block, blockIndex) => {
        const blockBlockId = generateFlexibleBlockId(doc.type, blockIndex);
        const blockComments = comments[blockBlockId];

        return (
          <div
            key={blockIndex}
            data-block-id={blockBlockId}
            className="document-block"
          >
            <h2 data-block-id={blockBlockId}>
              {block.block}
              {blockComments && <CommentBadge count={blockComments.length} />}
            </h2>

            {/* 渲染区块内的所有键值对 */}
            {block.data.map((item, dataIndex) => {
              const itemBlockId = generateFlexibleBlockId(
                doc.type,
                blockIndex,
                dataIndex
              );
              const itemComments = comments[itemBlockId];

              return (
                <div
                  key={dataIndex}
                  data-block-id={itemBlockId}
                  className="key-value-item"
                >
                  <label className="key-label">{item.key}</label>
                  <div className="value-content">
                    {typeof item.value === "string"
                      ? item.value
                      : JSON.stringify(item.value)}
                    {itemComments && (
                      <CommentBadge count={itemComments.length} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
```

#### 传统结构渲染（向后兼容）

```tsx
// Brief 组件渲染示例（支持动态字段）
function BriefRenderer({
  data,
  comments,
}: {
  data: BriefV2;
  comments: CommentMap;
}) {
  const videoConfigBlockId = `${data.blockId}.videoConfig`;
  const contentRequirementBlockId = `${data.blockId}.contentRequirement`;

  // 渲染动态字段的辅助函数
  const renderDynamicFields = (
    obj: Record<string, DynamicFieldValue>,
    parentBlockId: string
  ) => {
    return Object.entries(obj).map(([key, value]) => {
      const fieldBlockId = `${parentBlockId}.${key}`;
      const fieldComments = comments[fieldBlockId];

      return (
        <div key={key} data-block-id={fieldBlockId} className="dynamic-field">
          <label className="field-label">{key}</label>
          <div className="field-value">
            {typeof value === "string" ? value : JSON.stringify(value)}
            {fieldComments && <CommentBadge count={fieldComments.length} />}
          </div>
        </div>
      );
    });
  };

  return (
    <div data-block-id={data.blockId}>
      <h1 data-block-id={`${data.blockId}.title`}>{data.title}</h1>

      {/* VideoConfig - 支持动态字段 */}
      <div data-block-id={videoConfigBlockId} className="section">
        <h2>Video Config</h2>
        {renderDynamicFields(data.videoConfig, videoConfigBlockId)}
      </div>

      {/* ContentRequirement - 支持动态字段 */}
      <div data-block-id={contentRequirementBlockId} className="section">
        <h2>Content Requirement</h2>
        {renderDynamicFields(
          data.contentRequirement,
          contentRequirementBlockId
        )}
      </div>

      {/* 其他字段... */}
    </div>
  );
}
```

### 评论交互流程

```tsx
// 1. 用户框选节点
function handleNodeSelection(element: HTMLElement) {
  const blockId = getBlockIdFromElement(element);
  if (blockId) {
    // 显示评论面板
    openCommentPanel(blockId);
  }
}

// 2. 添加评论
async function handleAddComment(blockId: string, content: string) {
  const comment = await addComment(documentId, blockId, {
    author: currentUser,
    content,
  });

  // 更新本地状态
  setComments((prev) => ({
    ...prev,
    [blockId]: [...(prev[blockId] || []), comment],
  }));

  // 高亮对应 DOM 节点
  highlightBlock(blockId);
}

// 3. 点击评论定位节点
function handleCommentClick(blockId: string) {
  const element = findElementByBlockId(blockId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("comment-highlight");
    setTimeout(() => {
      element.classList.remove("comment-highlight");
    }, 2000);
  }
}
```

## 性能优化建议

1. **评论懒加载**：按需加载评论，避免一次性加载所有评论
2. **增量更新**：使用 WebSocket 或 SSE 实现评论的实时同步
3. **缓存策略**：前端缓存评论数据，减少 API 调用
4. **批量操作**：支持批量标记已读、批量删除等操作

## 灵活结构说明

### 为什么使用灵活结构？

灵活结构（`FlexibleDocument`）相比传统结构有以下优势：

1. **完全动态扩展**：
   - 区块（block）可以动态增减，无需修改类型定义
   - 每个区块内的字段（key-value）可以动态增减
   - 支持业务快速迭代

2. **统一的数据格式**：
   - 所有区块使用相同的 `{key, value}` 格式
   - 便于前端统一渲染和处理
   - 便于后端统一存储和查询

3. **更好的序列化支持**：
   - 扁平化的结构，序列化/反序列化更简单
   - 支持增量更新（只更新特定区块）
   - 便于版本控制和迁移

### 灵活结构的 BlockId 生成

灵活结构的 BlockId 格式更加清晰和统一：

```typescript
// 区块级别的 BlockId
brief.docs[0].block; // videoConfig 区块
brief.docs[1].block; // contentRequirement 区块

// 字段级别的 BlockId
brief.docs[0].data[0].key; // duration 字段
brief.docs[0].data[1].key; // aspectRatio 字段
brief.docs[1].data[0].key; // productName 字段
```

### 灵活结构的评论绑定示例

```typescript
// 在区块上添加评论
const blockComment: Comment = {
  id: "comment-001",
  blockId: "brief.docs[0].block",
  author: { id: "user-1", name: "张三" },
  content: "这个视频配置需要调整",
  createdAt: "2025-01-26T10:00:00Z",
};

// 在字段上添加评论
const fieldComment: Comment = {
  id: "comment-002",
  blockId: "brief.docs[0].data[0].key",
  author: { id: "user-2", name: "李四" },
  content: "时长需要改为 30s",
  createdAt: "2025-01-26T11:00:00Z",
};
```

### 灵活结构的 JSON 示例

```json
{
  "type": "brief",
  "id": "brief-001",
  "title": "Brief V2 Reference Picture Added",
  "createdAt": "2025-02-15T14:05:00Z",
  "docs": [
    {
      "block": "videoConfig",
      "data": [
        { "key": "duration", "value": "15s" },
        { "key": "aspectRatio", "value": "16:9" },
        { "key": "resolution", "value": "1080p" },
        { "key": "frameRate", "value": "30fps" }
      ]
    },
    {
      "block": "contentRequirement",
      "data": [
        { "key": "productName", "value": "Product Name" },
        { "key": "productLink", "value": "https://example.com" },
        { "key": "primaryPlatforms", "value": ["TikTok", "Youtube"] }
      ]
    }
  ]
}
```

## 动态字段处理说明

### 为什么需要动态字段？

业务需求会变化，`VideoConfig` 和 `ContentRequirement` 的字段可能会：

- **增加新字段**：如 `VideoConfig` 新增 `frameRate`、`codec` 等
- **减少字段**：某些字段可能不再需要
- **字段名变化**：业务术语可能调整

### 动态字段的 BlockId 生成

动态字段的 BlockId 生成规则与已知字段相同：

```typescript
// 已知字段
brief.videoConfig.duration;
brief.videoConfig.aspectRatio;

// 动态字段（业务扩展）
brief.videoConfig.frameRate;
brief.videoConfig.codec;
brief.videoConfig.bitrate;
```

### 动态字段的评论绑定

动态字段完全支持评论功能：

```typescript
// 用户可以在任何动态字段上添加评论
const comment: Comment = {
  id: "comment-001",
  blockId: "brief.videoConfig.frameRate", // 动态字段的 BlockId
  author: { id: "user-1", name: "张三" },
  content: "帧率需要调整到 60fps",
  createdAt: "2025-01-26T10:00:00Z",
};
```

### 动态字段的序列化

动态字段在序列化时会被完整保留：

```json
{
  "videoConfig": {
    "duration": "15s",
    "aspectRatio": "16:9",
    "resolution": "1080p",
    "frameRate": "30fps",
    "codec": "H.264"
  }
}
```

所有字段（包括动态字段）都会在序列化时保留，确保数据完整性。

## 总结

本协议设计实现了：

- ✅ **DOM 节点绑定**：通过 `data-block-id` 属性关联 JSON 和 DOM
- ✅ **评论双向绑定**：评论与节点双向定位
- ✅ **高效序列化**：扁平化的存储结构，便于查询和更新
- ✅ **层级路径标识**：清晰的 BlockId 规则，支持嵌套结构
- ✅ **后端友好**：使用 JSONB 存储，支持高效查询
- ✅ **动态字段支持**：支持业务字段的动态扩展，适应业务变化
