import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';
import { UploadCloud, CheckCircle2, AlertTriangle, FileCheck, Columns, Package, Trash2 } from 'lucide-react';

interface ValidationResult {
  stage1FileTypeOk: boolean;
  stage2ColumnsOk: boolean;
  fileType: string;
  requiredColumns: string[];
  foundColumns: string[];
  missingColumns: string[];
  errors: string[];
  previewRows: string[][];
}

interface UploadResult {
  totalRecords: number;
  successCount: number;
  failedCount: number;
  errors: string[];
}

interface HistoryRow {
  fileName: string;
  date: string;
  rows: number;
  status: 'SUCCESS' | 'FAILED';
}

const REQUIRED_COLS = 'medicine_name, batch_number, quantity, expiry_date, price';

const UPLOAD_HISTORY_DEFAULT: HistoryRow[] = [
  { fileName: 'medicines_batch_mar.csv', date: 'Mar 15, 2026', rows: 12, status: 'SUCCESS' },
  { fileName: 'inventory_update.xlsx', date: 'Mar 10, 2026', rows: 45, status: 'SUCCESS' },
  { fileName: 'batch_feb_final.csv', date: 'Feb 28, 2026', rows: 30, status: 'SUCCESS' },
  { fileName: 'medicines_bulk_v2.csv', date: 'Feb 15, 2026', rows: 8, status: 'FAILED' },
];

