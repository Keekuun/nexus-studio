# Slate 与 Tiptap 实现对比

基于 `slate-doc` 和 `feishu-doc` 中的实现，本文档对比了本项目中 Slate.js 和 Tiptap 在架构与实现上的差异。

## 1. 核心架构

### Slate (`slate-doc`)

- **模式**：以 React 为一等公民的 MVC（模型-视图-控制器）模式。
- **状态管理**：受控组件模式。编辑器状态是一个单一的 `value` 属性（`Descendant` 节点数组），传递给 `<Slate>` 提供者。
- **渲染**：通过 `renderElement` 和 `renderLeaf` 属性进行显式渲染控制。你可以完全决定每种节点类型渲染哪个 React 组件。
- **插件**：高阶函数模式（`withHistory`, `withReact`, `withNodeId`）。插件通过包裹编辑器实例来拦截和修改行为。

### Tiptap (`feishu-doc`)

- **模式**：ProseMirror 的无头封装。基于扩展的架构。
- **状态管理**：命令式的 `useEditor` 钩子。状态更新由 ProseMirror 的事务系统内部处理，但通过 `onUpdate` 暴露。
- **渲染**：模式驱动。节点在扩展（Extensions）中定义（见 `registry.ts`），Tiptap 处理渲染流程。React 组件通过 `ReactNodeViewRenderer` 挂载。
- **插件**：基于类的扩展（`Extension.create`, `Node.create`）。一切（节点、标记、功能）都是扩展。

## 2. 区块实现策略

### Slate 中的自定义区块

**文件：** `components/CustomBlocks.tsx`

- **实现**：纯 React 组件。
- **Props**：直接接收 `attributes`（用于 DOM 映射）和 `children`（用于嵌套内容）。
- **灵活性**：高。你对 DOM 结构有完全的控制权。
- **示例 (`ImageElement`)**:
  ```tsx
  export const ImageElement = ({ attributes, children, element }) => (
    <div {...attributes}>
      <img src={element.url} />
      {children}
    </div>
  );
  ```

### Tiptap 中的自定义区块

**文件：** `components/registry.ts`

- **实现**：节点扩展 + React Node Views。
- **配置**：需要定义 Schema（parseHTML, renderHTML, addAttributes），然后绑定视图。
- **Props**：React 组件接收包含属性的 `node` prop，但交互通常需要使用 `editor` 实例或 `updateAttributes`。
- **示例 (`CustomHeading`)**:
  ```ts
  Node.create({
    name: "heading",
    addAttributes() {
      return { level: { default: 1 } };
    },
    addNodeView() {
      return ReactNodeViewRenderer(Heading);
    },
  });
  ```

## 3. 数据结构

### Slate JSON

- **格式**：递归的对象树。
- **键**：`type`, `children`, 以及自定义属性。
- **示例**:
  ```json
  {
    "type": "card",
    "status": "success",
    "children": [{ "text": "" }]
  }
  ```

### Tiptap (ProseMirror) JSON

- **格式**：严格基于 Schema 的树。
- **键**：`type`, `content`, `attrs`（严格分离的属性）。
- **示例**:
  ```json
  {
    "type": "briefCard",
    "attrs": {
      "blockId": "brief-1",
      "title": "Brief V2"
    }
    // content 是分开的（如果允许包含内容）
  }
  ```

## 4. 功能实现对比

| 功能            | Slate 实现 (`slate-doc`)                     | Tiptap 实现 (`feishu-doc`)                               |
| :-------------- | :------------------------------------------- | :------------------------------------------------------- |
| **区块 ID**     | 自定义插件 `withNodeId` 包裹 `insertNode`。  | 扩展 `BlockId` 使用 `addGlobalAttributes`。              |
| **渲染**        | `renderElement` 中的 Switch-case。           | 扩展注册表中的 `addNodeView()`。                         |
| **交互性**      | 组件中的原生 React 事件处理。                | Node View 事件处理 + 编辑器命令 (Commands)。             |
| **工具栏/菜单** | 外部组件直接修改 `editor` 状态。             | 气泡菜单 (Bubble Menu) / 悬浮菜单 (Floating Menu) 扩展。 |
| **表格**        | 自定义嵌套区块结构 (`table` > `tr` > `td`)。 | `TableBlock` 扩展 (可能封装了复杂逻辑)。                 |

