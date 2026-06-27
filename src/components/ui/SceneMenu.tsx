// src/components/ui/SceneMenu.tsx
// UI HTML di atas Canvas: menu shortcut kamera + tombol Tour + modal foto +
// drawer "Experience & Portfolio" (kanan) & drawer daftar artikel series (kiri).
// Semua membaca/menulis store fokus (zustand).

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useFocus, type ViewName } from '../../store/useFocus'
import { openLink } from '../../config/links'
import { TUTORIALS } from '../../config/tutorials'
import { useIsMobile } from '../../hooks/useMediaQuery'

const NAV: { view: ViewName; label: string; icon: string }[] = [
  { view: 'overview', label: 'Beranda', icon: '🏠' },
  { view: 'photos', label: 'Education', icon: '🎓' },
  { view: 'desk', label: 'Experience', icon: '🚀' },
  { view: 'tv', label: 'My Video', icon: '🎬' },
  { view: 'books', label: 'Tutorial Series', icon: '📚' },
  { view: 'shelf', label: 'Contact Me', icon: '🤝' },
]

// urutan area yang dikunjungi tour otomatis (mulai dari Beranda)
const TOUR: ViewName[] = ['overview', 'photos', 'desk', 'tv', 'books', 'shelf']
// durasi baca per area (Beranda lebih lama karena penjelasannya lebih panjang)
const dwellOf = (v: ViewName) => (v === 'overview' ? 11000 : 8000)

// penjelasan fungsi objek yang bisa diklik di tiap area (dipakai saat tour)
const VIEW_INFO: Record<ViewName, { icon: string; title: string; desc: string; points?: string[] }> = {
  overview: {
    icon: '🏠',
    title: 'Selamat datang di ruang kerja 3D saya',
    desc: 'Beberapa cara berinteraksi dengan ruangan ini:',
    points: [
      '🧭 Menu di bawah — lompat ke tiap area: Education, Experience, My Video, Tutorial Series, dan Contact Me.',
      '🖱️ Putar kamera — tahan & geser mouse untuk melihat sekeliling (zoom dibatasi agar tetap di dalam ruangan).',
      '💡 Saklar di dinding — bisa diklik untuk menyalakan/mematikan lampu (neon sign, lampu meja, lampu sofa).',
    ],
  },
  photos: {
    icon: '🎓',
    title: 'Education & Certificate',
    desc: 'Galeri pendidikan & sertifikasi di dinding belakang.',
    points: [
      '🎓 Ijazah: Magister Manajemen (Bunda Mulia) & S1 Teknik Informatika (Binus).',
      '📜 Sertifikat TestDome: JavaScript, React, React-Redux, React Native (top 10%).',
      '🖼️ Klik bingkai foto mana pun untuk memperbesarnya dalam tampilan penuh.',
    ],
  },
  desk: {
    icon: '🚀',
    title: 'Experience & Portfolio',
    desc: 'Layar monitor menampilkan "Hadi OS" — desktop interaktif berisi karier & proyek.',
    points: [
      '💼 Ikon Resume — buka timeline 7 pengalaman kerja (IT Manager, Senior Frontend, dll).',
      '🗂️ 12 ikon proyek dari CV — klik untuk detail: peran, deskripsi, highlight, tech stack.',
      '💻 Layar laptop menampilkan cuplikan kode editor (VS Code).',
    ],
  },
  tv: {
    icon: '🎬',
    title: 'My Video',
    desc: 'Televisi di atas credenza, dengan jam dinding yang berjalan sesuai waktu nyata.',
    points: [
      '▶️ Klik layar TV untuk memutar video perkenalan (About Me).',
      '🕒 Jam di atas TV memakai waktu sistem secara real-time.',
    ],
  },
  books: {
    icon: '📚',
    title: 'Tutorial Series',
    desc: 'Rak buku 2×2 — tiap rak mewakili satu seri tutorial yang saya tulis di Medium.',
    points: [
      '📗 Seri: Expo Router, Fastify REST API, ExpressJS + TypeScript, 3D Profile Website.',
      '📖 Klik sebuah buku untuk membuka artikelnya langsung di Medium.',
      '🗃️ Klik raknya untuk melihat daftar lengkap artikel dalam seri itu.',
    ],
  },
  shelf: {
    icon: '🤝',
    title: 'Contact Me',
    desc: 'Rak melayang berisi kubus 3D media sosial yang berputar.',
    points: [
      '🧊 Kubus: GitHub, Email, LinkedIn, WhatsApp, dan Medium.',
      '🔗 Arahkan kursor untuk melihat label, klik untuk membuka tautannya.',
    ],
  },
}

