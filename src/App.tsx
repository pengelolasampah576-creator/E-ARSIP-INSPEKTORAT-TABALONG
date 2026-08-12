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
import { db, collection, onSnapshot, setDoc, doc, deleteDoc, writeBatch, getDocs } from './lib/firebase';

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

  // Helper for safe localStorage saving (handles QuotaExceededError when base64 files are present)
  const safeSaveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn('localStorage storage limit reached:', err);
      try {
        if (Array.isArray(data)) {
          const cleaned = data.map((item: any) => {
            if (item.fileUrl && item.fileUrl.startsWith('data:')) {
              return { ...item, fileUrl: '' };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      } catch (e) {
        console.error('Failed to save cleaned data to localStorage:', e);
      }
    }
  };

  // Helper function to record activity logs in Firestore
  const logActionToFirestore = async (action: string, details: string) => {
    try {
      const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const logItem: AuditLog = {
        id: logId,
        userId: currentUser?.id || 'usr-admin',
        userName: currentUser?.name || 'Admin',
        userRole: currentUser?.role || 'master_admin',
        action,
        details,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'activity_logs', logId), logItem);
    } catch (err) {
      console.warn('Error recording log to Firestore:', err);
    }
  };

  // Real-time Firestore Sync Subscriptions
  useEffect(() => {
    // Restore user session from localStorage
    const savedUser = localStorage.getItem('earsip_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing stored user session:', err);
      }
    }

    // 1. Subscribe to Documents Collection Realtime
    const docsRef = collection(db, 'documents');
    const unsubscribeDocs = onSnapshot(docsRef, async (snapshot) => {
      if (!snapshot.empty) {
        // If auto-purge hasn't run yet, clean out existing example documents
        if (!localStorage.getItem('earsip_purged_examples')) {
          localStorage.setItem('earsip_purged_examples', 'true');
          try {
            const batch = writeBatch(db);
            snapshot.forEach((dSnap) => {
              batch.delete(doc(db, 'documents', dSnap.id));
            });
            await batch.commit();
          } catch (e) {
            console.error('Error auto purging example docs:', e);
          }
          setDocuments([]);
          safeSaveToLocalStorage('earsip_documents', []);
          return;
        }

        const docsList: DocumentItem[] = [];
        snapshot.forEach((docSnap) => {
          docsList.push(docSnap.data() as DocumentItem);
        });
        docsList.sort((a, b) => (a.no || 0) - (b.no || 0));
        setDocuments(docsList);
        safeSaveToLocalStorage('earsip_documents', docsList);
      } else {
        localStorage.setItem('earsip_purged_examples', 'true');
        setDocuments([]);
        safeSaveToLocalStorage('earsip_documents', []);
      }
    }, (err) => {
      console.error('Firestore documents onSnapshot error:', err);
    });

    // 2. Subscribe to Users Collection Realtime
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
      if (!snapshot.empty) {
        const usersList: User[] = [];
        snapshot.forEach((userSnap) => {
          usersList.push(userSnap.data() as User);
        });
        setUsers(usersList);
      } else {
        try {
          const batch = writeBatch(db);
          INITIAL_USERS.forEach((usr) => {
            const uRef = doc(db, 'users', usr.id);
            batch.set(uRef, usr);
          });
          await batch.commit();
        } catch (e) {
          console.error('Error seeding initial users into Firestore:', e);
        }
      }
    }, (err) => {
      console.error('Firestore users onSnapshot error:', err);
    });

    // 3. Subscribe to Activity Logs Collection Realtime
    const logsRef = collection(db, 'activity_logs');
    const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
      if (!snapshot.empty) {
        const logsList: AuditLog[] = [];
        snapshot.forEach((logSnap) => {
          logsList.push(logSnap.data() as AuditLog);
        });
        logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logsList);
      }
    }, (err) => {
      console.error('Firestore logs onSnapshot error:', err);
    });

    return () => {
      unsubscribeDocs();
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, []);

  const fetchDocuments = () => {
    // Legacy refresh trigger helper
  };
  const fetchLogs = () => {
    // Legacy refresh trigger helper
  };

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

  // Document Operations using Realtime Firebase Firestore
  const handleSaveDocument = async (docData: Partial<DocumentItem>) => {
    const user = currentUser?.name || 'Admin';

    setIsDocModalOpen(false);

    try {
      if (editingDoc) {
        const updatedItem: DocumentItem = {
          ...editingDoc,
          ...docData,
          updatedAt: new Date().toISOString(),
          updatedBy: user
        };

        setEditingDoc(null);
        await setDoc(doc(db, 'documents', editingDoc.id), updatedItem);
        await logActionToFirestore('Ubah Dokumen', `Memperbarui dokumen ${updatedItem.masterRegulasi || updatedItem.id}`);
      } else {
        const maxNo = documents.reduce((max, d) => (d.no && d.no > max ? d.no : max), 0);
        const newId = `doc-${Date.now()}`;
        const newItem: DocumentItem = {
          id: newId,
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

        await setDoc(doc(db, 'documents', newId), newItem);
        await logActionToFirestore('Tambah Dokumen', `Menambahkan dokumen baru: ${newItem.masterRegulasi}`);
      }
    } catch (err) {
      console.error('Error saving document to Firestore:', err);
      alert('Gagal menyimpan dokumen ke Firebase Firestore.');
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: DocumentStatus) => {
    const targetDoc = documents.find(d => d.id === id);
    if (!targetDoc) return;

    try {
      const updatedItem = {
        ...targetDoc,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Admin'
      };
      await setDoc(doc(db, 'documents', id), updatedItem);
      await logActionToFirestore('Ubah Status', `Mengubah status dokumen "${targetDoc.masterRegulasi}" menjadi ${newStatus}`);
    } catch (err) {
      console.error('Error updating status in Firestore:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const targetDoc = documents.find(d => d.id === id);
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${targetDoc?.masterRegulasi || id}"?`)) return;

    try {
      await deleteDoc(doc(db, 'documents', id));
      await logActionToFirestore('Hapus Dokumen', `Menghapus dokumen: ${targetDoc?.masterRegulasi || id}`);
    } catch (err) {
      console.error('Error deleting document from Firestore:', err);
    }
  };

  // Export / Import Backup JSON Handlers
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `earsip_database_tabalong_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedDocs = JSON.parse(text);
      if (!Array.isArray(importedDocs) || importedDocs.length === 0) {
        alert('File JSON backup tidak valid atau kosong.');
        return;
      }

      const confirmImport = confirm(`Apakah Anda yakin ingin mengimpor ${importedDocs.length} data regulasi dari file backup ini? Data di Firebase cloud server dan seluruh komputer pengguna lain akan langsung diperbarui secara otomatis.`);
      if (!confirmImport) return;

      const chunkSize = 400;
      for (let i = 0; i < importedDocs.length; i += chunkSize) {
        const chunk = importedDocs.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((item: DocumentItem) => {
          if (item.id) {
            const itemRef = doc(db, 'documents', item.id);
            batch.set(itemRef, item);
          }
        });
        await batch.commit();
      }

      await logActionToFirestore('Impor Database', `Mengimpor ${importedDocs.length} dokumen regulasi ke Firebase Firestore.`);
      alert(`Berhasil mengimpor ${importedDocs.length} data regulasi ke Firebase Cloud Server! Seluruh pengguna di komputer lain sekarang dapat melihat data terbaru secara otomatis.`);
    } catch (err) {
      console.error('Error importing JSON backup to Firestore:', err);
      alert('Format file JSON tidak valid.');
    }
  };

  // User Management Operations (Admin)
  const handleAddUser = async (userData: any) => {
    try {
      const newId = `usr-${Date.now()}`;
      const newUser: User = {
        id: newId,
        username: userData.username,
        name: userData.name,
        email: userData.email || `${userData.username}@tabalongkab.go.id`,
        role: userData.role || 'operator_bidang',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', newId), newUser);
      await logActionToFirestore('Tambah Pengguna', `Menambahkan pengguna baru: ${newUser.name}`);
      alert('Pengguna berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding user to Firestore:', err);
      alert('Gagal menambahkan pengguna.');
    }
  };

  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      const existingUser = users.find(u => u.id === id);
      if (!existingUser) return;

      const updatedUser: User = {
        ...existingUser,
        ...userData
      };

      await setDoc(doc(db, 'users', id), updatedUser);
      await logActionToFirestore('Ubah Pengguna', `Memperbarui data pengguna: ${updatedUser.name}`);
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const targetUser = users.find(u => u.id === id);
      if (!confirm(`Hapus pengguna ${targetUser?.name || id}?`)) return;

      await deleteDoc(doc(db, 'users', id));
      await logActionToFirestore('Hapus Pengguna', `Menghapus pengguna: ${targetUser?.name || id}`);
    } catch (err) {
      console.error('Error deleting user from Firestore:', err);
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

  const handleResetAllDocuments = async () => {
    if (!confirm('Apakah Anda yakin ingin mengosongkan SELURUH data contoh regulasi? Data di database cloud dan tampilan aplikasi akan langsung menjadi kosong untuk diisi dengan data regulasi yang sebenarnya.')) {
      return;
    }
    try {
      const docsSnapshot = await getDocs(collection(db, 'documents'));
      if (!docsSnapshot.empty) {
        const batch = writeBatch(db);
        docsSnapshot.forEach((dSnap) => {
          batch.delete(doc(db, 'documents', dSnap.id));
        });
        await batch.commit();
      }
      setDocuments([]);
      localStorage.removeItem('earsip_documents');
      localStorage.setItem('earsip_purged_examples', 'true');
      await logActionToFirestore('Kosongkan Data', 'Mengosongkan seluruh data regulasi contoh untuk pengisian data regulasi aktual.');
      alert('Berhasil mengosongkan seluruh data regulasi! Aplikasi sekarang bersih dan siap diisi dengan regulasi aktual.');
    } catch (err) {
      console.error('Error resetting documents in Firestore:', err);
      alert('Gagal mengosongkan data dari database cloud.');
    }
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
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetAllDocuments}
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