## 5. 优缺点 (观察结论)

### Slate

- **优点**:
  - "这就是 React" 的心智模型非常强。
  - 更容易调试渲染循环（因为它只是一个 React 渲染）。
  - 对 DOM 层级有完全控制权（例如，容易在区块外包裹额外的 div）。
- **缺点**:
  - 简单功能也需要写更多样板代码。
  - Schema 强制执行（规范化）必须手动实现。
  - 协同编辑 (Yjs) 相比 Tiptap 内置的 Provider 需要更多手动配置。

### Tiptap

- **优点**:
  - 极其强大的扩展生态系统。
  - `ReactNodeViewRenderer` 抽象了同步 ProseMirror DOM 与 React 的复杂性。
  - 内置的 Schema 验证防止非法状态。
  - 输入规则 (Input rules) 和 Markdown 快捷键更容易配置。
- **缺点**:
  - 创建复杂自定义扩展的学习曲线较陡峭（需要理解 ProseMirror 的节点/Schema）。
  - `attrs` 和 `content` 的严格分离可能显得死板。
  - 调试 ProseMirror 事务比 React 状态变更更难。

## 6. 建议

- **选择 Slate 如果**: 你需要一个高度定制的 UI，且不符合标准文档模型，或者你想在不学习 ProseMirror 概念的情况下完全控制 React 渲染流程。
- **选择 Tiptap 如果**: 你正在构建一个 Notion/Google Docs 的克隆版。其结构化的 Schema、丰富的扩展生态（表格、协同、Markdown）以及 Node View 系统提供了一条通往健壮“文档”编辑器的更快路径。

## 7. 针对“高度自定义样式”场景的推荐

针对**“需要完全控制各个区块的样式展示，小到一个 span，大的整个文档样式都需要自定义”**这一特定业务需求，推荐使用 **Slate**。

### 为什么选择 Slate？

1.  **视图层完全分离**：
    - Slate 的核心设计哲学是 Model (数据) 与 View (视图) 的完全解耦。
    - 通过 `renderElement` (区块) 和 `renderLeaf` (内联)，你可以将文档中的任何节点映射为**任意**的 React 组件。
    - 对于“小到一个 span”的需求：`renderLeaf` 允许你直接控制文本节点的渲染逻辑。你可以根据文本属性（如 `bold`, `color`, `highlight`）动态生成带有任意 class 或 style 的 `<span>` 标签。
    - 对于“整个文档样式”的需求：你完全控制编辑器容器的渲染结构，不受预设 HTML 结构的限制。

2.  **更直观的 React 心智模型**：
    - 在 Slate 中，自定义一个区块就像写一个普通的 React 组件。你可以随意添加 CSS Modules, Tailwind classes, 或者使用 styled-components。
    - 相比之下，Tiptap 虽然支持 React Node Views，但本质上是在 ProseMirror 的 Schema 约束下工作。如果你需要打破常规的 DOM 结构（例如在编辑器内部渲染非内容编辑的复杂交互组件），Slate 会更加自由和直接。

3.  **避免 Schema 限制**：
    - Tiptap/ProseMirror 有严格的 Schema 定义（哪些节点可以包含哪些节点）。如果你的业务样式需要非标准的嵌套结构（例如在段落中嵌入复杂的卡片，卡片内又有独立的编辑区域），在 Tiptap 中配置起来会比较复杂（需要处理 `contentDOM`）。
    - Slate 对数据结构没有预设限制，只要你能写出对应的 React 渲染逻辑，它就能工作。

### 总结

如果你的首要目标是**UI/UX 的极致定制**，而不是复用现成的文档编辑功能（如标准的 Markdown 解析、复杂的表格操作等），Slate 是更合适的选择。它提供了一块“空白画布”，让你用 React 的方式去绘制文档。
