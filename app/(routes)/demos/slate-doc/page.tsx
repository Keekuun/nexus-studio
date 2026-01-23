"use client";

import React, { useState, useEffect } from "react";
import { SlateEditor } from "./editor";
import { CommentProvider, useComment } from "./CommentContext";
import { CommentSidebar } from "./components/CommentSidebar";
import { HistorySidebar, HistoryItem } from "./components/HistorySidebar";
import { simulateSSE } from "./utils";
import { Descendant } from "slate";
import { Play, Send } from "lucide-react";

// Inner component to access context
const DocContent = () => {
  const [value, setValue] = useState<Descendant[]>([
    { type: "paragraph", id: "init", children: [{ text: "" }] },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { closePanel } = useComment();

  // Load history on mount
  useEffect(() => {
    fetch("/api/demos/slate-doc/history")
      .then((res) => res.json())
      .then((data: HistoryItem[]) => {
        setHistory(data);
        // Automatically select the latest history item if available
        if (data.length > 0) {
          setActiveHistoryId(data[0].id);
          setValue(data[0].content);
        }
      })
      .catch((err) => console.error("Failed to load history", err));
  }, []);

  const handleNewChat = () => {
    // Enter "New Chat" mode but wait for user input
    setActiveHistoryId(null);
    setValue([{ type: "paragraph", id: "init", children: [{ text: "" }] }]);
    setIsStreaming(false);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    if (isStreaming) return; // Prevent switching while streaming
    setActiveHistoryId(item.id);
    setValue(item.content);
    closePanel();
  };

  const handleSendPrompt = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isStreaming) return;

    startStream(prompt);
    setPrompt("");
  };

  const startStream = (userPrompt: string = "Restart") => {
    setIsStreaming(true);
    setValue([]); // Clear
    closePanel(); // Close comments

    simulateSSE(
      userPrompt,
      (nodes) => {
        setValue(nodes);
      },
      () => {
        setIsStreaming(false);
        // In a real app, we would refresh the history list here after save
      }
    );
  };

  // Generate a key to force re-mount Slate when switching contexts
  // Use activeHistoryId, or 'stream' when streaming/new chat
  const editorKey = activeHistoryId || "stream-session";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Left Sidebar: History */}
      <HistorySidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        {/* Header / Toolbar */}
        <header className="z-10 flex h-14 flex-shrink-0 items-center justify-between border-b bg-white/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>Slate.js Smart Doc</span>
            {activeHistoryId && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                Read Only (History)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Only show stream button if we are in "New Chat" mode or manually triggered */}
            {/* {!activeHistoryId && ( ... removed restart button, relying on chat input ... )} */}
          </div>
        </header>

        {/* Editor Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8 pb-24">
          <div className="mx-auto">
            {/* Empty State for New Chat */}
            {!activeHistoryId &&
              !isStreaming &&
              value.length <= 1 &&
              (value[0] as { children?: { text: string }[] })?.children?.[0]
                ?.text === "" && (
                <div className="flex h-[50vh] flex-col items-center justify-center text-slate-400">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                    <Play size={32} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-slate-900">
                    Start a New Generation
                  </h3>
                  <p className="max-w-md text-center text-sm">
                    Enter a prompt below to generate a new document using the
                    simulated LLM stream.
                  </p>
                </div>
              )}

            <SlateEditor
              key={editorKey}
              value={value}
              onChange={(val) => setValue(val)}
              readOnly={false} // Always allow selection for comments
            />
          </div>
        </main>

        {/* Chat Input Area (Fixed at bottom) - Only show in New Chat mode */}
        {!activeHistoryId && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent p-6">
            <div className="mx-auto max-w-3xl">
              <form
                onSubmit={handleSendPrompt}
                className="relative overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isStreaming
                      ? "Generating..."
                      : "Describe what you want to write..."
                  }
                  disabled={isStreaming}
                  className="w-full px-4 py-4 pr-12 text-base outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isStreaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-2 text-center">
                <p className="text-xs text-slate-400">
                  AI-generated content may contain errors. Please review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: Comments (Overlay) */}
      <CommentSidebar />
    </div>
  );
};

export default function SlateDocPage() {
  return (
    <CommentProvider>
      <DocContent />
    </CommentProvider>
  );
}
