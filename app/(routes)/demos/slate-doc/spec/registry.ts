import {
  BaseBlock,
  BlockType,
  HeadingBlock,
  ParagraphBlock,
  ImageBlock,
  VideoBlock,
  AudioBlock,
  TagBlock,
  CardBlock,
  StoryCardBlock,
  GalleryBlock,
  SectionBlock,
  CustomElement,
  CustomText,
} from "@/app/(routes)/demos/slate-doc/types";

// Re-export types to match the Spec naming convention
export type NodeType = BlockType;
export type BaseNode = BaseBlock;

export type HeadingNode = HeadingBlock;
export type ParagraphNode = ParagraphBlock;
export type ImageNode = ImageBlock;
export type VideoNode = VideoBlock;
export type AudioNode = AudioBlock;
export type TagNode = TagBlock;
export type CardNode = CardBlock;
export type StoryCardNode = StoryCardBlock;
export type GalleryNode = GalleryBlock;
export type SectionNode = SectionBlock;

export type { CustomElement, CustomText };
