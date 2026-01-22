import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React from 'react'
import { HeadingPrimitive } from '../primitives/HeadingPrimitive'
import { IconPrimitive } from '../primitives/IconPrimitive'
import { ButtonPrimitive } from '../primitives/ButtonPrimitive'
import { TagPrimitive } from '../primitives/TagPrimitive'

export const CreativePlanning = ({ node }: any) => {
  const { 
      title = 'V2 - Creative Confirmation',
      date = '2025-2-15 · 14:05',
      tabs = [
          { label: 'Concept 1', tag: 'Product-First', color: 'blue', active: true },
          { label: 'Concept 2', tag: 'Story-Driven', color: 'orange', active: false },
          { label: 'Concept 3', tag: 'High-Impact', color: 'yellow', active: false },
      ]
  } = node.attrs
  
  const baseBlockId = node.attrs.blockId || 'creative-planning';

  return (
    <NodeViewWrapper 
        className="creative-planning-block bg-white rounded-xl border border-gray-200 my-8 shadow-sm overflow-hidden" 
        data-block-id={baseBlockId}
    >
      {/* Header */}
      <div className="border-b border-gray-100 p-4 flex items-center justify-between" data-block-id={`${baseBlockId}-header`}>
          <div className="flex items-center gap-2 text-gray-600">
              <IconPrimitive name="creative" className="w-4 h-4" />
              <span className="font-medium text-sm">Creative Planning</span>
          </div>
          <div className="flex items-center gap-3">
              <ButtonPrimitive variant="outline" size="sm" className="gap-1.5">
                  <IconPrimitive name="batch-feedback" className="w-3.5 h-3.5" />
                  Batch Feedback
              </ButtonPrimitive>
              <ButtonPrimitive variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <IconPrimitive name="close" className="w-4 h-4" />
              </ButtonPrimitive>
          </div>
      </div>

      <div className="p-6">
          {/* Title & Info */}
          <div className="mb-6" data-block-id={`${baseBlockId}-title`}>
              <HeadingPrimitive level={2} className="mb-1">{title}</HeadingPrimitive>
              <p className="text-xs text-gray-500">{date}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
              {tabs.map((tab: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${tab.active ? 'bg-gray-50 border-gray-200 ring-1 ring-gray-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                    data-block-id={`${baseBlockId}-tab-${index}`}
                  >
                      <div className="font-semibold text-sm text-gray-900 mb-1">{tab.label}</div>
                      <TagPrimitive label={tab.tag} color={tab.color} />
                  </div>
              ))}
          </div>

          {/* Content Area - This is where we render the nested blocks like StoryCards */}
          <div className="space-y-8">
              <NodeViewContent />
          </div>
      </div>
    </NodeViewWrapper>
  )
}
