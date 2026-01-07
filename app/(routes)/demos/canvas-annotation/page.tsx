"use client";

import { useState, useRef } from "react";
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
  const [isMerging, setIsMerging] = useState(false);

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
`;

  /**
   * 将画布转换为图片（适配 DPR 和尺寸）
   */
  const canvasToImage = (
    canvas: HTMLCanvasElement,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      // 如果 fabric canvas 可用，使用 fabric 的方法获取内容
      if (fabricCanvasRef.current) {
        const fabricCanvas = fabricCanvasRef.current;
        
        // 获取设备像素比
        const dpr = window.devicePixelRatio || 1;
        
        // 获取目标尺寸
        const displayWidth = targetWidth || fabricCanvas.getWidth();
        const displayHeight = targetHeight || fabricCanvas.getHeight();
        
        // 使用 fabric canvas 的 toDataURL 方法，但需要调整尺寸
        // 先创建一个临时画布
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        
        if (!tempCtx) {
          resolve("");
          return;
        }
        
        // 设置临时画布的实际分辨率（考虑 DPR，与 html2canvas 保持一致）
        tempCanvas.width = displayWidth * dpr;
        tempCanvas.height = displayHeight * dpr;
        
        // 缩放上下文以适配 DPR
        tempCtx.scale(dpr, dpr);
        
        // 获取 fabric canvas 的底层 canvas
        const fabricLowerCanvas = fabricCanvas.lowerCanvasEl || canvas;
        const fabricWidth = fabricCanvas.getWidth();
        const fabricHeight = fabricCanvas.getHeight();
        
        // 如果尺寸不一致，进行缩放
        if (fabricWidth !== displayWidth || fabricHeight !== displayHeight) {
          tempCtx.drawImage(fabricLowerCanvas, 0, 0, fabricWidth, fabricHeight, 0, 0, displayWidth, displayHeight);
        } else {
          tempCtx.drawImage(fabricLowerCanvas, 0, 0, displayWidth, displayHeight);
        }
        
        // 生成截图
        tempCanvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              resolve("");
            }
          },
          "image/png"
        );
        return;
      }
      
      // 如果没有 fabric canvas，使用普通方法
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = targetWidth || rect.width;
      const displayHeight = targetHeight || rect.height;
      
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      
      if (!tempCtx) {
        resolve("");
        return;
      }
      
      tempCanvas.width = displayWidth * dpr;
      tempCanvas.height = displayHeight * dpr;
      tempCtx.scale(dpr, dpr);
      tempCtx.drawImage(canvas, 0, 0, displayWidth, displayHeight);
      
      tempCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve("");
          }
        },
        "image/png"
      );
    });
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
   * 将文章页面截图
   */
  const captureArticle = async (): Promise<string> => {
    if (!articleRef.current) {
      throw new Error("文章容器未找到");
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
        
        // 第二步：只转换颜色相关的属性，保留原有的布局样式
        const allElements = clonedDoc.querySelectorAll("*");
        const originalElements = articleRef.current?.querySelectorAll("*") || [];
        
        allElements.forEach((clonedElement, index) => {
          const htmlElement = clonedElement as HTMLElement;
          const originalElement = originalElements[index] as HTMLElement;
          
          if (!originalElement) return;
          
          try {
            // 获取原始元素的计算样式
            const computedStyle = window.getComputedStyle(originalElement);
            
            // 只转换颜色相关的属性，避免破坏布局
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
            
            // 保留字体相关属性（但不强制覆盖，避免破坏布局）
            const fontProperties = ['fontSize', 'fontFamily', 'fontWeight', 'fontStyle'];
            fontProperties.forEach((prop) => {
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
   * 融合两张图片
   */
  const mergeImages = async (
    articleImage: string,
    canvasImage: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img1 = new Image();
      const img2 = new Image();

      img1.crossOrigin = "anonymous";
      img2.crossOrigin = "anonymous";

      let loadedCount = 0;
      const onLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          // 创建画布，使用文章截图的尺寸
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("无法创建画布上下文"));
            return;
          }

          // 使用文章截图的尺寸作为画布尺寸（确保对齐）
          canvas.width = img1.width;
          canvas.height = img1.height;

          // 先绘制文章截图（作为背景）
          ctx.drawImage(img1, 0, 0);

          // 再绘制画布批注（透明背景，叠加在上面）
          // 确保画布批注的尺寸与文章截图完全一致
          ctx.drawImage(img2, 0, 0, img1.width, img1.height);

          // 转换为图片
          const mergedImage = canvas.toDataURL("image/png");
          resolve(mergedImage);
        }
      };

      img1.onload = onLoad;
      img2.onload = onLoad;
      img1.onerror = () => reject(new Error("加载文章图片失败"));
      img2.onerror = () => reject(new Error("加载画布图片失败"));

      img1.src = articleImage;
      img2.src = canvasImage;
    });
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
    if (!canvasRef.current) {
      alert("请先在画布上添加批注");
      return;
    }

    setIsMerging(true);
    try {
      // 1. 先截图文章页面，获取实际尺寸
      const articleImage = await captureArticle();
      
      // 2. 获取文章容器的实际尺寸（用于对齐画布）
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
      
      // 3. 确保画布尺寸与文章容器一致（在截图前同步）
      if (fabricCanvasRef.current) {
        const fabricCanvas = fabricCanvasRef.current;
        const currentWidth = fabricCanvas.getWidth();
        const currentHeight = fabricCanvas.getHeight();
        
        // 如果尺寸不一致，立即同步
        if (Math.abs(currentWidth - articleWidth) > 1 || Math.abs(currentHeight - articleHeight) > 1) {
          fabricCanvas.setDimensions({
            width: articleWidth,
            height: articleHeight,
          });
          fabricCanvas.renderAll();
        }
      }
      
      // 等待画布渲染完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // 4. 获取画布图片，确保尺寸与文章截图完全一致
      const canvasImage = await canvasToImage(
        canvasRef.current,
        articleWidth,
        articleHeight
      );

      if (!canvasImage) {
        throw new Error("无法获取画布图片");
      }

      // 4. 融合两张图片
      const mergedImage = await mergeImages(articleImage, canvasImage);

      // 4. 下载融合后的图片
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
    if (!canvasRef.current) {
      alert("画布未初始化");
      return;
    }

    try {
      const canvasImage = await canvasToImage(canvasRef.current);
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
      const articleImage = await captureArticle();
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
        <div className="flex gap-2">
          <Button onClick={handleCaptureArticle} variant="outline">
            截图文章
          </Button>
          <Button onClick={handleSaveCanvas} variant="outline">
            保存批注
          </Button>
          <Button onClick={handleMerge} disabled={isMerging}>
            {isMerging ? "融合中..." : "融合图片"}
          </Button>
        </div>
      </div>

      {/* 文章容器 + 画布蒙层 */}
      <div className="space-y-4">
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
        <div className="relative">
          {/* 文章内容 */}
          <div
            ref={articleRef}
            className="bg-white p-6 rounded-lg shadow-md border relative"
          >
            <MarkdownArticle content={sampleMarkdown} />
          </div>

          {/* 画布蒙层 - 覆盖在文章上方，完全匹配文章容器尺寸 */}
          <div className="absolute inset-0 pointer-events-none">
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
          <li>点击"保存批注"可以单独保存画布批注（透明背景）</li>
          <li>点击"截图文章"可以单独保存文章页面截图</li>
          <li>点击"融合图片"可以将文章截图和画布批注融合为一张图片</li>
        </ul>
      </div>
    </div>
  );
}

