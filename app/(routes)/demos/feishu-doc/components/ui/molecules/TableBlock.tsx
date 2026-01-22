import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const TableBlock = ({ node }: any) => {
  const { data } = node.attrs
  // Simple data-driven table for demo
  // data is expected to be [][]
  
  return (
    <NodeViewWrapper className="table-block my-6 overflow-x-auto" data-block-id={node.attrs.blockId}>
      <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg shadow-sm">
          <tbody>
              {data.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50">
                      {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex} 
                            className={`p-3 border-r last:border-0 border-gray-100 text-sm ${rowIndex === 0 ? 'bg-gray-50 font-semibold text-gray-700' : 'text-gray-600'}`}
                          >
                              {cell}
                          </td>
                      ))}
                  </tr>
              ))}
          </tbody>
      </table>
    </NodeViewWrapper>
  )
}
