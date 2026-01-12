"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CanvasAnnotation } from "@/components/canvas/canvas-annotation";
import { MarkdownArticle } from "@/components/canvas/markdown-article";
import html2canvas from "html2canvas";

/**
 * Canvas 批注演示页面
 * 实现 markdown 文章展示 + fabric.js 画布批注 + 图片融合功能
 */
export default function CanvasAnnotationPage(): JSX.Element {
  const articleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null); // 用于访问 fabric canvas 实例
  const overlayRef = useRef<HTMLDivElement>(null); // 批注蒙层引用
  const [isMerging, setIsMerging] = useState(false);
  const [screenshotMethod, setScreenshotMethod] = useState<"html2canvas" | "system" | "snapdom">("html2canvas");
  const [systemScreenshotSupported, setSystemScreenshotSupported] = useState(false);
  const [snapdomSupported, setSnapdomSupported] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(true); // 批注模式开关：开时显示画布，关时便于操作视频控件
  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // 在客户端检查系统截图支持（避免 hydration 错误）
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getDisplayMedia &&
      !!window.ImageCapture;
    setSystemScreenshotSupported(supported);
  }, []);

  // 在客户端检查 snapdom 可用性（动态导入以避免 SSR 问题）
  useEffect(() => {
    let mounted = true;
    const checkSnapdom = async (): Promise<void> => {
      try {
        if (typeof window === "undefined") return;
        // 先乐观启用按钮，导入失败时仍可走降级逻辑
        if (mounted) setSnapdomSupported(true);
        await import("@zumer/snapdom");
      } catch (e) {
        console.warn("SnapDOM 动态导入失败，将在点击时降级 html2canvas:", e);
      }
    };
    checkSnapdom();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * 示例 markdown 文章内容
   */
  const sampleMarkdown = `# 深入理解 React Hooks

React Hooks 是 React 16.8 引入的新特性，它允许你在函数组件中使用状态和其他 React 特性。

## 什么是 Hooks？

Hooks 是一些特殊的函数，让你可以在函数组件中"钩入" React 的特性。它们不可以在类组件中使用。

### 常用的 Hooks

1. **useState** - 用于在函数组件中添加状态
2. **useEffect** - 用于处理副作用（如数据获取、订阅等）
3. **useContext** - 用于访问 React Context
4. **useRef** - 用于访问 DOM 元素或保存可变值

## useState 示例

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
\`\`\`

## useEffect 示例

\`\`\`javascript
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`你点击了 \${count} 次\`;
  });

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
\`\`\`

## 总结

Hooks 让函数组件变得更加强大和灵活，是现代 React 开发的标准方式。通过合理使用 Hooks，你可以编写出更加简洁和可维护的代码。

> 提示：记住 Hooks 的规则：
> - 只在最顶层调用 Hooks
> - 只在 React 函数中调用 Hooks

## 示例视频

下面是一段示例教学视频（可播放、可暂停）：

<div class="w-full aspect-video">
  <video
    controls
    width="100%"
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    crossorigin="anonymous"
  >
    您的浏览器不支持 video 标签。
  </video>
</div>
`;

  // 固定渲染的文章节点，避免切换状态时重建 DOM 导致视频回到首帧
  const memoizedArticle = useMemo(() => {
    return <MarkdownArticle content={sampleMarkdown} />;
  }, []);

  /**
   * 捕获视频首帧，返回 dataURL，并给视频打上 data-video-snapshot-id，便于 html2canvas 替换
   */
  const captureVideoFirstFrame = async (
    video: HTMLVideoElement,
    id: string
  ): Promise<string | null> => {
    try {
      // 确保跨域允许绘制
      if (!video.getAttribute("crossorigin")) {
        video.setAttribute("crossorigin", "anonymous");
      }
      
      // 等待下一帧渲染，避免 seek/暂停导致闪烁
      // 添加超时机制，避免无限等待
      try {
        if ("requestVideoFrameCallback" in video) {
          await Promise.race([
            new Promise<void>((resolve) =>
              (video as any).requestVideoFrameCallback(() => resolve())
            ),
            sleep(500), // 500ms 超时
          ]);
        } else {
          // 未支持 rVFC 时，短暂等待一帧
          await sleep(30);
        }
      } catch (e) {
        // 如果等待失败，继续执行（可能视频未播放或 API 不支持）
        console.warn("视频帧等待失败，继续截图:", e);
      }

      const width = video.videoWidth || video.clientWidth || 0;
      const height = video.videoHeight || video.clientHeight || 0;
      if (!width || !height) {
        console.warn("视频尺寸无效，跳过截图");
        return null;
      }

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        console.warn("无法创建画布上下文");
        return null;
      }
      
      try {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = tempCanvas.toDataURL("image/png");
        video.setAttribute("data-video-snapshot-id", id);
        return dataUrl;
      } catch (e) {
        // 绘制失败（可能是跨域问题），返回 null 但不阻塞整个流程
        console.warn("视频绘制失败，可能是跨域问题:", e);
        return null;
      }
    } catch (e) {
      console.warn("捕获视频帧失败:", e);
      return null;
    }
  };

  /**
   * 预处理文章内视频，获取首帧快照映射
   */
  const prepareVideoSnapshots = async (): Promise<Record<string, string>> => {
    if (!articleRef.current) return {};
    const videos = Array.from(
      articleRef.current.querySelectorAll<HTMLVideoElement>("video")
    );
    const snapshotMap: Record<string, string> = {};

    // 使用 Promise.allSettled 确保单个视频失败不会阻塞整个流程
    const results = await Promise.allSettled(
      videos.map(async (video, idx) => {
        const id = String(idx);
        const snapshot = await captureVideoFirstFrame(video, id);
        if (snapshot) {
          snapshotMap[id] = snapshot;
        }
        return { id, snapshot };
      })
    );

    // 记录失败的视频（用于调试）
    results.forEach((result, idx) => {
      if (result.status === "rejected") {
        console.warn(`视频 ${idx} 快照处理失败:`, result.reason);
      }
    });

    return snapshotMap;
  };

  /**
   * 将画布转换为图片（适配 DPR 和尺寸）
   */
  const canvasToImage = (
    canvas: any, // 可以是Fabric.js Canvas实例或HTMLCanvasElement
    targetWidth?: number,
    targetHeight?: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 检查是否是Fabric.js Canvas实例
      const isFabricCanvas =
        canvas &&
        typeof canvas.getObjects === "function" &&
        typeof canvas.renderAll === "function";

      if (isFabricCanvas) {
        const fabricCanvas = canvas;

        // 检查是否有对象
        const objects = fabricCanvas.getObjects();
        if (objects.length === 0) {
          console.warn("画布上没有批注对象");
          // 即使没有对象，也返回一个透明图片，但先检查canvas状态
        }

        // 关键：导出时不要影响页面上正在显示的 canvas（否则会出现“融合时批注闪一下/消失”）
        // 使用 fabric 的 toDataURL + multiplier 在内存中生成导出图层。
        try {
          const dpr = window.devicePixelRatio || 1;
          const fabricWidth = fabricCanvas.getWidth();
          const targetDisplayWidth = targetWidth || fabricWidth;

          // html2canvas 的输出像素通常是 displayWidth * dpr，所以这里对齐
          const multiplier = (targetDisplayWidth / fabricWidth) * dpr;

          // 先渲染一次，确保最新状态（不修改尺寸/视口）
          fabricCanvas.renderAll();

          requestAnimationFrame(() => {
            fabricCanvas.renderAll();

            const dataUrl: string = fabricCanvas.toDataURL({
              format: "png",
              multiplier,
              enableRetinaScaling: false,
            });

            if (!dataUrl) {
              reject(new Error("画布导出失败"));
              return;
            }

            resolve(dataUrl);
          });
        } catch (error) {
          console.error("获取 fabric canvas 内容失败:", error);
          reject(new Error("获取 fabric canvas 内容失败"));
        }
        return;
      }

      // 如果是普通HTML Canvas，使用普通方法
      const htmlCanvas = canvas as HTMLCanvasElement;
      const dpr = window.devicePixelRatio || 1;
      const rect = htmlCanvas.getBoundingClientRect();
      const displayWidth = targetWidth || rect.width;
      const displayHeight = targetHeight || rect.height;

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        reject(new Error("无法创建画布上下文"));
        return;
      }

      tempCanvas.width = displayWidth * dpr;
      tempCanvas.height = displayHeight * dpr;
      tempCtx.scale(dpr, dpr);
      tempCtx.drawImage(htmlCanvas, 0, 0, displayWidth, displayHeight);

      try {
        const dataUrl = tempCanvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch {
        reject(new Error("画布转换失败"));
      }
    });
  };

  /**
   * 系统级截图（使用 getDisplayMedia API）
   * @param hideOverlay - 是否隐藏批注蒙层
   */
  const systemScreenshot = async (hideOverlay = true): Promise<string> => {
    // 检查浏览器支持
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("浏览器不支持屏幕捕获 API");
    }

    if (!window.ImageCapture) {
      throw new Error("浏览器不支持 ImageCapture API（仅 Chrome/Edge 支持）");
    }

    let overlayElement: HTMLElement | null = null;
    let originalDisplay = "";

    try {
      // 1. 如果需要隐藏蒙层，临时隐藏
      if (hideOverlay && overlayRef.current) {
        overlayElement = overlayRef.current;
        originalDisplay = overlayElement.style.display;
        overlayElement.style.display = "none";
        // 等待 DOM 更新
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      // 2. 调用系统屏幕捕获 API（弹出系统截图授权窗口）
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always" as any, // 显示鼠标光标（TypeScript 类型定义可能不完整）
        } as any,
      });

      // 3. 创建视频轨道，捕获一帧画面
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      // ImageCapture.grabFrame() 返回 ImageBitmap，但类型定义可能不完整
      const bitmap = await (imageCapture as any).grabFrame() as ImageBitmap;

      // 4. 停止流（释放系统资源）
      videoTrack.stop();
      stream.getTracks().forEach((track) => track.stop());

      // 5. 裁剪到目标元素区域
      if (!articleRef.current) {
        throw new Error("文章容器未找到");
      }

      const rect = articleRef.current.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("无法创建画布上下文");
      }

      // 计算缩放比例（考虑系统截图的分辨率）
      const scale = bitmap.width / window.screen.width;
      const scrollX = window.scrollX || 0;
      const scrollY = window.scrollY || 0;

      canvas.width = rect.width;
      canvas.height = rect.height;

      // 裁剪出目标元素的区域（基于系统截图的像素）
      ctx.drawImage(
        bitmap,
        (rect.left + scrollX) * scale,
        (rect.top + scrollY) * scale,
        rect.width * scale,
        rect.height * scale,
        0,
        0,
        rect.width,
        rect.height
      );

      // 6. 恢复蒙层显示
      if (overlayElement && originalDisplay !== undefined) {
        overlayElement.style.display = originalDisplay;
      }

      // 返回系统级截图的 base64
      return canvas.toDataURL("image/png", 1.0);
    } catch (err) {
      // 确保恢复蒙层显示（即使出错）
      if (overlayElement && originalDisplay !== undefined) {
        overlayElement.style.display = originalDisplay;
      }
      throw err;
    }
  };

  /**
   * 转换 oklch 颜色为 rgb
   */
  const convertOklchToRgb = (oklchColor: string): string => {
    try {
      // 创建一个临时元素来获取转换后的颜色
      const tempDiv = document.createElement("div");
      tempDiv.style.color = oklchColor;
      tempDiv.style.position = "absolute";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      document.body.appendChild(tempDiv);
      const rgbColor = window.getComputedStyle(tempDiv).color;
      // 安全地移除元素
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      return rgbColor || "#000000";
    } catch (e) {
      return "#000000";
    }
  };

  /**
   * Blob 转 dataURL
   */
  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          resolve("");
        }
      };
      reader.readAsDataURL(blob);
    });

  /**
   * 使用 SnapDOM 截图文章
   */
  const captureArticleWithSnapdom = async (): Promise<string> => {
    if (!articleRef.current) {
      throw new Error("文章容器未找到");
    }

    // 先确保视频停留在首帧，获取快照映射
    const videoSnapshotMap = await prepareVideoSnapshots();

    const videoReplacements: Array<{ video: HTMLVideoElement; img: HTMLImageElement }> = [];

    try {
      // 1. 将视频元素替换为快照图片（SnapDOM 无法处理 video，常见表现是黑块）
      const videos = Array.from(
        articleRef.current.querySelectorAll<HTMLVideoElement>("video")
      );
      
      videos.forEach((video) => {
        const id = video.getAttribute("data-video-snapshot-id");
        if (!id) return;
        const snapshot = videoSnapshotMap[id];
        if (!snapshot) return;

        // 创建图片元素替换视频
        const img = document.createElement("img");
        img.src = snapshot;
        
        // 保持视频的样式和尺寸
        const videoStyle = window.getComputedStyle(video);
        img.style.width = videoStyle.width || "100%";
        img.style.height = videoStyle.height || "auto";
        img.style.display = "block";
        img.style.objectFit = "cover";
        img.style.borderRadius = videoStyle.borderRadius || "8px";
        img.style.border = videoStyle.border || "1px solid #e5e7eb";
        
        // 复制类名
        if (video.className) {
          img.className = video.className;
        }

        // 替换视频为图片
        if (video.parentNode) {
          video.parentNode.insertBefore(img, video);
          video.style.display = "none"; // 隐藏原视频，保留在DOM中以便恢复
          videoReplacements.push({ video, img });
        }
      });

      // 等待DOM更新
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 2. 调用 SnapDOM 截图
      // 注意：这里截图目标是 articleRef.current，批注蒙层 overlayRef 是兄弟节点，
      // 不需要（也不应该）为了“排除批注”而隐藏 overlay，否则融合时会造成页面批注闪烁/消失。
      const snapdomModule = await import("@zumer/snapdom");
      const snapdom = snapdomModule?.snapdom;
      if (!snapdom) {
        throw new Error("SnapDOM 模块加载失败");
      }

      const result = await snapdom(articleRef.current, {
        backgroundColor: "#ffffff",
      });

      let dataUrl = "";

      // 优先使用 toDataURL（若存在）
      if (typeof result?.toDataURL === "function") {
        dataUrl = await result.toDataURL("image/png");
      }

      // 尝试 toPng
      if (!dataUrl && typeof result?.toPng === "function") {
        const pngResult = await result.toPng();
        if (typeof pngResult === "string") {
          dataUrl = pngResult;
        } else if (pngResult instanceof HTMLImageElement && pngResult.src) {
          dataUrl = pngResult.src;
        } else if (pngResult instanceof Blob) {
          dataUrl = await blobToDataUrl(pngResult);
        }
      }

      // 尝试 toBlob
      if (!dataUrl && typeof result?.toBlob === "function") {
        const blob = await result.toBlob();
        if (blob) {
          dataUrl = await blobToDataUrl(blob);
        }
      }

      if (!dataUrl) {
        throw new Error("SnapDOM 未返回有效的图片数据");
      }

      return dataUrl;
    } finally {
      // 3. 恢复视频元素
      videoReplacements.forEach(({ video, img }) => {
        if (video.parentNode && img.parentNode) {
          video.style.display = ""; // 恢复显示
          img.parentNode.removeChild(img); // 移除临时图片
        }
      });
    }
  };

  /**
   * 将文章页面截图（支持多种方式）
   */
  const captureArticle = async (): Promise<string> => {
    if (!articleRef.current) {
      throw new Error("文章容器未找到");
    }

    // 根据选择的截图方式执行
    switch (screenshotMethod) {
      case "system":
        try {
          return await systemScreenshot(true); // 隐藏蒙层
        } catch (err) {
          console.warn("系统截图失败，降级到 html2canvas:", err);
          return captureArticleWithHtml2Canvas();
        }
      case "snapdom":
        try {
          return await captureArticleWithSnapdom();
        } catch (err) {
          console.warn("SnapDOM 截图失败，降级到 html2canvas:", err);
          return captureArticleWithHtml2Canvas();
        }
      case "html2canvas":
      default:
        return captureArticleWithHtml2Canvas();
    }
  };

  /**
   * 使用 html2canvas 截图文章
   */
  const captureArticleWithHtml2Canvas = async (): Promise<string> => {
    if (!articleRef.current) {
      throw new Error("文章容器未找到");
    }

    // 预处理视频首帧，供 html2canvas 使用
    // 即使视频处理失败，也继续截图流程
    let videoSnapshotMap: Record<string, string> = {};
    try {
      videoSnapshotMap = await prepareVideoSnapshots();
    } catch (error) {
      console.warn("视频快照预处理失败，继续截图（视频可能显示为空白）:", error);
    }

    // 获取容器的实际尺寸和位置
    const rect = articleRef.current.getBoundingClientRect();
    const scrollHeight = articleRef.current.scrollHeight;
    const scrollWidth = articleRef.current.scrollWidth;
    
    // 获取设备像素比，确保截图清晰度
    const dpr = window.devicePixelRatio || 1;
    
    // 等待内容完全渲染
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // 等待下一帧，确保所有渲染完成
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(articleRef.current, {
      backgroundColor: "#ffffff",
      useCORS: true,
      scale: dpr, // 使用设备像素比，确保清晰度
      allowTaint: true,
      logging: false, // 禁用日志，减少错误输出
      width: scrollWidth || rect.width, // 使用实际内容宽度（scrollWidth）
      height: scrollHeight || rect.height, // 使用实际内容高度（scrollHeight）
      windowWidth: scrollWidth || rect.width,
      windowHeight: scrollHeight || rect.height,
      scrollX: 0,
      scrollY: 0,
      x: 0, // 确保从容器左上角开始
      y: 0,
      // 在克隆文档中处理 oklch 颜色 - 只转换颜色属性，保留布局
      onclone: (clonedDoc, element) => {
        // 第一步：移除所有样式表链接和 style 标签，避免 html2canvas 解析样式表中的 oklch
        const styleSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
        styleSheets.forEach((sheet) => {
          sheet.remove();
        });
        
        // 第二步：转换关键样式（颜色 + 段落间距），尽量保持原有布局
        const allElements = clonedDoc.querySelectorAll("*");
        const originalElements = articleRef.current?.querySelectorAll("*") || [];
        
        allElements.forEach((clonedElement, index) => {
          const htmlElement = clonedElement as HTMLElement;
          const originalElement = originalElements[index] as HTMLElement;
          
          if (!originalElement) return;
          
          try {
            // 获取原始元素的计算样式
            const computedStyle = window.getComputedStyle(originalElement);
            
            // 颜色相关属性
            const colorProperties = [
              'backgroundColor',
              'color',
              'borderColor',
              'borderTopColor',
              'borderRightColor',
              'borderBottomColor',
              'borderLeftColor',
              'outlineColor',
              'textDecorationColor',
              'columnRuleColor',
            ];

            // 段落和排版相关属性（解决 html2canvas 截图段落间距缺失问题）
            const spacingProperties = [
              'margin',
              'marginTop',
              'marginBottom',
              'padding',
              'paddingTop',
              'paddingBottom',
              'lineHeight',
              'fontSize',
              'fontFamily',
              'fontWeight',
              'fontStyle',
            ];
            
            colorProperties.forEach((prop) => {
              try {
                const value = computedStyle.getPropertyValue(prop);
                if (value && (value.includes('oklch') || value.includes('color('))) {
                  // 创建临时元素来获取转换后的颜色
                  const tempDiv = document.createElement("div");
                  tempDiv.style.setProperty(prop, value);
                  tempDiv.style.position = "absolute";
                  tempDiv.style.visibility = "hidden";
                  tempDiv.style.top = "-9999px";
                  document.body.appendChild(tempDiv);
                  const rgbValue = window.getComputedStyle(tempDiv).getPropertyValue(prop);
                  if (rgbValue && rgbValue !== 'rgba(0, 0, 0, 0)' && rgbValue !== 'none') {
                    htmlElement.style.setProperty(prop, rgbValue);
                  }
                  // 安全地移除元素
                  if (tempDiv.parentNode) {
                    tempDiv.parentNode.removeChild(tempDiv);
                  }
                } else if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
                  // 对于非 oklch 的颜色值，直接应用
                  htmlElement.style.setProperty(prop, value);
                }
              } catch (e) {
                // 忽略单个属性错误
              }
            });

            // 应用段落与排版相关属性，保持行距和间距
            spacingProperties.forEach((prop) => {
              try {
                const value = computedStyle.getPropertyValue(prop);
                if (value && !htmlElement.style.getPropertyValue(prop)) {
                  htmlElement.style.setProperty(prop, value);
                }
              } catch (e) {
                // 忽略错误
              }
            });
          } catch (e) {
            // 忽略元素处理错误
          }
        });

        // 第三步：将视频替换为首帧图片，避免 html2canvas 捕获空白
        const clonedVideos = clonedDoc.querySelectorAll("video[data-video-snapshot-id]");
        clonedVideos.forEach((clonedVideo) => {
          const id = clonedVideo.getAttribute("data-video-snapshot-id");
          if (!id) return;
          const snapshot = videoSnapshotMap[id];
          if (!snapshot) return;

          const img = clonedDoc.createElement("img");
          img.src = snapshot;
          img.style.width =
            clonedVideo.getAttribute("width") !== null
              ? `${clonedVideo.getAttribute("width")}px`
              : "100%";
          img.style.height =
            clonedVideo.getAttribute("height") !== null
              ? `${clonedVideo.getAttribute("height")}px`
              : "auto";
          img.style.display = "block";
          img.className = clonedVideo.getAttribute("class") || "";

          clonedVideo.replaceWith(img);
        });
      },
      // 忽略某些可能导致问题的元素
      ignoreElements: (element) => {
        // 忽略 canvas 元素（避免递归截图）
        return element.tagName === "CANVAS";
      },
    });

    return canvas.toDataURL("image/png");
  };

  /**
   * 安全加载图片，避免空 src 导致卡住
   */
  const loadImage = (src: string, timeoutMs = 8000): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error("图片地址为空"));
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      const timer = setTimeout(() => {
        reject(new Error("图片加载超时"));
      }, timeoutMs);
      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error("图片加载失败"));
      };
      img.src = src;
    });

  /**
   * 融合两张图片
   */
  const mergeImages = async (
    articleImage: string,
    canvasImage: string
  ): Promise<string> => {
    const img1 = await loadImage(articleImage);
    const img2 = await loadImage(canvasImage);

    // 创建画布，使用文章截图的尺寸
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法创建画布上下文");
    }

    canvas.width = img1.width;
    canvas.height = img1.height;

    // 绘制背景与批注
    ctx.drawImage(img1, 0, 0);
    ctx.drawImage(img2, 0, 0, img1.width, img1.height);

    return canvas.toDataURL("image/png");
  };

  /**
   * 下载图片
   */
  const downloadImage = (imageUrl: string, filename: string): void => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    // 延迟移除，确保下载已开始
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      // 清理对象 URL
      if (imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    }, 100);
  };

  /**
   * 处理融合图片
   */
  const handleMerge = async (): Promise<void> => {
    setIsMerging(true);
    try {
      if (!canvasRef.current || !fabricCanvasRef.current) {
        throw new Error("请先在画布上添加批注");
      }

      // 1. 先获取文章容器的实际尺寸（用于对齐画布）
      // 必须使用与 html2canvas 相同的尺寸计算方式
      if (!articleRef.current) {
        throw new Error("文章容器未找到");
      }
      const articleRect = articleRef.current.getBoundingClientRect();
      const articleScrollWidth = articleRef.current.scrollWidth;
      const articleScrollHeight = articleRef.current.scrollHeight;
      // 使用与 captureArticle 中相同的计算方式
      const articleWidth = articleScrollWidth || articleRect.width;
      const articleHeight = articleScrollHeight || articleRect.height;

      // 2. 先获取画布图片（此时overlay必须保持可见，确保fabric canvas完全渲染）
      // 确保画布已完全渲染（不改变画布尺寸，避免对象丢失）
      const fabricCanvas = fabricCanvasRef.current;

      // 强制渲染多次，确保所有对象都显示
      fabricCanvas.renderAll();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      fabricCanvas.renderAll();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 100));
      fabricCanvas.renderAll();

      // 获取画布图片，使用 canvasToImage 的缩放功能处理尺寸差异
      // 不改变画布尺寸，避免批注对象丢失
      const canvasImage = await canvasToImage(
        fabricCanvas,
        articleWidth,
        articleHeight
      );
      if (!canvasImage) {
        throw new Error("无法获取画布图片");
      }

      // 3. 截图文章页面（使用不隐藏overlay的截图方法）
      // 重要：确保overlay保持可见，避免影响fabric canvas的渲染状态
      let articleImage: string;
      switch (screenshotMethod) {
        case "system":
          // 系统截图时不隐藏overlay，避免影响fabric canvas
          articleImage = await systemScreenshot(false); // false = 不隐藏overlay
          break;
        case "snapdom":
          // SnapDOM截图时会临时处理overlay，但不影响已获取的canvas图片
          articleImage = await captureArticleWithSnapdom();
          break;
        case "html2canvas":
        default:
          // html2canvas截图时不隐藏overlay
          articleImage = await captureArticleWithHtml2Canvas();
          break;
      }

      if (!articleImage) {
        throw new Error("文章截图失败");
      }

      // 4. 融合两张图片
      const mergedImage = await mergeImages(articleImage, canvasImage);

      // 5. 下载融合后的图片
      downloadImage(mergedImage, `merged-${Date.now()}.png`);

      alert("图片融合成功！已开始下载");
    } catch (error) {
      console.error("融合图片失败:", error);
      alert(`融合图片失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsMerging(false);
    }
  };

  /**
   * 保存画布批注（单独保存）
   */
  const handleSaveCanvas = async (): Promise<void> => {
    if (!fabricCanvasRef.current) {
      alert("画布未初始化");
      return;
    }

    try {
      // 传入fabric canvas实例，而不是HTML canvas元素
      const canvasImage = await canvasToImage(fabricCanvasRef.current);
      if (canvasImage) {
        downloadImage(canvasImage, `annotation-${Date.now()}.png`);
        alert("画布批注已保存！");
      }
    } catch (error) {
      console.error("保存画布失败:", error);
      alert(`保存画布失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  /**
   * 截图文章页面（单独保存）
   */
  const handleCaptureArticle = async (): Promise<void> => {
    try {
      console.log("开始截图文章...");

      // 根据选择的截图方式执行，但不隐藏overlay以避免影响fabric canvas
      let articleImage: string;
      switch (screenshotMethod) {
        case "system":
          // 系统截图时不隐藏overlay，避免影响fabric canvas
          articleImage = await systemScreenshot(false); // false = 不隐藏overlay
          break;
        case "snapdom":
          // SnapDOM截图时会临时处理overlay
          articleImage = await captureArticleWithSnapdom();
          break;
        case "html2canvas":
        default:
          // html2canvas截图时不隐藏overlay
          articleImage = await captureArticleWithHtml2Canvas();
          break;
      }

      if (!articleImage) {
        throw new Error("截图结果为空");
      }
      console.log("截图完成，开始下载...");
      downloadImage(articleImage, `article-${Date.now()}.png`);
      alert("文章截图已保存！");
    } catch (error) {
      console.error("截图失败:", error);
      alert(`截图失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Canvas 批注演示</h1>
          <p className="text-muted-foreground">
            Markdown 文章展示 + Fabric.js 画布批注 + 图片融合功能
          </p>
        </div>
      </div>

      {/* 悬浮操作面板：桌面端固定，移动端依旧随文档流排布 */}
      <div
        className="z-30 sticky top-4 lg:top-24 self-end flex flex-col gap-2 p-3 bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-full max-w-xl"
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCaptureArticle} variant="outline" title="截图文章">
            截图文章
          </Button>
          <Button onClick={handleSaveCanvas} variant="outline" title="保存批注">
            保存批注
          </Button>
          <Button onClick={handleMerge} disabled={isMerging} title="融合图片">
            {isMerging ? "融合中..." : "融合图片"}
          </Button>
          <Button
            variant={isAnnotating ? "default" : "outline"}
            onClick={() => setIsAnnotating((v) => !v)}
            title={isAnnotating ? "退出批注以操作视频控件" : "进入批注模式"}
          >
            <span aria-hidden>{isAnnotating ? "✋" : "✏️"}</span>
            <span className="sr-only">{isAnnotating ? "退出批注" : "进入批注"}</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">截图方式：</span>
          <Button
            variant={screenshotMethod === "html2canvas" ? "default" : "outline"}
            size="sm"
            onClick={() => setScreenshotMethod("html2canvas")}
            title="使用 html2canvas 截图"
          >
            html2canvas
          </Button>
          <Button
            variant={screenshotMethod === "snapdom" ? "default" : "outline"}
            size="sm"
            onClick={() => setScreenshotMethod("snapdom")}
            disabled={!snapdomSupported}
            title={
              snapdomSupported
                ? "使用 SnapDOM 截图（实验）"
                : "SnapDOM 未加载或浏览器不支持"
            }
          >
            SnapDOM
          </Button>
          <Button
            variant={screenshotMethod === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setScreenshotMethod("system")}
            disabled={!systemScreenshotSupported}
            title={
              !systemScreenshotSupported
                ? "浏览器不支持系统截图（仅 Chrome/Edge 支持）"
                : "需要授权屏幕共享权限"
            }
          >
            系统截图
          </Button>
        </div>
      </div>

      {/* 文章容器 + 画布蒙层 */}
      <div className="space-y-4">
        {isAnnotating ? (
          <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
              <CanvasAnnotation
                canvasRef={canvasRef}
                articleRef={articleRef}
                showToolbarOnly={true}
                fabricCanvasRef={fabricCanvasRef}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* 工具栏 - 放在标题旁边 */}
            <div className="flex flex-wrap items-center gap-2">
              <CanvasAnnotation
                canvasRef={canvasRef}
                articleRef={articleRef}
                showToolbarOnly={true}
                fabricCanvasRef={fabricCanvasRef}
              />
            </div>
          </div>
        )}
        <div className="relative">
          {/* 文章内容 */}
          <div
            ref={articleRef}
            className="bg-white p-6 rounded-lg shadow-md border relative"
          >
            {memoizedArticle}
          </div>

          {/* 画布蒙层 - 覆盖在文章上方，完全匹配文章容器尺寸 */}
          <div
            ref={overlayRef}
            className={`absolute inset-0 transition-opacity duration-150 ${
              isAnnotating ? "opacity-100" : "opacity-0"
            }`}
            style={{
              pointerEvents: isAnnotating ? "auto" : "none",
              visibility: isAnnotating ? "visible" : "hidden",
            }}
          >
            <CanvasAnnotation
              canvasRef={canvasRef}
              articleRef={articleRef}
              showToolbarOnly={false}
              fabricCanvasRef={fabricCanvasRef}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          使用说明：
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>直接在文章上使用画笔工具进行标记或批注（画布覆盖在文章上方）</li>
          <li>点击“保存批注”可以单独保存画布批注（透明背景）</li>
          <li>点击“截图文章”可以单独保存文章页面截图</li>
          <li>点击“融合图片”可以将文章截图和画布批注融合为一张图片</li>
        </ul>
      </div>
    </div>
  );
}

