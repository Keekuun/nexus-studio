import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React from 'react'

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
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium text-sm">Creative Planning</span>
          </div>
          <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Batch Feedback
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
          </div>
      </div>

      <div className="p-6">
          {/* Title & Info */}
          <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
              <p className="text-xs text-gray-500">{date}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
              {tabs.map((tab: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${tab.active ? 'bg-gray-50 border-gray-200 ring-1 ring-gray-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                  >
                      <div className="font-semibold text-sm text-gray-900 mb-1">{tab.label}</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium 
                        ${tab.color === 'blue' ? 'bg-blue-100 text-blue-700' : 
                          tab.color === 'orange' ? 'bg-orange-100 text-orange-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                          {tab.tag}
                      </span>
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
