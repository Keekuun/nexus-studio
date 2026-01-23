"use client";

import React, { useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import { CustomElement } from "./registry";
import {
  Heading,
  Paragraph,
  Image,
  Tag,
  Video,
  Audio,
} from "./components/atoms";
import { Card, Gallery, Section, StoryCard } from "./components/molecules";
import { MOCK_DOC_DATA } from "./mock";
import { SelectionProvider, useSelection } from "./SelectionContext";
import { ChevronRight } from "lucide-react";

const DocEditor = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { selectedNodeData } = useSelection();

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as CustomElement;

    switch (element.type) {
      // Atoms
      case "heading":
        return <Heading {...props} />;
      case "paragraph":
        return <Paragraph {...props} />;
      case "image":
        return <Image {...props} />;
      case "tag":
        return <Tag {...props} />;
      case "video":
        return <Video {...props} />;
      case "audio":
        return <Audio {...props} />;

      // Molecules
      case "card":
        return <Card {...props} />;
      case "story-card":
        return <StoryCard {...props} />;
      case "gallery":
        return <Gallery {...props} />;
      case "section":
        return <Section {...props} />;

      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <span {...props.attributes}>{props.children}</span>;
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Editor Area */}
      <div className="flex flex-1 justify-center overflow-y-auto p-8">
        <div className="h-fit min-h-[1200px] w-full max-w-[900px] rounded-[40px] bg-white p-16 shadow-2xl">
          <Slate editor={editor} initialValue={MOCK_DOC_DATA as Descendant[]}>
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              readOnly // Read-only for this interaction demo
              className="outline-none"
            />
          </Slate>
        </div>
      </div>

      {/* Sidebar: JSON Inspector */}
      <div className="z-20 flex w-96 flex-col border-l bg-white shadow-xl">
        <div className="border-b bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-800">Node Inspector</h3>
          <p className="mt-1 text-xs text-slate-500">
            Click any component to inspect its data structure.
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {selectedNodeData ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="rounded-lg bg-blue-100 p-2 font-mono text-xs font-bold uppercase text-blue-700">
                  {selectedNodeData.type}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedNodeData.type
                      .split("-")
                      .map(
                        (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                      )
                      .join(" ")}
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    ID: {selectedNodeData.id}
                  </div>
                </div>
              </div>

              {/* Props View */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Component Properties
                </h4>
                <div className="overflow-x-auto rounded-xl bg-slate-900 p-4">
                  <pre className="font-mono text-xs leading-relaxed text-green-400">
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(selectedNodeData).filter(
                          ([k]) =>
                            k !== "children" && k !== "type" && k !== "id"
                        )
                      ),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              {/* Raw JSON */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Full JSON Data
                </h4>
                <div className="rounded-xl border bg-slate-50 p-2">
                  <pre className="overflow-x-auto text-[10px] text-slate-600">
                    {JSON.stringify(selectedNodeData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <ChevronRight size={48} className="mb-4 opacity-20" />
              <p>Select a component to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SpecPage() {
  return (
    <SelectionProvider>
      <DocEditor />
    </SelectionProvider>
  );
}
