import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, ShieldCheck, Clock, User, ArrowRight } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs(60)
      .then((res) => setLogs(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Governance & Traceability Ledger
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>IMMUTABLE OPERATIONAL AUDIT LOG</span>
          </h1>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing last <span className="text-white font-bold">{logs.length}</span> events
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg space-y-3 font-mono text-xs">
        {logs.length > 0 ? (
          <div className="divide-y divide-surface-border/60">
            {logs.map((log) => (
              <div key={log._id || log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-bold">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-slate-300 border border-surface-border">
                      {log.agent || 'Campus Engine'}
                    </span>
                    {log.approvalRequired && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        APPROVAL REQUIRED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 font-sans text-xs">{log.reason}</p>
                  <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                    <span>Actor: <strong className="text-slate-400">{log.actor}</strong></span>
                    {log.affectedResources && log.affectedResources.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Target: <strong className="text-slate-300">{log.affectedResources.join(', ')}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  <div className="flex items-center space-x-1 sm:justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            {loading ? 'Reading audit trail...' : 'No audit entries recorded yet.'}
          </div>
        )}
      </div>
    </div>
  );
};
