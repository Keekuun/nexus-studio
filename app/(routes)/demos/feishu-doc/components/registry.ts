import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

// Import React Components
import { Heading } from "./ui/atoms/Heading";
import { Paragraph } from "./ui/atoms/Paragraph";
import { Tag } from "./ui/atoms/Tag";
import { ImageBlock } from "./ui/atoms/ImageBlock";
import { VideoBlock } from "./ui/atoms/VideoBlock";
import { AudioBlock } from "./ui/atoms/AudioBlock";
import { Section as SectionComponent } from "./ui/molecules/Section";
import { ImageGallery } from "./ui/molecules/ImageGallery";
import { TableBlock } from "./ui/molecules/TableBlock";
import { CardBlock } from "./ui/molecules/CardBlock";

import { StoryCard } from "./ui/molecules/StoryCard";
import { ShotTable } from "./ui/molecules/ShotTable";
import { BriefCard } from "./ui/molecules/BriefCard";
import { CreativePlanning } from "./ui/molecules/CreativePlanning";

// 1. BlockID Extension
export const BlockId = Extension.create({
  name: "blockId",
  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "image",
          "blockquote",
          "section",
          "bulletList",
          "orderedList",
          "imageBlock",
          "videoBlock",
          "audioBlock",
          "imageGallery",
          "tableBlock",
          "cardBlock",
          "tag",
          "storyCard",
          "shotTable",
          "briefCard",
          "creativePlanning",
        ],
        attributes: {
          blockId: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute("data-block-id"),
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.blockId) {
                return {};
              }
              return {
                "data-block-id": attributes.blockId,
              };
            },
          },
        },
      },
    ];
  },
});

// 2. Custom Node Extensions using React Components

const CustomHeading = Node.create({
  name: "heading",
  group: "block",
  content: "inline*",
  defining: true,
  addAttributes() {
    return {
      level: {
        default: 1,
      },
      blockId: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
      { tag: "h5", attrs: { level: 5 } },
      { tag: "h6", attrs: { level: 6 } },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const levels = this.options.levels || [1, 2, 3, 4, 5, 6];
    const hasLevel = levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : levels[0];
    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(Heading);
  },
});

const CustomParagraph = Node.create({
  name: "paragraph",
  group: "block",
  content: "inline*",
  addAttributes() {
    return {
      blockId: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "p" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(Paragraph);
  },
});

const CustomTag = Node.create({
  name: "tag",
  group: "inline",
  inline: true,
  content: "text*",
  addAttributes() {
    return {
      label: { default: "Tag" },
      color: { default: "blue" },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="tag"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "tag" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(Tag);
  },
});

export const Section = Node.create({
  name: "section",
  group: "block",
  content: "block+",
  draggable: true,

  addAttributes() {
    return {
      blockId: {
        default: null,
      },
      class: {
        default: "section-block",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="section"]' }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "section" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionComponent);
  },
});

const CustomImageBlock = Node.create({
  name: "imageBlock",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      caption: { default: null },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="image-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "image-block" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageBlock);
  },
});

const CustomVideoBlock = Node.create({
  name: "videoBlock",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      caption: { default: null },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="video-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "video-block" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoBlock);
  },
});

const CustomAudioBlock = Node.create({
  name: "audioBlock",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      caption: { default: null },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="audio-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "audio-block" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(AudioBlock);
  },
});

const CustomImageGallery = Node.create({
  name: "imageGallery",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      images: { default: [] },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="image-gallery"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "image-gallery" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageGallery);
  },
});

const CustomTableBlock = Node.create({
  name: "tableBlock",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      data: { default: [] },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="table-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "table-block" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TableBlock);
  },
});

const CustomCardBlock = Node.create({
  name: "cardBlock",
  group: "block",
  content: "block+",
  draggable: true,
  addAttributes() {
    return {
      title: { default: "Card" },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="card-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "card-block" }),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CardBlock);
  },
});

const CustomStoryCard = Node.create({
  name: "storyCard",
  group: "block",
  content: "block+",
  draggable: true,
  addAttributes() {
    return {
      title: { default: "Story Title" },
      images: { default: [] },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="story-card"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "story-card" }),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StoryCard);
  },
});

const CustomShotTable = Node.create({
  name: "shotTable",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      data: { default: [] },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="shot-table"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "shot-table" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ShotTable);
  },
});

const CustomBriefCard = Node.create({
  name: "briefCard",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      title: { default: "Brief" },
      date: { default: "" },
      settings: { default: {} },
      requirements: { default: {} },
      references: { default: [] },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="brief-card"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "brief-card" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BriefCard);
  },
});

const CustomCreativePlanning = Node.create({
  name: "creativePlanning",
  group: "block",
  content: "block+",
  draggable: true,
  addAttributes() {
    return {
      title: { default: "Creative Planning" },
      date: { default: "" },
      tabs: { default: [] },
      blockId: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="creative-planning"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "creative-planning" }),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CreativePlanning);
  },
});

// Export unified extension list
export const getExtensions = () => [
  StarterKit.configure({
    // Disable default nodes that we override
    heading: false,
    paragraph: false,
    document: false,
    text: false,
  }),

  Node.create({
    name: "doc",
    topNode: true,
    content: "block+",
  }),
  Node.create({
    name: "text",
    group: "inline",
  }),

  CustomHeading,
  CustomParagraph,
  CustomTag,
  Section,
  CustomImageBlock,
  CustomVideoBlock,
  CustomAudioBlock,
  CustomImageGallery,
  CustomTableBlock,
  CustomCardBlock,
  CustomStoryCard,
  CustomShotTable,
  CustomBriefCard,
  CustomCreativePlanning,
  BlockId,
  Placeholder.configure({ placeholder: "Type something..." }),
  Image,
];
