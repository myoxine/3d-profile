// src/components/ui/SceneMenu.tsx
// UI HTML di atas Canvas: menu shortcut kamera + modal foto.
// Membaca/menulis store fokus (zustand). Panel drawer proyek & buku
// SENGAJA dihilangkan dulu (akan dibahas di Part 9). Saat sedang fokus ke
// sebuah area (view != overview) tampil tombol Exit untuk balik ke awal.

import { useFocus, type ViewName } from '../../store/useFocus'

const NAV: { view: ViewName; label: string; icon: string }[] = [
  { view: 'overview', label: 'Beranda', icon: '🏠' },
  { view: 'photos', label: 'Pencapaian', icon: '🏆' },
  { view: 'desk', label: 'Portofolio', icon: '🚀' },
  { view: 'tv', label: 'My Video', icon: '🎬' },
  { view: 'books', label: 'Tutorial', icon: '📚' },
  { view: 'shelf', label: 'Terhubung', icon: '🤝' },
]

export function SceneMenu() {
  const view = useFocus((s) => s.view)
  const setView = useFocus((s) => s.setView)
  const photo = useFocus((s) => s.photo)
  const closePhoto = useFocus((s) => s.closePhoto)
  const reset = useFocus((s) => s.reset)

  const focused = view !== 'overview'

  return (
    <>
      {/* Tombol Exit: hanya saat sedang fokus ke sebuah area */}
      {focused && (
        <button
          onClick={() => reset()}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            zIndex: 12,
            border: 'none',
            cursor: 'pointer',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: '#1a1a1a',
            background: '#ffd27a',
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          ✕ Keluar
        </button>
      )}

      {/* Bar menu bawah-tengah */}
      <nav
        style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          padding: 6,
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
              onClick={() => setView(n.view)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                padding: '9px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.2,
                color: active ? '#1a1a1a' : '#e8e8e8',
                background: active
                  ? 'linear-gradient(135deg, #ffe1a3, #ffc24d)'
                  : 'transparent',
                boxShadow: active ? '0 3px 10px rgba(255,194,77,0.45)' : 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{n.icon}</span>
              {n.label}
            </button>
          )
        })}
      </nav>

      {/* Modal foto diperbesar */}
      {photo && (
        <div
          onClick={closePhoto}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={photo}
            alt=""
            style={{
              maxWidth: '88vw',
              maxHeight: '88vh',
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}
    </>
  )
}
