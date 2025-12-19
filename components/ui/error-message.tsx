import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

/**
 * 错误消息组件Props接口
 */
export interface ErrorMessageProps {
  error: string | Error | null;
  className?: string;
  onDismiss?: () => void;
}

/**
 * 错误消息组件
 * 显示错误信息
 */
export function ErrorMessage({ error, className, onDismiss }: ErrorMessageProps): JSX.Element | null {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div
      className={cn(
        "rounded-lg border border-destructive bg-destructive/10 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-1">错误</h3>
          <p className="text-sm text-destructive/90">{errorMessage}</p>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            关闭
          </Button>
        )}
      </div>
    </div>
  );
}

