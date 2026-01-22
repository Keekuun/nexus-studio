import React from 'react'
import { MarkdownPrimitive } from './MarkdownPrimitive'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const HeadingPrimitive = ({ level = 1, className, children, ...props }: HeadingProps) => {
  const Tag = `h${level}` as React.ElementType
  const baseStyles = `font-bold text-gray-900 ${level === 1 ? 'text-3xl mb-4' : level === 2 ? 'text-2xl mb-3' : 'text-xl mb-2'}`
  
  return (
    <Tag className={`${baseStyles} ${className || ''}`} {...props}>
      <MarkdownPrimitive inline>{children}</MarkdownPrimitive>
    </Tag>
  )
}
