import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'

interface ShotData {
    id: number;
    images: string[];
    duration: string;
    notes: string;
}

export const ShotTable = ({ node }: any) => {
  const { data = [] } = node.attrs
  const baseBlockId = node.attrs.blockId || 'shot-table';

  return (
    <NodeViewWrapper 
        className="shot-table-block my-8 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white" 
        data-block-id={baseBlockId}
    >
      <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
              <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                      Shot
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shot Notes
                  </th>
              </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row: ShotData, rowIndex: number) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                          {row.id}
                      </td>
                      <td className="px-6 py-4 align-top">
                          <div className="flex gap-2">
                              {row.images.map((img, imgIndex) => (
                                  <div 
                                    key={imgIndex} 
                                    className="relative w-24 h-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                    data-block-id={`${baseBlockId}-row-${rowIndex}-img-${imgIndex}`}
                                  >
                                      <img src={img} alt={`Shot ${row.id}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  </div>
                              ))}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                          {row.duration}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 align-top leading-relaxed">
                          {row.notes}
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>
    </NodeViewWrapper>
  )
}
