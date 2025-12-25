"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/stores/app-store";

/**
 * 网站头部组件
 */
export function Header(): JSX.Element {
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <header className="border-b sticky top-0 left-0 right-0 bg-white z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => useAppStore.getState().setSidebarOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
          <h1 className="text-2xl font-bold">Nexus Studio</h1>
        </div>
        <nav className="hidden md:flex gap-4">
          <Button variant="ghost" asChild>
            <a href="/">首页</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/editor">编辑器</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/studio">工作室</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/ai">AI助手</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

