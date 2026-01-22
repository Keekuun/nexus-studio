import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { HeadingPrimitive } from '../primitives/HeadingPrimitive'

export const Heading = ({ node }: any) => {
  const level = node.attrs.level

  return (
    <NodeViewWrapper className={`heading-node level-${level} relative group`} data-block-id={node.attrs.blockId}>
      <HeadingPrimitive level={level}>
        <NodeViewContent />
      </HeadingPrimitive>
    </NodeViewWrapper>
  )
}
