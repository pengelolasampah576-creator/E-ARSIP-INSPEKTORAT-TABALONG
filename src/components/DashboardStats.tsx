import React from 'react';
import { DocumentItem } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  TrendingUp, 
  PieChart as PieIcon,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardStatsProps {
  documents: DocumentItem[];
  bidangList: string[];
  onSelectBidangFilter: (b: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  documents,
  bidangList,
  onSelectBidangFilter
}) => {
  const total = documents.length;
  const ada = documents.filter(d => d.status === 'Ada').length;
  const dalamProses = documents.filter(d => d.status === 'Dalam Proses').length;
  const rencanaEvaluasi = documents.filter(d => d.status === 'Rencana Evaluasi').length;
  const tidakAda = documents.filter(d => d.status === 'Tidak Ada').length;

  const percentageAda = total > 0 ? Math.round((ada / total) * 100) : 0;
  const percentageProses = total > 0 ? Math.round((dalamProses / total) * 100) : 0;
  const percentageKosong = total > 0 ? Math.round((tidakAda / total) * 100) : 0;

  // Calculate stats by Bidang
  const cleanBidangs = bidangList.filter(b => b !== 'Semua Bidang');
  const statsByBidang = cleanBidangs.map(b => {
    const docs = documents.filter(d => d.bidang === b);
    const countAda = docs.filter(d => d.status === 'Ada').length;
    const countProses = docs.filter(d => d.status === 'Dalam Proses').length;
    const countKosong = docs.filter(d => d.status === 'Tidak Ada').length;
    const totalBidang = docs.length;
    const pct = totalBidang > 0 ? Math.round((countAda / totalBidang) * 100) : 0;

    return {
      bidang: b,
      total: totalBidang,
      ada: countAda,
      proses: countProses,
      kosong: countKosong,
      pct
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <ShieldCheck size={14} /> DOKUMEN INVENTORI REGULASI TABALONG
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Dashboard Kepatuhan & Kelengkapan Dokumen
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Analisis persentase ketersediaan Peraturan Bupati, Kebijakan, Pedoman, dan Standar Operasional Prosedur (SOP) di Inspektorat Daerah Kabupaten Tabalong.
            </p>
          </div>

          {/* Overall Meter */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex items-center gap-4 min-w-[240px]">
            <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
              {/* Circular progress display */}
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray={`${percentageAda}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-base font-black text-amber-300">
                {percentageAda}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Indeks Kepatuhan</div>
              <div className="text-xs text-emerald-400 font-semibold">{ada} / {total} Regulasi</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target: 100% Selesai</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">Total Regulasi</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{total}</span>
            <span className="text-[11px] text-slate-500">Master Regulasi Tabalong</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 block uppercase">Tersedia (Ada)</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{ada}</span>
            <span className="text-[11px] text-emerald-600 font-medium">{percentageAda}% dari total regulasi</span>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block uppercase">Dalam Proses</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{dalamProses}</span>
            <span className="text-[11px] text-amber-600 font-medium">{percentageProses}% tahap penyusunan</span>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 block uppercase">Belum Ada</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{tidakAda}</span>
            <span className="text-[11px] text-rose-600 font-medium">{percentageKosong}% butuh penyusunan</span>
          </div>
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
            <XCircle size={24} />
          </div>
        </div>

      </div>

      {/* Progress Breakdown per Bidang Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={18} className="text-amber-600" />
              Kelengkapan Dokumen per Bidang & Seksi
            </h2>
            <p className="text-xs text-slate-500">
              Klik pada salah satu bidang untuk langsung memfilter matriks dokumen
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Total {cleanBidangs.length} Bidang Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsByBidang.map((item) => (
            <div
              key={item.bidang}
              onClick={() => onSelectBidangFilter(item.bidang)}
              className="p-3.5 bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-lg cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900 truncate">
                  {item.bidang}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded ${
                  item.pct >= 70 ? 'bg-emerald-100 text-emerald-800' :
                  item.pct >= 30 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex mb-2">
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: `${item.total > 0 ? (item.ada / item.total) * 100 : 0}%` }} 
                  title={`Ada: ${item.ada}`}
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${item.total > 0 ? (item.proses / item.total) * 100 : 0}%` }} 
                  title={`Proses: ${item.proses}`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="text-emerald-700 font-semibold">Ada: {item.ada}</span>
                <span className="text-amber-700 font-semibold">Proses: {item.proses}</span>
                <span className="text-slate-500">Kosong: {item.kosong}</span>
                <span className="text-slate-400">Total: {item.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
