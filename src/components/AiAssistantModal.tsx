import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User as UserIcon, 
  Lightbulb, 
  FileCheck2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  selectedDocForAi?: DocumentItem | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  documents,
  selectedDocForAi
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: selectedDocForAi 
        ? `Halo! Saya Asisten AI Regulasi Inspektorat Tabalong. Mari kita kaji dokumen No.${selectedDocForAi.no}: "${selectedDocForAi.masterRegulasi}". Ada hal spesifik yang ingin Anda tanyakan atau minta draftkan?`
        : 'Halo! Saya Asisten AI Regulasi Inspektorat Daerah Kabupaten Tabalong. Saya dapat membantu menganalisis kelengkapan regulasi, memberikan rekomendasi penyusunan SOP, atau memicu draf acuan aturan. Silakan tanyakan sesuatu!'
    }
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    "Analisis bidang mana yang memiliki kekosongan SOP terbanyak?",
    "Rekomendasikan prioritas penyusunan regulasi untuk Triwulan depan.",
    "Bagaimana pedoman penyusunan SOP Audit Kinerja Berbasis Risiko?",
    "Cek kepatuhan SPBE berdasarkan daftar regulasi saat ini."
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: selectedDocForAi || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem AI');
      }

      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { role: 'ai', text: `⚠️ Mohon maaf: ${err.message || 'Gagal terhubung ke Gemini API.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col h-[85vh] max-h-[700px]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-300">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Asisten AI Regulasi Tabalong</h3>
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded text-[10px] font-bold">
                  Gemini AI 2.5
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Analisis Kepatuhan & Penyusunan Draf Regulasi Inspektorat
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto flex-shrink-0">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap self-center flex items-center gap-1">
            <Lightbulb size={13} className="text-amber-500" /> Saran:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 shadow-sm"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-teal-300 border border-teal-500/30'
              }`}>
                {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm ${
                m.role === 'user'
                  ? 'bg-amber-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3 bg-white border border-slate-200 rounded-xl max-w-xs shadow-sm">
              <Loader2 size={16} className="animate-spin text-teal-600" />
              <span>Memproses analisis regulasi dengan AI...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan analisis regulasi atau minta draf saran SOP..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
