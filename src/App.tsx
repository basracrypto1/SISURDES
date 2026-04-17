/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LetterData, INITIAL_DATA, SavedLetter } from './types';
import { LetterForm } from './components/LetterForm';
import { LetterPreview } from './components/LetterPreview';
import { LetterHistory } from './components/LetterHistory';
import { generateWordLetter } from './lib/wordGenerator';
import { generateLetterNumber } from './lib/utils';
import { Download, FileText, Printer, CheckCircle2, RefreshCw, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const getInitialCounter = () => {
    const saved = localStorage.getItem('surt_counter');
    return saved ? parseInt(saved, 10) : 1;
  };

  const getInitialHistory = (): SavedLetter[] => {
    const saved = localStorage.getItem('surt_history');
    return saved ? JSON.parse(saved) : [];
  };

  const [counter, setCounter] = useState(getInitialCounter);
  const [history, setHistory] = useState<SavedLetter[]>(getInitialHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [data, setData] = useState<LetterData>(() => ({
    ...INITIAL_DATA,
    id: crypto.randomUUID(),
    nomorSurat: generateLetterNumber(getInitialCounter()),
    tanggalSurat: new Date().toISOString().split('T')[0]
  }));
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateData = (update: Partial<LetterData> | ((prev: LetterData) => LetterData)) => {
    setData(prev => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update };
      
      const sanitize = (val: any): any => {
        if (val === null || val === undefined || val === 'null' || val === 'undefined') return '';
        if (Array.isArray(val)) return val.map(sanitize);
        if (typeof val === 'object' && val !== null) {
          const obj: any = {};
          Object.keys(val).forEach(k => {
            obj[k] = sanitize(val[k]);
          });
          return obj;
        }
        return val;
      };

      return sanitize(next);
    });
  };

  useEffect(() => {
    // Sync numbering if counter changes from other source or internal logic
    updateData({ nomorSurat: generateLetterNumber(counter) });
  }, [counter]);

  const saveToHistory = () => {
    const newEntry: SavedLetter = {
      ...data,
      savedAt: Date.now()
    };
    
    // Prevent duplicate saves of the exact same timestamped entry if triggered twice
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== data.id || h.nomorSurat !== data.nomorSurat);
      const updated = [newEntry, ...filtered].slice(0, 100); // Keep last 100
      localStorage.setItem('surt_history', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFromHistory = (combinedId: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => (h.id + h.savedAt) !== combinedId);
      localStorage.setItem('surt_history', JSON.stringify(updated));
      return updated;
    });
  };

  const loadFromHistory = (letter: SavedLetter) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedAt, ...letterData } = letter;
    updateData(letterData);
    setShowHistory(false);
    setActiveTab('edit');
  };

  const incrementCounter = () => {
    const nextCounter = counter + 1;
    setCounter(nextCounter);
    localStorage.setItem('surt_counter', nextCounter.toString());
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await generateWordLetter(data);
      setShowSuccess(true);
      saveToHistory();
      incrementCounter();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate Word file:', error);
      alert('Gagal membuat file Word. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    try {
      console.log('Initiating print sequence...');
      saveToHistory();
      window.focus();
      window.print();
      incrementCounter();
    } catch (e) {
      console.error('Print failed:', e);
    }
  };

  const handleRefreshNumber = () => {
    updateData({ nomorSurat: generateLetterNumber(counter) });
  };

  const handleUpdate = (update: Partial<LetterData>) => {
    updateData(update);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-bg overflow-hidden font-sans">
      {/* Mobile Tab Toggle */}
      <div className="lg:hidden flex border-b border-line bg-white flex-shrink-0">
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-ink/40'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Edit Data
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-ink/40'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Hasil Preview
          </div>
        </button>
      </div>

      {/* Sidebar / Form Area */}
      <aside className={`
        w-full lg:w-[450px] h-full flex flex-col bg-bg border-r border-line overflow-y-auto no-scrollbar
        ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}
      `}>
        <div className="p-6 md:p-10 flex-1">
          <LetterForm 
            data={data} 
            onChange={updateData} 
            onRefreshNumber={handleRefreshNumber}
          />
        </div>
        
        {/* Action Buttons at bottom of sidebar */}
        <div className="p-6 md:p-8 space-y-3 bg-paper/50 border-t border-line backdrop-blur-md sticky bottom-0 z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-line text-ink rounded-xl font-bold text-[10px] tracking-widest hover:bg-ink hover:text-white active:scale-95 transition-all shadow-sm"
            >
              <History className="w-4 h-4" /> RIWAYAT
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-line text-ink rounded-xl font-bold text-[10px] tracking-widest hover:bg-ink hover:text-white active:scale-95 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" /> CETAK
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full h-14 flex items-center justify-center gap-3 bg-ink text-paper rounded-xl font-bold text-xs tracking-[2px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-ink/10 relative overflow-hidden group"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                <span>UNDUH FILE WORD (.DOCX)</span>
              </>
            )}
          </button>
          
          <div className="flex flex-col items-center gap-2 mt-4">
            <p className="text-[9px] text-ink/30 italic font-medium">
              *Hanya cetak & unduh di browser desktop
            </p>
            
            <a 
              href="https://www.tiktok.com/@me.fahrulanam" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-0.5"
            >
              <span className="text-[8px] uppercase tracking-[3px] text-ink/20 font-bold group-hover:text-accent transition-colors">Digitalization by</span>
              <span className="text-[10px] font-bold text-ink/40 group-hover:text-ink transition-colors">Fahrul Anam</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Preview Pane */}
      <main className={`
        flex-1 h-full bg-preview-bg items-start justify-center relative overflow-auto p-4 md:p-10 no-scrollbar
        ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}
      `}>
        <div className="fixed top-8 right-8 bg-accent/10 border border-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse z-50 shadow-sm backdrop-blur-sm hidden lg:block">
          Interactive Editor Mode
        </div>
        
        <div className="transform scale-[0.6] sm:scale-75 md:scale-90 xxl:scale-100 origin-top mt-12 transition-transform duration-500 mb-20">
          <LetterPreview data={data} onUpdate={handleUpdate} />
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-10 right-10 bg-ink text-paper px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-paper/10 z-50"
            >
              <div className="bg-accent p-1 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-paper" />
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-wider">Success</p>
                <p className="text-xs opacity-60">File Word berhasil diunduh.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <LetterHistory 
            history={history}
            onSelect={loadFromHistory}
            onDelete={deleteFromHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {/* Global CSS overrides for scrollbars and print */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .flex { display: block !important; }
          aside { display: none !important; }
          main { 
            display: block !important;
            background: white !important; 
            padding: 0 !important; 
            margin: 0 !important;
            width: 100% !important; 
            height: auto !important; 
            position: static !important;
            overflow: visible !important;
          }
          .fixed, [class*="Interactive Editor Mode"], .success-toast { display: none !important; }
          .transform { 
            transform: none !important; 
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .printable-content { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            max-width: none !important;
            margin: 0 !important;
            padding: 15mm !important;
            min-height: auto !important;
            position: relative !important;
          }
        }
      `}</style>
    </div>
  );
}


