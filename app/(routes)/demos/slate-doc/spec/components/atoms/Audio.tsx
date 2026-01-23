"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { AudioNode } from "../../registry";
import { Music } from "lucide-react";

export const Audio = (props: RenderElementProps) => {
  const node = props.element as AudioNode;
  return (
    <InteractiveRegion node={node} className="my-2">
      <div
        {...props.attributes}
        contentEditable={false}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <Music size={20} className="text-indigo-600" />
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 bg-indigo-500" />
        </div>
        <div className="font-mono text-xs text-slate-500">03:45</div>
      </div>
      {props.children}
    </InteractiveRegion>
  );
};
