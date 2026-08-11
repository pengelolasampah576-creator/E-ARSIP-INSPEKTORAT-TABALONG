import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DOCUMENTS, INITIAL_USERS } from './src/data/initialData';
import { DocumentItem, User, AuditLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure data directory and uploads directory exist for database and file persistence
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded document files static route
app.use('/uploads', express.static(UPLOADS_DIR));

// Initial Database State
interface DBState {
  documents: DocumentItem[];
  users: User[];
  logs: AuditLog[];
  passwords: Record<string, string>; // username -> password mapping
}

function loadDB(): DBState {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading db.json, creating initial DB:', err);
    }
  }

  const initialDB: DBState = {
    documents: INITIAL_DOCUMENTS,
    users: INITIAL_USERS,
    logs: [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        userId: 'usr-admin',
        userName: 'System Administrator',
        userRole: 'master_admin',
        action: 'Inisialisasi Sistem',
        details: 'Sistem e-Arsip Tabalong berhasil diinisialisasi dengan 131 regulasi terdaftar.'
      }
    ],
    passwords: {
      admin: 'admin123',
      inspektur: 'inspektur123',
      auditor1: 'auditor123',
      publik: 'publik123'
    }
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(db: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB state:', err);
  }
}

let db = loadDB();

function logAction(userId: string, userName: string, userRole: string, action: string, details: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    details
  };
  db.logs.unshift(newLog);
  // keep last 500 logs
  if (db.logs.length > 500) db.logs = db.logs.slice(0, 500);
  saveDB(db);
}

// Helper function to convert base64 fileUrl to real server file in uploads/ directory
function processDocumentFileUrl(docData: Partial<DocumentItem>): Partial<DocumentItem> {
  const result = { ...docData };
  if (result.fileUrl && result.fileUrl.startsWith('data:')) {
    try {
      const rawName = result.fileName || 'dokumen.pdf';
      const safeName = rawName.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const timestamp = Date.now();
      const storedFileName = `${timestamp}_${safeName}`;
      const filePath = path.join(UPLOADS_DIR, storedFileName);

      const matches = result.fileUrl.match(/^data:(.+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        const base64Content = result.fileUrl.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
        buffer = Buffer.from(base64Content, 'base64');
      }

      fs.writeFileSync(filePath, buffer);

      const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
      const fileSizeStr = buffer.length > 1024 * 1024 
        ? `${sizeInMB} MB` 
        : `${Math.round(buffer.length / 1024)} KB`;

      result.fileUrl = `/uploads/${storedFileName}`;
      result.fileName = safeName;
      if (!result.fileSize) {
        result.fileSize = fileSizeStr;
      }
    } catch (err) {
      console.error('Error saving base64 file to server upload directory:', err);
    }
  }
  return result;
}

// --- API ROUTES ---

// 1. FILE UPLOAD API
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Data berkas tidak ditemukan' });
    }

    const safeName = (fileName || 'dokumen.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const timestamp = Date.now();
    const storedFileName = `${timestamp}_${safeName}`;
    const filePath = path.join(UPLOADS_DIR, storedFileName);

    let buffer: Buffer;
    const matches = fileData.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    fs.writeFileSync(filePath, buffer);

    const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
    const fileSizeStr = buffer.length > 1024 * 1024 
      ? `${sizeInMB} MB` 
      : `${Math.round(buffer.length / 1024)} KB`;

    return res.json({
      fileUrl: `/uploads/${storedFileName}`,
      fileName: safeName,
      fileSize: fileSizeStr
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: 'Gagal menyimpan berkas ke server' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'Username tidak ditemukan' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Akun Anda dinonaktifkan. Hubungi Administrator.' });
  }

  const storedPass = db.passwords[user.username] || 'admin123';
  if (password !== storedPass) {
    return res.status(401).json({ error: 'Password salah' });
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveDB(db);

  logAction(user.id, user.name, user.role, 'Login Sistem', `User ${user.username} berhasil masuk ke sistem.`);

  return res.json({
    user,
    token: `fake-jwt-token-${user.id}-${Date.now()}`
  });
});

// 2. DOCUMENTS API
app.get('/api/documents', (_req, res) => {
  res.json(db.documents);
});

app.post('/api/documents', (req, res) => {
  let newDocData = req.body;
  newDocData = processDocumentFileUrl(newDocData);

  const user = req.headers['x-user-name'] as string || 'Admin';
  const userId = req.headers['x-user-id'] as string || 'usr-admin';
  const userRole = req.headers['x-user-role'] as string || 'master_admin';

  const maxNo = db.documents.reduce((max, d) => (d.no > max ? d.no : max), 0);
  
  const newDoc: DocumentItem = {
    ...newDocData,
    id: `doc-${Date.now()}`,
    no: newDocData.no || (maxNo + 1),
    updatedAt: new Date().toISOString(),
    updatedBy: user
  };

  db.documents.unshift(newDoc);
  saveDB(db);

  logAction(userId, user, userRole, 'Tambah Dokumen', `Menambahkan dokumen No.${newDoc.no}: ${newDoc.masterRegulasi}`);

  res.status(201).json(newDoc);
});

app.put('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  let updateData = req.body;
  updateData = processDocumentFileUrl(updateData);

  const user = req.headers['x-user-name'] as string || 'Admin';
  const userId = req.headers['x-user-id'] as string || 'usr-admin';
  const userRole = req.headers['x-user-role'] as string || 'master_admin';

  const index = db.documents.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Dokumen tidak ditemukan' });
  }

  const prevStatus = db.documents[index].status;
  
  db.documents[index] = {
    ...db.documents[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
    updatedBy: user
  };

  saveDB(db);

  logAction(
    userId, 
    user, 
    userRole, 
    'Pembaruan Dokumen', 
    `Memperbarui No.${db.documents[index].no} (${db.documents[index].masterRegulasi}). Status: ${prevStatus} ➔ ${db.documents[index].status}`
  );

  res.json(db.documents[index]);
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const user = req.headers['x-user-name'] as string || 'Admin';
  const userId = req.headers['x-user-id'] as string || 'usr-admin';
  const userRole = req.headers['x-user-role'] as string || 'master_admin';

  const target = db.documents.find(d => d.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Dokumen tidak ditemukan' });
  }

  db.documents = db.documents.filter(d => d.id !== id);
  saveDB(db);

  logAction(userId, user, userRole, 'Hapus Dokumen', `Menghapus dokumen No.${target.no}: ${target.masterRegulasi}`);

  res.json({ message: 'Dokumen berhasil dihapus' });
});

