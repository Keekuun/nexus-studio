"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";

/**
 * 侧边栏组件Props接口
 */
export interface SidebarProps {
  className?: string;
}

/**
 * 侧边栏组件
 */
export function Sidebar({ className }: SidebarProps): JSX.Element {
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform block md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
        className
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nexus Studio</h2>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            关闭
          </Button>
        </div>
        <nav className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/">首页</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/editor">编辑器</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/studio">工作室</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/ai">AI助手</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/demos">案例演示</Link>
          </Button>
        </nav>
      </div>
    </aside>
  );
}

