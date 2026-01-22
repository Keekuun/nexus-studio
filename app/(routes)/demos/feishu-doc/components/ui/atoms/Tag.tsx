import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const Tag = ({ node }: any) => {
  const { label, color = 'blue' } = node.attrs
  
  const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <NodeViewWrapper as="span" className="inline-block mx-1 align-middle" data-block-id={node.attrs.blockId}>
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[color] || colors.gray}`}>
        {label}
      </span>
    </NodeViewWrapper>
  )
}
