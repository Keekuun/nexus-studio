import React, { useState } from "react";
import { useComment } from "../CommentContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Send, User } from "lucide-react";

export const CommentSidebar = () => {
  const {
    comments,
    activeNodeId,
    isPanelOpen,
    closePanel,
    addComment,
    openPanel,
  } = useComment();
  const [inputValue, setInputValue] = useState("");

  if (!isPanelOpen) return null;

  // Flatten all comments if no activeNodeId, otherwise show active node comments
  const displayComments = activeNodeId
    ? comments[activeNodeId] || []
    : Object.values(comments)
        .flat()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeNodeId) return;

    addComment(activeNodeId, inputValue);
    setInputValue("");
  };

  const handleCommentClick = (nodeId: string) => {
    // Bi-directional linking: click comment -> highlight node
    // We can use the openPanel logic to set the activeNodeId which triggers highlight in BlockWrapper
    // But we need to make sure we don't just filter the list to only this node immediately if we want to keep context?
    // Actually, "bi-directional anchor" usually means filtering to that context.
    // If the user wants to see all, they can maybe click "Show All" or click outside.
    // For now, let's just highlight the node.

    // We need to scroll to the node.
    const element = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Set active node to highlight it
      openPanel(nodeId);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-white shadow-xl duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-slate-50/50 p-4">
        <h3 className="font-semibold text-slate-900">
          {activeNodeId ? "Thread" : "All Comments"}
        </h3>
        <div className="flex items-center gap-2">
          {activeNodeId && (
            <button
              onClick={() => openPanel(null)}
              className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Show All
            </button>
          )}
          <button
            onClick={closePanel}
            className="rounded-full p-1 transition-colors hover:bg-slate-200"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {displayComments.length === 0 ? (
          <div className="mt-10 text-center text-slate-400">
            <p className="text-sm">No comments yet</p>
            <p className="mt-1 text-xs">
              Select a block to start a discussion!
            </p>
          </div>
        ) : (
          displayComments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "group flex cursor-pointer gap-3 rounded-lg p-2 transition-colors",
                // Highlight logic could go here if we tracked activeCommentId
                "hover:bg-slate-50"
              )}
              onClick={() => handleCommentClick(comment.nodeId)}
            >
              <div className="mt-1 flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment.author.avatar}
                    alt={comment.author.name}
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    <User size={14} />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mt-1 text-sm leading-relaxed text-slate-700">
                  {comment.content}
                </div>
                {!activeNodeId && (
                  <div className="mt-2 text-xs font-medium text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                    Click to jump to context
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area - Only show if a specific node is selected */}
      {activeNodeId && (
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Reply to thread..."
              className="min-h-[80px] w-full resize-none rounded-lg border border-slate-200 p-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute bottom-3 right-3 rounded-md bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