export default function BulkUploadPage() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadHistory, setUploadHistory] = useState<HistoryRow[]>(UPLOAD_HISTORY_DEFAULT);

  const validateMut = useMutation({
    mutationFn: (f: File) => adminAPI.validateBatches(f).then(r => r.data as ValidationResult),
    onSuccess: (data) => setValidation(data),
  });

  const uploadMut = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      return adminAPI.uploadBatches(file).then(r => r.data as UploadResult);
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setUploadHistory((prev) => [
        { fileName: file?.name || 'upload', date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }), rows: data.totalRecords, status: data.failedCount === 0 ? 'SUCCESS' : 'FAILED' },
        ...prev,
      ]);
      qc.invalidateQueries({ queryKey: ['batches'] });
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['lowStock'] });
      qc.invalidateQueries({ queryKey: ['expiring'] });
      qc.invalidateQueries({ queryKey: ['invStats'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const clearMut = useMutation({
    mutationFn: () => adminAPI.clearInventory(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['lowStock'] });
      qc.invalidateQueries({ queryKey: ['expiring'] });
      qc.invalidateQueries({ queryKey: ['invStats'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setValidation(null);
      setUploadResult(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setValidation(null);
    setUploadResult(null);
    if (f) validateMut.mutate(f);
  };

  const stage1Ok = validation?.stage1FileTypeOk ?? false;
  const stage2Ok = validation?.stage2ColumnsOk ?? false;
  const readyToUpload = stage1Ok && stage2Ok && file;
  const previewRows = validation?.previewRows;
  const hasPreviewRows = (previewRows?.length ?? 0) > 0;

  return (
    <div className="page active">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => window.confirm('Remove all your medicines and batches? You can re-upload after this.') && clearMut.mutate()}
          disabled={clearMut.isPending}
          className="tb-btn"
          style={{ color: 'var(--red)' }}
        >
          <Trash2 className="w-4 h-4" /> {clearMut.isPending ? 'Clearing...' : 'Clear inventory data'}
        </button>
      </div>

      <div className="two-col mt14">
        <div>
          <div className="upload-zone">
            <div className="upload-ico">📂</div>
            <div className="upload-title">Drop your CSV or Excel file here</div>
            <div className="upload-sub">Supports .csv, .xlsx, .xls — max 10 MB</div>
            <label className="tb-btn primary mt-4 inline-flex cursor-pointer">
              <input type="file" className="hidden" accept=".csv,.xlsx,.pdf" onChange={handleFileChange} />
              Browse Files
            </label>
            {file && <div className="text-sm mt-2" style={{ color: 'var(--text-dim)' }}>{file.name}</div>}
          </div>

          <div className="panel mt14">
            <div className="panel-hdr">
              <span className="panel-title">Guidelines</span>
            </div>
            <div className="panel-body text-sm" style={{ color: 'var(--text-dim)' }}>
              <ul className="list-disc list-inside space-y-2">
                <li>First row must contain column headers</li>
                <li>Required columns: <span style={{ color: '#1ab8cc' }}>name, batch, quantity, cost, selling, expiry</span></li>
                <li>Expiry date format: <span style={{ color: '#1ab8cc' }}>YYYY-MM-DD</span></li>
                <li>Duplicate batch numbers will be skipped</li>
                <li>Maximum 500 rows per upload</li>
              </ul>
            </div>
          </div>

          {validation && (
            <>
              <div className="panel mt14">
                <div className="panel-hdr flex flex-wrap gap-2">
                  <div className={`flex items-center gap-2 ${stage1Ok ? '' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage1Ok ? 'bg-[var(--green-bg)]' : 'bg-[var(--red-bg)]'}`}><FileCheck className="w-4 h-4" style={{ color: stage1Ok ? 'var(--green)' : 'var(--red)' }} /></div>
                    <span className="panel-title">Stage 1: File type</span>
                    {validation && <span className="text-sm" style={{ color: stage1Ok ? 'var(--green)' : 'var(--red)' }}>{stage1Ok ? 'Passed' : 'Failed'}</span>}
                  </div>
                </div>
                {!stage1Ok && validation.errors?.[0] && <div className="panel-body pt-0 text-sm" style={{ color: 'var(--red)' }}>{validation.errors[0]}</div>}
              </div>
              <div className="panel mt14">
                <div className="panel-hdr flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage2Ok ? 'bg-[var(--green-bg)]' : 'bg-[var(--red-bg)]'}`}><Columns className="w-4 h-4" style={{ color: stage2Ok ? 'var(--green)' : 'var(--red)' }} /></div>
                    <span className="panel-title">Stage 2: Required columns</span>
                    {validation && <span className="text-sm" style={{ color: stage2Ok ? 'var(--green)' : 'var(--red)' }}>{stage2Ok ? 'Passed' : 'Failed'}</span>}
                  </div>
                </div>
                {!stage2Ok && validation.missingColumns?.length > 0 && <div className="panel-body pt-0 text-sm" style={{ color: 'var(--red)' }}>Missing: {validation.missingColumns.join(', ')}</div>}
              </div>
            </>
          )}

          {hasPreviewRows && previewRows && (
            <div className="table-card mt14">
              <div className="tbar"><span className="panel-title">Preview (first rows)</span></div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr>{REQUIRED_COLS.split(', ').map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx}>{row.map((cell, i) => <td key={i} className="primary">{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {readyToUpload && (
            <div className="mt14">
              <button type="button" className="tb-btn primary" disabled={uploadMut.isPending} onClick={() => uploadMut.mutate()}>
                {uploadMut.isPending ? 'Uploading...' : 'Upload and add to inventory'}
              </button>
            </div>
          )}

          {uploadResult && (
            <div className="panel mt14">
              <div className="panel-body flex flex-wrap gap-2 items-center">
                {uploadResult.failedCount === 0 ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--green)' }} /> : <AlertTriangle className="w-5 h-5" style={{ color: 'var(--amber)' }} />}
                <span className="font-semibold" style={{ color: 'var(--text-white)' }}>Stage 3: Data added to inventory</span>
                <span className="badge badge-shipped">Total: {uploadResult.totalRecords}</span>
                <span className="badge badge-delivered">Success: {uploadResult.successCount}</span>
                {uploadResult.failedCount > 0 && <span className="badge badge-inactive">Failed: {uploadResult.failedCount}</span>}
              </div>
              {uploadResult.errors?.length > 0 && <div className="panel-body pt-0 text-xs max-h-32 overflow-y-auto" style={{ color: 'var(--red)' }}>{uploadResult.errors.map((e, i) => <div key={i}>• {e}</div>)}</div>}
              <div className="panel-body pt-0 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                <Link to="/inventory" className="inline-flex items-center gap-2 font-medium" style={{ color: '#1ab8cc' }}><Package className="w-4 h-4" /> View in Inventory</Link>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="table-card">
            <div className="tbar"><span className="panel-title">Upload History</span></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><th>File Name</th><th>Date</th><th>Rows</th><th>Status</th></tr></thead>
                <tbody>
                  {uploadHistory.map((h, i) => (
                    <tr key={i}>
                      <td className="primary">{h.fileName}</td>
                      <td>{h.date}</td>
                      <td>{h.rows}</td>
                      <td>{h.status === 'SUCCESS' ? <span className="badge badge-delivered">SUCCESS</span> : <span className="badge badge-inactive">FAILED</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel mt14">
            <div className="panel-hdr"><span className="panel-title">Download Template</span></div>
            <div className="panel-body flex flex-col gap-2">
              <button type="button" className="tb-btn w-full">⬇ Download CSV Template</button>
              <button type="button" className="tb-btn w-full">⬇ Download XLSX Template</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
