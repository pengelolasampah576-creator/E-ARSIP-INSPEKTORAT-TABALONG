# e-Arsip Inspektorat - Sistem Inventori Matriks Regulasi & SOP

Aplikasi **e-Arsip Inspektorat** adalah sistem manajemen inventori digital berbasis web yang dirancang khusus untuk memetakan, mengelola, mengunggah, dan mengevaluasi seluruh Peraturan, Kebijakan, Pedoman, serta Standar Operasional Prosedur (SOP) Inspektorat Daerah.

---

## 🌟 Fitur Utama

1. **Matriks Dokumen Regulasi Interaktif**
   - Pemetaan dokumen lengkap berdasarkan Bidang/Seksi dan Jenis Dokumen (Peraturan, Kebijakan, Pedoman, SOP).
   - Indikator kelengkapan status visual (`Ada`, `Dalam Proses`, `Rencana Evaluasi`, `Tidak Ada`).
   - Pencarian cepat (Search) & Filter dinamis.

2. **Penyimpanan Berkas Digital Utuh (File Persistence & Download)**
   - Mengunggah berkas fisik (PDF/DOCX) secara utuh yang disimpan di folder server (`/uploads/`).
   - Berkas tidak akan hilang saat aplikasi dibuka kembali atau diakses dari komputer/perangkat lain.
   - Tombol **Unduh / Buka Berkas** langsung untuk mengakses dokumen asli.

3. **Multi-User Login & Akses Lintas Perangkat (Cloud Ready)**
   - Dapat diakses dari komputer/browser manapun menggunakan URL aplikasi yang dibagikan.
   - Hak Akses Berbasis Peran (Role-Based Access Control):
     - 👑 **Master Admin**: Akses penuh kelola dokumen, tambah/ubah user, dan lihat audit log.
     - 🔍 **Auditor / Inspektur**: Tambah & ubah status matriks regulasi.
     - 👁️ **Tamu / Publik**: Akses *read-only* untuk melihat matriks regulasi.

4. **Asisten AI Regulasi (Integrasi Gemini AI)**
   - Fitur AI otomatis untuk menganalisis kekosongan SOP, memberikan rekomendasi prioritas penyusunan regulasi, serta membantu menyusun draf acuan aturan.

5. **Ekspor Data & Cetak Laporan Resmi**
   - Fitur Ekspor ke **Excel (.xlsx)**.
   - Fitur **Cetak PDF/Laporan** dengan Kop Surat Resmi Inspektorat & kolom tanda tangan pimpinan.

---

## 🔑 Kredensial Akses Default

Sistem menyediakan akun siap pakai untuk pengujian:

| Peran (Role) | Username | Password | Otorisasi Akses |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin` | `admin123` | Akses Penuh Sistem & User Management |
| **Auditor / Inspektur** | `inspektur` | `inspektur123` | Tambah & Edit Matriks Regulasi |
| **Tamu / Viewer** | `publik` | `publik123` | Hanya Lihat Dokumen |

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal / Server

### 1. Prasyarat (Requirements)
- Node.js versi 18+ atau 20+
- npm (Node Package Manager)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan (Dev Mode)
```bash
npm run dev
```
Aplikasi akan berjalan pada port `3000` (akses via `http://localhost:3000`).

### 4. Build untuk Produksi (Production Build)
```bash
npm run build
npm start
```

---

## 📁 Struktur Direktori Proyek

```
.
├── server.ts                 # Backend Express.js REST API & static file server
├── src/
│   ├── App.tsx               # Entry point utama React UI
│   ├── components/           # Komponen UI (Navbar, Sidebar, Matrix, Modals, AI)
│   ├── data/                 # Master data awal & sampel regulasi
│   ├── types.ts              # TypeScript interface & types
│   └── assets/               # Asset gambar & logo
├── data/
│   └── db.json               # Data terenkapsulasi/persisten lokal
├── uploads/                  # Tempat penyimpanan file lampiran PDF/DOCX utuh
└── package.json              # Pengaturan dependensi & script build
```

---

## 📝 Lisensi & Hak Cipta
Diperuntukkan untuk **Inspektorat Daerah**.
Dapat dimodifikasi dan dikembangkan lebih lanjut sesuai kebutuhan tata kelola regulasi daerah.
