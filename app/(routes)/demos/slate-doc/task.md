# Slate.js 实现类飞书文档评论节点（完整可落地方案）

核心逻辑：评论绑定Slate节点唯一ID，通过「节点hover唤出+选中唤出评论入口」，用Portal挂载评论面板，配合状态管理同步评论数据，支持协同更新。
适配React+TS，贴合飞书评论核心交互（节点关联、悬浮显示、评论列表、回复、已读）

## 一、 前置准备（3个核心依赖）

1.  核心：`slate`+`slate-react`（富文本内核）
2.  辅助：`nanoid`（生成唯一节点ID）、`react-dom`（Portal挂载评论面板）

## 二、 步骤1：基础配置（节点加唯一ID+Schema定义）

### 1. 扩展Slate编辑器，给所有节点加唯一id（必做，评论绑定核心）

```tsx
import { Editor, Transforms } from "slate";
import { nanoid } from "nanoid";

// 给编辑器注入节点ID能力
export const withCommentNode = (editor) => {
  const { insertNode } = editor;
  // 插入节点时自动加唯一id
  editor.insertNode = (node) => {
    insertNode({ ...node, id: nanoid(10) }); // 10位唯一id，够用且轻量
  };
  return editor;
};

// 编辑器初始化时使用
const editor = useMemo(() => withCommentNode(createEditor()), []);
```

### 2. 定义评论相关TS类型（规范数据结构）

```tsx
// 评论数据类型（和后端一致）
interface CommentItem {
  id: string; // 评论唯一id
  nodeId: string; // 绑定的Slate节点id
  docId: string; // 文档id
  userId: string;
  userName: string;
  content: string;
  createTime: string;
  replies?: CommentItem[]; // 回复
  isRead: boolean;
}

// 扩展Slate节点类型，让TS识别node.id
declare module "slate" {
  interface Node {
    id: string;
  }
}
```

## 三、 步骤2：核心实现（3大核心功能）

### 功能1： 节点绑定评论入口（hover显示评论角标，选中可加评论）

核心：节点渲染时绑定hover事件，判断当前节点是否有评论，显示角标/入口

```tsx
import { useSlate, RenderElementProps } from "slate-react";
import { useState } from "react";

// 通用节点渲染组件（所有Slate节点都走这里，统一加hover/评论逻辑）
export const RenderElement = (props: RenderElementProps) => {
  const { element, children } = props;
  const [isHover, setIsHover] = useState(false); // 节点hover状态
  // 当前节点的评论列表（从全局状态/接口获取）
  const nodeComments = useSelector((state) =>
    state.comment.list.filter((item) => item.nodeId === element.id)
  );
  const hasComment = nodeComments.length > 0;

  // 节点hover/离开事件
  const handleMouseEnter = () => setIsHover(true);
  const handleMouseLeave = () => setIsHover(false);

  return (
    <div
      data-node-id={element.id} // 标记节点id，方便调试
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="slate-node-container relative"
    >
      {/* 节点内容 */}
      {children}

      {/* 评论入口角标：hover显示，有评论显示数量，无评论显示加号 */}
      {isHover && (
        <span
          className="comment-trigger absolute right-[-12px] top-1 cursor-pointer rounded-full bg-blue-500 px-1 text-xs text-white"
          onClick={(e) => {
            e.stopPropagation();
            // 打开评论面板，传递节点id和评论列表
            openCommentPanel({ nodeId: element.id, comments: nodeComments });
          }}
        >
          {hasComment ? nodeComments.length : "+"}
        </span>
      )}
    </div>
  );
};
```

### 功能2： 评论面板（Portal挂载，避免被文档容器裁剪，类飞书悬浮效果）

核心：用ReactDOM.createPortal挂载到body，定位到触发节点位置，支持添加/查看/回复评论