// 3. USERS MANAGEMENT API (Master Admin)
app.get('/api/users', (_req, res) => {
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const { username, name, email, role, password } = req.body;
  const adminUser = req.headers['x-user-name'] as string || 'Master Admin';
  const adminId = req.headers['x-user-id'] as string || 'usr-admin';

  if (!username || !name || !role) {
    return res.status(400).json({ error: 'Username, Nama, dan Role wajib diisi' });
  }

  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username sudah digunakan' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    username,
    name,
    email: email || `${username}@tabalongkab.go.id`,
    role,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.passwords[username] = password || 'tabalong123';
  saveDB(db);

  logAction(adminId, adminUser, 'master_admin', 'Tambah Pengguna', `Membuat pengguna baru: ${name} (${role})`);

  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role, status, password } = req.body;
  const adminUser = req.headers['x-user-name'] as string || 'Master Admin';
  const adminId = req.headers['x-user-id'] as string || 'usr-admin';

  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User tidak ditemukan' });
  }

  const targetUser = db.users[index];
  
  db.users[index] = {
    ...targetUser,
    name: name ?? targetUser.name,
    email: email ?? targetUser.email,
    role: role ?? targetUser.role,
    status: status ?? targetUser.status
  };

  if (password) {
    db.passwords[targetUser.username] = password;
  }

  saveDB(db);

  logAction(adminId, adminUser, 'master_admin', 'Ubah Pengguna', `Memperbarui data pengguna: ${targetUser.name}`);

  res.json(db.users[index]);
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const adminUser = req.headers['x-user-name'] as string || 'Master Admin';
  const adminId = req.headers['x-user-id'] as string || 'usr-admin';

  const target = db.users.find(u => u.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  }

  if (target.username === 'admin') {
    return res.status(400).json({ error: 'Master Admin utama tidak dapat dihapus' });
  }

  db.users = db.users.filter(u => u.id !== id);
  delete db.passwords[target.username];
  saveDB(db);

  logAction(adminId, adminUser, 'master_admin', 'Hapus Pengguna', `Menghapus pengguna: ${target.name}`);

  res.json({ message: 'Pengguna berhasil dihapus' });
});

// 4. AUDIT LOGS API
app.get('/api/audit-logs', (_req, res) => {
  res.json(db.logs);
});

// 5. GEMINI AI ASSISTANT API
app.post('/api/ai-summarize', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Calculate document summary stats for prompt context
    const totalDocs = db.documents.length;
    const adaDocs = db.documents.filter(d => d.status === 'Ada').length;
    const dalamProses = db.documents.filter(d => d.status === 'Dalam Proses').length;
    const tidakAda = db.documents.filter(d => d.status === 'Tidak Ada').length;
    const persentase = Math.round((adaDocs / totalDocs) * 100);

    const systemContext = `
Anda adalah Asisten Regulasi & Audit AI untuk Inspektorat Daerah Kabupaten Tabalong, Kalimantan Selatan ("e-Arsip Tabalong").
Anda ahli dalam pengawasan internal pemerintah daerah (APIP), SPIP, Manajemen Risiko, SPBE, dan penyusunan SOP Regulasi Daerah.

Statistik Inventori Matriks Regulasi Inspektorat Tabalong Saat Ini:
- Total Regulasi Master: ${totalDocs} dokumen
- Tersedia (Ada): ${adaDocs} (${persentase}%)
- Dalam Proses Penyusunan: ${dalamProses}
- Belum Ada (Tersedia): ${tidakAda}

Pertanyaan/Instruksi Pengguna: ${prompt}
Konteks Tambahan (Bidang/Dokumen yang dipilih): ${JSON.stringify(context || {})}

Berikan jawaban yang sangat profesional, terstruktur, berbasis aturan tata kelola pemerintah daerah di Indonesia (Peraturan Menteri PANRB, BPKP, Peraturan Bupati Tabalong), dan langsung applicable untuk tim Inspektorat Kabupaten Tabalong.
Gunakan Bahasa Indonesia yang baku, sopan, dan mudah dipahami. Gunakan poin-poin yang jelas dan beri rekomendasi konkret.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemContext
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Error generating AI response:', err);
    res.status(500).json({ error: err?.message || 'Gagal memproses analisis AI.' });
  }
});

// --- VITE MIDDLEWARE / SERVE STATIC ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server e-Arsip Tabalong berjalan di http://localhost:${PORT}`);
  });
}

startServer();
