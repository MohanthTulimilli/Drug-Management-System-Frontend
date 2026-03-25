import React from 'react';

interface Props {
  rows: string[][];
}

export default function PreviewTable({ rows }: Props) {
  if (!rows.length) return null;
  const [header, ...data] = rows;

  return (
    <div className="card mt-4">
      <h3 className="text-sm font-semibold mb-2 text-primary">Preview (first rows)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600">
              {header.map((h, i) => (
                <th key={i} className="text-left py-2 px-3 font-medium text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-700">
                {row.map((cell, i) => (
                  <td key={i} className="py-2 px-3 text-secondary">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

