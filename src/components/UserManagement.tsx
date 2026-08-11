import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Lock, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  X, 
  Save, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onAddUser: (userData: any) => void;
  onUpdateUser: (id: string, userData: any) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('inspektur');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openAddModal = () => {
    setSelectedUser(null);
    setUsername('');
    setName('');
    setEmail('');
    setRole('inspektur');
    setPassword('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setUsername(user.username);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
    setStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onUpdateUser(selectedUser.id, {
        name,
        email,
        role,
        status,
        ...(password ? { password } : {})
      });
    } else {
      if (!username || !name) {
        alert('Username dan Nama Lengkap wajib diisi');
        return;
      }
      onAddUser({
        username,
        name,
        email: email || `${username}@tabalongkab.go.id`,
        role,
        password: password || 'tabalong123',
        status
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Master Credentials Guide */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-500/40 text-white rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-amber-200">
                  Manajemen Pengguna & Akses Master
                </h1>
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded font-extrabold text-[10px]">
                  MASTER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Kelola kredensial login, peran (Role), serta otorisasi hak akses pengguna e-Arsip Tabalong.
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow transition-colors"
          >
            <UserPlus size={16} />
            <span>Tambah User Baru</span>
          </button>
        </div>

        {/* Preset Info Pill */}
        <div className="mt-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-amber-400" />
            <span className="font-semibold text-white">Akun Master Terdaftar:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <span className="bg-slate-900 px-2 py-1 rounded border border-amber-500/30 text-amber-300">
              👑 Master Admin: <strong>admin</strong> / <strong>admin123</strong>
            </span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-teal-500/30 text-teal-300">
              🔍 Inspektur: <strong>inspektur</strong> / <strong>inspektur123</strong>
            </span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-600 text-slate-300">
              👁️ Tamu: <strong>publik</strong> / <strong>publik123</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Users size={18} className="text-amber-600" />
            Daftar Akun Pengguna System ({users.length})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Pengguna</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role / Hak Akses</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Login Terakhir</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-amber-50/50">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      u.role === 'master_admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      u.role === 'inspektur' ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {u.role === 'master_admin' ? '👑' : u.role === 'inspektur' ? '🔍' : '👁️'}
                    </div>
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">ID: {u.id}</div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">
                    {u.username}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${
                      u.role === 'master_admin' 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : u.role === 'inspektur'
                        ? 'bg-teal-100 text-teal-900 border-teal-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {u.role === 'master_admin' ? 'Master Admin' : u.role === 'inspektur' ? 'Auditor / Inspektur' : 'Tamu / Viewer'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {u.email}
                  </td>
                  <td className="p-3 text-center">
                    {u.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        <CheckCircle size={12} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px]">
                        <XCircle size={12} /> Non-Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono text-[11px] text-slate-500">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('id-ID') : 'Belum pernah'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-amber-700 hover:bg-amber-100 rounded"
                        title="Edit User & Reset Password"
                      >
                        <Edit size={15} />
                      </button>
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus pengguna ${u.name}?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus size={16} className="text-amber-400" />
                {selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              
              {!selectedUser && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: auditor2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.T."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@tabalongkab.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Peran *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-bold text-amber-900"
                >
                  <option value="master_admin">👑 Master Admin (Akses Penuh Total)</option>
                  <option value="inspektur">🔍 Auditor / Inspektur (Tambah & Ubah Dokumen)</option>
                  <option value="viewer">👁️ Tamu / Publik (Hanya Lihat)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {selectedUser ? 'Reset Password (Kosongkan jika tidak diubah)' : 'Password *'}
                </label>
                <input
                  type="password"
                  placeholder={selectedUser ? '••••••••' : 'Min 6 Karakter'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif / Diblokir</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded flex items-center gap-1 shadow"
                >
                  <Save size={14} /> Simpan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
