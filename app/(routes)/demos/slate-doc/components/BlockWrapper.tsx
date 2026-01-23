import React, { useState } from "react";
import { useComment } from "../CommentContext";
import { cn } from "@/lib/utils";
import { MessageSquarePlus, MessageSquare } from "lucide-react";
import { Element } from "slate";

interface BlockWrapperProps {
  element: Element & { id: string };
  children: React.ReactNode;
  className?: string;
}

export const BlockWrapper = ({
  element,
  children,
  className,
}: BlockWrapperProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { comments, activeNodeId, openPanel } = useComment();

  const nodeId = element.id;
  const nodeComments = comments[nodeId] || [];
  const hasComments = nodeComments.length > 0;
  const isActive = activeNodeId === nodeId;

  // Handle click to select the block
  const handleClick = () => {
    // If we want to support selection of the block
    // const path = ReactEditor.findPath(editor, element);
    // Transforms.select(editor, path);
  };

  return (
    <div
      className={cn(
        "group relative -ml-4 rounded-lg py-1 pl-4 pr-2 transition-all duration-200",
        // Hover state
        (isHovered || isActive) && "bg-slate-50",
        // Active/Comment state
        isActive && "bg-blue-50/50 ring-1 ring-blue-200",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Actions (Comment Button) */}
      <div
        className={cn(
          "absolute right-2 top-2 z-20 flex items-center gap-1 transition-opacity duration-200",
          isHovered || hasComments || isActive ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            openPanel(nodeId);
          }}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            hasComments
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "border bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-slate-600"
          )}
          title={
            hasComments ? `${nodeComments.length} comments` : "Add comment"
          }
        >
          {hasComments ? (
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span className="text-xs font-medium">{nodeComments.length}</span>
            </div>
          ) : (
            <MessageSquarePlus size={16} />
          )}
        </button>
      </div>

      {/* Left Border Marker for Hover/Active */}
      <div
        className={cn(
          "absolute bottom-0 left-0 top-0 w-1 rounded-l-lg transition-colors",
          isActive
            ? "bg-blue-400"
            : isHovered
              ? "bg-slate-200"
              : "bg-transparent"
        )}
      />
    </div>
  );
};
