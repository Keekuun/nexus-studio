import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";

const CardComponent = ({ node }: { node: any }) => {
  return (
    <NodeViewWrapper
      as="span"
      className="mx-1 inline-flex items-center align-middle"
    >
      <span
        className="select-none whitespace-nowrap rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        data-type="card"
      >
        {node.attrs.label}
      </span>
    </NodeViewWrapper>
  );
};

export const Card = Node.create({
  name: "card",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      label: {
        default: "Card",
      },
      value: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "card" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardComponent);
  },
});
