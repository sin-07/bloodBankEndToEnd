'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function Table<T extends { _id?: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        <div className="h-10 bg-slate-850 rounded-xl animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-900/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-slate-900/40">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/[0.07]">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-5 py-3.5 font-bold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-850 flex items-center justify-center text-slate-500">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || rowIndex}
                className={`transition-colors text-slate-200 hover:bg-slate-800/50 ${
                  onRowClick ? 'cursor-pointer active:bg-slate-800/70' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-5 py-3.5 whitespace-nowrap ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
