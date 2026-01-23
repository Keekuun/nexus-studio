"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { CardNode } from "../../registry";
import { cn } from "@/lib/utils";

export const Card = (props: RenderElementProps) => {
  const node = props.element as CardNode;
  const paddingMap = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  const variantMap = {
    default: "bg-white border-none shadow-none",
    outlined: "bg-white border border-slate-200",
    elevated: "bg-white shadow-md border-none",
  };

  return (
    <InteractiveRegion node={node} className="h-full">
      <div
        {...props.attributes}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl",
          paddingMap[node.padding || "md"],
          variantMap[node.variant || "default"]
        )}
      >
        {props.children}
      </div>
    </InteractiveRegion>
  );
};
