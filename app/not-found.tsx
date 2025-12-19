"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * 404页面
 */
export default function NotFound(): JSX.Element {
  const handleBack = (): void => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">页面未找到</h2>
        <p className="text-muted-foreground">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
          <Button variant="outline" onClick={handleBack}>
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  );
}

