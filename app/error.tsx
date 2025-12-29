"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";

/**
 * 全局错误页面
 * Next.js App Router的错误边界
 * 
 * Next.js 15 要求错误边界组件必须导出特定的 props 类型
 */
type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到错误监控服务
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen p-8">
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

