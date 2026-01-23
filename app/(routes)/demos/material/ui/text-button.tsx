import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 是否带下拉箭头 */
  endIcon?: "chevron-down" | "chevron-up" | "none";
}

export function TextButton({
  children,
  onClick,
  endIcon = "none",
  disabled,
  className,
  ...props
}: TextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-pink-500 transition-colors hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {endIcon === "chevron-down" && <ChevronDown className="h-4 w-4" />}
      {endIcon === "chevron-up" && <ChevronUp className="h-4 w-4" />}
    </button>
  );
}
