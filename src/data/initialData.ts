import { DocumentItem, User } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator Utama (Master)',
    email: 'admin.inspektorat@tabalongkab.go.id',
    role: 'master_admin',
    status: 'active',
    lastLogin: '2026-08-10T17:30:00Z',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'usr-inspektur',
    username: 'inspektur',
    name: 'Drs. H. M. Yasin, M.Si (Inspektur)',
    email: 'inspektur@tabalongkab.go.id',
    role: 'inspektur',
    status: 'active',
    lastLogin: '2026-08-10T14:15:00Z',
    createdAt: '2025-01-05T00:00:00Z'
  },
  {
    id: 'usr-staf',
    username: 'auditor1',
    name: 'Ahmad Fauzi, S.E. (Auditor Ahli Muda)',
    email: 'ahmad.fauzi@tabalongkab.go.id',
    role: 'inspektur',
    status: 'active',
    lastLogin: '2026-08-09T09:20:00Z',
    createdAt: '2025-02-10T00:00:00Z'
  },
  {
    id: 'usr-publik',
    username: 'publik',
    name: 'Akses Tamu / Instansi',
    email: 'tamu@tabalongkab.go.id',
    role: 'viewer',
    status: 'active',
    lastLogin: '2026-08-08T11:00:00Z',
    createdAt: '2025-03-01T00:00:00Z'
  }
];

export const BIDANG_LIST = [
  'Semua Bidang',
  'Pengawasan',
  'Reviu',
  'Evaluasi',
  'Pemantauan',
  'Konsultansi',
  'SOP Pengawasan',
  'SOP Audit TIK',
  'Manajemen Risiko',
  'SPIP',
  'Mutu',
  'SDM',
  'Kesekretariatan',
  'Keuangan',
  'Barang Milik',
  'SPBE',
  'Perencanaan',
  'Penganggaran',
  'Pelaporan',
  'Integritas'
];

export const JENIS_DOKUMEN_LIST = [
  'Semua Jenis',
  'Peraturan',
  'Kebijakan',
  'Pedoman',
  'SOP'
];
