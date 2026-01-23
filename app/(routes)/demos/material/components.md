# 设计系统基础组件定义 (Design System Components)

本文档基于设计稿（Typography、Video、Picture、Tag）以及 `asset.md` 中的数据结构，定义了用于构建创意内容管理系统的基础 UI 组件及其 Props 接口。

## 1. 设计原则

- **原子化设计**：从基础的 Typography 和 Media 组件开始，向上构建复杂业务组件。
- **类型驱动**：Props 定义直接引用 `creative-types.d.ts` 中的数据类型，确保数据层与视图层的一致性。
- **语义化 Props**：Props 命名与 `asset.md` 保持一致，减少转换成本。

## 2. 基础类型引用

```typescript
import { Asset, AssetType } from "./creative-types"; // 假设引用自 asset.md 定义的类型
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

## 4. 基础组件 (Atoms)

### 4.1 Tag (标签)

用于展示 `CreativeConcept.tags` 或其他分类信息。

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
}

// 示例用法
// <Tag label="Product-First" variant="blue" />
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
}
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
}
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
}
```

## 5. 业务组件 (Molecules)

将基础组件与 `asset.md` 中的数据结构结合。

### 5.1 AssetCard (资产卡片)

用于在列表中展示单个资产。

```typescript
export interface AssetCardProps {
  /** 完整资产数据对象 */
  asset: Asset;
  /** 是否显示标题和描述 */
  showDetails?: boolean;
  /** 点击卡片的回调 */
  onAssetClick?: (assetId: string) => void;
}

// 内部实现逻辑：
// 1. 根据 asset.type 动态渲染 Image 或 Video 组件
// 2. 如果 showDetails 为 true，下方使用 Typography 渲染 asset.title (h5) 和 asset.description (body)
```

### 5.2 KeyValueRow (键值信息行)

用于展示 `VideoConfig` 或 `ContentRequirement` 中的信息。

```typescript
export interface KeyValueRowProps {
  /** 标签 (如 "Duration", "Resolution") */
  label: string;
  /** 值 (如 "15s", "1080p") */
  value: string | React.ReactNode;
  /** 布局方向 (水平或垂直) */
  direction?: "row" | "column";
}
```

## 6. 组合示例 (Compositions)

### 场景 1：展示 Video Config (Brief 模块)

```tsx
const VideoConfigSection = ({ config }: { config: VideoConfig }) => (
  <div className="flex flex-col gap-4">
    <Typography variant="h4">Video Settings</Typography>
    <div className="grid grid-cols-3 gap-4">
      <KeyValueRow
        label="Duration"
        value={<Typography variant="h3">{config.duration}</Typography>}
      />
      <KeyValueRow label="Aspect Ratio" value={config.aspectRatio} />
      <KeyValueRow label="Resolution" value={config.resolution} />
    </div>
  </div>
);
```

### 场景 2：展示参考资产列表 (Reference Assets)

```tsx
const ReferenceAssetsList = ({ assets }: { assets: Asset[] }) => (
  <div className="grid grid-cols-2 gap-4">
    {assets.map((asset) => (
      <AssetCard key={asset.id} asset={asset} showDetails={true} />
    ))}
  </div>
);
```

### 场景 3：展示创意概念 (Creative Concept)

```tsx
const ConceptCard = ({ concept }: { concept: CreativeConcept }) => (
  <div className="card">
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
            src={asset.url}
            poster={asset.thumbnailUrl}
            aspectRatio="16:9"
          />
        ) : (
          <Image
            key={asset.id}
            src={asset.url}
            alt={asset.title}
            aspectRatio="16:9"
          />
        )
      )}
    </div>
  </div>
);
```
