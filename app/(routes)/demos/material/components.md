# 设计系统基础组件定义 (Design System Components)

本文档基于设计稿（Typography、Video、Picture、Tag）以及 `asset.md` 中的 FlexibleDocument 数据结构，定义了用于构建创意内容管理系统的基础 UI 组件及其 Props 接口。

## 1. 设计原则

- **原子化设计**：从基础的 Typography 和 Media 组件开始，向上构建复杂业务组件。
- **类型驱动**：Props 定义直接引用 `creative-types.ts` 中的数据类型，确保数据层与视图层的一致性。
- **语义化 Props**：Props 命名与 `asset.md` 保持一致，减少转换成本。
- **唯一ID支持**：所有组件支持唯一ID标识，便于评论绑定和节点追踪。
- **评论绑定**：所有可评论节点支持 `data-block-id` 和 `data-id` 属性。

## 2. 基础类型引用

```typescript
import {
  FlexibleDocument,
  DocumentBlock,
  KeyValuePair,
  Asset,
  AssetType,
  DocumentType,
  Id,
} from "./creative-types";
```

## 3. Typography 系统

基于设计稿中的文字层级定义。

```typescript
// 排版变体类型
export type TypographyVariant =
  | "h1" // 一级标题 (如: The Morning Miracle)
  | "h2" // 二级标题 (如: Brief V2 Reference Picture Added)
  | "h3" // 三级标题 (如: 15s)
  | "h4" // 四级标题 (如: Video Settings)
  | "h5" // 五级标题 (如: An organic construction...)
  | "h6" // 六级标题 (预留)
  | "subtitle" // 副标题 (如: Thank you for providing...)
  | "body" // 正文 (如: An organic construction...)
  | "caption"; // 说明文字 (如: 2025-02-15 · 14:05)

export interface TypographyProps {
  /** 文本内容 */
  children: React.ReactNode;
  /** 排版变体 */
  variant: TypographyVariant;
  /** 语义化标签 (可选，默认根据 variant 映射) */
  component?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  /** 文本颜色 (可选) */
  color?: "primary" | "secondary" | "tertiary" | "inherit";
  /** 额外的 CSS 类名 */
  className?: string;
}
```

**使用示例**：

```tsx
<Typography variant="h1">The Morning Miracle</Typography>
<Typography variant="body" color="tertiary">描述文本</Typography>
```

## 4. 基础组件 (Atoms)

### 4.1 Tag (标签)

用于展示标签信息，如 `CreativeConcept.tags`。

```typescript
export interface TagProps {
  /** 标签文本 */
  label: string;
  /** 预设样式风格 (对应设计稿中的颜色) */
  variant?: "blue" | "orange" | "pink" | "default";
  /** 自定义背景色 (可选) */
  backgroundColor?: string;
  /** 自定义文字颜色 (可选) */
  textColor?: string;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例
<Tag label="Product-First" variant="blue" />
```

### 4.2 TextButton (文本按钮)

用于 "Show more" 等交互操作。

```typescript
export interface TextButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否带下拉箭头 (如 Show more 后的箭头) */
  endIcon?: "chevron-down" | "chevron-up" | "none";
  /** 禁用状态 */
  disabled?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例
<TextButton endIcon="chevron-down" onClick={handleShowMore}>
  Show more
</TextButton>
```

### 4.3 Media 组件拆分

#### 4.3.1 Image (图片展示)

用于展示图片类型的资产。

```typescript
export interface ImageProps {
  /** 图片资源 URL */
  src: string;
  /** 图片 Alt 文本 */
  alt: string;
  /** 圆角大小 */
  borderRadius?: "sm" | "md" | "lg" | "none";
  /** 宽高比 (如 "16:9", "1:1", "4:3") */
  aspectRatio?: string;
  /** 具体的 CSS 宽度 */
  width?: string | number;
  /** 具体的 CSS 高度 */
  height?: string | number;
  /** 点击回调 (通常用于打开 Lightbox) */
  onClick?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例
<Image
  src="https://example.com/image.jpg"
  alt="描述"
  aspectRatio="16:9"
  borderRadius="md"
/>
```

#### 4.3.2 Video (视频展示)

用于展示视频类型的资产，自动处理播放按钮覆盖层。

