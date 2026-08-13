export type DocumentStatus = 'Ada' | 'Tidak Ada' | 'Dalam Proses' | 'Rencana Evaluasi';

export type JenisDokumen = 'Peraturan' | 'Kebijakan' | 'Pedoman' | 'SOP';

export interface DocumentItem {
  id: string;
  no: number;
  bidang: string;
  jenisDokumen: JenisDokumen | string;
  masterRegulasi: string;
  dokumenYangAda: string;
  tahunTerbit: string;
  status: DocumentStatus;
  catatan?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  updatedAt: string;
  updatedBy: string;
}

export type UserRole = 'master_admin' | 'inspektur' | 'viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  bidangAccess?: string[];
  status: 'active' | 'inactive';
  lastLogin?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}

export interface FilterOptions {
  search: string;
  bidang: string;
  jenisDokumen: string;
  status: string;
}

export interface DashboardStats {
  total: number;
  ada: number;
  tidakAda: number;
  dalamProses: number;
  rencanaEvaluasi: number;
  completenessPercentage: number;
  byBidang: Record<string, { total: number; ada: number; persentase: number }>;
}

export type BidangTargets = Record<string, number>;

export interface TargetSettings {
  targets: BidangTargets;
  updatedAt: string;
  updatedBy: string;
}
