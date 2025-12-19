import { cn } from "@/lib/utils/cn";

/**
 * 加载组件Props接口
 */
export interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

/**
 * 加载组件
 * 显示加载状态指示器
 */
export function Loading({ className, size = "md", text }: LoadingProps): JSX.Element {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

