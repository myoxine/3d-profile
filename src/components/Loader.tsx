// src/components/Loader.tsx
// Layar loading: kartu elegan dengan judul, progress bar animatif, dan persen.
// Dirender sebagai fallback <Suspense> (Html, di tengah layar).

import { Html, useProgress } from '@react-three/drei'

export function Loader() {
  const { progress, active } = useProgress()
  const pct = Math.min(100, Math.round(progress))

  return (
    <Html center>
      <div
        style={{
          width: 320,
          maxWidth: '80vw',
          padding: '26px 28px',
          borderRadius: 18,
          background: 'linear-gradient(150deg, #1b2031, #0c0e16)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {/* keyframes lokal untuk shimmer & pulse */}
        <style>
          {`@keyframes hl-pulse{0%,100%{opacity:.55}50%{opacity:1}}
            @keyframes hl-shimmer{0%{background-position:-160px 0}100%{background-position:320px 0}}`}
        </style>

        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 0.4,
            background: 'linear-gradient(135deg, #ffe1a3, #ffc24d)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Hadi Halim
        </div>
        <div style={{ fontSize: 11.5, letterSpacing: 2, color: '#8b93a7', marginTop: 3, textTransform: 'uppercase' }}>
          3D Portfolio
        </div>

        {/* track + bar progress */}
        <div
          style={{
            marginTop: 20,
            height: 7,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #ffd27a, #ffb347)',
              boxShadow: '0 0 12px rgba(255,194,77,0.6)',
              transition: 'width 0.25s ease-out',
            }}
          />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#aab2c5' }}>
          <span style={{ animation: 'hl-pulse 1.4s ease-in-out infinite' }}>
            {active ? 'Memuat ruangan…' : 'Hampir siap…'}
          </span>
          <span style={{ fontWeight: 700, color: '#ffd27a' }}>{pct}%</span>
        </div>
      </div>
    </Html>
  )
}
