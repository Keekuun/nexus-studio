import { BaseEditor, BaseElement, BaseText, Descendant } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

// --- Slate Custom Types ---

export type BlockType =
  // Original Demo Types
  | "title"
  | "paragraph"
  | "image"
  | "card"
  | "list"
  | "table"
  | "table-row"
  | "table-cell"
  // New Spec Demo Types
  | "heading"
  | "video"
  | "audio"
  | "tag"
  | "story-card"
  | "gallery"
  | "section";

export interface BaseBlock extends BaseElement {
  id: string;
  type: BlockType;
  children: Descendant[];
  className?: string;
}

// --- Specific Blocks ---

// 1. Text & Headings
export interface TitleBlock extends BaseBlock {
  type: "title";
  level: 1 | 2 | 3;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "left" | "center" | "right";
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  align?: "left" | "center" | "right";
}

// 2. Media
export interface ImageBlock extends BaseBlock {
  type: "image";
  // Unified props
  url?: string; // Legacy
  src?: string; // Spec
  alt?: string;
  caption?: string;
  width?: number | string;
  height?: number | string;
  children: CustomText[]; // Void node
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  src: string;
  poster?: string;
  autoplay?: boolean;
  children: CustomText[]; // Void node
}

export interface AudioBlock extends BaseBlock {
  type: "audio";
  src: string;
  children: CustomText[]; // Void node
}

// 3. Components
export interface TagBlock extends BaseBlock {
  type: "tag";
  label: string;
  color?: "blue" | "red" | "green" | "gray";
  children: CustomText[];
}

export interface CardBlock extends BaseBlock {
  type: "card";
  // Legacy Props
  title?: string;
  status?: "success" | "warning" | "error" | "info" | string;
  description?: string;
  // Spec Props
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  // Children handling: Legacy used void with props, Spec uses children slots
  children: Descendant[];
}

export interface StoryCardBlock extends BaseBlock {
  type: "story-card";
  layout: "horizontal" | "vertical";
  children: Descendant[];
}

// 4. Collections / Layouts
export interface ListBlock extends BaseBlock {
  type: "list";
  ordered?: boolean;
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  columns: 2 | 3 | 4;
  aspectRatio?: "square" | "video" | "portrait";
  children: Descendant[];
}

export interface SectionBlock extends BaseBlock {
  type: "section";
  background?: string;
  children: Descendant[];
}

export interface TableBlock extends BaseBlock {
  type: "table";
}

export interface TableRowBlock extends BaseBlock {
  type: "table-row";
}

export interface TableCellBlock extends BaseBlock {
  type: "table-cell";
}

// --- Unions ---

export type CustomElement =
  | TitleBlock
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | TagBlock
  | CardBlock
  | StoryCardBlock
  | ListBlock
  | GalleryBlock
  | SectionBlock
  | TableBlock
  | TableRowBlock
  | TableCellBlock;

export interface CustomText extends BaseText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  color?: string;
}

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// --- Comment System Types ---

export interface Comment {
  id: string;
  nodeId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  replies?: Comment[];
  highlighted?: boolean;
}

// --- Backend Types ---

export interface ServerBlockData {
  id: string;
  type: BlockType;
  content?: string;
  props?: Record<string, unknown>;
  children?: ServerBlockData[];
}

export interface StreamEvent {
  type: "chunk" | "complete";
  data: ServerBlockData[];
}
