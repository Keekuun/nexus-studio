"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { GalleryNode } from "../../registry";
import { cn } from "@/lib/utils";

export const Gallery = (props: RenderElementProps) => {
  const node = props.element as GalleryNode;
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <InteractiveRegion node={node} className="my-8">
      <div
        {...props.attributes}
        className={cn("grid gap-4", gridCols[node.columns])}
      >
        {props.children}
      </div>
    </InteractiveRegion>
  );
};
