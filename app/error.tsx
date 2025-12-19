"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";

/**
 * 全局错误页面
 * Next.js App Router的错误边界
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    // 记录错误到错误监控服务
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold text-destructive">出现错误</h1>
        <ErrorMessage error={error.message} />
        {error.digest && (
          <p className="text-sm text-muted-foreground">
            错误ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4">
          <Button onClick={reset}>重试</Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}

