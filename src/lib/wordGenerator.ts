import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ImageRun,
  Header
} from 'docx';
import { saveAs } from 'file-saver';
import { LetterData } from '../types';

export const generateWordLetter = async (data: LetterData) => {
  const sectionChildren: any[] = [];

  // Fetch logo buffer if exists
  let logoImage: any = null;
  if (data.logoKabupaten) {
    try {
      const resp = await fetch(data.logoKabupaten);
      const buffer = await resp.arrayBuffer();
      logoImage = new ImageRun({
        data: buffer,
        transformation: {
          width: 75,
          height: 75,
        },
      } as any);
    } catch (e) {
      console.error("Failed to fetch logo:", e);
    }
  }

  // Header Table for Kop Surat (Table ensures alignment matches preview)
  sectionChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: logoImage ? [
                new Paragraph({
                  children: [logoImage],
                  alignment: AlignmentType.CENTER,
                })
              ] : [],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `PEMERINTAH KABUPATEN ${data.kabupaten.toUpperCase()}`,
                      bold: true,
                      size: 28,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `KECAMATAN ${data.kecamatan.toUpperCase()}`,
                      bold: true,
                      size: 28,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `DESA ${data.desa.toUpperCase()}`,
                      bold: true,
                      size: 28,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: data.alamatDesa,
                      size: 20,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [],
            }),
          ],
        }),
      ],
    })
  );

  // Divider Line
  sectionChildren.push(
    new Paragraph({
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.DOUBLE,
          size: 24,
        },
      },
      children: [],
    }),
    new Paragraph({ children: [new TextRun("")] }), // Spacer

    // Judul Surat
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.judulSurat.toUpperCase(),
          bold: true,
          underline: {},
          size: 28,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Nomor: ${data.nomorSurat}`,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun("")] }), // Spacer

    // Isi Surat
    new Paragraph({
      alignment: AlignmentType.BOTH,
      indent: { firstLine: 720 },
      children: [
        new TextRun({
          text: `Kepala Desa ${data.desa}, Kecamatan ${data.kecamatan}, Kabupaten ${data.kabupaten}, menerangkan dengan sebenarnya bahwa:`,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
      spacing: { after: 200 }
    }),

    // Data Penduduk (Table for alignment)
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        createDataRow("Nama Lengkap", data.nama),
        createDataRow("NIK", data.nik),
        createDataRow("Tempat, Tgl Lahir", `${data.tempatLahir}, ${formatDate(data.tanggalLahir)}`),
        createDataRow("Jenis Kelamin", data.jenisKelamin),
        createDataRow("Pekerjaan", data.pekerjaan),
        createDataRow("Alamat", data.alamat),
      ],
    }),

    new Paragraph({ children: [new TextRun("")] }),
    
    // Narasi Surat
    new Paragraph({
      alignment: AlignmentType.BOTH,
      indent: { firstLine: 720 },
      children: [
        new TextRun({
          text: data.narasiSurat.replace(/{desa}/g, data.desa),
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
      spacing: { before: 200, after: 200 }
    }),

    ...(data.ahliWaris.length > 0 ? [
      new Paragraph({
        children: [new TextRun({ text: "Adapun ahli waris dari yang bersangkutan adalah sebagai berikut:", size: 24, font: "Bookman Old Style" })],
        spacing: { before: 200, after: 100 }
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 24, font: "Bookman Old Style" })] })], width: { size: 5, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nama Lengkap", bold: true, size: 24, font: "Bookman Old Style" })] })], width: { size: 45, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIK", bold: true, size: 24, font: "Bookman Old Style" })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Hubungan", bold: true, size: 24, font: "Bookman Old Style" })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
            ]
          }),
          ...data.ahliWaris.map((heir, idx) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (idx + 1).toString(), size: 24, font: "Bookman Old Style" })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: heir.nama.toUpperCase(), bold: true, size: 24, font: "Bookman Old Style" })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: heir.nik, size: 24, font: "Bookman Old Style" })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: heir.hubungan, size: 24, font: "Bookman Old Style" })] })] }),
            ]
          }))
        ]
      }),
      new Paragraph({ children: [new TextRun("")] }),
    ] : []),

    // Keperluan
    new Paragraph({
      alignment: AlignmentType.BOTH,
      indent: { firstLine: 720 },
      children: [
        new TextRun({
          text: "Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: ",
          size: 24,
          font: "Bookman Old Style",
        }),
        new TextRun({
          text: data.keperluan,
          bold: true,
          italics: true,
          size: 24,
          font: "Bookman Old Style",
        }),
        new TextRun({
          text: ".",
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
      spacing: { before: 200, after: 200 }
    }),

    // Demikian
    new Paragraph({
      alignment: AlignmentType.BOTH,
      indent: { firstLine: 720 },
      children: [
        new TextRun({
          text: "Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.",
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
      spacing: { after: 400 }
    }),

    new Paragraph({ children: [new TextRun("")] }),
    new Paragraph({ children: [new TextRun("")] }),

    // Tanda Tangan Ahli Waris if any
    ...(data.ahliWaris.length > 0 ? [
      new Paragraph({
        children: [new TextRun({ text: "Pihak Ahli Waris:", bold: true, underline: {}, size: 24, font: "Bookman Old Style" })],
        spacing: { after: 200 }
      }),
      generateHeirSignatures(data.ahliWaris),
      new Paragraph({ children: [new TextRun("")] }),
    ] : []),

    // Tanda Tangan Saksi if any
    ...(data.saksi.length > 0 ? [
      new Paragraph({
        children: [new TextRun({ text: "Saksi-Saksi:", bold: true, underline: {}, size: 24, font: "Bookman Old Style" })],
        spacing: { before: 200, after: 200 }
      }),
      generateWitnessSignatures(data.saksi),
      new Paragraph({ children: [new TextRun("")] }),
    ] : []),

    // Tanda Tangan Kades
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [], width: { size: 60, type: WidthType.PERCENTAGE } }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${data.desa}, ${formatDate(data.tanggalSurat)}`,
                      size: 24,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: data.jabatanKades,
                      size: 24,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
                new Paragraph({ children: [new TextRun("") ] }),
                new Paragraph({ children: [new TextRun("") ] }),
                new Paragraph({ children: [new TextRun("") ] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: data.namaKades.toUpperCase(),
                      bold: true,
                      underline: {},
                      italics: true,
                      size: 24,
                      font: "Bookman Old Style",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sectionChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${data.judulSurat.replace(/\s+/g, '_')}_${data.nama.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, fileName);
};

function generateHeirSignatures(heirs: any[]) {
  const cols = heirs.length > 2 ? 3 : 2;
  const rows: TableRow[] = [];
  
  for (let i = 0; i < heirs.length; i += cols) {
    const cells: TableCell[] = [];
    for (let j = 0; j < cols; j++) {
      const heir = heirs[i + j];
      if (heir) {
        cells.push(new TableCell({
          width: { size: 100 / cols, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${i + j + 1}. ${heir.nama}`, size: 20, font: "Bookman Old Style" })
              ],
              spacing: { after: 600 }
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "(....................)", size: 18, font: "Bookman Old Style", italics: true })
              ]
            })
          ],
          verticalAlign: VerticalAlign.TOP
        }));
      } else {
        cells.push(new TableCell({ children: [] }));
      }
    }
    rows.push(new TableRow({ children: cells }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: rows
  });
}

function generateWitnessSignatures(witnesses: any[]) {
  const cols = witnesses.length > 2 ? 3 : 2;
  const rows: TableRow[] = [];
  
  for (let i = 0; i < witnesses.length; i += cols) {
    const cells: TableCell[] = [];
    for (let j = 0; j < cols; j++) {
      const witness = witnesses[i + j];
      if (witness) {
        cells.push(new TableCell({
          width: { size: 100 / cols, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Saksi ${i + j + 1}`, size: 20, font: "Bookman Old Style" })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `(${witness.jabatan})`, size: 18, font: "Bookman Old Style", italics: true })
              ],
              spacing: { after: 600 }
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: witness.nama.toUpperCase(), bold: true, size: 22, font: "Bookman Old Style" })
              ]
            })
          ],
          verticalAlign: VerticalAlign.TOP
        }));
      } else {
        cells.push(new TableCell({ children: [] }));
      }
    }
    rows.push(new TableRow({ children: cells }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: rows
  });
}

function createDataRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, size: 24, font: "Bookman Old Style" })] })],
      }),
      new TableCell({
        width: { size: 5, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: ":", size: 24, font: "Bookman Old Style" })] })],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 24, font: "Bookman Old Style" })] })],
      }),
    ],
  });
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
