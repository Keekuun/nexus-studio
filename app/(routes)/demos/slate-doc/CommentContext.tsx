import React, { createContext, useContext, useState, ReactNode } from "react";
import { Comment } from "./types";
import { nanoid } from "nanoid";

interface CommentContextType {
  comments: Record<string, Comment[]>; // Map nodeId -> Comments
  activeCommentId: string | null;
  activeNodeId: string | null;
  isPanelOpen: boolean;
  addComment: (nodeId: string, content: string) => void;
  openPanel: (nodeId?: string | null) => void;
  closePanel: () => void;
  setActiveComment: (commentId: string | null) => void;
  togglePanel: () => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true); // Default to true

  const addComment = async (nodeId: string, content: string) => {
    // Optimistic UI update
    const tempId = nanoid();
    const newComment: Comment = {
      id: tempId,
      nodeId,
      author: {
        id: "user-1",
        name: "You",
        avatar: "https://github.com/shadcn.png",
      },
      content,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => ({
      ...prev,
      [nodeId]: [...(prev[nodeId] || []), newComment],
    }));

    // Auto open panel
    setActiveNodeId(nodeId);
    setIsPanelOpen(true);

    try {
      const res = await fetch("/api/demos/slate-doc/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId,
          content,
          author: newComment.author,
        }),
      });

      if (!res.ok) throw new Error("Failed to save comment");

      const savedComment = await res.json();
      // Replace temp comment with real one
      setComments((prev) => {
        const list = prev[nodeId] || [];
        return {
          ...prev,
          [nodeId]: list.map((c) => (c.id === tempId ? savedComment : c)),
        };
      });
    } catch (err) {
      console.error(err);
      // Revert on error (optional)
    }
  };

  // Fetch comments on mount
  React.useEffect(() => {
    fetch("/api/demos/slate-doc/comments")
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Failed to load comments", err));
  }, []);

  const openPanel = (nodeId: string | null = null) => {
    setActiveNodeId(nodeId);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setActiveNodeId(null);
    setActiveCommentId(null);
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  const setActiveComment = (commentId: string | null) => {
    setActiveCommentId(commentId);
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        activeCommentId,
        activeNodeId,
        isPanelOpen,
        addComment,
        openPanel,
        closePanel,
        setActiveComment,
        togglePanel,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComment = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useComment must be used within a CommentProvider");
  }
  return context;
};
