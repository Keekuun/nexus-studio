import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { TagPrimitive } from '../primitives/TagPrimitive'

export const Section = ({ node }: any) => {
  return (
    <NodeViewWrapper 
        className="section-block border-2 border-transparent hover:border-gray-100 transition-colors p-6 rounded-xl my-4 bg-gray-50/30 relative group" 
        data-type="section"
        data-block-id={node.attrs.blockId}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <TagPrimitive label="Container" color="gray" className="bg-white shadow-sm" />
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  )
}
