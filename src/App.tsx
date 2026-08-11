import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { DocumentItem, DocumentStatus, User, UserRole, AuditLog } from './types';
import { BIDANG_LIST, JENIS_DOKUMEN_LIST } from './data/initialData';
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
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
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
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
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
  }, []);

  // Login handler
  const handleLogin = async (username: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      setCurrentUser(data.user);
      localStorage.setItem('earsip_user', JSON.stringify(data.user));
      fetchLogs(); // refresh audit logs
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal terhubung ke server' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('earsip_user');
    setIsLoginModalOpen(true);
  };

  // Document Operations
  const handleSaveDocument = async (docData: Partial<DocumentItem>) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-name': currentUser?.name || 'Admin',
        'x-user-id': currentUser?.id || 'usr-admin',
        'x-user-role': currentUser?.role || 'master_admin'
      };

      if (editingDoc) {
        // PUT update
        const res = await fetch(`/api/documents/${editingDoc.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(docData)
        });
        if (res.ok) {
          fetchDocuments();
          fetchLogs();
        }
      } else {
        // POST create
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers,
          body: JSON.stringify(docData)
        });
        if (res.ok) {
          fetchDocuments();
          fetchLogs();
        }
      }
    } catch (err) {
      console.error('Error saving document:', err);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: DocumentStatus) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin',
          'x-user-role': currentUser?.role || 'master_admin'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDocuments();
        fetchLogs();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen regulasi ini?')) return;

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-name': currentUser?.name || 'Admin',
          'x-user-id': currentUser?.id || 'usr-admin',
          'x-user-role': currentUser?.role || 'master_admin'
        }
      });
      if (res.ok) {
        fetchDocuments();
        fetchLogs();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
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
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
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
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto print:p-0">
          
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
