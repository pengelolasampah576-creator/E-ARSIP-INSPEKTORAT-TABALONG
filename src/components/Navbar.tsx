import React, { useState } from 'react';
import { User } from '../types';
import { LOGO_URL } from '../assets';
import { 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Key, 
  FileCheck2, 
  Search,
  Sparkles,
  Menu,
  Share2,
  Check,
  RefreshCw,
  Download,
  Upload,
  Database,
  Trash2,
  Target
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  stats: {
    total: number;
    ada: number;
    percentage: number;
  };
  onOpenAi: () => void;
  onToggleSidebarMobile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData?: () => void;
  onOpenTargetModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  stats,
  onOpenAi,
  onToggleSidebarMobile,
  searchQuery,
  onSearchChange,
  onRefresh,
  onExportBackup,
  onImportBackup,
  onResetData,
  onOpenTargetModal
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleSidebarMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              title="Buka Menu"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-13 sm:h-13 flex-shrink-0 flex items-center justify-center">
                <img 
                  src={LOGO_URL} 
                  alt="Logo e-Arsip" 
                  className="w-full h-full object-contain filter drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-amber-200 via-white to-teal-200 bg-clip-text text-transparent">
                    e-Arsip
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Inspektorat
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold truncate max-w-[200px] sm:max-w-none">
                  Inspektorat Daerah Kabupaten Tabalong
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-amber-300 tracking-tight leading-tight mt-0.5">
                  Copyright by @2026_WG Corp.
                </p>
              </div>
            </div>
          </div>

          {/* Middle Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari regulasi, SOP, nomor perbup..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right User Badge & Stats */}
          <div className="flex items-center gap-3">
            
            {/* Cloud Sync Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 rounded-full text-xs font-medium shadow-sm" title="Tersambung ke Firebase Firestore Realtime Cloud Server">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden md:inline">Cloud Realtime Sync</span>
            </div>

            {/* Quick Stat Pill */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">
              <FileCheck2 size={14} className="text-teal-400" />
              <span>Kelengkapan:</span>
              <span className="font-bold text-amber-300">{stats.percentage}%</span>
              <span className="text-slate-500">({stats.ada}/{stats.total})</span>
            </div>

            {/* Refresh / Sync Data Button */}
            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-all"
                title="Sinkronkan / Muat Ulang Data Server Terkini"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-teal-400' : 'text-slate-400'} />
                <span className="hidden lg:inline">Sinkronkan</span>
              </button>
            )}

            {/* Backup / Restore Database JSON */}
            {onExportBackup && (
              <button
                onClick={onExportBackup}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                title="Ekspor Backup File Database (.JSON)"
              >
                <Download size={14} className="text-amber-400" />
                <span className="hidden xl:inline">Ekspor JSON</span>
              </button>
            )}

            {onImportBackup && (
              <label
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-teal-300 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer transition-all"
                title="Impor & Pulihkan Database dari File (.JSON)"
              >
                <Upload size={14} className="text-teal-400" />
                <span className="hidden xl:inline">Impor JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </label>
            )}

            {onOpenTargetModal && (
              <button
                onClick={onOpenTargetModal}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/40 transition-all"
                title="Kelola & Atur Target Dokumen Per Bidang"
              >
                <Target size={14} className="text-amber-400" />
                <span className="hidden xl:inline">Target Bidang</span>
              </button>
            )}



            {/* Share App Link Button */}
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all border ${
                copied 
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' 
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
              }`}
              title="Salin Link Aplikasi e-Arsip untuk Dibagikan ke Pengguna Lain"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? 'Link Disalin!' : 'Bagikan Link'}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
              title="Buka Asisten AI Inspektorat"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="hidden sm:inline">Asisten AI</span>
            </button>

            {/* User Profile / Master Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-lg p-1 pr-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'master_admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : currentUser.role === 'inspektur'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {currentUser.role === 'master_admin' ? '👑' : currentUser.role === 'inspektur' ? '🔍' : '👁️'}
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-amber-400/90 capitalize font-medium flex items-center gap-1">
                    {currentUser.role === 'master_admin' && <ShieldCheck size={10} />}
                    {currentUser.role === 'master_admin' ? 'Master Admin' : currentUser.role === 'inspektur' ? 'Auditor / Inspektur' : 'Publik / Viewer'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors ml-1"
                  title="Keluar"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium shadow transition-colors"
              >
                <Key size={14} />
                <span>Login Master</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
