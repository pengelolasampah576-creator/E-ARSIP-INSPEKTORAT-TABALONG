import React, { useState } from 'react';
import { LOGO_URL } from '../assets';
import { ShieldCheck, Key, Lock, User, X, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const result = await onLogin(username, password);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Login gagal. Periksa kembali username dan password Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/10 p-1 mx-auto mb-3 border border-amber-500/40 shadow-inner flex items-center justify-center">
            <img 
              src={LOGO_URL} 
              alt="Logo e-Arsip" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-full uppercase tracking-wider">
            LOGIN MASTER & AKSES SISTEM
          </span>

          <h2 className="text-xl font-extrabold text-white mt-1">
            e-Arsip
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspektorat Daerah Kabupaten Tabalong
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User size={14} className="text-amber-600" /> Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Lock size={14} className="text-amber-600" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-400 text-white font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memverifikasi Otorisasi...</span>
            ) : (
              <>
                <Key size={16} />
                <span>Masuk Sistem</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
            Sistem Inventori Dokumen • Inspektorat Kab. Tabalong
          </div>

        </form>

      </div>
    </div>
  );
};