export function SceneMenu() {
  const view = useFocus((s) => s.view)
  const setView = useFocus((s) => s.setView)
  const photo = useFocus((s) => s.photo)
  const closePhoto = useFocus((s) => s.closePhoto)
  const panel = useFocus((s) => s.panel)
  const series = useFocus((s) => s.series)
  const closePanel = useFocus((s) => s.closePanel)
  const touring = useFocus((s) => s.touring)
  const startTour = useFocus((s) => s.startTour)
  const stopTour = useFocus((s) => s.stopTour)
  const reset = useFocus((s) => s.reset)

  const isMobile = useIsMobile()
  const focused = view !== 'overview'
  const [step, setStep] = useState(0)
  const [remaining, setRemaining] = useState(0) // detik tersisa sebelum auto-next

  // mulai tour -> kembali ke langkah pertama
  useEffect(() => {
    if (touring) setStep(0)
  }, [touring])

  // tampilkan area langkah saat ini + auto-advance + hitung mundur (reset tiap step)
  useEffect(() => {
    if (!touring) return
    setView(TOUR[step])
    const total = dwellOf(TOUR[step])
    setRemaining(Math.round(total / 1000))
    const tick = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    const timer = window.setTimeout(() => {
      if (step + 1 >= TOUR.length) reset()
      else setStep(step + 1)
    }, total)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(timer)
    }
  }, [touring, step, setView, reset])

  const tourNext = () => (step + 1 >= TOUR.length ? reset() : setStep(step + 1))
  const tourPrev = () => setStep((s) => Math.max(0, s - 1))

  const onNav = (v: ViewName) => {
    if (touring) stopTour()
    // klik "Beranda" -> reset() agar kamera selalu kembali ke framing overview
    // yang rapi (homeKey naik), bahkan saat view sudah 'overview' tapi terlanjur
    // diputar. View lain cukup setView biasa.
    if (v === 'overview') reset()
    else setView(v)
  }

  return (
    <>
      {/* Kontrol kiri-atas: Tour */}
      {!focused && !touring && (
        <button onClick={() => startTour()} style={pill('#7c5cff')}>
          ▶ Tur Ruangan
        </button>
      )}

      {/* Kontrol kanan-atas: Stop tour / Keluar */}
      {touring ? (
        <button onClick={() => reset()} style={{ ...pill('#ff6b6b'), left: 'auto', right: 18 }}>
          ⏹ Hentikan Tur
        </button>
      ) : (
        focused && (
          <button onClick={() => reset()} style={{ ...pill('#ffd27a'), left: 'auto', right: 18, color: '#1a1a1a' }}>
            ✕ Keluar
          </button>
        )
      )}

      {/* Kartu penjelasan area saat tour berjalan */}
      {touring && (
        <div
          style={{
            position: 'absolute',
            top: 78,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(560px, 92vw)',
            boxSizing: 'border-box',
            padding: '16px 20px',
            borderRadius: 16,
            background: 'rgba(18,18,22,0.82)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            border: '1px solid rgba(124,92,255,0.4)',
            color: '#fff',
            zIndex: 13,
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, color: '#b9a9ff', letterSpacing: 1, marginBottom: 4 }}>
            TUR RUANGAN · {step + 1}/{TOUR.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {VIEW_INFO[view].icon} {VIEW_INFO[view].title}
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#dcdce6' }}>{VIEW_INFO[view].desc}</div>
          {VIEW_INFO[view].points && (
            <ul
              style={{
                listStyle: 'none',
                margin: '10px 0 0',
                padding: 0,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              {VIEW_INFO[view].points!.map((p, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.45, color: '#e6e6ef' }}>
                  {p}
                </li>
              ))}
            </ul>
          )}

          {/* kontrol langkah tour */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            <button onClick={tourPrev} disabled={step === 0} style={tourBtn(step === 0)}>
              ‹ Sebelumnya
            </button>
            <button onClick={tourNext} style={tourBtn(false, true)}>
              {step + 1 >= TOUR.length ? `Selesai ✓ (${remaining}s)` : `Lanjut › (${remaining}s)`}
            </button>
          </div>
        </div>
      )}

      {/* Bar menu bawah-tengah. Di mobile: ikon-saja + bisa di-scroll horizontal
          supaya 6 menu tetap muat di layar sempit tanpa menyusut/menumpuk. */}
      <nav
        style={{
          position: 'absolute',
          bottom: isMobile ? 12 : 18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: 6,
          padding: 6,
          maxWidth: '96vw',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          borderRadius: 999,
          background: 'rgba(20,20,24,0.55)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          zIndex: 10,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {NAV.map((n) => {
          const active = view === n.view
          return (
            <button
              key={n.view}
              onClick={() => onNav(n.view)}
              title={n.label}
              aria-label={n.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 0 : 7,
                whiteSpace: 'nowrap',
                flex: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: isMobile ? '10px 12px' : '9px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.2,
                color: active ? '#1a1a1a' : '#e8e8e8',
                background: active ? 'linear-gradient(135deg, #ffe1a3, #ffc24d)' : 'transparent',
                boxShadow: active ? '0 3px 10px rgba(255,194,77,0.45)' : 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <span style={{ fontSize: isMobile ? 18 : 15, lineHeight: 1 }}>{n.icon}</span>
              {!isMobile && n.label}
            </button>
          )
        })}
      </nav>

      {/* Modal foto diperbesar (fancy) */}
      {photo && (
        <div
          onClick={closePhoto}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 40%, rgba(30,26,40,0.86), rgba(6,6,10,0.94))',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            cursor: 'zoom-out',
            padding: 24,
            boxSizing: 'border-box',
          }}
        >
          <style>{'@keyframes popIn{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}'}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              padding: 14,
              borderRadius: 18,
              background: 'linear-gradient(145deg, #20202a, #0f0f16)',
              border: '1px solid rgba(255,210,122,0.35)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03) inset',
              animation: 'popIn 0.25s cubic-bezier(0.2,0.8,0.2,1)',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'default',
            }}
          >
            <button
              onClick={closePhoto}
              aria-label="Tutup"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                transform: 'translate(40%, -40%)',
                width: 34,
                height: 34,
                minWidth: 0,
                padding: 0,
                boxSizing: 'border-box',
                borderRadius: '50%',
                border: '2px solid #15151c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #ffe1a3, #ffc24d)',
                color: '#1a1a1a',
                fontSize: 18,
                fontWeight: 700,
                boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
                zIndex: 2,
              }}
            >
              ×
            </button>
            <img
              src={photo}
              alt=""
              style={{
                maxWidth: '84vw',
                maxHeight: '74vh',
                borderRadius: 10,
                display: 'block',
                objectFit: 'contain',
                boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
              }}
            />
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                width: '100%',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                color: '#f0e6cf',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              🎓 {prettyName(photo)}
            </div>
          </div>
        </div>
      )}

      {/* Drawer daftar artikel series (kiri) */}
      {panel === 'series' && series !== null && TUTORIALS[series] && (
        <Drawer side="left" title={TUTORIALS[series].name} accent={TUTORIALS[series].color} onClose={closePanel}>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#9aa' }}>
            {TUTORIALS[series].articles.length} artikel · klik untuk baca di Medium
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TUTORIALS[series].articles.map((a, i) => (
              <li key={i}>
                <button
                  onClick={() => openLink(a.url)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#eee',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    lineHeight: 1.35,
                    borderLeft: `3px solid ${TUTORIALS[series!].color}`,
                  }}
                >
                  {a.title}
                </button>
              </li>
            ))}
          </ul>
        </Drawer>
      )}
    </>
  )
}

