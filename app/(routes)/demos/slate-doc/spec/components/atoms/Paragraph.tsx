"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { ParagraphNode } from "../../registry";
import { cn } from "@/lib/utils";

export const Paragraph = (props: RenderElementProps) => {
  const node = props.element as ParagraphNode;
  return (
    <InteractiveRegion node={node}>
      <p
        {...props.attributes}
        className={cn(
          "mb-4 leading-relaxed text-slate-700",
          node.align && `text-${node.align}`
        )}
      >
        {props.children}
      </p>
    </InteractiveRegion>
  );
};
