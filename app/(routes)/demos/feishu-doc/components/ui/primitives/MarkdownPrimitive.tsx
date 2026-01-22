import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPrimitiveProps {
  children: React.ReactNode;
  className?: string;
  // If true, forces the root paragraph to be a span (good for headings, buttons, tags)
  inline?: boolean;
}

export const MarkdownPrimitive = ({ children, className, inline = false }: MarkdownPrimitiveProps) => {
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
            a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />,
            code: ({node, ...props}) => <code {...props} className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-red-500" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </Wrapper>
  )
}
