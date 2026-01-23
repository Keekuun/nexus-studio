"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { TagNode } from "../../registry";
import { cn } from "@/lib/utils";

export const Tag = (props: RenderElementProps) => {
  const node = props.element as TagNode;
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    gray: "bg-slate-100 text-slate-800",
  };

  return (
    <InteractiveRegion node={node} className="my-1 mr-2 inline-block">
      <span
        {...props.attributes}
        contentEditable={false}
        className={cn(
          "rounded-md px-2 py-1 text-xs font-medium",
          colorMap[(node.color || "gray") as keyof typeof colorMap]
        )}
      >
        #{node.label}
      </span>
      {props.children}
    </InteractiveRegion>
  );
};
