import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { TagPrimitive } from '../primitives/TagPrimitive'

export const Tag = ({ node }: any) => {
  const { label, color = 'blue' } = node.attrs

  return (
    <NodeViewWrapper as="span" className="inline-block mx-1 align-middle" data-block-id={node.attrs.blockId}>
      <TagPrimitive label={label} color={color} />
    </NodeViewWrapper>
  )
}
