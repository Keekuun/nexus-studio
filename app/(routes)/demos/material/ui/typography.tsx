import React from "react";
import { cn } from "@/lib/utils";

export type TypographyVariant =
  | "h1" // 一级标题
  | "h2" // 二级标题
  | "h3" // 三级标题
  | "h4" // 四级标题
  | "h5" // 五级标题
  | "h6" // 六级标题
  | "subtitle" // 副标题
  | "body" // 正文
  | "caption"; // 说明文字

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** 文本内容 */
  children: React.ReactNode;
  /** 排版变体 */
  variant: TypographyVariant;
  /** 语义化标签 (可选，默认根据 variant 映射) */
  component?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  /** 文本颜色 (可选) */
  color?: "primary" | "secondary" | "tertiary" | "inherit";
}

const variantMapping: Record<TypographyVariant, string> = {
  h1: "text-4xl font-bold tracking-tight text-foreground", // 一级标题
  h2: "text-2xl font-semibold tracking-tight text-foreground", // 二级标题
  h3: "text-xl font-semibold tracking-tight text-foreground", // 三级标题
  h4: "text-lg font-medium text-foreground", // 四级标题
  h5: "text-base font-medium text-foreground", // 五级标题
  h6: "text-sm font-medium text-foreground", // 六级标题
  subtitle: "text-sm text-muted-foreground", // 副标题
  body: "text-base text-foreground leading-relaxed", // 正文
  caption: "text-xs text-muted-foreground", // 说明文字
};

const defaultComponentMapping: Record<TypographyVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle: "p",
  body: "p",
  caption: "span",
};

export function Typography({
  children,
  variant,
  component,
  color = "inherit",
  className,
  ...props
}: TypographyProps) {
  const Component = component || defaultComponentMapping[variant] || "div";

  const colorClass =
    color === "inherit"
      ? ""
      : color === "primary"
        ? "text-primary"
        : color === "secondary"
          ? "text-secondary-foreground"
          : color === "tertiary"
            ? "text-muted-foreground"
            : "";

  return (
    <Component
      className={cn(variantMapping[variant], colorClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
}