```typescript
export interface VideoProps {
  /** 视频资源 URL */
  src: string;
  /** 缩略图 URL */
  poster?: string;
  /** 圆角大小 */
  borderRadius?: "sm" | "md" | "lg" | "none";
  /** 宽高比 (如 "16:9", "1:1", "4:3") */
  aspectRatio?: string;
  /** 具体的 CSS 宽度 */
  width?: string | number;
  /** 具体的 CSS 高度 */
  height?: string | number;
  /** 点击回调 (通常用于播放控制) */
  onClick?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例
<Video
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  aspectRatio="16:9"
  borderRadius="md"
/>
```

## 5. 业务组件 (Molecules)

将基础组件与 `asset.md` 中的 FlexibleDocument 数据结构结合。

### 5.1 KeyValueItem (键值对项)

用于展示单个 KeyValuePair，支持评论绑定。

```typescript
export interface KeyValueItemProps {
  /** 键值对数据 */
  item: KeyValuePair;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 是否高亮（用于评论定位） */
  highlighted?: boolean;
  /** 点击回调 */
  onClick?: (item: KeyValuePair) => void;
  /** 评论点击回调 */
  onCommentClick?: (itemId: Id) => void;
  /** 布局方向 (水平或垂直) */
  direction?: "row" | "column";
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例：
// <KeyValueItem
//   item={keyValuePair}
//   commentCount={3}
//   onCommentClick={(id) => openCommentPanel(id)}
// />
```

### 5.2 DocumentBlock (文档区块)

用于展示单个 DocumentBlock，包含多个 KeyValueItem。

```typescript
export interface DocumentBlockProps {
  /** 区块数据 */
  block: DocumentBlock;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 是否高亮（用于评论定位） */
  highlighted?: boolean;
  /** 区块标题渲染方式 */
  renderTitle?: (block: DocumentBlock) => React.ReactNode;
  /** 点击回调 */
  onClick?: (block: DocumentBlock) => void;
  /** 评论点击回调 */
  onCommentClick?: (blockId: Id) => void;
  /** 键值对点击回调 */
  onKeyValueClick?: (item: KeyValuePair) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例：
// <DocumentBlock
//   block={documentBlock}
//   commentCount={5}
//   onCommentClick={(id) => openCommentPanel(id)}
// />
```

### 5.3 FlexibleDocumentViewer (灵活文档查看器)

用于展示完整的 FlexibleDocument，支持所有模块类型。

```typescript
export interface FlexibleDocumentViewerProps {
  /** 文档数据 */
  document: FlexibleDocument;
  /** 评论映射表（blockId -> Comment[]） */
  comments?: Record<Id, Comment[]>;
  /** 是否显示评论角标 */
  showCommentBadges?: boolean;
  /** 文档点击回调 */
  onDocumentClick?: (doc: FlexibleDocument) => void;
  /** 区块点击回调 */
  onBlockClick?: (block: DocumentBlock) => void;
  /** 键值对点击回调 */
  onKeyValueClick?: (item: KeyValuePair) => void;
  /** 评论点击回调 */
  onCommentClick?: (blockId: Id) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 使用示例：
// <FlexibleDocumentViewer
//   document={briefDocument}
//   comments={commentMap}
//   showCommentBadges={true}
//   onCommentClick={(id) => openCommentPanel(id)}
// />
```

### 5.4 AssetCard (资产卡片)

用于在列表中展示单个资产，支持唯一ID。

```typescript
export interface AssetCardProps {
  /** 完整资产数据对象 */
  asset: Asset;
  /** 资产唯一ID（用于评论绑定） */
  assetBlockId?: Id;
  /** 是否显示标题和描述 */
  showDetails?: boolean;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 点击卡片的回调 */
  onAssetClick?: (assetId: string) => void;
  /** 评论点击回调 */
  onCommentClick?: (blockId: Id) => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// 内部实现逻辑：
// 1. 根据 asset.type 动态渲染 Image 或 Video 组件
// 2. 如果 showDetails 为 true，下方使用 Typography 渲染 asset.title (h5) 和 asset.description (body)
// 3. 添加 data-block-id={assetBlockId} 属性支持评论绑定
```

### 5.5 KeyValueRow (键值信息行)

用于展示键值对信息，支持唯一ID。

```typescript
export interface KeyValueRowProps {
  /** 标签 (如 "Duration", "Resolution") */
  label: string;
  /** 值 (如 "15s", "1080p") */
  value: string | React.ReactNode;
  /** 唯一ID（用于评论绑定） */
  blockId?: Id;
  /** 评论数量（可选） */
  commentCount?: number;
  /** 布局方向 (水平或垂直) */
  direction?: "row" | "column";
  /** 额外的 CSS 类名 */
  className?: string;
}
```

