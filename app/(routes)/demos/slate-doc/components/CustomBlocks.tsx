import React from "react";
import { RenderElementProps, useSelected, useFocused } from "slate-react";
import { BlockWrapper } from "./BlockWrapper";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  CardBlock,
  ImageBlock,
  TitleBlock,
  TableBlock,
  TableRowBlock,
  TableCellBlock,
} from "../types";

// --- Title Block ---
export const TitleElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  const block = element as TitleBlock;
  // Use any to avoid "union type that is too complex" error when TS tries to resolve props for all IntrinsicElements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LevelTag = `h${block.level || 1}` as any;

  return (
    <BlockWrapper {...props}>
      <LevelTag
        {...attributes}
        className={cn(
          "mb-2 font-bold text-slate-900",
          block.level === 1 && "mt-6 border-b pb-2 text-3xl",
          block.level === 2 && "mt-4 text-2xl",
          block.level === 3 && "mt-3 text-xl"
        )}
      >
        {children}
      </LevelTag>
    </BlockWrapper>
  );
};

// --- Image Block ---
export const ImageElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  const block = element as ImageBlock;
  const selected = useSelected();
  const focused = useFocused();

  return (
    <BlockWrapper {...props}>
      <div {...attributes} contentEditable={false} className="my-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border bg-slate-50",
            selected && focused && "ring-2 ring-blue-500 ring-offset-2"
          )}
        >
          {block.url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={block.url}
              alt={block.caption || "Image"}
              className="mx-auto h-auto max-w-full object-cover"
            />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <ImageIcon size={48} className="mb-2" />
              <span>No Image URL</span>
            </div>
          )}
          {block.caption && (
            <div className="absolute bottom-0 w-full bg-black/50 p-2 text-center text-xs text-white backdrop-blur-sm">
              {block.caption}
            </div>
          )}
        </div>
      </div>
      {children}
    </BlockWrapper>
  );
};

// --- Card Block ---
export const CardElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  const block = element as CardBlock;

  const statusColors: Record<string, string> = {
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const statusIcons: Record<string, typeof CheckCircle2> = {
    success: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
    info: Info,
  };

  const status = block.status || "info";
  const StatusIcon = statusIcons[status] || Info;

  return (
    <BlockWrapper {...props}>
      <div {...attributes} contentEditable={false} className="my-4">
        <div
          className={cn(
            "rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md",
            "bg-white"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "rounded-lg p-2",
                statusColors[status] || statusColors.info
              )}
            >
              <StatusIcon size={20} />
            </div>
            <div className="flex-1">
              <h4 className="mb-1 text-base font-semibold text-slate-900">
                {block.title}
              </h4>
              <p className="text-sm leading-relaxed text-slate-500">
                {block.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      {children}
    </BlockWrapper>
  );
};

// --- Table Blocks ---
// Tables are complex. Here is a simplified version for display.
// Usually Table -> TableRow -> TableCell
export const TableElement = (props: RenderElementProps) => {
  return (
    <BlockWrapper {...props}>
      <div className="my-4 overflow-x-auto rounded-lg border">
        <table
          {...props.attributes}
          className="w-full text-left text-sm text-slate-500"
        >
          <tbody className="divide-y divide-slate-200 bg-white">
            {props.children}
          </tbody>
        </table>
      </div>
    </BlockWrapper>
  );
};

export const TableRowElement = (props: RenderElementProps) => {
  return (
    <tr {...props.attributes} className="transition-colors hover:bg-slate-50">
      {props.children}
    </tr>
  );
};

export const TableCellElement = (props: RenderElementProps) => {
  return (
    <td
      {...props.attributes}
      className="border-r border-slate-100 px-6 py-4 last:border-r-0"
    >
      {props.children}
    </td>
  );
};

// --- List Block ---
export const ListElement = (props: RenderElementProps) => {
  const { attributes, children } = props;
  // const block = element as any; // Cast if needed

  return (
    <BlockWrapper {...props}>
      <ul
        {...attributes}
        className="ml-4 list-inside list-disc space-y-1 text-slate-700"
      >
        {children}
      </ul>
    </BlockWrapper>
  );
};

// --- Default Paragraph ---
export const ParagraphElement = (props: RenderElementProps) => {
  return (
    <BlockWrapper {...props}>
      <p {...props.attributes} className="mb-2 leading-7 text-slate-700">
        {props.children}
      </p>
    </BlockWrapper>
  );
};
