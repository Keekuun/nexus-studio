"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { HeadingNode } from "../../registry";
import { cn } from "@/lib/utils";

export const Heading = (props: RenderElementProps) => {
  const node = props.element as HeadingNode;
  // Cast to any to avoid "union type too complex" error with IntrinsicElements
  const Tag = `h${node.level}` as any;

  return (
    <InteractiveRegion node={node}>
      <Tag
        {...props.attributes}
        className={cn(
          "my-2 font-bold text-slate-900",
          node.level === 1 && "border-b pb-4 text-4xl",
          node.level === 2 && "mb-4 mt-8 text-3xl",
          node.level === 3 && "mb-3 mt-6 text-2xl",
          node.align && `text-${node.align}`
        )}
      >
        {props.children}
      </Tag>
    </InteractiveRegion>
  );
};
