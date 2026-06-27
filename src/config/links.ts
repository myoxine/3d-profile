// src/config/links.ts
// Satu tempat untuk semua tautan & data konten. EDIT NILAI DI SINI.

export const LINKS = {
  github: 'https://github.com/myoxine',
  medium: 'https://medium.com/@hadish19',
  linkedin: 'https://www.linkedin.com/in/hadish19/',
  email: 'mailto:hdi_hlim@yahoo.com',
  whatsapp: 'https://wa.me/628999353111',
}

// Aplikasi/proyek yang ditampilkan di "layar" monitor saat diklik.
export type ProjectApp = {
  name: string
  url: string
  color: string // warna ikon
  short: string // 1-2 huruf untuk ikon
}

export const PROJECTS: ProjectApp[] = [
  { name: 'Project One', url: 'https://example.com', color: '#3b82f6', short: 'P1' },
  { name: 'Project Two', url: 'https://example.com', color: '#10b981', short: 'P2' },
  { name: 'Project Three', url: 'https://example.com', color: '#f59e0b', short: 'P3' },
  { name: 'Project Four', url: 'https://example.com', color: '#ef4444', short: 'P4' },
  { name: 'Project Five', url: 'https://example.com', color: '#8b5cf6', short: 'P5' },
  { name: 'Project Six', url: 'https://example.com', color: '#ec4899', short: 'P6' },
]

// Buka tautan: mailto langsung, http di tab baru.
export function openLink(url: string) {
  if (url.startsWith('mailto:')) window.location.href = url
  else window.open(url, '_blank', 'noopener,noreferrer')
}
