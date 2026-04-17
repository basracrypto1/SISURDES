import React from 'react';
import { LetterData } from '../types';
import { formatDateIndo } from '../lib/utils';
import { Edit3 } from 'lucide-react';

interface Props {
  data: LetterData;
  onUpdate?: (data: Partial<LetterData>) => void;
}

export const LetterPreview: React.FC<Props> = ({ data, onUpdate }) => {
  const handleInlineEdit = (field: keyof LetterData, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  const sanitizeValue = (val: any): string => {
    if (val === null || val === undefined || (typeof val === 'number' && isNaN(val)) || val === 'null' || val === 'undefined') {
      return '';
    }
    return String(val);
  };

  const EditableSpan = ({ field, value, bold, italic, uppercase }: { field: keyof LetterData, value: any, bold?: boolean, italic?: boolean, uppercase?: boolean }) => {
    const displayValue = sanitizeValue(value);
    return (
      <span
        contentEditable={!!onUpdate}
        suppressContentEditableWarning
        onBlur={(e) => handleInlineEdit(field, e.currentTarget.textContent || '')}
        className={`
          ${onUpdate ? 'cursor-text hover:bg-accent/5 focus:bg-accent/10 focus:outline-none focus:ring-1 focus:ring-accent/20 rounded px-0.5 transition-all' : ''}
          ${bold ? 'font-bold' : ''}
          ${italic ? 'italic' : ''}
          ${uppercase ? 'uppercase' : ''}
        `}
      >
        {displayValue}
      </span>
    );
  };

  const EditableDiv = ({ field, value, className, placeholder }: { field: keyof LetterData, value: any, className?: string, placeholder?: string }) => {
    const rawValue = sanitizeValue(value);
    const text = rawValue.replace(/{desa}/g, data.desa || '');
    return (
      <div
        contentEditable={!!onUpdate}
        suppressContentEditableWarning
        onBlur={(e) => handleInlineEdit(field, e.currentTarget.textContent || '')}
        className={`
          ${onUpdate ? 'cursor-text hover:bg-accent/5 focus:bg-accent/10 focus:outline-none focus:ring-1 focus:ring-accent/20 rounded p-1 transition-all' : ''}
          ${className || ''}
        `}
      >
        {text || placeholder}
      </div>
    );
  };

  return (
    <div 
      key={`${data.judulSurat}-${data.nama}-${data.keperluan}`}
      id="printable-letter"
      className="bg-paper p-12 shadow-2xl rounded-sm border border-line min-h-[1050px] text-[12pt] leading-relaxed mx-auto w-[210mm] animate-update-flash relative group printable-content"
      style={{ fontFamily: '"Bookman Old Style", "Times New Roman", serif' }}
    >
      {onUpdate && (
        <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-40 transition-opacity text-[10px] text-ink uppercase tracking-widest font-bold">
          <Edit3 className="w-3 h-3" /> Klik teks untuk mengedit langsung
        </div>
      )}

      {/* Kop Surat */}
      <div className="relative text-center border-b-[3px] border-double border-ink pb-2 mb-8">
        {data.logoKabupaten && (
          <div className="absolute left-0 top-0 h-24 w-24 flex items-center justify-center">
            <img 
              src={data.logoKabupaten} 
              alt="Logo Kabupaten" 
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h3 className="text-[14pt] font-bold uppercase tracking-tight">Pemerintah Kabupaten <EditableSpan field="kabupaten" value={data.kabupaten} /></h3>
        <h3 className="text-[14pt] font-bold uppercase tracking-tight">Kecamatan <EditableSpan field="kecamatan" value={data.kecamatan} /></h3>
        <h2 className="text-[14pt] font-extrabold uppercase tracking-tight mt-1">Desa <EditableSpan field="desa" value={data.desa} /></h2>
        <p className="text-[11pt] mt-2 opacity-80 font-sans italic"><EditableSpan field="alamatDesa" value={data.alamatDesa} /></p>
      </div>

      {/* Judul */}
      <div className="text-center mb-10">
        <h1 className="text-[14pt] font-bold underline uppercase tracking-wide">
          <EditableSpan field="judulSurat" value={data.judulSurat} />
        </h1>
        <p className="text-[12pt] mt-1">
          Nomor: <EditableSpan field="nomorSurat" value={data.nomorSurat || '...........................................'} />
        </p>
      </div>

      {/* Pembuka */}
      <div className="space-y-6">
        <p className="indent-[1.25cm] text-justify">
          Kepala Desa <EditableSpan field="desa" value={data.desa} />, Kecamatan <EditableSpan field="kecamatan" value={data.kecamatan} />, Kabupaten <EditableSpan field="kabupaten" value={data.kabupaten} />, menerangkan dengan sebenarnya bahwa:
        </p>

        {/* Data Penduduk Table */}
        <div className="pl-10 my-8">
          <table className="w-full border-collapse">
            <tbody className="text-[12pt]">
              <tr>
                <td className="w-[180px] py-1.5">Nama Lengkap</td>
                <td className="w-[10px]">:</td>
                <td className="uppercase tracking-wide">
                  <EditableSpan field="nama" value={data.nama || '...........................................'} />
                </td>
              </tr>
              <tr>
                <td className="py-1.5">NIK</td>
                <td>:</td>
                <td><EditableSpan field="nik" value={data.nik || '...........................................'} /></td>
              </tr>
              <tr>
                <td className="py-1.5">Tempat, Tgl Lahir</td>
                <td>:</td>
                <td>
                   <EditableSpan field="tempatLahir" value={data.tempatLahir || '....................'} />, {formatDateIndo(data.tanggalLahir)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">Jenis Kelamin</td>
                <td>:</td>
                <td><span className={onUpdate ? 'bg-accent/5 px-1 rounded' : ''}>{sanitizeValue(data.jenisKelamin)}</span></td>
              </tr>
              <tr>
                <td className="py-1.5">Pekerjaan</td>
                <td>:</td>
                <td><EditableSpan field="pekerjaan" value={data.pekerjaan || '...........................................'} /></td>
              </tr>
              <tr>
                <td className="py-1.5 align-top">Alamat</td>
                <td className="align-top">:</td>
                <td className="text-justify leading-relaxed">
                  <EditableSpan field="alamat" value={data.alamat || '...........................................'} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Paragraf Utama */}
        <div className="text-justify space-y-4">
           <EditableDiv 
            field="narasiSurat" 
            value={data.narasiSurat} 
            className="indent-[1.25cm]"
            placeholder="Ketik narasi surat di sini..."
           />
           
           {data.ahliWaris.length > 0 && (
             <div className="my-6">
               <p className="mb-2">Adapun ahli waris dari yang bersangkutan adalah sebagai berikut:</p>
               <table className="w-full border border-ink/40 text-[11pt]">
                 <thead>
                   <tr className="bg-ink/5">
                     <th className="border border-ink/40 p-2 w-[40px]">No</th>
                     <th className="border border-ink/40 p-2 text-left">Nama Lengkap</th>
                     <th className="border border-ink/40 p-2 text-left">NIK</th>
                     <th className="border border-ink/40 p-2 text-left">Hubungan</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.ahliWaris.map((heir, idx) => (
                     <tr key={idx}>
                       <td className="border border-ink/40 p-2 text-center">{idx + 1}</td>
                       <td className="border border-ink/40 p-2 font-bold uppercase">{heir.nama || '....................'}</td>
                       <td className="border border-ink/40 p-2">{heir.nik || '....................'}</td>
                       <td className="border border-ink/40 p-2">{heir.hubungan || '....................'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}

           <p className="indent-[1.25cm]">
             Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: <EditableSpan field="keperluan" value={data.keperluan || '...........................................'} bold italic />.
           </p>
        </div>

        <p className="indent-[1.25cm] text-justify">
          Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="mt-16 space-y-12">
        {/* Section Ahli Waris signatures if any */}
        {data.ahliWaris.length > 0 && (
          <div className="space-y-4">
            <p className="font-bold underline uppercase text-sm">Pihak Ahli Waris:</p>
            <div className={`grid ${data.ahliWaris.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-y-12 gap-x-4`}>
              {data.ahliWaris.map((heir, idx) => (
                <div key={idx} className="text-center min-w-[120px]">
                  <p className="text-[10pt] mb-20">{idx + 1}. {heir.nama || '....................'}</p>
                  <div className="border-t border-ink/40 pt-1">
                    <p className="text-[9pt] italic">(Tanda Tangan)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Saksi-Saksi signatures if any */}
        {data.saksi.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-line border-dashed">
            <p className="font-bold underline uppercase text-sm">Saksi-Saksi:</p>
            <div className={`grid ${data.saksi.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-y-12 gap-x-4`}>
              {data.saksi.map((witness, idx) => (
                <div key={idx} className="text-center min-w-[120px]">
                  <p className="text-[10pt] mb-4">Saksi {idx + 1}</p>
                  <div className="mb-16">
                    <p className="text-[9pt] opacity-60">({witness.jabatan || '....................'})</p>
                  </div>
                  <div className="border-t border-ink/40 pt-1">
                    <p className="text-[10pt] font-bold uppercase">{witness.nama || '....................'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Kades */}
        <div className="flex justify-between items-start pt-8">
           <div className="text-center min-w-[200px] invisible">
             {/* Spacer for centering logic if needed, but flex-end works better for single kades */}
           </div>
           
           <div className="text-center min-w-[300px]">
            <p className="mb-1 text-[11pt]">
              <EditableSpan field="desa" value={data.desa} />, {formatDateIndo(data.tanggalSurat)}
            </p>
            <div className="relative">
              <p className="font-bold underline uppercase mb-24 text-[11pt]">
                <EditableSpan field="jabatanKades" value={data.jabatanKades} />
              </p>
              <p className="font-bold underline uppercase italic text-[12pt]">
                <EditableSpan field="namaKades" value={data.namaKades} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


