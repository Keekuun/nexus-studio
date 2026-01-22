import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const CardBlock = ({ node }: any) => {
  const { title } = node.attrs

  return (
    <NodeViewWrapper 
        className="card-block border border-gray-200 rounded-lg shadow-sm bg-white my-4 overflow-hidden group"
        data-block-id={node.attrs.blockId}
    >
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-gray-700 text-sm">{title || 'Card Title'}</span>
          <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
      </div>
      <div className="p-4">
          <NodeViewContent />
      </div>
    </NodeViewWrapper>
  )
}
