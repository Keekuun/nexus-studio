"use client";

import React, { useState, useEffect, useRef } from "react";
import { SlateEditor } from "./editor";
import { CommentProvider, useComment } from "./CommentContext";
import { CommentSidebar } from "./components/CommentSidebar";
import { HistorySidebar, HistoryItem } from "./components/HistorySidebar";
import { simulateSSE } from "./utils";
import { Descendant } from "slate";
import { Play, Send, Sparkles, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Inner component to access context
const DocContent = () => {
  const [value, setValue] = useState<Descendant[]>([
    { type: "paragraph", id: "init", children: [{ text: "" }] },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { closePanel, isPanelOpen, openPanel } = useComment();

  // Ref for auto-scrolling during stream
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [value, isStreaming]);

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
    <div className="fixed inset-0 z-[100] flex h-screen w-full overflow-hidden bg-slate-100">
      {/* Left Sidebar: History */}
      <HistorySidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* Header / Toolbar */}
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b bg-white/95 px-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
              title="Back to Home"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                Nexus Editor
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{activeHistoryId ? "History Mode" : "AI Generator"}</span>
                {isStreaming && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                    Generating...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (isPanelOpen ? closePanel() : openPanel(null))}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-50",
                isPanelOpen
                  ? "bg-slate-100 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600"
              )}
            >
              <MessageSquare size={16} />
              Comments
            </button>
            {activeHistoryId && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                Read Only
              </span>
            )}
          </div>
        </header>

        {/* Editor Scroll Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-100/50 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl pb-40">
            {/* Empty State for New Chat */}
            {!activeHistoryId &&
              !isStreaming &&
              value.length <= 1 &&
              (value[0] as { children?: { text: string }[] })?.children?.[0]
                ?.text === "" && (
                <div className="flex h-[60vh] flex-col items-center justify-center text-slate-400">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg ring-1 ring-slate-100">
                    <Sparkles size={40} className="text-blue-500" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                    Start Creating
                  </h3>
                  <p className="max-w-md text-center text-slate-500">
                    Enter a prompt below to let the AI generate a structured
                    document with rich media, or select a history item to
                    review.
                  </p>
                </div>
              )}

            {/* Document Paper */}
            {(activeHistoryId ||
              isStreaming ||
              (value.length > 0 &&
                (value[0] as any).children?.[0]?.text !== "")) && (
              <div className="min-h-[1100px] w-full rounded-sm border border-slate-200 bg-white px-8 py-12 shadow-md transition-shadow hover:shadow-lg sm:px-12 md:px-16">
                <SlateEditor
                  key={editorKey}
                  value={value}
                  onChange={(val) => setValue(val)}
                  readOnly={false} // Always allow selection for comments
                />
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </main>

        {/* Chat Input Area (Floating Island) - Only show in New Chat mode */}
        {!activeHistoryId && (
          <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center px-4">
            <div className="w-full max-w-3xl">
              <form
                onSubmit={handleSendPrompt}
                className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-100 transition-all focus-within:ring-2 focus-within:ring-blue-500/20"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <Sparkles size={18} />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isStreaming
                      ? "AI is writing..."
                      : "Describe the document you want to create..."
                  }
                  disabled={isStreaming}
                  className="flex-1 bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isStreaming}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isStreaming ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
              <div className="mt-3 text-center">
                <p className="text-xs font-medium text-slate-400 shadow-sm">
                  Powered by Nexus AI Model
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
