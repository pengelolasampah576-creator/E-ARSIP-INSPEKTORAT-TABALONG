import React from 'react';
import { UserRole } from '../types';
import { 
  Table, 
  BarChart3, 
  Users, 
  History, 
  Sparkles, 
  FileSpreadsheet, 
  Printer, 
  ShieldCheck, 
  PlusCircle,
  Building2,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'matrix' | 'dashboard' | 'users' | 'logs' | 'ai';
  setActiveTab: (tab: 'matrix' | 'dashboard' | 'users' | 'logs' | 'ai') => void;
  userRole: UserRole;
  onOpenAddModal: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  selectedBidang: string;
  onSelectBidang: (b: string) => void;
  bidangList: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onOpenAddModal,
  onExportExcel,
  onPrint,
  selectedBidang,
  onSelectBidang,
  bidangList
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          Menu Utama
        </div>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'matrix'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Table size={18} className={activeTab === 'matrix' ? 'text-amber-400' : 'text-slate-400'} />
          <span>Matriks Regulasi</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BarChart3 size={18} className={activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'} />
          <span>Dashboard & Analisis</span>
        </button>

        {/* Exclusive Master Admin User Management */}
        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users size={18} className={activeTab === 'users' ? 'text-amber-400' : 'text-slate-400'} />
            <span>Manajemen User</span>
          </div>
          {userRole === 'master_admin' ? (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
              Admin
            </span>
          ) : (
            <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
              Akses
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <History size={18} className={activeTab === 'logs' ? 'text-amber-400' : 'text-slate-400'} />
          <span>Log Aktivitas</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Sparkles size={18} className="text-teal-400 animate-pulse" />
          <span>Asisten AI Regulasi</span>
        </button>
      </div>

      {/* Quick Action Buttons for Add/Export */}
      <div className="px-4 py-3 border-t border-b border-slate-800/80 space-y-2">
        {(userRole === 'master_admin' || userRole === 'inspektur') && (
          <button
            onClick={onOpenAddModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <PlusCircle size={15} />
            <span>Tambah Regulasi Baru</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onExportExcel}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-medium transition-colors"
            title="Ekspor ke Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} />
            <span>Excel</span>
          </button>
          
          <button
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Cetak Laporan / PDF"
          >
            <Printer size={14} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Filter by Bidang */}
      <div className="p-4 flex-1 overflow-y-auto max-h-96">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
            <Building2 size={12} /> Filter Bidang
          </span>
          {selectedBidang !== 'Semua Bidang' && (
            <button 
              onClick={() => onSelectBidang('Semua Bidang')}
              className="text-[10px] text-amber-400 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1">
          {bidangList.map((bidang) => (
            <button
              key={bidang}
              onClick={() => onSelectBidang(bidang)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs truncate transition-colors flex items-center justify-between ${
                selectedBidang === bidang
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400 pl-2'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="truncate">{bidang}</span>
              {bidang === selectedBidang && <FolderOpen size={12} className="text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        <div className="font-semibold text-slate-400">Inspektorat Kab. Tabalong</div>
        <div>Tanjung, Kalimantan Selatan</div>
        <div className="text-[10px] text-amber-500/70 mt-1">v2.5 • e-Arsip Matriks</div>
      </div>

    </aside>
  );
};
