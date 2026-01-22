import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const Heading = ({ node, updateAttributes, extension }: any) => {
  const level = node.attrs.level
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <NodeViewWrapper className={`heading-node level-${level} relative group`} data-block-id={node.attrs.blockId}>
      <Tag className={`font-bold ${level === 1 ? 'text-3xl mb-4' : 'text-xl mb-2'} text-gray-900`}>
        <NodeViewContent />
      </Tag>
    </NodeViewWrapper>
  )
}
