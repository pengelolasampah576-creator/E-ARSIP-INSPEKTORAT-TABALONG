import React from 'react';
import { AuditLog } from '../types';
import { History, Shield, Clock, FileText, User } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History size={20} className="text-amber-400" />
            Log Aktivitas & Jejak Audit Sistem
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Catatan historis penambahan, pembaruan status, penghapusan dokumen, dan log masuk pengguna.
          </p>
        </div>
        <span className="text-xs font-semibold bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
          Total Log: {logs.length}
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3 text-xs">
              
              <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                log.action.includes('Login') ? 'bg-blue-100 text-blue-800' :
                log.action.includes('Tambah') ? 'bg-emerald-100 text-emerald-800' :
                log.action.includes('Hapus') ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {log.action.includes('Login') ? <User size={16} /> : <FileText size={16} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-bold text-slate-900">
                    {log.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">
                  {log.details}
                </p>

                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">{log.userName}</span>
                  <span>•</span>
                  <span className="capitalize px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 border border-slate-200">
                    {log.userRole === 'master_admin' ? 'Master Admin' : log.userRole}
                  </span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
