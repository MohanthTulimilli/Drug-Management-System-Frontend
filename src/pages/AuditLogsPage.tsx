import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../api';
import { FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['auditLogs'], queryFn: () => adminAPI.getAuditLogs().then(r => r.data) });

  return (
    <div className="page active">
      <div className="panel mt14">
        {isLoading ? <div className="panel-body" style={{ color: 'var(--text-muted)' }}>Loading...</div> : logs.length === 0 ? (
          <div className="panel-body text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-dim)' }}>No audit logs recorded yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>System activities will appear here</p>
          </div>
        ) : (
          <div className="panel-body space-y-2">{logs.map((l: any) => (
            <div key={l.id} className="tl-item">
              <div className="tl-dot b" />
              <div className="tl-body">
                <div className="tl-text"><span style={{ color: 'var(--text-white)', fontWeight: 500 }}>{l.action}</span> <span className="badge badge-shipped text-[10px]">{l.entity}</span></div>
                {l.details && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{l.details}</p>}
                <div className="tl-time">by {l.performedBy} • {new Date(l.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
