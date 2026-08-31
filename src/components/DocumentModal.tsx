import React, { useState, useEffect } from 'react';
import { DocumentItem, DocumentStatus, JenisDokumen } from '../types';
import { X, Save, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { storage, storageRef, uploadBytesResumable, getDownloadURL } from '../lib/firebase';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Partial<DocumentItem>) => void;
  initialData?: DocumentItem | null;
  bidangList: string[];
  jenisList: string[];
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  bidangList,
  jenisList
}) => {
  const [bidang, setBidang] = useState('Pengawasan');
  const [jenisDokumen, setJenisDokumen] = useState<JenisDokumen | string>('SOP');
  const [masterRegulasi, setMasterRegulasi] = useState('');
  const [dokumenYangAda, setDokumenYangAda] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('Ada');
  const [catatan, setCatatan] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (initialData) {
      setBidang(initialData.bidang || 'Pengawasan');
      setJenisDokumen(initialData.jenisDokumen || 'SOP');
      setMasterRegulasi(initialData.masterRegulasi || '');
      setDokumenYangAda(initialData.dokumenYangAda || '');
      setTahunTerbit(initialData.tahunTerbit || '');
      setStatus(initialData.status || 'Ada');
      setCatatan(initialData.catatan || '');
      setFileName(initialData.fileName || '');
      setFileUrl(initialData.fileUrl || '');
      setFileSize(initialData.fileSize || '');
    } else {
      setBidang('Pengawasan');
      setJenisDokumen('SOP');
      setMasterRegulasi('');
      setDokumenYangAda('');
      setTahunTerbit('');
      setStatus('Ada');
      setCatatan('');
      setFileName('');
      setFileUrl('');
      setFileSize('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterRegulasi.trim()) {
      alert('Master Regulasi wajib diisi');
      return;
    }

    onSave({
      bidang,
      jenisDokumen,
      masterRegulasi,
      dokumenYangAda: dokumenYangAda.trim() || '-',
      tahunTerbit: tahunTerbit.trim() || '-',
      status,
      catatan,
      fileName,
      fileUrl,
      fileSize
    });

    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const calcSizeMB = file.size / (1024 * 1024);
    const sizeStr = calcSizeMB >= 1 
      ? `${calcSizeMB.toFixed(2)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    try {
      // Upload the actual file bytes to Firebase Cloud Storage, so the file is
      // hosted online and viewable by ANYONE with the app link — not just this browser.
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const storagePath = `documents/${Date.now()}_${safeName}`;
      const fileRef = storageRef(storage, storagePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(pct);
          },
          (err) => reject(err),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      setFileUrl(downloadUrl);
      setFileName(file.name);
      setFileSize(sizeStr);

      if (!dokumenYangAda) {
        setDokumenYangAda(file.name.replace(/\.[^/.]+$/, ""));
      }
      if (status === 'Tidak Ada') {
        setStatus('Ada');
      }
    } catch (err: any) {
      console.error('Error uploading file to Firebase Storage:', err);
      alert('Gagal mengunggah berkas ke server. Periksa koneksi internet Anda dan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Edit Dokumen Regulasi' : 'Tambah Regulasi / SOP Baru'}
              </h2>
              <p className="text-xs text-slate-300">
                Inspektorat Daerah Kabupaten Tabalong
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Bidang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bidang / Seksi <span className="text-rose-500">*</span>
              </label>
              <select
                value={bidang}
                onChange={(e) => setBidang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {bidangList.filter(b => b !== 'Semua Bidang').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Jenis Dokumen */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenis Dokumen <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenisDokumen}
                onChange={(e) => setJenisDokumen(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {jenisList.filter(j => j !== 'Semua Jenis').map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Master Regulasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Master Regulasi / Acuan Standar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Peraturan Bupati tentang Pedoman Audit Kinerja Berbasis Risiko..."
              value={masterRegulasi}
              onChange={(e) => setMasterRegulasi(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Dokumen Yang Ada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dokumen Yang Ada (Aturan Riil / SK Bupati / SK Inspektur)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Peraturan Bupati Tabalong Nomor 17 Tahun 2025 tentang..."
              value={dokumenYangAda}
              onChange={(e) => setDokumenYangAda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tahun / Tanggal Terbit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun / Tanggal Terbit
              </label>
              <input
                type="text"
                placeholder="Contoh: 19 Mei 2025"
                value={tahunTerbit}
                onChange={(e) => setTahunTerbit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Status Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keterangan Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="Ada">Ada (Tersedia / Berlaku)</option>
                <option value="Dalam Proses">Dalam Proses Penyusunan</option>
                <option value="Rencana Evaluasi">Rencana Evaluasi</option>
                <option value="Tidak Ada">Tidak Ada (Belum Ada)</option>
              </select>
            </div>

          </div>

          {/* Catatan / Keterangan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Keterangan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Perlu harmonisasi dengan Bagian Hukum Setda Tabalong..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Lampiran Dokumen Digital */}
          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Upload size={14} className="text-amber-600" />
              Upload Digital Attachment (PDF/DOCX) - Berkas Disimpan Utuh
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                disabled={isUploading}
                onChange={handleFileUpload}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer disabled:opacity-50"
              />
              {isUploading && (
                <span className="text-xs text-amber-700 font-semibold animate-pulse">
                  Mengunggah berkas ke server... {uploadProgress}%
                </span>
              )}
              {!isUploading && fileName && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} /> {fileName} {fileSize ? `(${fileSize})` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Save size={15} />
              <span>Simpan Dokumen</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
