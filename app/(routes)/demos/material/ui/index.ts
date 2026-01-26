/**
 * 组件统一导出
 * 基于 FlexibleDocument 结构的组件系统
 */

// 基础组件
export {
  Typography,
  type TypographyProps,
  type TypographyVariant,
} from "./typography";
export { Tag, type TagProps } from "./tag";
export { TextButton, type TextButtonProps } from "./text-button";
export { Image, type ImageProps } from "./image";
export { Video, type VideoProps } from "./video";

// 业务组件
export { AssetCard, type AssetCardProps } from "./asset-card";
export {
  AssetImageViewer,
  type AssetImageViewerProps,
} from "./asset-image-viewer";
export { AssetGrid, type AssetGridProps } from "./asset-grid";
export { AssetTable, type AssetTableProps } from "./asset-table";
export { KeyValueRow, type KeyValueRowProps } from "./key-value-row";
export { KeyValueItem, type KeyValueItemProps } from "./key-value-item";
export {
  DocumentBlockComponent,
  type DocumentBlockProps,
} from "./document-block";
export {
  FlexibleDocumentViewer,
  type FlexibleDocumentViewerProps,
} from "./flexible-document-viewer";
