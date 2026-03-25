import React, { useCallback, useState } from 'react';

interface Props {
  onFileSelected: (file: File | null, previewRows: string[][]) => void;
}

const ACCEPTED_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
];

export default function FileUpload({ onFileSelected }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    setError(null);
    if (!fileList || fileList.length === 0) {
      onFileSelected(null, []);
      return;
    }
    const file = fileList[0];
    const ext = file.name.toLowerCase();
    if (!ACCEPTED_TYPES.includes(file.type) && !ext.endsWith('.csv') && !ext.endsWith('.xlsx') && !ext.endsWith('.pdf')) {
      setError('Unsupported file type. Please upload CSV, XLSX, or PDF.');
      onFileSelected(null, []);
      return;
    }

    const previewRows: string[][] = [];

    if (ext.endsWith('.csv') || file.type === 'text/csv') {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      for (let i = 0; i < Math.min(lines.length, 6); i++) {
        previewRows.push(lines[i].split(','));
      }
    }

    onFileSelected(file, previewRows);
  }, [onFileSelected]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${dragActive ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/30' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 hover:border-cyan-400'}`}
        onClick={() => (document.getElementById('bulk-upload-input') as HTMLInputElement | null)?.click()}
      >
        <p className="text-sm text-secondary">
          Drag & drop a <span className="font-semibold">CSV</span>, <span className="font-semibold">Excel (.xlsx)</span>, or <span className="font-semibold">PDF</span> file here,
          or <span className="text-cyan-600 dark:text-cyan-400 font-semibold">browse</span> to upload.
        </p>
        <p className="text-xs text-muted mt-1">
          Expected columns: medicine_name, batch_number, quantity, expiry_date, price
        </p>
      </div>
      <input
        id="bulk-upload-input"
        type="file"
        className="hidden"
        accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
        onChange={e => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

