export interface Heir {
  nama: string;
  nik: string;
  hubungan: string;
}

export interface Witness {
  nama: string;
  jabatan: string;
}

export interface LetterData {
  id: string;
  nomorSurat: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  alamatDesa: string;
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  pekerjaan: string;
  alamat: string;
  keperluan: string;
  judulSurat: string;
  narasiSurat: string;
  tanggalSurat: string;
  namaKades: string;
  jabatanKades: string;
  ahliWaris: Heir[];
  saksi: Witness[];
  logoKabupaten: string;
}

export interface SavedLetter extends LetterData {
  savedAt: number;
}

export const INITIAL_DATA: LetterData = {
  id: crypto.randomUUID(),
  nomorSurat: '',
  kabupaten: 'Bangkalan',
  kecamatan: 'Tanah Merah',
  desa: 'Tanah Merah Laok',
  alamatDesa: 'Jl Dsn Duwak Rampak Desa Tanah Merah Laok',
  nama: '',
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: 'Laki-laki',
  pekerjaan: '',
  alamat: '',
  keperluan: 'Persyaratan bantuan sosial / administrasi kependudukan',
  judulSurat: 'Surat Keterangan Tidak Mampu',
  narasiSurat: 'Bahwa nama tersebut di atas adalah benar-benar penduduk Desa {desa} yang menurut pengamatan kami termasuk dalam golongan keluarga ekonomi tidak mampu (Keluarga Pra Sejahtera).',
  tanggalSurat: new Date().toISOString().split('T')[0],
  namaKades: 'AZMY HAFIDZ HARIRI, SE',
  jabatanKades: 'KEPALA DESA TANAH MERAH LAOK',
  ahliWaris: [],
  saksi: [],
  logoKabupaten: '', // Base64 or URL
};
