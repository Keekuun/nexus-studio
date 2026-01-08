declare module "@zumer/snapdom" {
  // SnapDOM 核心方法：返回带导出方法的对象（toPng、toBlob、toDataURL 等）
  // 这里使用简化声明以避免类型阻塞，实际类型以官方为准
  export function snapdom(
    target: HTMLElement,
    options?: Record<string, unknown>
  ): Promise<{
    toPng?: () => Promise<string | HTMLImageElement | Blob>;
    toBlob?: () => Promise<Blob>;
    toDataURL?: (type?: string) => Promise<string>;
  }>;
}

