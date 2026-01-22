import React from 'react'
import { MarkdownPrimitive } from './MarkdownPrimitive'

export const ParagraphPrimitive = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`leading-relaxed text-gray-700 ${className || ''}`} {...props}>
      <MarkdownPrimitive>{children}</MarkdownPrimitive>
    </div>
  )
}