```tsx
import { createPortal } from "react-dom";
import { useState } from "react";

interface CommentPanelProps {
  nodeId: string;
  docId: string;
  initComments: CommentItem[];
  onClose: () => void;
}

// 评论面板组件
export const CommentPanel = (props: CommentPanelProps) => {
  const { nodeId, docId, initComments, onClose } = props;
  const [commentList, setCommentList] = useState(initComments);
  const [inputValue, setInputValue] = useState("");

  // 添加评论（对接后端接口，这里是前端逻辑）
  const handleAddComment = async () => {
    if (!inputValue.trim()) return;
    const newComment: CommentItem = {
      id: nanoid(),
      nodeId,
      docId,
      userId: "current-user-id", // 当前用户id
      userName: "当前用户",
      content: inputValue,
      createTime: new Date().toLocaleString(),
      isRead: false,
      replies: [],
    };
    // 1. 调用接口提交评论  2. 更新本地列表  3. 协同场景推送给其他用户
    await api.addComment(newComment);
    setCommentList([...commentList, newComment]);
    setInputValue("");
  };

  // 渲染评论列表（简化，可扩展回复逻辑）
  const renderComments = () => {
    return commentList.map((item) => (
      <div key={item.id} className="comment-item border-b py-2">
        <div className="flex justify-between">
          <span className="font-medium">{item.userName}</span>
          <span className="text-xs text-gray-500">{item.createTime}</span>
        </div>
        <p className="mt-1 text-sm">{item.content}</p>
        {/* 回复入口、已读标记可扩展 */}
      </div>
    ));
  };

  // Portal挂载到body，避免被文档容器裁剪
  return createPortal(
    <div className="comment-panel w-380px fixed z-50 rounded-lg border bg-white p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-medium">评论</h4>
        <button onClick={onClose} className="text-gray-500">
          ×
        </button>
      </div>
      <div className="comments-list max-h-200px overflow-y-auto">
        {renderComments()}
      </div>
      <div className="mt-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full rounded border p-2 text-sm"
          placeholder="添加评论..."
          rows={2}
        />
        <button
          onClick={handleAddComment}
          className="mt-1 rounded bg-blue-500 px-3 py-1 text-sm text-white"
        >
          提交
        </button>
      </div>
    </div>,
    document.body
  );
};
```

### 功能3： 全局状态管理（控制评论面板显隐+同步评论数据）

用`useState`（简单场景）或Redux/Zustand（复杂/协同场景），这里用React Context做全局管理，适配多组件通信

```tsx
// 1. 创建评论Context
import { createContext, useContext, useState, ReactNode } from "react";

interface CommentContextType {
  panelVisible: boolean;
  currentNodeId: string;
  currentComments: CommentItem[];
  openCommentPanel: (opts: { nodeId: string; comments: CommentItem[] }) => void;
  closeCommentPanel: () => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

// 2. 提供Context Provider
export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const [panelVisible, setPanelVisible] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState("");
  const [currentComments, setCurrentComments] = useState<CommentItem[]>([]);

  const openCommentPanel = (opts) => {
    setCurrentNodeId(opts.nodeId);
    setCurrentComments(opts.comments);
    setPanelVisible(true);
  };

  const closeCommentPanel = () => {
    setPanelVisible(false);
    setCurrentNodeId("");
    setCurrentComments([]);
  };

  return (
    <CommentContext.Provider
      value={{
        panelVisible,
        currentNodeId,
        currentComments,
        openCommentPanel,
        closeCommentPanel,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

// 3. 自定义Hook方便使用
export const useComment = () => {
  const context = useContext(CommentContext);
  if (!context) throw new Error("useComment必须在CommentProvider内使用");
  return context;
};
```

## 四、 步骤3： 集成到编辑器（最终组装）

```tsx
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";
import { withCommentNode } from "./withCommentNode";
import { RenderElement } from "./RenderElement";
import { CommentProvider, useComment } from "./CommentContext";
import { CommentPanel } from "./CommentPanel";

// 根组件
export const FeishuDocEditor = ({ docId, initialValue }) => {
  // 初始化编辑器，集成React+节点ID能力
  const editor = useMemo(() => withCommentNode(withReact(createEditor())), []);
  const { panelVisible, currentNodeId, currentComments, closeCommentPanel } =
    useComment();

  return (
    <div className="doc-editor-container h-full w-full">
      {/* Slate编辑器核心 */}
      <Slate editor={editor} value={initialValue} onChange={() => {}}>
        <Editable
          renderElement={(props) => <RenderElement {...props} />}
          placeholder="请输入文档内容..."
          className="h-full w-full p-4 outline-none"
        />
      </Slate>

      {/* 评论面板：显隐控制 */}
      {panelVisible && (
        <CommentPanel
          nodeId={currentNodeId}
          docId={docId}
          initComments={currentComments}
          onClose={closeCommentPanel}
        />
      )}
    </div>
  );
};

// 入口组件（包裹Provider）
export const DocPage = () => {
  return (
    <CommentProvider>
      <FeishuDocEditor
        docId="doc_123"
        initialValue={[
          { type: "paragraph", id: nanoid(), children: [{ text: "" }] },
        ]}
      />
    </CommentProvider>
  );
};
```

## 五、 关键补充（贴合飞书核心体验）

1.  协同同步：评论CRUD后通过Socket推送给所有协作者，更新全局评论列表
2.  定位优化：评论面板定位到触发节点位置（获取节点DOM坐标，设置panel的top/left）
3.  选中加评论：给Editable加选中事件，选中节点后右键/工具栏可唤出评论入口
4.  样式优化：hover高亮用飞书同款浅蓝底色，评论角标悬浮显示tooltip
