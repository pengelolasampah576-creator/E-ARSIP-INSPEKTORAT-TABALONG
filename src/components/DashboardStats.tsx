import React from 'react';
import { DocumentItem, BidangTargets } from '../types';
import { DEFAULT_BIDANG_TARGETS } from '../data/initialData';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Target,
  ShieldCheck,
  Settings
} from 'lucide-react';

interface DashboardStatsProps {
  documents: DocumentItem[];
  bidangList: string[];
  targets: BidangTargets;
  onSelectBidangFilter: (b: string) => void;
  onOpenTargetModal: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  documents,
  bidangList,
  targets,
  onSelectBidangFilter,
  onOpenTargetModal
}) => {
  const totalDocs = documents.length;
  const ada = documents.filter(d => d.status === 'Ada').length;
  const dalamProses = documents.filter(d => d.status === 'Dalam Proses').length;
  const tidakAda = documents.filter(d => d.status === 'Tidak Ada').length;

  const cleanBidangs = bidangList.filter(b => b !== 'Semua Bidang');

  let totalTargetSum = 0;
  let totalEffectiveAdaSum = 0;
  let unfulfilledBidangsCount = 0;

  const statsByBidang = cleanBidangs.map(b => {
    const docs = documents.filter(d => d.bidang === b);
    const countAda = docs.filter(d => d.status === 'Ada').length;
    const countProses = docs.filter(d => d.status === 'Dalam Proses').length;
    const countKosong = docs.filter(d => d.status === 'Tidak Ada').length;
    
    const targetCount = targets[b] ?? DEFAULT_BIDANG_TARGETS[b] ?? 5;
    totalTargetSum += targetCount;

    const effectiveAda = Math.min(countAda, targetCount);
    totalEffectiveAdaSum += effectiveAda;

    const isFulfilled = targetCount > 0 && countAda >= targetCount;
    if (!isFulfilled) {
      unfulfilledBidangsCount++;
    }

    const gap = targetCount > countAda ? targetCount - countAda : 0;
    const pct = targetCount > 0 ? Math.min(100, Math.round((countAda / targetCount) * 100)) : 0;

    return {
      bidang: b,
      total: docs.length,
      ada: countAda,
      proses: countProses,
      kosong: countKosong,
      target: targetCount,
      isFulfilled,
      gap,
      pct
    };
  });

  // Calculate Overall Completion Percentage
  let overallCompletionPct = totalTargetSum > 0 ? Math.floor((totalEffectiveAdaSum / totalTargetSum) * 100) : 0;
  
  // Rule: "selama target tidak terpenuhi maka nilai tidak akan sempurna"
  // If there is any unfulfilled bidang, score cannot reach 100%
  if (unfulfilledBidangsCount > 0 && overallCompletionPct >= 100) {
    overallCompletionPct = 99;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <ShieldCheck size={14} /> DOKUMEN INVENTORI REGULASI TABALONG
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Dashboard Kepatuhan & Target Pemenuhan Regulasi
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Analisis persentase ketersediaan Peraturan Bupati, Kebijakan, Pedoman, dan SOP. Selama seluruh target bidang belum terpenuhi, nilai kepatuhan tidak akan mencapai 100% sempurna.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Overall Meter */}
            <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={unfulfilledBidangsCount === 0 ? 'text-emerald-400' : 'text-amber-400'}
                    strokeDasharray={`${overallCompletionPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-base font-black ${unfulfilledBidangsCount === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {overallCompletionPct}%
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-200 uppercase">Indeks Capaian</div>
                <div className="text-xs text-emerald-400 font-bold mt-0.5">{ada} / {totalTargetSum} Target</div>
                <div className="mt-1">
                  {unfulfilledBidangsCount === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      <CheckCircle2 size={10} /> SEMPURNA (100%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                      <AlertTriangle size={10} /> BELUM SEMPURNA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Atur Target Button */}
            <button
              onClick={onOpenTargetModal}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <Target size={18} />
              <div className="text-left">
                <div className="text-[10px] uppercase opacity-80 leading-none">Pengaturan</div>
                <div className="text-xs font-black leading-tight">Atur Target Bidang</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Target Status Warning Card if not full */}
      {unfulfilledBidangsCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wide text-amber-900">
                Peringatan Evaluasi Target Bidang ({unfulfilledBidangsCount} Bidang Belum Memenuhi Target)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Nilai capaian tidak akan bisa menjadi 100% sempurna selama masih terdapat bidang yang kuantitas dokumen regulasinya di bawah target minimum.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTargetModal}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex-shrink-0 transition-colors"
          >
            Sesuaikan Target
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">Total Target Regulasi</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalTargetSum}</span>
            <span className="text-[11px] text-slate-500">Kuota dari 19 Bidang</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Target size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 block uppercase">Tersedia (Ada)</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{ada}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Dokumen regulasi aktif</span>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block uppercase">Dalam Proses</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{dalamProses}</span>
            <span className="text-[11px] text-amber-600 font-medium">Tahap penyusunan</span>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 block uppercase">Belum Ada</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{tidakAda}</span>
            <span className="text-[11px] text-rose-600 font-medium">Perlu penyusunan</span>
          </div>
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
            <XCircle size={24} />
          </div>
        </div>

      </div>

      {/* Progress Breakdown per Bidang Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={18} className="text-amber-600" />
              Kelengkapan & Target Dokumen per Bidang / Seksi
            </h2>
            <p className="text-xs text-slate-500">
              Klik salah satu bidang untuk memfilter matriks dokumen.
            </p>
          </div>
          
          <button
            onClick={onOpenTargetModal}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Settings size={14} className="text-amber-600" />
            <span>Atur Target</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsByBidang.map((item) => (
            <div
              key={item.bidang}
              onClick={() => onSelectBidangFilter(item.bidang)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all group ${
                item.isFulfilled 
                  ? 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-300' 
                  : 'bg-slate-50 hover:bg-amber-50/80 border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-900 truncate max-w-[170px]" title={item.bidang}>
                  {item.bidang}
                </span>
                
                {item.isFulfilled ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {item.ada}/{item.target} ({item.pct}%)
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {item.ada}/{item.target} ({item.pct}%)
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex mb-2">
                <div 
                  className={item.isFulfilled ? 'bg-emerald-500 h-full' : 'bg-amber-500 h-full'} 
                  style={{ width: `${item.pct}%` }} 
                  title={`Ada: ${item.ada} / Target: ${item.target}`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="text-emerald-700 font-semibold">Tersedia: {item.ada}</span>
                <span className="text-slate-600 font-bold">Target: {item.target}</span>
                {item.isFulfilled ? (
                  <span className="text-emerald-600 font-bold">✓ Terpenuhi</span>
                ) : (
                  <span className="text-amber-700 font-bold">Kurang {item.gap}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
