import React, { useState } from 'react';
import { DocumentItem, DocumentStatus, UserRole } from '../types';
import { 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square,
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface DocumentMatrixProps {
  documents: DocumentItem[];
  userRole: UserRole;
  onViewDoc: (doc: DocumentItem) => void;
  onEditDoc: (doc: DocumentItem) => void;
  onDeleteDoc: (id: string) => void;
  onQuickStatusChange: (id: string, newStatus: DocumentStatus) => void;
  selectedBidang: string;
  onSelectBidang: (b: string) => void;
  jenisFilter: string;
  onJenisFilterChange: (j: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bidangList: string[];
  jenisList: string[];
  onOpenAiForDoc?: (doc: DocumentItem) => void;
}

export const DocumentMatrix: React.FC<DocumentMatrixProps> = ({
  documents,
  userRole,
  onViewDoc,
  onEditDoc,
  onDeleteDoc,
  onQuickStatusChange,
  selectedBidang,
  onSelectBidang,
  jenisFilter,
  onJenisFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  bidangList,
  jenisList,
  onOpenAiForDoc
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchBidang = selectedBidang === 'Semua Bidang' || doc.bidang === selectedBidang;
    const matchJenis = jenisFilter === 'Semua Jenis' || doc.jenisDokumen === jenisFilter;
    const matchStatus = statusFilter === 'Semua Status' || doc.status === statusFilter;
    
    const query = searchQuery.toLowerCase();
    const matchQuery = !query || 
      doc.masterRegulasi.toLowerCase().includes(query) ||
      doc.dokumenYangAda.toLowerCase().includes(query) ||
      doc.bidang.toLowerCase().includes(query) ||
      doc.jenisDokumen.toLowerCase().includes(query) ||
      doc.no.toString().includes(query);

    return matchBidang && matchJenis && matchStatus && matchQuery;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Multi-select handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedDocs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedDocs.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = (status: DocumentStatus) => {
    selectedIds.forEach(id => onQuickStatusChange(id, status));
    setSelectedIds([]);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Ada':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check size={14} className="stroke-[3]" />
            <span>Ada (v)</span>
          </span>
        );
      case 'Dalam Proses':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={13} />
            <span>Dalam Proses</span>
          </span>
        );
      case 'Rencana Evaluasi':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <AlertCircle size={13} />
            <span>Evaluasi</span>
          </span>
        );
      case 'Tidak Ada':
      default:
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            <X size={12} />
            <span>Tidak Ada</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      
      {/* Header Info & Filters */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                MATRIKS DOKUMEN REGULASI
              </span>
              <span className="text-xs text-slate-400">
                Menampilkan {filteredDocs.length} dari {documents.length} Dokumen
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              INSPEKTORAT DAERAH KABUPATEN TABALONG
            </h1>
            <p className="text-xs text-slate-300">
              Pengelolaan Inventori Peraturan, Kebijakan, Pedoman, dan Standar Operasional Prosedur (SOP)
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-2 rounded-lg text-center">
              <div className="text-lg font-extrabold text-emerald-400">
                {documents.filter(d => d.status === 'Ada').length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ada</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-2 rounded-lg text-center">
              <div className="text-lg font-extrabold text-amber-400">
                {documents.filter(d => d.status === 'Dalam Proses').length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Proses</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-2 rounded-lg text-center">
              <div className="text-lg font-extrabold text-slate-400">
                {documents.filter(d => d.status === 'Tidak Ada').length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Kosong</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          
          {/* Bidang Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Filter Bidang:</label>
            <select
              value={selectedBidang}
              onChange={(e) => {
                onSelectBidang(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-amber-500/50"
            >
              {bidangList.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Jenis Dokumen Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Jenis Dokumen:</label>
            <select
              value={jenisFilter}
              onChange={(e) => {
                onJenisFilterChange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-amber-500/50"
            >
              {jenisList.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Keterangan / Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                onStatusFilterChange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Ada">Ada (Tersedia)</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Rencana Evaluasi">Rencana Evaluasi</option>
              <option value="Tidak Ada">Tidak Ada</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cari Regulasi:</label>
            <input
              type="text"
              placeholder="Kata kunci regulasi..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

        </div>

        {/* Batch Action Bar if selected */}
        {selectedIds.length > 0 && (userRole === 'master_admin' || userRole === 'inspektur') && (
          <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs text-amber-200">
            <span className="font-semibold">
              {selectedIds.length} dokumen dipilih:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Ubah Status Massal:</span>
              <button
                onClick={() => handleBulkStatusChange('Ada')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
              >
                Set Ada
              </button>
              <button
                onClick={() => handleBulkStatusChange('Dalam Proses')}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold"
              >
                Set Proses
              </button>
              <button
                onClick={() => handleBulkStatusChange('Tidak Ada')}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px]"
              >
                Set Tidak Ada
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Main Table Matrix matching screenshot strictly */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider border-b-2 border-slate-300">
              {(userRole === 'master_admin' || userRole === 'inspektur') && (
                <th className="p-3 w-10 text-center border-r border-slate-200">
                  <button onClick={toggleSelectAll} className="text-slate-600 hover:text-slate-900">
                    {selectedIds.length === paginatedDocs.length && paginatedDocs.length > 0 ? (
                      <CheckSquare size={16} className="text-amber-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
              )}
              <th className="p-3 w-12 text-center border-r border-slate-200">No</th>
              <th className="p-3 w-36 border-r border-slate-200">Bidang</th>
              <th className="p-3 w-28 border-r border-slate-200">Jenis Dokumen</th>
              <th className="p-3 border-r border-slate-200 max-w-xs">MASTER REGULASI</th>
              <th className="p-3 border-r border-slate-200 max-w-md">Dokumen yang ada</th>
              <th className="p-3 w-32 border-r border-slate-200 text-center">Tahun Terbit</th>
              <th className="p-3 w-36 text-center border-r border-slate-200">Keterangan</th>
              <th className="p-3 w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
            {paginatedDocs.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  <FileText size={32} className="mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-sm">Tidak ada regulasi yang sesuai dengan filter.</p>
                  <p className="text-xs">Coba ubah kata kunci pencarian atau reset filter bidang.</p>
                </td>
              </tr>
            ) : (
              paginatedDocs.map((doc, idx) => {
                const isSelected = selectedIds.includes(doc.id);
                return (
                  <tr 
                    key={doc.id}
                    className={`hover:bg-amber-50/60 transition-colors ${
                      isSelected ? 'bg-amber-100/50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {(userRole === 'master_admin' || userRole === 'inspektur') && (
                      <td className="p-2.5 text-center border-r border-slate-200">
                        <button onClick={() => toggleSelect(doc.id)} className="text-slate-500">
                          {isSelected ? (
                            <CheckSquare size={15} className="text-amber-600" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="p-2.5 text-center font-bold text-slate-700 border-r border-slate-200">
                      {doc.no}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-200">
                      {doc.bidang}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        doc.jenisDokumen === 'Peraturan' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : doc.jenisDokumen === 'Kebijakan'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : doc.jenisDokumen === 'Pedoman'
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}>
                        {doc.jenisDokumen}
                      </span>
                    </td>
                    <td className="p-2.5 font-medium text-slate-900 border-r border-slate-200 leading-relaxed">
                      {doc.masterRegulasi}
                    </td>
                    <td className="p-2.5 text-slate-700 border-r border-slate-200 leading-relaxed">
                      {doc.dokumenYangAda !== '-' || doc.fileName ? (
                        <div className="font-medium text-slate-800">
                          <div>{doc.dokumenYangAda !== '-' ? doc.dokumenYangAda : doc.masterRegulasi}</div>
                          
                          {/* Uploaded File Badge */}
                          {(doc.fileName || doc.fileUrl) && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <a
                                href={doc.fileUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                download={doc.fileName || 'dokumen.pdf'}
                                onClick={(e) => {
                                  if (!doc.fileUrl) {
                                    e.preventDefault();
                                    onViewDoc(doc);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold transition-colors shadow-xs"
                                title="Buka / Unduh Berkas Digital"
                              >
                                <Download size={11} className="text-amber-700" />
                                <span className="max-w-[180px] truncate">{doc.fileName || 'Berkas Terunggah (PDF/DOC)'}</span>
                                {doc.fileSize && <span className="text-amber-600 font-normal">({doc.fileSize})</span>}
                              </a>
                            </div>
                          )}

                          {doc.catatan && (
                            <div className="text-[10px] text-amber-800 bg-amber-50/80 p-1 rounded mt-1 border border-amber-200">
                              ℹ️ {doc.catatan}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center text-slate-600 border-r border-slate-200 font-mono text-[11px]">
                      {doc.tahunTerbit}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      {userRole === 'master_admin' || userRole === 'inspektur' ? (
                        <div className="group relative inline-block">
                          <button className="focus:outline-none">
                            {getStatusBadge(doc.status)}
                          </button>
                          {/* Quick status dropdown on hover */}
                          <div className="hidden group-hover:block absolute z-20 left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1 space-y-1 w-36 text-left">
                            <button
                              onClick={() => onQuickStatusChange(doc.id, 'Ada')}
                              className="w-full text-left px-2 py-1 hover:bg-emerald-50 rounded text-[11px] font-bold text-emerald-700 flex items-center gap-1"
                            >
                              <Check size={12} /> Ada (v)
                            </button>
                            <button
                              onClick={() => onQuickStatusChange(doc.id, 'Dalam Proses')}
                              className="w-full text-left px-2 py-1 hover:bg-amber-50 rounded text-[11px] font-bold text-amber-700 flex items-center gap-1"
                            >
                              <Clock size={12} /> Dalam Proses
                            </button>
                            <button
                              onClick={() => onQuickStatusChange(doc.id, 'Rencana Evaluasi')}
                              className="w-full text-left px-2 py-1 hover:bg-purple-50 rounded text-[11px] font-bold text-purple-700 flex items-center gap-1"
                            >
                              <AlertCircle size={12} /> Evaluasi
                            </button>
                            <button
                              onClick={() => onQuickStatusChange(doc.id, 'Tidak Ada')}
                              className="w-full text-left px-2 py-1 hover:bg-slate-100 rounded text-[11px] text-slate-600 flex items-center gap-1"
                            >
                              <X size={12} /> Tidak Ada
                            </button>
                          </div>
                        </div>
                      ) : (
                        getStatusBadge(doc.status)
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewDoc(doc)}
                          className="p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded"
                          title="Lihat Detail Regulasi"
                        >
                          <Eye size={15} />
                        </button>

                        {onOpenAiForDoc && (
                          <button
                            onClick={() => onOpenAiForDoc(doc)}
                            className="p-1 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded"
                            title="Analisis Regulasi dengan AI"
                          >
                            <Sparkles size={14} />
                          </button>
                        )}

                        {(userRole === 'master_admin' || userRole === 'inspektur') && (
                          <button
                            onClick={() => onEditDoc(doc)}
                            className="p-1 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded"
                            title="Edit Regulasi"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {userRole === 'master_admin' && (
                          <button
                            onClick={() => onDeleteDoc(doc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Dokumen"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Menampilkan <span className="font-bold text-slate-800">
            {filteredDocs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span> sampai <span className="font-bold text-slate-800">
            {Math.min(currentPage * itemsPerPage, filteredDocs.length)}
          </span> dari <span className="font-bold text-slate-800">{filteredDocs.length}</span> regulasi
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-slate-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};
