import React from "react";
import { cn } from "@/lib/utils";
import { Clock, Plus, FileText } from "lucide-react";
import { Descendant } from "slate";

export interface HistoryItem {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  content: Descendant[];
}

interface HistorySidebarProps {
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onNewChat: () => void;
}

export const HistorySidebar = ({
  history,
  activeId,
  onSelect,
  onNewChat,
}: HistorySidebarProps) => {
  return (
    <div className="flex h-full w-64 flex-shrink-0 flex-col overflow-hidden border-r bg-slate-50">
      <div className="border-b bg-white p-4">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          New Generation
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          History
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No history yet
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                "group cursor-pointer rounded-lg border border-transparent p-3 transition-all hover:bg-white hover:shadow-sm",
                activeId === item.id
                  ? "border-slate-200 bg-white shadow-sm ring-1 ring-blue-500/20"
                  : "hover:border-slate-100"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    activeId === item.id ? "text-blue-700" : "text-slate-700"
                  )}
                >
                  {item.title}
                </span>
                {activeId === item.id && (
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
              </div>

              <p className="mb-2 line-clamp-2 text-xs text-slate-500">
                {item.summary}
              </p>

              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock size={10} />
                <span>
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
