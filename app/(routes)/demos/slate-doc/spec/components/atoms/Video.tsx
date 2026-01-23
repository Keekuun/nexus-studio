"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { VideoNode } from "../../registry";
import { Video as VideoIcon } from "lucide-react";

export const Video = (props: RenderElementProps) => {
  const node = props.element as VideoNode;
  return (
    <InteractiveRegion node={node} className="my-4">
      <div
        {...props.attributes}
        contentEditable={false}
        className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-900"
      >
        {}
        <video src={node.src} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <VideoIcon className="text-white" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-xs text-white">
          VIDEO ATOM
        </div>
      </div>
      {props.children}
    </InteractiveRegion>
  );
};
