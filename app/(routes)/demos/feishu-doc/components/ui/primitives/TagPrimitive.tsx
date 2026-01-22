import React from 'react'
import { MarkdownPrimitive } from './MarkdownPrimitive'

export type TagColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'orange';

interface TagPrimitiveProps {
  label: string;
  color?: TagColor | string;
  className?: string;
}

export const TagPrimitive = ({ label, color = 'gray', className }: TagPrimitiveProps) => {
  const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
  }

  // Fallback to gray if color key doesn't exist, or if it's a custom string try to use it? 
  // For now, assume it maps to one of the keys or defaults to gray.
  const colorClass = colors[color] || colors.gray

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} ${className || ''}`}>
      <MarkdownPrimitive inline>{label}</MarkdownPrimitive>
    </span>
  )
}
