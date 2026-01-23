"use client";

import React from "react";
import { RenderElementProps } from "slate-react";
import { InteractiveRegion } from "../InteractiveRegion";
import { ImageNode } from "../../registry";

export const Image = (props: RenderElementProps) => {
  const node = props.element as ImageNode;
  return (
    <InteractiveRegion node={node} className="my-2 inline-block">
      <div {...props.attributes} contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.src || node.url}
          alt={node.alt || "Image"}
          className="h-auto max-w-full rounded-lg object-cover shadow-sm"
        />
        {node.caption && (
          <div className="mt-2 text-center text-xs text-slate-500">
            {node.caption}
          </div>
        )}
      </div>
      {props.children}
    </InteractiveRegion>
  );
};
