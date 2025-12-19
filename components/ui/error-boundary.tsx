"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * 错误边界组件Props接口
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * 错误边界组件State接口
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的JavaScript错误，记录这些错误，并显示降级UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <h2 className="text-2xl font-bold text-destructive">出现错误</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {this.state.error?.message || "发生了未知错误"}
          </p>
          <Button onClick={this.handleReset}>重试</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

