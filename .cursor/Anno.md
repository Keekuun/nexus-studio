这是一个非常清晰且具有工程挑战的需求。你的核心逻辑是：**“AI 驱动生成 -> 结构化预览 -> 交互式反馈（批注/对话）”**。

在这种场景下，Tiptap 实际上被你用作了一个**“高性能、可交互、支持自定义组件的渲染引擎”**，而不仅仅是文本编辑器。

以下是为你设计的完整方案 Prompt 及技术实现细节。

---

### 第一部分：发给大模型的系统 Prompt (System Prompt)

这份 Prompt 旨在约束 AI 输出符合你系统解析逻辑的 “Hybrid 格式”。

```markdown
# Role
你是一个极具创意的智能文档架构师。你的任务是根据用户的需求生成内容丰富、结构精美、交互性强的文档。

# Output Format Rules
请混合使用 Markdown 和自定义 XML 标签输出内容：
1. **基础排版**：使用标准 Markdown 语法（标题、列表、加粗、链接、引用）。
2. **结构化组件 (XML)**：当需要展示复杂内容时，必须使用以下预定义的自定义 XML 标签：
   - `<card title="标题" type="info|warning|success">内容</card>`：用于展示重点卡片。
   - `<data-chart type="bar|line|pie" data="JSON数据结构">描述文字</data-chart>`：用于展示图表。
   - `<media-player url="链接" type="video|audio" />`：用于展示音视频。
   - `<task-list id="unique_id">[ ] 任务项</task-list>`：用于展示可交互的任务。

3. **批注处理 (Annotation)**：
   - 如果用户在当前文档中已有批注，你会看到 `<annotation id="ID" note="批注内容">原文</annotation>` 格式。
   - **更新逻辑**：如果你根据批注修改了内容，请移除旧的批注标签，或者根据新内容重新包裹。
   - **跨节点支持**：`<annotation>` 标签可以包裹多个 Markdown 段落或 XML 组件。

# Constraints
- 严禁输出 Markdown 以外的 HTML 标签。
- 自定义 XML 标签必须严格闭合。
- 保持文档逻辑清晰，排版优雅。

# Example Output
# 项目启动计划
这是一段普通引言。

<annotation id="ann_01" note="请加入更多关于预算的描述">
<card title="核心目标" type="success">
- 完成 MVP 开发
- 获得首批 100 位种子用户
</card>
</annotation>

<data-chart type="bar" data='{"labels": ["Q1", "Q2"], "values": [400, 600]}'>
季度增长预期图表
</data-chart>
```

---

### 第二部分：Tiptap 内部实现细节

你的业务逻辑重点在于 **“Block 交互”** 和 **“预览回显”**。

#### 1. 数据转换流 (Transformer)
*   **输入 (From AI)**: 接收 AI 返回的字符串。使用 `tiptap-extension-markdown` 配合自定义正则。
    *   *技巧*：先用正则表达式将所有的 `<annotation>` 和 `<custom-tag>` 识别出来，映射到 Tiptap 的 `JSON Node`。
*   **输出 (To AI)**: 将 Tiptap 的 JSON 树递归遍历，将 Node 还原为 XML 字符串。

#### 2. 自定义 React 组件实现 (Node View)
针对每一个 XML 标签，在 Tiptap 中创建一个 `Node`。

```javascript
// 以 <card> 标签为例的 Tiptap 扩展
const CardExtension = Node.create({
  name: 'card',
  group: 'block',
  content: 'block+', // 允许卡片内部嵌套其他 block
  addAttributes() {
    return {
      title: { default: '' },
      type: { default: 'info' }
    }
  },
  parseHTML() {
    return [{ tag: 'card' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['card', mergeAttributes(HTMLAttributes), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CardComponent)
  }
})
```

#### 3. Block 级交互逻辑 (React Component)
在 `CardComponent.jsx` 中实现你的 Hover 效果和工具菜单：

```jsx
const CardComponent = ({ node, updateAttributes, extension }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper 
      className={`relative group ${isHovered ? 'ring-2 ring-blue-500' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮工具菜单 */}
      {isHovered && (
        <div className="absolute -top-8 right-0 flex gap-2 bg-white shadow-md border rounded p-1 z-10">
          <button onClick={handleAddComment} title="添加批注">💬</button>
          <button onClick={handleSendToChat} title="发送到对话">✈️</button>
          <button onClick={handleDelete} title="删除节点">🗑️</button>
        </div>
      )}

      <div className={`p-4 rounded border bg-${node.attrs.type}-50`}>
        <h4 className="font-bold">{node.attrs.title}</h4>
        {/* 这里渲染卡片内部嵌套的内容 */}
        <NodeViewContent className="mt-2" />
      </div>
    </NodeViewWrapper>
  );
};
```

---

### 第三部分：跨节点批注实现细节

由于你的需求是“跨节点批注”，普通的 `Mark`（行内高亮）无法跨越不同的 Block（比如从段落跨到卡片）。

**方案：双向 ID 绑定 (Dual-Binding)**

1.  **数据结构**：
    在文档的 `attrs` 中维护一个全局 `annotations` 列表：
    ```json
    {
      "id": "ann_123",
      "note": "这里的逻辑不对",
      "range": { "from": 10, "to": 150 } // 跨越 Tiptap 内部位置
    }
    ```
2.  **渲染层 (Decorations)**：
    不改变文档结构，使用 Tiptap 的 `Decoration` 插件。
    - 遍历 `annotations` 列表。
    - 使用 `Decoration.node` 为被包裹的整个 Block 增加一个 `border-left` 或背景色。
    - 使用 `Decoration.inline` 为被包裹的文本增加高亮。
3.  **双向锚定**：
    - **从列表到编辑器**：点击右侧批注列表，编辑器调用 `editor.commands.focus(pos)` 并闪烁对应区域。
    - **从编辑器到列表**：鼠标 hover 带有批注的 Block，高亮显示该批注对应的右侧评论。

---

### 第四部分：业务 Workflow 总结

1.  **用户提问**：“帮我写一个关于 AI 发展的报告。”
2.  **AI 返回**：返回 `Hybrid String`（含 Markdown 和 `<card>`）。
3.  **前端解析**：
    - `Transformer` 将字符串转为 Tiptap JSON。
    - Tiptap 根据注册的 `ReactNodeViewRenderer` 渲染出带有精美样式的 React 组件。
4.  **用户交互**：
    - 用户鼠标 Hover 某个卡片。
    - 触发 React 组件内部的 `isHovered` 状态，显示工具栏。
    - 用户点击“批注”，在侧边栏弹出输入框。
    - 批注保存后，前端通过 `Decoration` 在编辑器中实时生成一个高亮覆盖层。
5.  **继续对话**：
    - 用户点击“发送到对话”。
    - 系统获取该 Block 的 XML 片段 + 用户的批注内容。
    - 组合成新的 Prompt 发送给大模型：“针对这个组件 `<card>...</card>`，用户的反馈是‘修改标题’，请更新。”

### 核心优势
*   **UI 灵活性**：XML 自定义标签让你能实现任何复杂的 React 组件（甚至带图表、带交互按钮）。
*   **语义化通讯**：AI 处理 XML 的能力极强，相比 JSON，它更不容易出错，且能理解“包含关系”。
*   **解耦**：编辑器负责展示和位置管理，业务逻辑（批注内容、对话流）留在 React 层处理。