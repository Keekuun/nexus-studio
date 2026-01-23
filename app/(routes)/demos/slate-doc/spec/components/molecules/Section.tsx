"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { SectionNode } from "../../registry";
import { cn } from "@/lib/utils";

export const Section = (props: RenderElementProps) => {
  const node = props.element as SectionNode;

  return (
    <InteractiveRegion node={node} className="mb-8">
      <section
        {...props.attributes}
        className={cn(
          "rounded-3xl border border-dashed border-slate-200 px-8 py-12",
          node.background || "bg-transparent"
        )}
      >
        {props.children}
      </section>
    </InteractiveRegion>
  );
};
