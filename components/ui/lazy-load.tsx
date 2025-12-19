"use client";

import { Suspense, type ReactNode } from "react";
import { Loading } from "./loading";

/**
 * 懒加载包装器组件
 * 提供组件懒加载和加载状态显示
 * 使用方式：配合Next.js的dynamic导入使用
 */
export interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 懒加载包装器
 * 用于包装懒加载的组件，提供加载状态
 */
export function LazyLoad({ children, fallback }: LazyLoadProps): JSX.Element {
  return <Suspense fallback={fallback || <Loading />}>{children}</Suspense>;
}

