import React, { useState, useEffect } from 'react';
import { BidangTargets, DocumentItem } from '../types';
import { DEFAULT_BIDANG_TARGETS } from '../data/initialData';
import { 
  Target, 
  X, 
  RotateCcw, 
  Save, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: BidangTargets;
  onSaveTargets: (newTargets: BidangTargets) => Promise<void>;
  documents: DocumentItem[];
  bidangList: string[];
}

export const TargetModal: React.FC<TargetModalProps> = ({
  isOpen,
  onClose,
  targets,
  onSaveTargets,
  documents,
  bidangList
}) => {
  const [localTargets, setLocalTargets] = useState<BidangTargets>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync props to local state when modal opens
  useEffect(() => {
    if (isOpen) {
      const cleanBidangs = bidangList.filter(b => b !== 'Semua Bidang');
      const merged: BidangTargets = {};
      cleanBidangs.forEach(b => {
        merged[b] = targets[b] ?? DEFAULT_BIDANG_TARGETS[b] ?? 5;
      });
      setLocalTargets(merged);
    }
  }, [isOpen, targets, bidangList]);

  if (!isOpen) return null;

  const cleanBidangs = bidangList.filter(b => b !== 'Semua Bidang');

  // Calculation helper
  const getBidangStats = (b: string) => {
    const docs = documents.filter(d => d.bidang === b);
    const ada = docs.filter(d => d.status === 'Ada').length;
    const target = localTargets[b] ?? 0;
    const isFulfilled = target > 0 && ada >= target;
    const gap = target > ada ? target - ada : 0;
    const pct = target > 0 ? Math.min(100, Math.round((ada / target) * 100)) : 0;
    return { ada, target, isFulfilled, gap, pct };
  };

  // Overall stats
  let totalTargetSum = 0;
  let totalEffectiveAdaSum = 0;
  let totalAdaSum = 0;
  let unfulfilledCount = 0;

  cleanBidangs.forEach(b => {
    const { ada, target, isFulfilled } = getBidangStats(b);
    totalTargetSum += target;
    totalAdaSum += ada;
    totalEffectiveAdaSum += Math.min(ada, target);
    if (!isFulfilled) {
      unfulfilledCount++;
    }
  });

  // Calculate total percentage. If unfulfilledCount > 0, cap display percentage at 99% max
  let overallPct = totalTargetSum > 0 ? Math.floor((totalEffectiveAdaSum / totalTargetSum) * 100) : 0;
  if (unfulfilledCount > 0 && overallPct >= 100) {
    overallPct = 99;
  }

  const handleTargetChange = (b: string, val: number) => {
    const sanitized = Math.max(0, isNaN(val) ? 0 : val);
    setLocalTargets(prev => ({
      ...prev,
      [b]: sanitized
    }));
  };

  const handleResetDefault = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan semua target bidang ke standar default Inspektorat Tabalong (Total 131 Dokumen)?')) {
      setLocalTargets({ ...DEFAULT_BIDANG_TARGETS });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTargets(localTargets);
      onClose();
    } catch (err) {
      console.error('Error saving targets:', err);
      alert('Gagal menyimpan target ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBidangs = cleanBidangs.filter(b => 
    b.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Target size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
                <ShieldCheck size={12} /> PENGATURAN TARGET BIDANG
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Kelola Target Dokumen Regulasi
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Atur target kuantitas regulasi per Bidang/Seksi. Selama target belum terpenuhi, nilai kepatuhan tidak akan mencapai 100%.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Target</span>
              <span className="text-xl font-black text-slate-900">{totalTargetSum}</span>
              <span className="text-[10px] text-slate-400 block">Dokumen</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tersedia (Ada)</span>
              <span className="text-xl font-black text-emerald-600">{totalAdaSum}</span>
              <span className="text-[10px] text-slate-400 block">Dokumen</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Nilai Capaian</span>
              <span className={`text-xl font-black ${unfulfilledCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {overallPct}%
              </span>
              <span className="text-[10px] font-bold block">
                {unfulfilledCount === 0 ? (
                  <span className="text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 size={10} /> Sempurna
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center justify-center gap-1">
                    <AlertTriangle size={10} /> Belum Sempurna
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Alert Status Banner */}
          <div className={`p-3 rounded-xl border text-xs font-medium w-full md:w-auto flex-1 ${
            unfulfilledCount === 0 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {unfulfilledCount === 0 ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>SELURUH TARGET TERPENUHI (NILAI 100% SEMPURNA)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                  <span>
                    TARGET BELUM SEMPURNA ({unfulfilledCount} Bidang Belum Mencapai Target)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {unfulfilledCount === 0 
                ? 'Seluruh bidang telah memenuhi kuantitas dokumen regulasi yang ditargetkan.'
                : 'Sistem membatasi nilai kepatuhan maks 99% hingga seluruh bidang mencapai kuota minimal regulasinya.'
              }
            </p>
          </div>
        </div>

        {/* Filter and Quick Actions Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama bidang / seksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleResetDefault}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            title="Kembalikan nilai target ke standar awal Inspektorat Tabalong"
          >
            <RotateCcw size={14} />
            <span>Reset ke Target Standar (131 Dokumen)</span>
          </button>
        </div>

        {/* Scrollable Bidang Target List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredBidangs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada bidang yang sesuai pencarian "{searchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBidangs.map(b => {
                const { ada, target, isFulfilled, gap, pct } = getBidangStats(b);

                return (
                  <div 
                    key={b}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isFulfilled 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">
                          {b}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tersedia saat ini: <strong className="text-slate-800">{ada} Dokumen</strong>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {isFulfilled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Terpenuhi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <AlertTriangle size={12} /> Kurang {gap}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2.5 border border-slate-200">
                      <div 
                        className={`h-full transition-all ${
                          isFulfilled ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Input Controls */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600">
                        Target Dokumen:
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTargetChange(b, target - 1)}
                          className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 flex items-center justify-center font-bold text-sm transition-colors"
                        >
                          <Minus size={12} />
                        </button>

                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={target}
                          onChange={(e) => handleTargetChange(b, parseInt(e.target.value) || 0)}
                          className="w-14 h-7 text-center text-xs font-bold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />

                        <button
                          type="button"
                          onClick={() => handleTargetChange(b, target + 1)}
                          className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 flex items-center justify-center font-bold text-sm transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Target tersimpan secara otomatis di cloud database.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Target Bidang'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
