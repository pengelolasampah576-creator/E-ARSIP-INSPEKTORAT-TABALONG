import React from 'react';
import { DocumentItem, UserRole } from '../types';
import { 
  X, 
  FileText, 
  Check, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Building2, 
  Tag, 
  User as UserIcon, 
  Download, 
  Sparkles,
  Edit3
} from 'lucide-react';

interface DocumentViewerModalProps {
  doc: DocumentItem | null;
  onClose: () => void;
  onEdit?: (doc: DocumentItem) => void;
  userRole: UserRole;
  onOpenAi?: (doc: DocumentItem) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  doc,
  onClose,
  onEdit,
  userRole,
  onOpenAi
}) => {
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              No. {doc.no}
            </span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {doc.bidang}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Master Regulasi Title */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Master Regulasi / Acuan
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {doc.masterRegulasi}
            </h2>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-amber-600" />
              <div>
                <span className="text-slate-500 block text-[10px]">Bidang / Unit:</span>
                <span className="font-semibold text-slate-800">{doc.bidang}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag size={15} className="text-teal-600" />
              <div>
                <span className="text-slate-500 block text-[10px]">Jenis Dokumen:</span>
                <span className="font-semibold text-slate-800">{doc.jenisDokumen}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-blue-600" />
              <div>
                <span className="text-slate-500 block text-[10px]">Tahun / Tanggal Terbit:</span>
                <span className="font-semibold text-slate-800">{doc.tahunTerbit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <UserIcon size={15} className="text-indigo-600" />
              <div>
                <span className="text-slate-500 block text-[10px]">Diperbarui Oleh:</span>
                <span className="font-semibold text-slate-800">{doc.updatedBy || 'System'}</span>
              </div>
            </div>

          </div>

          {/* Dokumen Yang Ada */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-lg">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              Dokumen Yang Ada
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {doc.dokumenYangAda !== '-' ? doc.dokumenYangAda : 'Belum Ada Dokumen Regulasi Terbit'}
            </p>

            {doc.catatan && (
              <div className="mt-2 text-xs text-slate-700 bg-white/80 p-2 rounded border border-amber-200">
                <span className="font-bold text-amber-900">Catatan: </span>
                {doc.catatan}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
            <span className="text-xs font-bold text-slate-700">Status Kelengkapan:</span>
            <div>
              {doc.status === 'Ada' && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs flex items-center gap-1">
                  <Check size={14} /> Tersedia (Ada)
                </span>
              )}
              {doc.status === 'Dalam Proses' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold text-xs flex items-center gap-1">
                  <Clock size={14} /> Dalam Proses Penyusunan
                </span>
              )}
              {doc.status === 'Rencana Evaluasi' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full font-bold text-xs flex items-center gap-1">
                  <AlertCircle size={14} /> Perlu Evaluasi
                </span>
              )}
              {doc.status === 'Tidak Ada' && (
                <span className="px-3 py-1 bg-slate-200 text-slate-700 border border-slate-300 rounded-full font-bold text-xs">
                  Tidak Ada (Belum Tersedia)
                </span>
              )}
            </div>
          </div>

          {/* Digital Attachment Preview Box */}
          <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={28} className="text-slate-500" />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {doc.fileName || `${doc.masterRegulasi.substring(0, 30)}.pdf`}
                </div>
                <div className="text-[10px] text-slate-500">
                  Arsip Digital Inspektorat Tabalong • PDF/Doc
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => alert(`Mengunduh salinan berkas: ${doc.masterRegulasi}`)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Download size={13} /> Download
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {onOpenAi && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAi(doc);
                }}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-teal-600" />
                <span>Analisis AI</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {(userRole === 'master_admin' || userRole === 'inspektur') && onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(doc);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Edit3 size={14} /> Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
