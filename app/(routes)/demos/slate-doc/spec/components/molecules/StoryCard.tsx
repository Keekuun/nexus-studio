"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { StoryCardNode } from "../../registry";
import { cn } from "@/lib/utils";

export const StoryCard = (props: RenderElementProps) => {
  const node = props.element as StoryCardNode;
  const isHorizontal = node.layout === "horizontal";

  return (
    <InteractiveRegion node={node} className="my-6">
      <div
        {...props.attributes}
        className={cn(
          "flex overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg",
          isHorizontal ? "h-64 flex-row" : "flex-col"
        )}
      >
        {/* Note: In a real implementation, we'd need to control which child goes where.
            Slate renders children sequentially. For this demo, we assume the JSON structure matches the layout.
            Typically: [Image, Content]
        */}
        {props.children}
      </div>
    </InteractiveRegion>
  );
};
