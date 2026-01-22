import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const Paragraph = ({ node }: any) => {
  return (
    <NodeViewWrapper className="paragraph-node mb-2 leading-relaxed text-gray-700 relative group" data-block-id={node.attrs.blockId}>
      <div className="paragraph-content">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  )
}
