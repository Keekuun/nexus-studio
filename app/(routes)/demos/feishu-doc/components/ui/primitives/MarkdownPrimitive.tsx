'use client';

import React from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MermaidPrimitive } from './MermaidPrimitive'

interface MarkdownPrimitiveProps {
  children: React.ReactNode;
  className?: string;
  // If true, forces the root paragraph to be a span (good for headings, buttons, tags)
  inline?: boolean;
  components?: Components;
}

export const MarkdownPrimitive = ({ children, className, inline = false, components }: MarkdownPrimitiveProps) => {
  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  // Use a wrapper to apply className
  const Wrapper = inline ? 'span' : 'div';

  return (
    <Wrapper className={className}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={{
            p: ({node, ...props}) => {
                 const Element = inline ? 'span' : 'p';
                 return <Element {...props} />;
            },
            a: ({node, ...props}) => {
                // Remove onClick since it can't be passed to client components in SSR context easily if not needed
                // Or if we need interactivity, we should ensure this component is client-side or handles events properly.
                // For a static spec page, simple links are fine.
                // But `MarkdownPrimitive` is likely used in interactive contexts too.
                // The error says "Event handlers cannot be passed to Client Component props" which implies
                // ReactMarkdown might be rendering client components or the way props are passed is strict.
                // Actually, the error usually happens when a Server Component passes a function (onClick) to a Client Component.
                // MarkdownPrimitive is likely a Client Component implicitly if used in one, but let's make it explicit or remove the handler if not needed.
                // The handler `e.stopPropagation()` suggests this was for the editor context.
                // For the spec page, we don't strictly need stopPropagation.
                // Let's make this component a client component explicitly to be safe, or remove the handler.
                // Since this is a Primitive used in UI, 'use client' is safest.
                return <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />;
            },
            code: ({node, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '')
                if (match && match[1] === 'mermaid') {
                    return <MermaidPrimitive chart={String(children).replace(/\n$/, '')} />
                }
                return <code {...props} className={`bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-500 ${className || ''}`}>{children}</code>
            },
            ...components,
        }}
      >
        {children}
      </ReactMarkdown>
    </Wrapper>
  )
}
