import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { AudioPrimitive } from '../primitives/AudioPrimitive'

export const AudioBlock = ({ node }: any) => {
  const { src, caption } = node.attrs

  return (
    <NodeViewWrapper className="audio-block my-4 relative group" data-block-id={node.attrs.blockId}>
      <div className="max-w-[600px] mx-auto">
        <AudioPrimitive src={src} caption={caption} />
      </div>
    </NodeViewWrapper>
  )
}
