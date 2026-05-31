'use client'

import type { Block } from '@/lib/builder/types'

export default function TableBlock({ block }: { block: Block }) {
  const { props } = block
  const headers = (props.headers as string[]) || []
  const rows = (props.rows as string[][]) || []

  const cellStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: 14,
    color: '#374151',
  }

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 600,
    color: '#111827',
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #d1d5db',
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} style={headerCellStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length || 1} style={{ ...cellStyle, textAlign: 'center', color: '#9ca3af' }}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={cellStyle}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
