// src/config/projects.ts
// Proyek/portfolio (dari CV) yang tampil sebagai ikon di "desktop" layar monitor.
// Klik ikon -> jendela penjelasan. EDIT/ tambah di sini.

export type Project = {
  id: string
  name: string
  icon: string // emoji ikon desktop
  category: string
  year?: string
  role: string
  desc: string
  tech: string[]
  highlights: string[]
}

export const PROJECTS: Project[] = [
  {
    id: 'twistxd',
    name: 'TwistXD',
    icon: '📊',
    category: 'BI Dashboard',
    role: 'IT Manager',
    desc: 'Portal web untuk dashboard & reporting yang mengekstrak data langsung dari ERP SAP. Sistem ini menyajikan analisis COGS, pelacakan inventory, monitoring penjualan, dan laporan produksi, dilengkapi notifikasi email otomatis untuk insight bisnis penting seperti update penjualan & pengiriman, pelacakan variance produksi, dan analisis harga beli.',
    tech: ['PHP', 'MySQL', 'SAP'],
    highlights: [
      'Integrasi data SAP untuk analisis real-time',
      'Analisis COGS & insight profitabilitas',
      'Monitoring inventory, tren penjualan, dan output produksi',
      'Email alert otomatis: performa sales, shipment, variance produksi, analitik harga',
      'Dashboard interaktif yang menyajikan data kompleks untuk pengambilan keputusan',
    ],
  },
  {
    id: 'charis',
    name: 'CHARIS',
    icon: '👥',
    category: 'HRIS & Payroll',
    role: 'IT Manager',
    desc: 'Human Resource Information System yang merampingkan proses manajemen karyawan: rekrutmen, hiring, staffing, evaluasi kinerja, perpanjangan kontrak, tindakan disipliner, hingga prosedur exit. Sistem juga mengintegrasikan pelacakan absensi (cuti, penjadwalan shift, lembur) dan pemrosesan payroll untuk staf labor maupun head office.',
    tech: ['PHP', 'MySQL'],
    highlights: [
      'Manajemen rekrutmen, staffing & perpanjangan kontrak',
      'Pelacakan absensi otomatis (cuti, shift, lembur)',
      'Pemrosesan payroll yang aman & efisien',
      'Penilaian kinerja & evaluasi karyawan',
      'Platform HRIS terpusat dengan keamanan & backup data',
    ],
  },
  {
    id: 'qc',
    name: 'QC Digital',
    icon: '✅',
    category: 'Quality Control',
    role: 'IT Manager & Developer',
    desc: 'Sistem digitalisasi Quality Control untuk menggantikan proses pencatatan manual. Memungkinkan input digital real-time, menghasilkan form QC yang dapat dicetak, dan menyajikan laporan grafis interaktif untuk pengambilan keputusan yang lebih baik, plus distribusi data otomatis ke departemen terkait.',
    tech: ['PHP', 'MySQL', 'ReactJS'],
    highlights: [
      'Form QC digital dengan input real-time & generate otomatis',
      'Pelaporan grafis interaktif (grafik & dashboard)',
      'Notifikasi otomatis ke departemen terkait',
      'Menggantikan form kertas → akurasi & aksesibilitas meningkat',
    ],
  },
  {
    id: 'barcode',
    name: 'Security Barcode',
    icon: '🔒',
    category: 'Access Control',
    role: 'IT Manager',
    desc: 'Sistem checkpoint keamanan berbasis barcode untuk verifikasi karyawan & tamu. Scanner mendukung ID card dan juga dapat diakses lewat aplikasi mobile CHARIS. Sistem memverifikasi status karyawan, jadwal shift, dan otorisasi akses, terintegrasi dengan HRIS (CHARIS), serta berfungsi sebagai sistem absensi.',
    tech: ['Arduino', 'Visual Basic', 'PHP', 'MySQL'],
    highlights: [
      'Verifikasi akses via barcode ID card / aplikasi mobile',
      'Kontrol akses otomatis (status, shift, hak akses tamu)',
      'Pembatasan akses area pabrik per zona',
      'Terintegrasi HRIS sebagai sistem absensi',
      'Dashboard admin: log akses & laporan audit',
    ],
  },
  {
    id: 'tracest',
    name: 'TRACEST',
    icon: '📍',
    category: 'Sales Tracking',
    role: 'IT Manager',
    desc: 'Sistem pelacakan untuk tim sales guna memonitor absensi dan kunjungan. Sistem juga mengumpulkan data outlet dan menganalisis frekuensi kunjungan untuk mengoptimalkan operasi penjualan. Dilengkapi portal admin untuk laporan detail, termasuk peta berbasis GIS yang menampilkan outlet yang dikunjungi, riwayat pergerakan sales, dan lokasi terakhir.',
    tech: ['React Native', 'PHP', 'MySQL', 'Google Maps API'],
    highlights: [
      'Monitoring absensi & kunjungan sales real-time',
      'Pengumpulan data outlet untuk analisis pasar',
      'Analisis frekuensi kunjungan untuk optimasi jadwal',
      'Tracking GIS: outlet, riwayat & lokasi terakhir salesperson',
      'Portal admin dengan sistem pelaporan',
    ],
  },
  {
    id: 'victor',
    name: 'Victor Game',
    icon: '🎮',
    category: 'Gaming Platform',
    role: 'Frontend Developer',
    desc: 'Platform gaming online berbasis di Filipina yang mengintegrasikan banyak provider internasional. Sistem terbagi menjadi backend dan frontend yang berkomunikasi via RESTful API, dengan modul back office dan portal pemain.',
    tech: ['React.js', 'Next.js', 'Django', 'PostgreSQL', 'RabbitMQ', 'Google Kubernetes'],
    highlights: [
      'UI responsif & performa tinggi dengan React.js & Next.js',
      'Back office: kelola pemain, transaksi, provider, promosi, rebate, referral, afiliasi',
      'Portal pemain: register/login, top up token, main, refund, riwayat transaksi',
      'Integrasi RESTful API dengan backend',
      'Modul autentikasi & transaksi yang aman',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Group',
    icon: '🛒',
    category: 'E-Commerce',
    role: 'IT Manager & Developer',
    desc: 'Platform e-commerce multi-regional (custom.co.id, .my, .com.hk, .sg, .ph) untuk produk yang dapat dikustomisasi. Menyediakan designer tool agar pelanggan bisa upload gambar, menambah teks, mengubah background, melihat preview desain sebelum order, dan melacak pesanan secara real-time.',
    tech: ['PHP', 'Yii2', 'MySQL', 'AWS / Google Drive / Dropbox SDK'],
    highlights: [
      'Designer tool kustomisasi produk + preview real-time',
      'Alur operasional: validasi CS → gudang → produksi (task management)',
      'Integrasi cloud storage (Google Drive, Dropbox, AWS)',
      'Strategi SEO & digital marketing (Social Media, Google Ads)',
      'Memimpin tim cross-functional & menjaga skalabilitas sistem',
    ],
  },
  {
    id: 'fullprint',
    name: 'Fullprint',
    icon: '🎨',
    category: 'C2C Marketplace',
    role: 'IT Manager & Developer',
    desc: 'Platform Customer-to-Customer (C2C) yang menghubungkan desainer dan pelanggan. Desainer dapat mengunggah & menjual desain pola kustom, sementara pelanggan memilih pola favorit untuk dicetak di kain. Sistem mengotomatiskan pemrosesan pesanan dan pencetakan.',
    tech: ['PHP', 'Yii2', 'MySQL'],
    highlights: [
      'Marketplace desainer: upload & jual desain pola',
      'Custom fabric printing sesuai pilihan pelanggan',
      'Pemrosesan order otomatis langsung ke tim produksi',
      'Backend otomatis untuk merampingkan alur pesanan',
    ],
  },
  {
    id: 'wachatbot',
    name: 'WA Chatbot',
    icon: '🤖',
    category: 'Automation',
    role: 'IT Manager & Developer',
    desc: 'Chatbot berbasis WhatsApp untuk mengotomatiskan customer support dengan merespons inquiry secara instan. Chatbot memberikan update pesanan real-time dan informasi produk, mengurangi beban tim customer service serta meningkatkan efisiensi respons.',
    tech: ['PHP', 'Yii2', 'Java Selenium'],
    highlights: [
      'Auto-reply inquiry pelanggan (pesanan & produk)',
      'Order tracking langsung via WhatsApp',
      'Otomatisasi WhatsApp dengan Java Selenium',
      'Mengurangi beban CS untuk pertanyaan berulang',
    ],
  },
  {
    id: 'crm',
    name: 'CRM Salesforce',
    icon: '📇',
    category: 'CRM',
    role: 'Senior Web Developer',
    desc: 'Sistem Customer Relationship Management (mudah.my, ICDD, SKINC, Evermarch, PCS, Republic Poly, Carsurin) untuk mengelola leads dan pelanggan secara efisien. Mencakup manajemen order, invoice, dan pelacakan pembayaran untuk merampingkan proses penjualan di platform Salesforce.',
    tech: ['Salesforce'],
    highlights: [
      'Manajemen leads & pelanggan terstruktur',
      'Order & invoice otomatis + pelacakan pembayaran',
      'Optimasi sales pipeline dengan workflow terstruktur',
      'Kustomisasi & skalabilitas sesuai kebutuhan klien',
    ],
  },
  {
    id: 'foodbank',
    name: 'Foodbank',
    icon: '🍱',
    category: 'NGO System',
    role: 'Senior Web Developer',
    desc: 'Donors, Membership & Inventory Management System (DMIMS) yang dirancang untuk mengurangi food waste dengan mendistribusikan surplus makanan kepada yang membutuhkan. Sistem merampingkan manajemen donor, pelacakan keanggotaan, dan kontrol inventory untuk meningkatkan efisiensi distribusi pangan.',
    tech: ['Salesforce', 'PHP', 'Yii'],
    highlights: [
      'Manajemen donor & partisipasi relawan',
      'Kontrol inventory: stok, tanggal kadaluarsa, distribusi',
      'Integrasi Salesforce CRM untuk data & pelaporan',
      'Otomatisasi untuk meminimalkan proses manual',
    ],
  },
  {
    id: 'lms',
    name: 'LMS',
    icon: '🎓',
    category: 'E-Learning',
    role: 'Senior Web Developer',
    desc: 'Learning Management System berbasis web untuk meningkatkan dan merampingkan proses pendidikan bagi dosen dan mahasiswa. Memfasilitasi perencanaan course, distribusi materi, dan kolaborasi akademik melalui antarmuka yang intuitif.',
    tech: ['PHP', 'MySQL', 'jQuery'],
    highlights: [
      'Manajemen course: materi & jadwal',
      'Portal mahasiswa: jadwal, unduh materi, submit tugas',
      'Forum diskusi interaktif dosen–mahasiswa',
      'Resource sharing (upload/download materi)',
    ],
  },
]
