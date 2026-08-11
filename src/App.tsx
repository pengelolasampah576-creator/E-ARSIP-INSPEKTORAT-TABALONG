import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { DocumentItem, DocumentStatus, User, UserRole, AuditLog } from './types';
import { INITIAL_DOCUMENTS, INITIAL_USERS, BIDANG_LIST, JENIS_DOKUMEN_LIST } from './data/initialData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DocumentMatrix } from './components/DocumentMatrix';
import { DocumentModal } from './components/DocumentModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { DashboardStats } from './components/DashboardStats';
import { UserManagement } from './components/UserManagement';
import { AuditLogView } from './components/AuditLogView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { LoginModal } from './components/LoginModal';
import { LOGO_URL } from './assets';
import { FileSpreadsheet, Printer, ShieldCheck } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('earsip_documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored documents:', e);
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Active User session (default to master admin for seamless access, but allow easy switching!)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator Utama (Master)',
    email: 'admin.inspektorat@tabalongkab.go.id',
    role: 'master_admin',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z'
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<'matrix' | 'dashboard' | 'users' | 'logs' | 'ai'>('matrix');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Filters
  const [selectedBidang, setSelectedBidang] = useState('Semua Bidang');
  const [jenisFilter, setJenisFilter] = useState('Semua Jenis');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [docForAi, setDocForAi] = useState<DocumentItem | null>(null);

  // Fetch initial data from Express backend REST API
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDocuments(data);
          localStorage.setItem('earsip_documents', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error('Error fetching documents from server:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    // Restore session from localStorage if available
    const saved = localStorage.getItem('earsip_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (err) {
        console.error('Error parsing stored user session:', err);
      }
    }

    fetchDocuments();
    fetchUsers();
    fetchLogs();

    // Auto-sync polling every 10 seconds so all shared users see live updates & uploaded files
    const interval = setInterval(() => {
      fetchDocuments();
    }, 10000);

    const handleFocus = () => {
      fetchDocuments();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Login handler
  const handleLogin = async (username: string, pass: string) => {
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Username dan password wajib diisi.' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsLoginModalOpen(false);
        localStorage.setItem('earsip_user', JSON.stringify(data.user));
        fetchLogs(); // refresh audit logs
        return { success: true };
      } else if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        return { success: false, error: data.error || 'Username atau password salah.' };
      }
    } catch (err) {
      console.warn('API login request timed out or failed, falling back to instant local authentication:', err);
    }

    // Local authentication fallback if server API times out or is offline
    const defaultPasswords: Record<string, string> = {
      admin: 'admin123',
      inspektur: 'inspektur123',
      auditor1: 'auditor123',
      publik: 'publik123'
    };

    const foundUser = users.find(u => u.username.toLowerCase() === cleanUser.toLowerCase()) || 
                      INITIAL_USERS.find(u => u.username.toLowerCase() === cleanUser.toLowerCase());

    if (foundUser) {
      if (foundUser.status !== 'active') {
        return { success: false, error: 'Akun Anda dinonaktifkan. Hubungi Administrator.' };
      }

      const expectedPass = defaultPasswords[foundUser.username] || 'admin123';
      if (cleanPass === expectedPass) {
        setCurrentUser(foundUser);
        setIsLoginModalOpen(false);
        localStorage.setItem('earsip_user', JSON.stringify(foundUser));
        return { success: true };
      } else {
        return { success: false, error: 'Password salah. Mohon periksa huruf besar/kecil.' };
      }
    }

    return { success: false, error: 'Username tidak ditemukan.' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('earsip_user');
    setIsLoginModalOpen(true);
  };

  // Document Operations
  const handleSaveDocument = async (docData: Partial<DocumentItem>) => {
    const user = currentUser?.name || 'Admin';
    const userId = currentUser?.id || 'usr-admin';
    const userRole = currentUser?.role || 'master_admin';

    setIsDocModalOpen(false);

    if (editingDoc) {
      const updatedItem: DocumentItem = {
        ...editingDoc,
        ...docData,
        updatedAt: new Date().toISOString(),
        updatedBy: user
      };

      setDocuments(prev => {
        const next = prev.map(d => d.id === editingDoc.id ? updatedItem : d);
        localStorage.setItem('earsip_documents', JSON.stringify(next));
        return next;
      });
      setEditingDoc(null);

      try {
        const res = await fetch(`/api/documents/${editingDoc.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-name': user,
            'x-user-id': userId,
            'x-user-role': userRole
          },
          body: JSON.stringify(updatedItem)
        });

        if (res.ok) {
          const serverDoc = await res.json();
          setDocuments(prev => {
            const next = prev.map(d => d.id === editingDoc.id ? serverDoc : d);
            localStorage.setItem('earsip_documents', JSON.stringify(next));
            return next;
          });
        }
        fetchLogs();
      } catch (err) {
        console.warn('Backend PUT sync error:', err);
      }
    } else {
      const maxNo = documents.reduce((max, d) => (d.no && d.no > max ? d.no : max), 0);
      const newItem: DocumentItem = {
        id: `doc-${Date.now()}`,
        no: maxNo + 1,
        bidang: docData.bidang || 'Pengawasan',
        jenisDokumen: docData.jenisDokumen || 'Peraturan',
        masterRegulasi: docData.masterRegulasi || 'Regulasi Baru',
        dokumenYangAda: docData.dokumenYangAda || '-',
        tahunTerbit: docData.tahunTerbit || '-',
        status: docData.status || 'Ada',
        catatan: docData.catatan || '',
        fileName: docData.fileName || '',
        fileUrl: docData.fileUrl || '',
        fileSize: docData.fileSize || '',
        updatedAt: new Date().toISOString(),
        updatedBy: user
      };

      setDocuments(prev => {
        const next = [newItem, ...prev];
        localStorage.setItem('earsip_documents', JSON.stringify(next));
        return next;
      });

      try {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-name': user,
            'x-user-id': userId,
            'x-user-role': userRole
          },
          body: JSON.stringify(newItem)
        });

        if (res.ok) {
          const serverDoc = await res.json();
          if (serverDoc && serverDoc.id) {
            setDocuments(prev => {
              const next = prev.map(d => d.id === newItem.id ? serverDoc : d);
              localStorage.setItem('earsip_documents', JSON.stringify(next));
              return next;
            });
          }
        }
        fetchLogs();
      } catch (err) {
        console.warn('Backend POST sync error:', err);
      }
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: DocumentStatus) => {
    setDocuments(prev => {
      const next = prev.map(d => d.id === id ? { ...d, status: newStatus } : d);
      localStorage.setItem('earsip_documents', JSON.stringify(next));
      return next;
    });

    try {
      await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin',
          'x-user-role': currentUser?.role || 'master_admin'
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchLogs();
    } catch (err) {
      console.warn('Status change sync error:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen regulasi ini?')) return;

    setDocuments(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem('earsip_documents', JSON.stringify(next));
      return next;
    });

    try {
      await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin',
          'x-user-role': currentUser?.role || 'master_admin'
        }
      });
      fetchLogs();
    } catch (err) {
      console.warn('Delete sync error:', err);
    }
  };

  // User Management Operations (Admin)
  const handleAddUser = async (userData: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin'
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        fetchUsers();
        fetchLogs();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menambahkan user');
      }
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin'
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin'
        }
      });
      if (res.ok) {
        fetchUsers();
        fetchLogs();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Export & Print
  const handleExportExcel = () => {
    const exportData = documents.map((d) => ({
      'No': d.no,
      'Bidang': d.bidang,
      'Jenis Dokumen': d.jenisDokumen,
      'MASTER REGULASI': d.masterRegulasi,
      'Dokumen yang ada': d.dokumenYangAda,
      'Tahun Terbit': d.tahunTerbit,
      'Keterangan / Status': d.status,
      'Catatan': d.catatan || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Regulasi Inspektorat Tabalong');
    XLSX.writeFile(
      workbook, 
      `e-Arsip_Matriks_Regulasi_Inspektorat_Tabalong_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats calculation
  const totalDocs = documents.length;
  const adaDocs = documents.filter(d => d.status === 'Ada').length;
  const percentageAda = totalDocs > 0 ? Math.round((adaDocs / totalDocs) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        stats={{ total: totalDocs, ada: adaDocs, percentage: percentageAda }}
        onOpenAi={() => {
          setDocForAi(null);
          setIsAiModalOpen(true);
        }}
        onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchDocuments}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={currentUser?.role || 'viewer'}
            onOpenAddModal={() => {
              setEditingDoc(null);
              setIsDocModalOpen(true);
            }}
            onExportExcel={handleExportExcel}
            onPrint={handlePrint}
            selectedBidang={selectedBidang}
            onSelectBidang={setSelectedBidang}
            bidangList={BIDANG_LIST}
          />
        </div>

        {/* Mobile Drawer Sidebar */}
        {isSidebarMobileOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden flex">
            <div className="w-64 bg-slate-900 h-full shadow-2xl overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarMobileOpen(false);
                }}
                userRole={currentUser?.role || 'viewer'}
                onOpenAddModal={() => {
                  setEditingDoc(null);
                  setIsDocModalOpen(true);
                  setIsSidebarMobileOpen(false);
                }}
                onExportExcel={() => {
                  handleExportExcel();
                  setIsSidebarMobileOpen(false);
                }}
                onPrint={() => {
                  handlePrint();
                  setIsSidebarMobileOpen(false);
                }}
                selectedBidang={selectedBidang}
                onSelectBidang={(b) => {
                  setSelectedBidang(b);
                  setIsSidebarMobileOpen(false);
                }}
                bidangList={BIDANG_LIST}
              />
            </div>
            <div 
              className="flex-1 h-full" 
              onClick={() => setIsSidebarMobileOpen(false)}
            />
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto min-w-0 w-full print:p-0">
          
          {/* PRINT-ONLY HEADER BLOCK */}
          <div className="hidden print:block mb-6 text-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-cover" />
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wider">PEMERINTAH KABUPATEN TABALONG</h1>
                <h2 className="text-2xl font-black uppercase">INSPEKTORAT DAERAH</h2>
                <p className="text-xs italic">Jl. Pembataan No. 1, Tanjung, Kabupaten Tabalong, Kalimantan Selatan</p>
              </div>
            </div>
            <div className="text-sm font-bold mt-3 border-t border-slate-300 pt-2 uppercase">
              MATRIKS INVENTORI DOKUMEN REGULASI & STANDAR OPERASIONAL PROSEDUR (SOP)
            </div>
          </div>

          {/* Active Tab Views */}
          {activeTab === 'matrix' && (
            <DocumentMatrix
              documents={documents}
              userRole={currentUser?.role || 'viewer'}
              onViewDoc={(doc) => setViewingDoc(doc)}
              onEditDoc={(doc) => {
                setEditingDoc(doc);
                setIsDocModalOpen(true);
              }}
              onDeleteDoc={handleDeleteDocument}
              onQuickStatusChange={handleQuickStatusChange}
              selectedBidang={selectedBidang}
              onSelectBidang={setSelectedBidang}
              jenisFilter={jenisFilter}
              onJenisFilterChange={setJenisFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              bidangList={BIDANG_LIST}
              jenisList={JENIS_DOKUMEN_LIST}
              onOpenAiForDoc={(doc) => {
                setDocForAi(doc);
                setIsAiModalOpen(true);
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardStats
              documents={documents}
              bidangList={BIDANG_LIST}
              onSelectBidangFilter={(b) => {
                setSelectedBidang(b);
                setActiveTab('matrix');
              }}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogView logs={auditLogs} />
          )}

          {activeTab === 'ai' && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center shadow-sm">
              <ShieldCheck size={40} className="mx-auto text-amber-600 mb-2" />
              <h2 className="text-lg font-bold text-slate-900">Asisten AI Regulasi Inspektorat</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Fitur AI terintegrasi Gemini 2.5 Flash membantu melakukan audit kepatuhan regulasi & merekomendasikan draf SOP secara otomatis.
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow"
              >
                Mulai Percakapan AI
              </button>
            </div>
          )}

          {/* PRINT-ONLY SIGNATURE FOOTER */}
          <div className="hidden print:block mt-12 pt-6 text-xs text-slate-900">
            <div className="flex justify-between items-start">
              <div>
                <p>Dicetak Pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                <p>Status Kelengkapan: {percentageAda}% ({adaDocs}/{totalDocs} Regulasi Ada)</p>
              </div>
              <div className="text-center w-64">
                <p>Tanjung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold mt-1">Inspektur Daerah Kab. Tabalong</p>
                <div className="h-20"></div>
                <p className="font-bold underline">Drs. H. M. Yasin, M.Si</p>
                <p>NIP. 19680512 199303 1 008</p>
              </div>
            </div>
          </div>

        </main>

      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleSaveDocument}
        initialData={editingDoc}
        bidangList={BIDANG_LIST}
        jenisList={JENIS_DOKUMEN_LIST}
      />

      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onEdit={(doc) => {
          setEditingDoc(doc);
          setIsDocModalOpen(true);
        }}
        userRole={currentUser?.role || 'viewer'}
        onOpenAi={(doc) => {
          setDocForAi(doc);
          setIsAiModalOpen(true);
        }}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        documents={documents}
        selectedDocForAi={docForAi}
      />

    </div>
  );
}