// ---- helper UI ----

// tombol langkah tour (primary = tombol Lanjut)
function tourBtn(disabled: boolean, primary = false): CSSProperties {
  return {
    border: primary ? 'none' : '1px solid rgba(255,255,255,0.25)',
    cursor: disabled ? 'default' : 'pointer',
    padding: '8px 16px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'system-ui, sans-serif',
    color: primary ? '#1a1a1a' : '#e8e8e8',
    background: primary ? 'linear-gradient(135deg, #c9b6ff, #7c5cff)' : 'transparent',
    opacity: disabled ? 0.4 : 1,
  }
}

// judul foto dari nama file: "/images/cert-react-redux.jpg" -> "React Redux"
function prettyName(src: string): string {
  const base = src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
  return base
    .replace(/^(cert|ijazah)[-_]?/i, '')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function pill(bg: string): CSSProperties {
  return {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 12,
    border: 'none',
    cursor: 'pointer',
    padding: '10px 18px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    background: bg,
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    fontFamily: 'system-ui, sans-serif',
  }
}

function Drawer({
  side,
  title,
  accent,
  onClose,
  children,
}: {
  side: 'left' | 'right'
  title: string
  accent: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        [side]: 0,
        height: '100%',
        width: 'min(400px, 88vw)',
        background: 'rgba(18,18,22,0.94)',
        backdropFilter: 'blur(10px)',
        boxShadow: `${side === 'right' ? '-' : ''}8px 0 30px rgba(0,0,0,0.45)`,
        zIndex: 16,
        padding: '20px 18px',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: accent }}>{title}</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#aaa', fontSize: 22, cursor: 'pointer' }}>
          ×
        </button>
      </div>
      {children}
    </div>
  )
}
