// src/config/experience.ts
// Riwayat pengalaman kerja (dari CV) untuk app "Resume" di desktop monitor.

export type Experience = {
  role: string
  company: string
  period: string
  desc: string
  highlights?: string[]
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'IT Manager',
    company: 'PT Jaya Swarasa Agung',
    period: 'Okt 2021 — Sekarang',
    desc: 'Perusahaan manufaktur FMCG (biskuit, wafer stick, confectionery, snack). Memimpin seluruh operasional IT & transformasi digital.',
    highlights: [
      'Manajemen budget IT & optimasi biaya',
      'Maintenance & optimasi ERP (SAP)',
      'Pengembangan HRIS & payroll, digitalisasi QC',
      'BI dashboard real-time (sales, produksi, inventory)',
    ],
  },
  {
    role: 'Senior Frontend Developer',
    company: 'PT Jaya Agung Teknologi',
    period: 'Jun 2020 — Nov 2021',
    desc: 'Firma konsultan teknologi spesialis solusi e-commerce (strategi, UI/UX, development, integrasi sistem).',
    highlights: [
      'Membangun website e-commerce performa tinggi',
      'Komponen UI interaktif & reusable',
      'Optimasi loading speed & responsiveness',
    ],
  },
  {
    role: 'IT Manager',
    company: 'PT Mata Laba Laba',
    period: 'Okt 2011 — Mei 2020',
    desc: 'Website one-stop untuk produk berbahan kain yang dapat dikustomisasi untuk kebutuhan personal & bisnis.',
    highlights: [
      'Memimpin pengembangan e-commerce & ERP',
      'Manajemen server cloud (AWS) & on-premise',
      'Memimpin tim IT & transformasi digital',
    ],
  },
  {
    role: 'Senior Web Programmer',
    company: 'Interaktiv',
    period: 'Jul 2010 — Okt 2014',
    desc: 'Konsultan Salesforce regional spesialis CRM & ERP untuk UKM.',
    highlights: [
      'Mengembangkan CRM & ERP multi-perusahaan',
      'HRIS untuk ClickHR',
      'Sistem informasi relawan untuk Foodbank',
    ],
  },
  {
    role: 'Senior Web Programmer',
    company: 'Bundamulia University',
    period: 'Okt 2008 — Jun 2010',
    desc: 'Universitas terkemuka fokus pada teknologi informasi, manajemen, dan ilmu komunikasi.',
    highlights: ['Membangun Learning Management System (LMS)', 'Mengimplementasikan HRIS fakultas & staf'],
  },
  {
    role: 'Web Programmer',
    company: 'PT Mynts Sulusindo',
    period: 'Nov 2007 — Okt 2011',
    desc: 'Perusahaan solusi IT spesialis aplikasi desktop & web custom.',
    highlights: ['Auto Chat/ChatBot customer service', 'Meluncurkan 15+ website dinamis'],
  },
  {
    role: 'Web Programmer',
    company: 'Bali Megah Wisata Tour & Travel',
    period: 'Mei 2005 — Okt 2007',
    desc: 'Agen tour & travel untuk pengalaman perjalanan di Bali, Jakarta, Bandung, dan Yogyakarta.',
    highlights: ['Sistem booking B2B', 'Sistem manajemen kontrak & produk travel'],
  },
]