## 6. 组合示例 (Compositions)

### 场景 1：展示 Brief 文档（使用 FlexibleDocument）

```tsx
import { FlexibleDocumentViewer } from "./ui/flexible-document-viewer";
import { Brief } from "./creative-types";

const BriefViewer = ({
  brief,
  comments,
}: {
  brief: Brief;
  comments?: Record<Id, Comment[]>;
}) => {
  return (
    <FlexibleDocumentViewer
      document={brief}
      comments={comments}
      showCommentBadges={true}
      onCommentClick={(id) => {
        // 打开评论面板
        openCommentPanel(id);
      }}
    />
  );
};
```

### 场景 2：展示单个区块（DocumentBlock）

```tsx
import { DocumentBlock } from "./ui/document-block";
import { DocumentBlock as DocumentBlockType } from "./creative-types";

const VideoConfigSection = ({
  block,
  comments,
}: {
  block: DocumentBlockType;
  comments?: Comment[];
}) => {
  return (
    <DocumentBlock
      block={block}
      commentCount={comments?.length}
      renderTitle={(block) => (
        <Typography variant="h4">{block.block}</Typography>
      )}
      onCommentClick={(id) => openCommentPanel(id)}
    />
  );
};
```

### 场景 3：展示键值对列表

```tsx
import { KeyValueItem } from "./ui/key-value-item";
import { KeyValuePair } from "./creative-types";

const KeyValueList = ({
  items,
  comments,
}: {
  items: KeyValuePair[];
  comments?: Record<Id, Comment[]>;
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <KeyValueItem
          key={item.id}
          item={item}
          commentCount={comments?.[item.id]?.length}
          onCommentClick={(id) => openCommentPanel(id)}
        />
      ))}
    </div>
  );
};
```

### 场景 4：展示参考资产列表（从 KeyValuePair 中提取）

```tsx
import { AssetCard } from "./ui/asset-card";
import { KeyValuePair, Asset } from "./creative-types";

const ReferenceAssetsList = ({ kvItem }: { kvItem: KeyValuePair }) => {
  // 从 KeyValuePair 的 value 中提取资产数组
  const assets = Array.isArray(kvItem.value) ? (kvItem.value as Asset[]) : [];

  return (
    <div
      data-block-id={kvItem.id}
      data-id={kvItem.id}
      className="grid grid-cols-2 gap-4"
    >
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          assetBlockId={`${kvItem.id}-${asset.id}`}
          showDetails={true}
        />
      ))}
    </div>
  );
};
```

### 场景 5：展示创意概念（从 KeyValuePair 中提取）

```tsx
import { Tag } from "./ui/tag";
import { Typography } from "./ui/typography";
import { Image } from "./ui/image";
import { Video } from "./ui/video";
import { KeyValuePair } from "./creative-types";

interface CreativeConcept {
  id: string;
  title: string;
  tags: string[];
  coreCreative: string;
  outline: string[];
  assets: Asset[];
}

const ConceptCard = ({ kvItem }: { kvItem: KeyValuePair }) => {
  const concepts = Array.isArray(kvItem.value)
    ? (kvItem.value as CreativeConcept[])
    : [];

  const concept = concepts[0]; // 取第一个概念

  if (!concept) return null;

  return (
    <div data-block-id={kvItem.id} data-id={kvItem.id} className="card">
      <div className="mb-2 flex gap-2">
        {concept.tags.map((tag) => (
          <Tag key={tag} label={tag} variant="blue" />
        ))}
      </div>
      <Typography variant="h1">{concept.title}</Typography>
      <Typography variant="body" className="mt-2">
        {concept.coreCreative}
      </Typography>

      <div className="mt-4">
        {/* 展示关联资产 */}
        {concept.assets.map((asset) =>
          asset.type === "video" ? (
            <Video
              key={asset.id}
              src={asset.url || ""}
              poster={asset.thumbnailUrl}
              aspectRatio="16:9"
            />
          ) : (
            <Image
              key={asset.id}
              src={asset.url || ""}
              alt={asset.title}
              aspectRatio="16:9"
            />
          )
        )}
      </div>
    </div>
  );
};
```

### 场景 6：完整的文档渲染（支持评论）

