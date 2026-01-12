"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// 动态导入 fabric，避免 SSR 问题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fabric: any = null;

/**
 * Canvas 批注组件属性
 */
interface CanvasAnnotationProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  articleRef: React.RefObject<HTMLDivElement>;
  showToolbarOnly?: boolean; // 是否只显示工具栏
  fabricCanvasRef?: React.MutableRefObject<any>; // 用于暴露 fabric canvas 实例
}

/**
 * 画笔工具类型
 */
type ToolType = "pen" | "brush" | "eraser" | "text" | "rectangle" | "circle";

/**
 * Canvas 批注组件
 * 使用 Fabric.js 实现画布批注功能
 */
export function CanvasAnnotation({
  canvasRef,
  articleRef,
  showToolbarOnly = false,
  fabricCanvasRef: externalFabricCanvasRef,
}: CanvasAnnotationProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalFabricCanvasRef = useRef<any>(null);
  // 工具栏与画布层需要共享同一个 fabric canvas 实例：
  // - 画布层负责初始化/销毁
  // - 工具栏层只负责操作（不允许重复初始化）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricCanvasRef = (externalFabricCanvasRef ??
    internalFabricCanvasRef) as React.MutableRefObject<any>;
  const [tool, setTool] = useState<ToolType>("pen");
  const [brushWidth, setBrushWidth] = useState(3);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * 初始化 Fabric.js 画布
   */
  useEffect(() => {
    // 只允许“画布层实例”（showToolbarOnly=false）初始化 fabric，
    // 否则会在同一个 <canvas> 上重复 new fabric.Canvas(...)，导致对象丢失。
    if (showToolbarOnly) return;
    if (!canvasRef.current) return;

    // 动态加载 fabric
    const initFabric = async () => {
      if (!fabric) {
        const fabricModule = await import("fabric");
        fabric = fabricModule.fabric;
      }

      if (!canvasRef.current || !fabric) return;

      // 如果已经初始化过，直接退出，避免重复初始化覆盖对象
      if (fabricCanvasRef.current) return;

      // 获取文章容器的尺寸，如果没有则使用默认值（后续会通过 syncSize 更新）
      let initialWidth = 600;
      let initialHeight = 800;
      
      if (articleRef.current) {
        const rect = articleRef.current.getBoundingClientRect();
        initialWidth = rect.width || 600;
        initialHeight = rect.height || 800;
      }

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: initialWidth,
        height: initialHeight,
        backgroundColor: "transparent", // 透明背景
        isDrawingMode: true, // 默认启用绘制模式
      });

      fabricCanvasRef.current = canvas;

      // 设置默认画笔样式
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = brushColor;

      // 监听绘制开始
      canvas.on("path:created", () => {
        setIsDrawing(true);
      });

      // 监听绘制结束
      canvas.on("mouse:up", () => {
        setIsDrawing(false);
      });

      // 监听对象选择，确保可以选择和操作对象
      canvas.on("selection:created", () => {
        // 当选择对象时，确保不在绘制模式
        if (canvas.isDrawingMode) {
          canvas.isDrawingMode = false;
        }
      });

      canvas.on("selection:updated", () => {
        // 当更新选择时，确保不在绘制模式
        if (canvas.isDrawingMode) {
          canvas.isDrawingMode = false;
        }
      });
    };

    initFabric();

    // 清理函数
    return () => {
      if (fabricCanvasRef.current) {
        try {
          const canvas = fabricCanvasRef.current;
          // 检查 canvas 元素是否还在 DOM 中
          const canvasElement = canvas.lowerCanvasEl || canvasRef.current;
          if (canvasElement && canvasElement.parentNode) {
            // 先移除所有事件监听器
            canvas.off();
            // 然后安全地 dispose
            canvas.dispose();
          } else {
            // 如果元素已经不在 DOM 中，只清理引用
            canvas.off();
          }
        } catch (error) {
          // 忽略 dispose 错误，可能元素已经被移除
          console.warn("Canvas dispose error:", error);
        } finally {
          fabricCanvasRef.current = null;
        }
      }
    };
  }, [canvasRef, showToolbarOnly, articleRef, brushWidth, brushColor, fabricCanvasRef]);

  /**
   * 更新画笔样式
   */
  useEffect(() => {
    // 工具栏实例负责同步画笔样式；画布层实例不要写回默认值，避免覆盖用户设置
    if (!showToolbarOnly) return;
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = brushColor;
    }
  }, [brushWidth, brushColor, showToolbarOnly, fabricCanvasRef]);

  /**
   * 同步画布尺寸与文章容器尺寸
   */
  useEffect(() => {
    // 只让画布层实例负责尺寸同步，工具栏实例不要参与
    if (showToolbarOnly) return;
    if (!fabricCanvasRef.current || !articleRef.current) return;

    const syncSize = () => {
      if (!articleRef.current || !fabricCanvasRef.current) return;
      
      // 获取文章容器的实际尺寸（使用 scrollWidth/scrollHeight 获取完整内容尺寸）
      // 必须使用 scrollWidth/scrollHeight，与文章截图保持一致
      const scrollWidth = articleRef.current.scrollWidth;
      const scrollHeight = articleRef.current.scrollHeight;
      const articleRect = articleRef.current.getBoundingClientRect();
      
      // 使用 scrollWidth/scrollHeight（与 html2canvas 保持一致）
      const width = scrollWidth || articleRect.width;
      const height = scrollHeight || articleRect.height;
      
      // 确保画布尺寸完全匹配文章容器
      const currentWidth = fabricCanvasRef.current.getWidth();
      const currentHeight = fabricCanvasRef.current.getHeight();
      
      // 只有当尺寸发生变化时才更新，避免不必要的重绘
      if (Math.abs(currentWidth - width) > 1 || Math.abs(currentHeight - height) > 1) {
        fabricCanvasRef.current.setDimensions({
          width: width,
          height: height,
        });
        fabricCanvasRef.current.renderAll();
      }
    };

    // 立即执行一次
    syncSize();
    
    // 使用 ResizeObserver 监听文章容器尺寸变化
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && articleRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // 使用 requestAnimationFrame 确保在下一帧更新
        requestAnimationFrame(syncSize);
      });
      resizeObserver.observe(articleRef.current);
    }
    
    // 延迟执行，确保 DOM 已完全渲染
    const timer = setTimeout(syncSize, 200);
    
    // 监听窗口大小变化
    window.addEventListener("resize", syncSize);
    // 监听滚动事件（可能影响布局）
    window.addEventListener("scroll", syncSize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("scroll", syncSize, true);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [articleRef, showToolbarOnly, fabricCanvasRef]);

  /**
   * 切换工具
   */
  const handleToolChange = async (newTool: ToolType): Promise<void> => {
    if (!fabricCanvasRef.current) {
      // 如果 fabric 还未加载，先加载
      if (!fabric) {
        const fabricModule = await import("fabric");
        fabric = fabricModule.fabric;
      }
      return;
    }

    setTool(newTool);
    const canvas = fabricCanvasRef.current;

    // 完全禁用绘制模式，确保可以正常选择和操作对象
    canvas.isDrawingMode = false;
    
    // 清除当前选择状态（可选）
    canvas.discardActiveObject();
    canvas.renderAll();

    switch (newTool) {
      case "pen":
      case "brush":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushWidth;
        canvas.freeDrawingBrush.color = brushColor;
        // 重置橡皮擦的合成操作
        if ("globalCompositeOperation" in canvas.freeDrawingBrush) {
          (canvas.freeDrawingBrush as any).globalCompositeOperation = "source-over";
        }
        break;
      case "eraser":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushWidth;
        // 使用全局合成操作实现橡皮擦效果
        if ("globalCompositeOperation" in canvas.freeDrawingBrush) {
          (canvas.freeDrawingBrush as any).globalCompositeOperation = "destination-out";
        }
        break;
      case "text":
        // 文本工具：禁用绘制模式，允许选择和创建文本
        canvas.isDrawingMode = false;
        break;
      case "rectangle":
      case "circle":
        // 形状工具：禁用绘制模式，允许选择和创建形状
        canvas.isDrawingMode = false;
        break;
    }
  };

  /**
   * 处理画布点击（用于文本和形状工具）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCanvasClick = async (e: any): Promise<void> => {
    if (!fabricCanvasRef.current) return;
    if (!fabric) {
      const fabricModule = await import("fabric");
      fabric = fabricModule.fabric;
    }

    const canvas = fabricCanvasRef.current;
    
    // 如果点击的是已有对象，不创建新对象（允许选择和操作）
    if (e.target && e.target !== canvas) {
      return;
    }

    const pointer = canvas.getPointer(e.e);

    switch (tool) {
      case "text":
        if (!fabric) return;
        // 创建可编辑的文本对象
        const text = new fabric.IText("点击编辑文本", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: brushColor,
          editable: true,
          selectable: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        // 立即进入编辑模式
        text.enterEditing();
        canvas.renderAll();
        break;
      case "rectangle":
        if (!fabric) return;
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 100,
          height: 100,
          fill: "transparent",
          stroke: brushColor,
          strokeWidth: brushWidth,
          selectable: true,
          evented: true,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        break;
      case "circle":
        if (!fabric) return;
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 50,
          fill: "transparent",
          stroke: brushColor,
          strokeWidth: brushWidth,
          selectable: true,
          evented: true,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        break;
    }
  };

  /**
   * 绑定点击事件
   */
  useEffect(() => {
    // 只由工具栏实例根据 tool 状态绑定/解绑点击创建逻辑，画布层实例不参与
    if (!showToolbarOnly) return;
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // 确保绘制模式已正确设置
    if (tool === "text" || tool === "rectangle" || tool === "circle") {
      canvas.isDrawingMode = false; // 禁用绘制模式，允许选择和操作
      canvas.on("mouse:down", handleCanvasClick);
    } else {
      canvas.off("mouse:down", handleCanvasClick);
    }

    return () => {
      canvas.off("mouse:down", handleCanvasClick);
    };
  }, [tool, brushColor, brushWidth, showToolbarOnly, fabricCanvasRef]);

  /**
   * 清空画布
   */
  const handleClear = (): void => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
  };

  /**
   * 撤销操作
   */
  const handleUndo = (): void => {
    if (!fabricCanvasRef.current) return;
    const objects = fabricCanvasRef.current.getObjects();
    if (objects.length > 0) {
      fabricCanvasRef.current.remove(objects[objects.length - 1]);
      fabricCanvasRef.current.renderAll();
    }
  };

  // 如果只显示工具栏，返回工具栏组件
  if (showToolbarOnly) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={tool === "pen" ? "default" : "outline"}
            onClick={() => handleToolChange("pen")}
            title="画笔"
          >
            <span aria-hidden>✏️</span>
            <span className="sr-only">画笔</span>
          </Button>
          <Button
            size="sm"
            variant={tool === "brush" ? "default" : "outline"}
            onClick={() => handleToolChange("brush")}
            title="刷子"
          >
            <span aria-hidden>🖌️</span>
            <span className="sr-only">刷子</span>
          </Button>
          <Button
            size="sm"
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => handleToolChange("eraser")}
            title="橡皮擦"
          >
            <span aria-hidden>🧽</span>
            <span className="sr-only">橡皮擦</span>
          </Button>
          <Button
            size="sm"
            variant={tool === "text" ? "default" : "outline"}
            onClick={() => handleToolChange("text")}
            title="文本"
          >
            <span aria-hidden>🔤</span>
            <span className="sr-only">文本</span>
          </Button>
          <Button
            size="sm"
            variant={tool === "rectangle" ? "default" : "outline"}
            onClick={() => handleToolChange("rectangle")}
            title="矩形"
          >
            <span aria-hidden>▭</span>
            <span className="sr-only">矩形</span>
          </Button>
          <Button
            size="sm"
            variant={tool === "circle" ? "default" : "outline"}
            onClick={() => handleToolChange("circle")}
            title="圆形"
          >
            <span aria-hidden>◯</span>
            <span className="sr-only">圆形</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">颜色:</label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">粗细:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushWidth}
            onChange={(e) => setBrushWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-600 w-8">{brushWidth}px</span>
        </div>

        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={handleUndo} title="撤销">
            <span aria-hidden>↩️</span>
            <span className="sr-only">撤销</span>
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear} title="清空">
            <span aria-hidden>🗑️</span>
            <span className="sr-only">清空</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-auto">
      {/* 画布容器 - 完全覆盖文章区域 */}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full" 
      />

      {isDrawing && (
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
            正在绘制中...
          </div>
        </div>
      )}
    </div>
  );
}

