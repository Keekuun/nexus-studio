"use client";

import React from "react";
import { useSelection } from "../SelectionContext";
import { cn } from "@/lib/utils";
import { BaseNode } from "../registry";
import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms, Node as SlateNode } from "slate";

interface InteractiveRegionProps {
  node: BaseNode;
  children: React.ReactNode;
  className?: string;
  // If true, this region captures hover events and stops propagation to parents
  // This is key for the "Atom vs Molecule" distinction
  isAtomic?: boolean;
}

export const InteractiveRegion = ({
  node,
  children,
  className,
}: InteractiveRegionProps) => {
  const { hoveredNodeId, setHoveredNodeId, selectedNodeId, handleNodeClick } =
    useSelection();

  const editor = useSlateStatic();

  const isHovered = hoveredNodeId === node.id;
  const isSelected = selectedNodeId === node.id;

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Critical: Stop propagation so parent containers don't think they are hovered
    // when we are hovering a child.
    e.stopPropagation();
    setHoveredNodeId(node.id);
  };

  const handleMouseLeave = () => {
    // When leaving, we don't necessarily want to set null immediately if we are moving to a parent
    // But since parents also listen to enter/leave, let's just clear specific ID logic
    setHoveredNodeId(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleNodeClick(node);

    // Also sync Slate selection if needed
    try {
      const path = ReactEditor.findPath(editor, node as SlateNode);
      Transforms.select(editor, path);
    } catch {
      // Ignore if node not found in editor state
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 transition-all duration-200",
        // Default border transparent
        "border-transparent",
        // Hover state: Blue dashed border
        isHovered && "border-dashed border-blue-400 bg-blue-50/30",
        // Selected state: Blue solid border + shadow
        isSelected && "border-blue-600 shadow-sm ring-2 ring-blue-100",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      // Add data attributes for debugging or testing
      data-node-type={node.type}
      data-node-id={node.id}
    >
      {/* Label Tag on Hover/Select */}
      {(isHovered || isSelected) && (
        <div
          className={cn(
            "pointer-events-none absolute -top-3 left-2 z-10 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
            isSelected ? "bg-blue-600" : "bg-blue-400"
          )}
        >
          {node.type}
        </div>
      )}

      {children}
    </div>
  );
};
