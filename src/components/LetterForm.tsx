import React, { useState } from 'react';
import { LetterData, Heir, Witness, INITIAL_DATA } from '../types';
import { 
  RefreshCw, User, FileText, Briefcase, Users, Plus, Trash2, 
  ShieldCheck, LayoutDashboard, Database, Signature, Settings2, Sparkles, Upload, Image as ImageIcon
} from 'lucide-react';
import { AIAssistant } from './AIAssistant';
import { motion, AnimatePresence } from 'motion/react';

import { GeneratedLetter } from '../services/geminiService';

interface Props {
  data: LetterData;
  onChange: (data: LetterData) => void;
  onRefreshNumber: () => void;
}

type FormSection = 'umum' | 'penduduk' | 'waris_saksi' | 'isi';

export const LetterForm: React.FC<Props> = ({ data, onChange, onRefreshNumber }) => {
  const [activeSection, setActiveSection] = useState<FormSection>('umum');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, logoKabupaten: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onChange({ ...data, logoKabupaten: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const addHeir = () => {
    const newHeir: Heir = { nama: '', nik: '', hubungan: '' };
    onChange({ ...data, ahliWaris: [...data.ahliWaris, newHeir] });
  };

  const removeHeir = (index: number) => {
    const newHeirs = [...data.ahliWaris];
    newHeirs.splice(index, 1);
    onChange({ ...data, ahliWaris: newHeirs });
  };

  const handleHeirChange = (index: number, field: keyof Heir, value: string) => {
    const newHeirs = [...data.ahliWaris];
    newHeirs[index] = { ...newHeirs[index], [field]: value };
    onChange({ ...data, ahliWaris: newHeirs });
  };

  const addWitness = () => {
    const newWitness: Witness = { nama: '', jabatan: '' };
    onChange({ ...data, saksi: [...data.saksi, newWitness] });
  };

  const removeWitness = (index: number) => {
    const newWitnesses = [...data.saksi];
    newWitnesses.splice(index, 1);
    onChange({ ...data, saksi: newWitnesses });
  };

  const handleWitnessChange = (index: number, field: keyof Witness, value: string) => {
    const newWitnesses = [...data.saksi];
    newWitnesses[index] = { ...newWitnesses[index], [field]: value };
    onChange({ ...data, saksi: newWitnesses });
  };

  const handleAIGeneration = (result: GeneratedLetter) => {
    onChange({ 
      ...data, 
      judulSurat: result.judulSurat, 
      keperluan: result.keperluan, 
      narasiSurat: result.narasiSurat,
      nama: result.nama || data.nama,
      nik: result.nik || data.nik,
      tempatLahir: result.tempatLahir || data.tempatLahir,
      tanggalLahir: result.tanggalLahir || data.tanggalLahir,
    });
    // Stay on current section or intelligently switch if identity was updated
    if (result.nama || result.nik) {
      setActiveSection('penduduk');
    } else {
      setActiveSection('isi');
    }
  };

  const resetForm = () => {
    if (confirm('Mulai surat baru? Data yang belum tersimpan akan hilang.')) {
      onChange({ 
        ...INITIAL_DATA, 
        id: crypto.randomUUID(),
        nomorSurat: data.nomorSurat,
        tanggalSurat: new Date().toISOString().split('T')[0]
      });
      setActiveSection('umum');
    }
  };

  const inputStyle = "w-full py-2.5 bg-paper/50 border border-line rounded-lg px-4 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none font-sans text-sm transition-all placeholder:text-ink/20";
  const labelStyle = "block text-[10px] uppercase font-bold tracking-[1.5px] text-ink/40 mb-2 ml-1";

  const sections = [
    { id: 'umum', label: 'Umum', icon: LayoutDashboard },
    { id: 'penduduk', label: 'Penduduk', icon: Database },
    { id: 'waris_saksi', label: 'Waris & Saksi', icon: Users },
    { id: 'isi', label: 'Isi Surat', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand & Global Actions */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="font-serif italic text-2xl tracking-tight text-ink">
            Desa {data.desa || 'Tanah Merah Laok'}
          </h1>
          <p className="text-[10px] uppercase tracking-[3px] font-bold text-accent/60">SISURDES - SISTEM SURAT DESA</p>
        </div>
        <button
          onClick={resetForm}
          className="p-2.5 bg-ink text-paper rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-accent/20"
          title="Buat Surat Baru"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Pills */}
      <nav className="flex items-center gap-1 p-1 bg-paper border border-line rounded-xl mb-4 md:mb-8 flex-shrink-0 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as FormSection)}
            className={`
              flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
              ${activeSection === s.id 
                ? 'bg-ink text-paper shadow-sm' 
                : 'text-ink/40 hover:text-ink hover:bg-ink/5'}
            `}
          >
            <s.icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${activeSection === s.id ? 'text-accent' : ''}`} />
            {s.label}
          </button>
        ))}
      </nav>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 no-scrollbar pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {activeSection === 'umum' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <AIAssistant onGenerated={handleAIGeneration} />

                <div className="p-5 bg-paper border border-line rounded-2xl space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Logo Kabupaten
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-bg rounded-xl border border-line flex items-center justify-center overflow-hidden relative group">
                      {data.logoKabupaten ? (
                        <>
                          <img 
                            src={data.logoKabupaten} 
                            alt="Logo" 
                            className="w-full h-full object-contain p-2"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={removeLogo}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-ink/10" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full py-4 bg-white border border-dashed border-line rounded-xl cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-5 h-5 text-accent mb-1" />
                          <p className="text-[10px] font-bold text-ink/60 uppercase tracking-widest leading-none">Upload Logo</p>
                          <p className="text-[8px] text-ink/20 mt-1 uppercase">Maks 2MB (PNG/JPG)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-accent/5 rounded-2xl border border-accent/10 space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> Konfigurasi Utama
                  </h3>
                  <div>
                    <label className={labelStyle}>Judul Surat</label>
                    <input
                      type="text"
                      name="judulSurat"
                      value={data.judulSurat}
                      onChange={handleChange}
                      placeholder="Contoh: Surat Keterangan Tidak Mampu"
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Nomor Surat</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="nomorSurat"
                        value={data.nomorSurat}
                        onChange={handleChange}
                        className={inputStyle}
                      />
                      <button
                        onClick={onRefreshNumber}
                        className="p-2.5 bg-white border border-line rounded-lg text-accent hover:bg-accent hover:text-white transition-all shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Tanggal Surat</label>
                    <input
                      type="date"
                      name="tanggalSurat"
                      value={data.tanggalSurat}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="p-5 bg-paper border border-line rounded-2xl space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Identitas Instansi
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Kabupaten</label>
                      <input type="text" name="kabupaten" value={data.kabupaten} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                      <label className={labelStyle}>Kecamatan</label>
                      <input type="text" name="kecamatan" value={data.kecamatan} onChange={handleChange} className={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Nama Desa</label>
                    <input type="text" name="desa" value={data.desa} onChange={handleChange} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Alamat Kantor</label>
                    <input type="text" name="alamatDesa" value={data.alamatDesa} onChange={handleChange} className={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'penduduk' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-5 bg-paper border border-line rounded-2xl space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                    <User className="w-4 h-4" /> Data Personal Penduduk
                  </h3>
                  <div>
                    <label className={labelStyle}>Nama Lengkap</label>
                    <input type="text" name="nama" value={data.nama} onChange={handleChange} className={`${inputStyle} font-bold text-ink uppercase tracking-wide`} />
                  </div>
                  <div>
                    <label className={labelStyle}>NIK</label>
                    <input type="text" name="nik" value={data.nik} onChange={handleChange} className={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Tempat Lahir</label>
                      <input type="text" name="tempatLahir" value={data.tempatLahir} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                      <label className={labelStyle}>Tanggal Lahir</label>
                      <input type="date" name="tanggalLahir" value={data.tanggalLahir} onChange={handleChange} className={inputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Jenis Kelamin</label>
                      <select name="jenisKelamin" value={data.jenisKelamin} onChange={handleChange} className={inputStyle}>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Pekerjaan</label>
                      <input type="text" name="pekerjaan" value={data.pekerjaan} onChange={handleChange} className={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Alamat Domisili</label>
                    <textarea name="alamat" value={data.alamat} onChange={handleChange} className={`${inputStyle} h-24 resize-none`} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'waris_saksi' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Ahli Waris */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Ahli Waris
                    </h3>
                    <button onClick={addHeir} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-ink text-paper rounded-full hover:bg-accent transition-colors">
                      Tambah
                    </button>
                  </div>
                  <div className="space-y-4">
                    {data.ahliWaris.map((heir, idx) => (
                      <div key={idx} className="p-5 bg-paper border border-line rounded-2xl relative group hover:border-accent/40 transition-all">
                        <button onClick={() => removeHeir(idx)} className="absolute top-4 right-4 text-ink/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-4">
                          <div>
                            <label className={labelStyle}>Nama #{idx+1}</label>
                            <input type="text" value={heir.nama} onChange={(e) => handleHeirChange(idx, 'nama', e.target.value)} className={inputStyle} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelStyle}>NIK</label>
                              <input type="text" value={heir.nik} onChange={(e) => handleHeirChange(idx, 'nik', e.target.value)} className={inputStyle} />
                            </div>
                            <div>
                              <label className={labelStyle}>Hubungan</label>
                              <input type="text" value={heir.hubungan} onChange={(e) => handleHeirChange(idx, 'hubungan', e.target.value)} className={inputStyle} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.ahliWaris.length === 0 && <div className="text-center py-8 bg-paper border border-dashed border-line rounded-2xl text-[10px] uppercase tracking-widest text-ink/20">Belum ada data</div>}
                  </div>
                </div>

                {/* Saksi-Saksi */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Saksi-Saksi
                    </h3>
                    <button onClick={addWitness} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-ink text-paper rounded-full hover:bg-accent transition-colors">
                      Tambah
                    </button>
                  </div>
                  <div className="space-y-4">
                    {data.saksi.map(( witness, idx) => (
                      <div key={idx} className="p-5 bg-paper border border-line rounded-2xl relative group hover:border-accent/40 transition-all">
                        <button onClick={() => removeWitness(idx)} className="absolute top-4 right-4 text-ink/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-4">
                          <div>
                            <label className={labelStyle}>Nama Saksi #{idx+1}</label>
                            <input type="text" value={witness.nama} onChange={(e) => handleWitnessChange(idx, 'nama', e.target.value)} className={inputStyle} />
                          </div>
                          <div>
                            <label className={labelStyle}>Jabatan / Peran</label>
                            <input type="text" value={witness.jabatan} onChange={(e) => handleWitnessChange(idx, 'jabatan', e.target.value)} className={inputStyle} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.saksi.length === 0 && <div className="text-center py-8 bg-paper border border-dashed border-line rounded-2xl text-[10px] uppercase tracking-widest text-ink/20">Belum ada data</div>}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'isi' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-5 bg-paper border border-line rounded-2xl space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Redaksi & Pengesahan
                  </h3>
                  <div>
                    <label className={labelStyle}>Paragraf Narasi</label>
                    <textarea name="narasiSurat" value={data.narasiSurat} onChange={handleChange} className={`${inputStyle} h-40 resize-none leading-relaxed`} />
                  </div>
                  <div>
                    <label className={labelStyle}>Untuk Keperluan</label>
                    <textarea name="keperluan" value={data.keperluan} onChange={handleChange} className={`${inputStyle} h-20 resize-none`} />
                  </div>
                  <div className="pt-4 border-t border-line space-y-4">
                    <div className="flex items-center gap-2 text-ink/40 mb-2">
                      <Signature className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Penanggung Jawab</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelStyle}>Nama Penandatangan</label>
                        <input type="text" name="namaKades" value={data.namaKades} onChange={handleChange} className={inputStyle} />
                      </div>
                      <div>
                        <label className={labelStyle}>Jabatan</label>
                        <input type="text" name="jabatanKades" value={data.jabatanKades} onChange={handleChange} className={inputStyle} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

