import React, { useCallback, useMemo } from "react";
import { createEditor, Descendant, Editor } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import {
  TitleElement,
  ParagraphElement,
  ImageElement,
  CardElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  ListElement,
} from "./components/CustomBlocks";
import { CustomElement } from "./types";

// Extend the editor with ID generation if needed, though we assume backend provides IDs
const withNodeId = (editor: Editor) => {
  // If we were editing, we'd ensure IDs here.
  // For read-only/display of SSE, IDs come from data.
  return editor;
};

interface SlateEditorProps {
  value: Descendant[];
  onChange?: (value: Descendant[]) => void;
  readOnly?: boolean;
}

export const SlateEditor = ({
  value,
  onChange,
  readOnly = false,
}: SlateEditorProps) => {
  const editor = useMemo(
    () => withNodeId(withHistory(withReact(createEditor()))),
    []
  );

  // Sync editor content when `value` prop changes externally (e.g. from SSE stream)
  // Note: This is a brute-force approach for demo purposes.
  // In a real collaborative app, we'd use Yjs or operational transforms.
  React.useEffect(() => {
    if (value && value.length > 0) {
      // Check if value actually changed to avoid loop if onChange is updating parent
      if (JSON.stringify(editor.children) !== JSON.stringify(value)) {
        editor.children = value;
        editor.onChange();
      }
    }
  }, [value, editor]);

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as CustomElement;

    switch (element.type) {
      case "title":
        return <TitleElement {...props} />;
      case "image":
        return <ImageElement {...props} />;
      case "card":
        return <CardElement {...props} />;
      case "table":
        return <TableElement {...props} />;
      case "table-row":
        return <TableRowElement {...props} />;
      case "table-cell":
        return <TableCellElement {...props} />;
      case "list":
        return <ListElement {...props} />;
      case "paragraph":
      default:
        return <ParagraphElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props;
    if (props.leaf.bold) children = <strong>{children}</strong>;
    if (props.leaf.italic) children = <em>{children}</em>;
    if (props.leaf.code)
      children = (
        <code className="rounded bg-slate-100 px-1 font-mono text-sm text-pink-500">
          {children}
        </code>
      );

    return <span {...props.attributes}>{children}</span>;
  }, []);

  return (
    <div className="mx-auto min-h-[calc(100vh-100px)] w-full max-w-4xl rounded-xl bg-white p-12 shadow-sm">
      <Slate
        editor={editor}
        initialValue={value}
        // If controlled, we need to handle onChange.
        // Note: Slate's onChange is fired on selection change too.
        onChange={onChange}
      >
        <Editable
          readOnly={readOnly}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Waiting for content..."
          className="pb-20 outline-none"
        />
      </Slate>
    </div>
  );
};