```tsx
import { FlexibleDocumentViewer } from "./ui/flexible-document-viewer";
import { FlexibleDocument, Comment } from "./creative-types";

interface DocumentViewerProps {
  document: FlexibleDocument;
  comments?: Record<Id, Comment[]>;
  onAddComment?: (blockId: Id, content: string) => void;
}

const DocumentViewer = ({
  document,
  comments = {},
  onAddComment,
}: DocumentViewerProps) => {
  const handleCommentClick = (blockId: Id) => {
    // 定位到对应节点并打开评论面板
    const element = document.querySelector(`[data-id="${blockId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("comment-highlight");
      setTimeout(() => {
        element.classList.remove("comment-highlight");
      }, 2000);
    }
    openCommentPanel(blockId);
  };

  return (
    <FlexibleDocumentViewer
      document={document}
      comments={comments}
      showCommentBadges={true}
      onCommentClick={handleCommentClick}
      onKeyValueClick={(item) => {
        // 可以在这里处理键值对的点击事件
        console.log("KeyValue clicked:", item);
      }}
    />
  );
};
```

## 7. 组件系统架构

### 7.1 组件层级

```
FlexibleDocumentViewer (顶层)
  └── DocumentBlockComponent (区块层)
      └── KeyValueItem (键值对层)
          └── KeyValueRow (展示层)
              └── Typography (基础层)
```

### 7.2 数据流向

```
FlexibleDocument (数据)
  → DocumentBlock[]
    → KeyValuePair[]
      → 渲染为 UI 组件
        → 支持评论绑定 (通过 data-block-id/data-id)
```

### 7.3 评论绑定机制

所有组件都支持评论绑定：

1. **唯一ID标识**：每个组件通过 `data-block-id` 和 `data-id` 属性绑定唯一ID
2. **评论角标**：通过 `commentCount` prop 显示评论数量
3. **评论交互**：通过 `onCommentClick` 回调处理评论点击事件
4. **高亮定位**：通过 `highlighted` prop 支持评论定位高亮

### 7.4 组件导入

```typescript
// 方式1：统一导入
import {
  FlexibleDocumentViewer,
  DocumentBlockComponent,
  KeyValueItem,
  AssetCard,
  Typography,
} from "./ui";

// 方式2：按需导入
import { FlexibleDocumentViewer } from "./ui/flexible-document-viewer";
import { DocumentBlockComponent } from "./ui/document-block";
import { KeyValueItem } from "./ui/key-value-item";
```

### 7.5 完整使用示例

```tsx
import { FlexibleDocumentViewer } from "./ui/flexible-document-viewer";
import { Brief, Id } from "./creative-types";

interface Comment {
  id: string;
  blockId: Id;
  author: { id: string; name: string; avatar?: string };
  content: string;
  createdAt: string;
}

function BriefPage() {
  const [brief, setBrief] = useState<Brief>(briefData);
  const [comments, setComments] = useState<Record<Id, Comment[]>>({});

  const handleAddComment = async (blockId: Id, content: string) => {
    // 调用 API 添加评论
    const newComment = await api.addComment(brief.id, blockId, content);

    // 更新本地评论状态
    setComments((prev) => ({
      ...prev,
      [blockId]: [...(prev[blockId] || []), newComment],
    }));
  };

  const handleCommentClick = (blockId: Id) => {
    // 定位到对应节点
    const element = document.querySelector(`[data-id="${blockId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("comment-highlight");
    }

    // 打开评论面板
    openCommentPanel(blockId);
  };

  return (
    <FlexibleDocumentViewer
      document={brief}
      comments={comments}
      showCommentBadges={true}
      onCommentClick={handleCommentClick}
      onKeyValueClick={(item) => {
        // 处理键值对点击
        console.log("KeyValue clicked:", item);
      }}
    />
  );
}
```

## 8. 组件特性总结

### 8.1 核心特性

1. **类型安全**：所有组件 Props 都基于 `creative-types.ts` 中的类型定义
2. **唯一ID支持**：每个组件都支持唯一ID标识，便于评论绑定
3. **评论集成**：内置评论角标和交互支持
4. **灵活扩展**：支持动态区块和字段，无需修改组件代码
5. **统一风格**：所有组件遵循统一的设计系统

### 8.2 使用建议

1. **优先使用 FlexibleDocumentViewer**：对于完整的文档展示，使用 `FlexibleDocumentViewer` 组件
2. **按需使用子组件**：对于部分区块展示，可以使用 `DocumentBlockComponent` 或 `KeyValueItem`
3. **评论绑定**：始终传递 `comments` 和 `onCommentClick` props 以支持评论功能
4. **ID 管理**：确保所有数据都包含唯一ID，便于评论绑定和节点追踪
