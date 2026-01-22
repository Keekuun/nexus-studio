'use client';

import React, { useEffect, useState } from 'react';
import { MarkdownPrimitive } from '../components/ui/primitives/MarkdownPrimitive';

export default function TechnicalSpecPage() {
  const content = `
# 仿飞书文档 (Feishu Doc) 编辑器技术方案

## 1. 项目概述
本项目旨在构建一个高交互性、富文本与结构化数据深度融合的文档编辑器。核心目标是实现类似飞书文档的体验，包括：
*   **所见即所得 (WYSIWYG)** 的富文本编辑。
*   **复杂卡片与结构化内容** 的嵌入（如分镜表、Brief 卡片）。
*   **细粒度的交互能力**：支持对文档内任意元素（包括嵌套在卡片内部的标题、图片、表格单元格）进行精准的 Hover 框选和评论批注。

## 2. 技术架构

### 2.1 技术栈
*   **核心引擎**: [Tiptap](https://tiptap.dev/) (基于 Prosemirror) - 提供强大的 Headless 编辑器能力。
*   **视图层**: **React** - 用于渲染复杂的自定义节点 (Node Views)。
*   **样式方案**: **Tailwind CSS** - 原子化 CSS，便于构建统一的设计系统。
*   **基础组件**: 自研 Primitives - 确保原子组件与组合组件视觉一致性。

### 2.2 架构分层图

\`\`\`mermaid
graph TD
    subgraph Editor_Core ["编辑器核心层"]
        Tiptap_Engine["Tiptap Engine"]
        Extensions_Registry["Extension Registry"]
        State_Manager["Editor State (JSON/Yjs)"]
    end

    subgraph Interaction_Layer ["交互层 DocEditor"]
        Event_Delegation["全局事件代理<br/>MouseMove/Click"]
        Hit_Testing["命中检测<br/>elementsFromPoint"]
        Overlay_System["浮层系统<br/>Hover/Select/Comment Rects"]
    end

    subgraph Component_System ["组件系统"]
        Molecules["Molecules 组合组件<br/>BriefCard<br/>StoryCard<br/>ShotTable"]
        Atoms["Atoms 原子节点<br/>VideoBlock<br/>ImageBlock<br/>Heading"]
        Primitives["Primitives 基础UI<br/>VideoPrimitive<br/>ImagePrimitive<br/>MarkdownPrimitive"]
    end

    Tiptap_Engine -->|Render| Atoms
    Tiptap_Engine -->|Render| Molecules
    Molecules -->|Use| Primitives
    Atoms -->|Use| Primitives
    Interaction_Layer -.->|Highlight| Component_System
\`\`\`

## 3. 核心技术实现细节

### 3.1 细粒度框选与交互系统 (The "Hover" Magic)
这是本项目最核心的难点。我们需要在不侵入业务组件逻辑的前提下，实现对任意层级元素的框选。

*   **实现原理**：**基于 DOM 的全局后处理 (Post-processing)**。
*   **核心文件**: \`DocEditor.tsx\`
*   **关键步骤**:
    1.  **标识注入 (\`data-block-id\`)**:
        *   利用 Tiptap 的 \`GlobalAttributes\` 扩展，为所有 Block Node 自动注入 \`data-block-id\`。
        *   在 React 组件内部（如 \`BriefCard\`），手动为子元素（标题、单元格、按钮）添加 \`data-block-id\`，形成嵌套的 ID 体系（如 \`brief-1-header-title\`）。
    2.  **命中检测**:
        *   监听编辑器的 \`onMouseMove\` 事件。
        *   使用 \`document.elementsFromPoint(x, y)\` 获取鼠标下方的所有元素栈。
        *   过滤出带有 \`data-block-id\` 的元素。
    3.  **智能选区策略**:
        *   **默认**: 选中最内层的原子元素（如卡片里的某张图片）。
        *   **容器优先**: 如果鼠标位于容器（如 Section）边缘 \`20px\` 范围内，优先选中外层容器，模仿飞书的交互体验。
    4.  **高性能渲染**:
        *   **Overlay 分离**: 高亮框（蓝色边框）是一个独立的绝对定位 \`div\` 层，不影响文档流。
        *   **坐标同步**: 使用 \`getBoundingClientRect\` 计算位置。监听 \`scroll\` 和 \`resize\` 事件，实时重算坐标，防止滚动时高亮框错位。

### 3.2 组件化设计系统 (Atomic Design)
为了解决 Tiptap Node View 与普通 React 组件复用困难的问题，我们采用了原子化设计：

*   **Primitives (基础组件)**:
    *   *定位*: 纯 UI 组件，无业务逻辑，不依赖 Tiptap。
    *   *例子*: \`VideoPrimitive.tsx\`, \`MarkdownPrimitive.tsx\`。
    *   *特性*: 统一了圆角、边框、Markdown 渲染能力。
*   **Atoms (原子节点)**:
    *   *定位*: Tiptap 的 \`NodeViewWrapper\` 封装层。
    *   *例子*: \`VideoBlock.tsx\`。
    *   *作用*: 连接编辑器数据 (node.attrs) 与 UI。
*   **Molecules (组合组件)**:
    *   *定位*: 复杂的业务卡片。
    *   *例子*: \`BriefCard.tsx\`, \`ShotTable.tsx\`。
    *   *实现*: 内部使用 \`Primitives\` 组装，通过 Props 传递数据，并通过 \`data-block-id\` 暴露内部结构给交互层。

### 3.3 沉浸式图片/媒体浏览
*   **痛点**: 在复杂的组合组件（如分镜表、故事卡）中，图片分散在不同 DOM 节点，无法连续预览。
*   **解决方案**:
    *   构建通用的 \`ImageViewerPrimitive.tsx\`。
    *   **数据拍平**: 在 \`ShotTable\` 或 \`BriefCard\` 内部，将分散的图片数据收集为一个数组。
    *   **索引映射**: 点击某张图片时，计算其在全局数组中的索引，从而打开预览器并支持前后切换。

### 3.4 Markdown 支持
*   所有文本类原子组件（Heading, Paragraph, Caption）均集成了 \`react-markdown\`。
*   通过 \`MarkdownPrimitive.tsx\` 统一处理，支持在卡片描述、备注中直接渲染 Markdown 语法，增强了内容的表现力。

### 3.5 数据映射原理：从 JSON 到 React 组件
许多开发者关心后端返回的 JSON 数据是如何一步步变成屏幕上复杂的 React 组件的。这里详细拆解这一过程。

*   **核心流程**: \`JSON\` -> \`Tiptap Model\` -> \`Extension Matching\` -> \`ReactNodeViewRenderer\` -> \`React Component\`

#### 3.5.1 数据流转图
\`\`\`mermaid
graph TD
    JSON[JSON Data] -->|load| Tiptap_Engine[Tiptap Engine]
    Tiptap_Engine -->|match 'type'| Extension_Registry[Extension Registry]
    Extension_Registry -->|create| Node_Model[Node Model]
    Node_Model -->|render| ReactNodeViewRenderer[ReactNodeViewRenderer]
    ReactNodeViewRenderer -->|props=node| React_Component[React Component]
\`\`\`

#### 3.5.2 详细步骤解析

**1. 后端数据 (JSON)**
后端存储的是标准的 ProseMirror JSON 结构。
\`\`\`json
{
  "type": "alert",
  "attrs": {
    "type": "warning",
    "title": "注意事项",
    "content": "请务必在发布前检查权限设置。"
  }
}
\`\`\`

**2. 扩展定义 (Extension Registry)**
在 \`registry.ts\` 中，我们定义了 \`name: 'alert'\`，这与 JSON 中的 \`"type": "alert"\` 对应。
\`\`\`ts
// components/registry.ts
export const AlertExtension = Node.create({
  name: 'alert', // 对应 JSON 中的 type
  
  addAttributes() {
    return {
      // 定义 attrs 的默认值和解析规则
      type: { default: 'info' },
      title: { default: '' },
      content: { default: '' }
    }
  },
  
  // 关键：告诉 Tiptap 使用 React 组件渲染此节点
  addNodeView() {
    return ReactNodeViewRenderer(AlertBlock)
  }
})
\`\`\`

**3. 组件渲染 (React Component)**
Tiptap 实例化 \`AlertBlock\` 组件，并将数据注入到 \`props.node.attrs\` 中。
\`\`\`tsx
// components/ui/atoms/AlertBlock.tsx
export const AlertBlock = (props) => {
  // 自动映射：JSON.attrs -> props.node.attrs
  const { type, title, content } = props.node.attrs;
  
  return (
    <NodeViewWrapper>
       <AlertPrimitive type={type} title={title}>
         {content}
       </AlertPrimitive>
    </NodeViewWrapper>
  )
}
\`\`\`

## 4. 开发指南：如何新增组件

本节将以开发一个简单的 "Alert 警告框" 为例，演示如何从零构建组件，遵循 Primitives -> Atoms -> Molecules 的分层架构。

### 4.1 新增 Primitives (基础组件)
*   **目标**: 创建一个纯 UI 组件，不包含任何 Tiptap 逻辑。
*   **路径**: \`components/ui/primitives/AlertPrimitive.tsx\`

\`\`\`tsx
// 1. 定义 Props，只关注 UI 表现
interface AlertPrimitiveProps {
  type: 'info' | 'warning' | 'error';
  title: string;
  children: React.ReactNode;
}

// 2. 实现组件，使用 MarkdownPrimitive 渲染富文本内容
export const AlertPrimitive = ({ type, title, children }: AlertPrimitiveProps) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={\`p-4 rounded-lg border \${colors[type]} my-4\`}>
      <div className="font-bold mb-1">{title}</div>
      <div className="text-sm opacity-90">
        {/* 使用 MarkdownPrimitive 以支持富文本 */}
        <MarkdownPrimitive>{children}</MarkdownPrimitive>
      </div>
    </div>
  );
};
\`\`\`

### 4.2 新增 Atoms (原子节点)
*   **目标**: 将 Primitive 包装为 Tiptap 节点，连接编辑器数据。
*   **路径**: \`components/ui/atoms/AlertBlock.tsx\`

\`\`\`tsx
import { NodeViewWrapper } from '@tiptap/react';
import { AlertPrimitive } from '../primitives/AlertPrimitive';

export const AlertBlock = (props: any) => {
  // 1. 从 props.node.attrs 获取数据
  const { type, title, content } = props.node.attrs;

  return (
    <NodeViewWrapper className="alert-block">
      {/* 2. 传递数据给 Primitive */}
      <AlertPrimitive type={type} title={title}>
        {content}
      </AlertPrimitive>
    </NodeViewWrapper>
  );
};
\`\`\`

**注册**: 在 \`components/registry.ts\` 中注册：
\`\`\`ts
export const AlertExtension = Node.create({
  name: 'alert',
  group: 'block',
  atom: true, // 标记为原子节点
  
  addAttributes() {
    return {
      type: { default: 'info' },
      title: { default: 'Notice' },
      content: { default: '' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="alert"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'alert', ...HTMLAttributes }];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(AlertBlock);
  },
});
\`\`\`

### 4.3 新增 Molecules (组合组件)
*   **目标**: 创建包含多个交互区域的复杂卡片。
*   **关键点**: 正确设置 \`data-block-id\` 以支持细粒度交互。

\`\`\`tsx
// components/ui/molecules/TaskCard.tsx
export const TaskCard = (props: any) => {
  const { id } = props.node.attrs; // 获取节点唯一ID
  
  return (
    <NodeViewWrapper className="task-card border rounded p-4">
      {/* 1. 为头部区域设置唯一 ID，使其可被独立框选 */}
      <div 
        data-block-id={\`\${id}-header\`}
        className="font-bold border-b pb-2 mb-2"
      >
        任务详情
      </div>
      
      {/* 2. 嵌套使用 Atom 或 Primitive */}
      <div className="flex gap-4">
        <div data-block-id={\`\${id}-status\`} className="w-1/3">
           <StatusPrimitive status="pending" />
        </div>
        <div data-block-id={\`\${id}-desc\`} className="w-2/3">
           <MarkdownPrimitive>任务描述...</MarkdownPrimitive>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
\`\`\`

## 5. 目录结构说明

\`\`\`text
components/
├── DocEditor.tsx           # 编辑器入口与交互核心逻辑
├── registry.ts             # Tiptap 扩展注册表
├── ui/
│   ├── primitives/         # [纯UI层] 基础组件 (Icon, Image, Video, Markdown...)
│   ├── atoms/              # [Tiptap层] 原子节点 (VideoBlock, AudioBlock...)
│   └── molecules/          # [业务层] 组合组件 (BriefCard, StoryCard...)
\`\`\`

## 6. 总结与优势
1.  **高可维护性**: 通过 Primitives 层隔离了 UI 细节，修改一处样式（如圆角），全站生效。
2.  **极致交互**: 实现了业界领先的细粒度 DOM 框选交互，且与业务逻辑解耦。
3.  **扩展性强**: 新增一种卡片只需编写一个 React 组件并注册到 Tiptap，交互能力自动继承。
  `;

  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);

  useEffect(() => {
    // Simple header extraction from the content string
    // In a real app, you might want to extract from the rendered DOM or parsed AST
    const lines = content.split('\n');
    const headers = [];
    let inCodeBlock = false;

    for (const line of lines) {
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
            headers.push({ id, text, level });
        }
    }
    setToc(headers);
  }, [content]);

  // Custom components to add IDs to headings
  const components = {
    h1: ({ children, ...props }: any) => {
        const text = React.Children.toArray(children).join('');
        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
        return <h1 id={id} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
        const text = React.Children.toArray(children).join('');
        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
        return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
        const text = React.Children.toArray(children).join('');
        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
        return <h3 id={id} {...props}>{children}</h3>;
    },
  };

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Sidebar TOC */}
      <aside className="hidden xl:block w-64 fixed left-[max(0px,calc(50%-42rem))] top-0 h-screen overflow-y-auto py-12 px-4 border-r border-gray-100">
        <nav className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">目录</h4>
            {toc.map((item) => (
                <button
                    key={item.id}
                    onClick={() => scrollToHeader(item.id)}
                    className={`
                        block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-100 transition-colors
                        ${item.level === 1 ? 'font-bold text-gray-900 mt-4' : ''}
                        ${item.level === 2 ? 'font-medium text-gray-700 ml-2' : ''}
                        ${item.level === 3 ? 'text-gray-500 ml-4' : ''}
                    `}
                >
                    {item.text}
                </button>
            ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="w-full max-w-4xl py-12 px-4 sm:px-6 lg:px-8 xl:pl-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-code:text-red-500 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-50">
            <MarkdownPrimitive components={components}>{content}</MarkdownPrimitive>
          </article>
        </div>
      </div>
    </div>
  );
}
