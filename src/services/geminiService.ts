import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    // Note: In this environment, GEMINI_API_KEY is usually injected by the platform.
    // If it's missing, it could be a configuration issue in the platform.
    console.warn("GEMINI_API_KEY is not defined in the environment.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface GeneratedLetter {
  judulSurat: string;
  keperluan: string;
  narasiSurat: string;
  nama?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
}

export const generateLetterContent = async (prompt: string): Promise<GeneratedLetter> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Anda adalah asisten administrasi desa profesional di Indonesia. 
      Tugas Anda adalah membuat data surat berdasarkan permintaan: "${prompt}". 
      
      Aturan Penulisan:
      1. JUDUL: Harus KAPITAL dan FORMAL (Contoh: SURAT KETERANGAN AHLI WARIS).
      2. NARASI: Berupa paragraf yang menerangkan status subjek. 
         - Jika Surat Tidak Mampu: Terangkan tentang status ekonomi rendah.
         - Jika Ahli Waris: Sebutkan bahwa ybs adalah ahli waris dari (Alm/Almh) siapa.
         - Jika Beda Nama: Terangkan bahwa nama di dokumen X dan Y adalah orang yang sama.
         - Gunakan kata ganti "penduduk kami" atau "warga Desa {desa}".
         - Selalu gunakan "{desa}" sebagai placeholder untuk nama desa.
      3. KEPERLUAN: Tujuan surat yang formal (Contoh: "Persyaratan pengajuan beasiswa pendidikan").
      4. EKSTRAKSI IDENTITAS: Jika dalam prompt terdapat nama orang, NIK, atau tempat/tanggal lahir, ekstraksi data tersebut secara akurat.
         - Tanggal lahir harus dalam format YYYY-MM-DD.
      
      Berikan jawaban dalam format JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judulSurat: {
              type: Type.STRING,
              description: "Judul formal surat",
            },
            narasiSurat: {
              type: Type.STRING,
              description: "Paragraf narasi keterangan penduduk",
            },
            keperluan: {
              type: Type.STRING,
              description: "Penjelasan keperluan surat yang formal",
            },
            nama: {
              type: Type.STRING,
              description: "Nama penduduk jika ada dalam prompt",
            },
            nik: {
              type: Type.STRING,
              description: "NIK jika ada dalam prompt",
            },
            tempatLahir: {
              type: Type.STRING,
              description: "Tempat lahir jika ada dalam prompt",
            },
            tanggalLahir: {
              type: Type.STRING,
              description: "Tanggal lahir format YYYY-MM-DD jika ada dalam prompt",
            },
          },
          required: ["judulSurat", "narasiSurat", "keperluan"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      judulSurat: result.judulSurat || "Surat Keterangan",
      narasiSurat: result.narasiSurat || "Bahwa nama tersebut di atas adalah benar-benar penduduk Desa {desa}.",
      keperluan: result.keperluan || "",
      nama: result.nama,
      nik: result.nik,
      tempatLahir: result.tempatLahir,
      tanggalLahir: result.tanggalLahir,
    };
  } catch (error: any) {
    if (error?.error?.code === 403) {
      console.error("Gemini Permission Error (403):", error);
      throw new Error("Izin akses AI ditolak. Silakan periksa konfigurasi API Key Anda di menu Settings.");
    }
    console.error("Gemini Error:", error);
    throw error;
  }
};
