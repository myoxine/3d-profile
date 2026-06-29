// src/components/MonitorScreen.tsx
// "Desktop" interaktif di layar monitor: ikon-ikon proyek; klik -> jendela
// penjelasan proyek. Dirender sebagai DOM lewat <Html transform> menempel di
// muka layar monitor (clickable). Transform disetel dari Room.

import { useState, Suspense, Component } from 'react'
import * as THREE from 'three'
import type { ReactNode } from 'react'
import { Html, useTexture } from '@react-three/drei'
import { PROJECTS, type Project } from '../config/projects'
import { EXPERIENCE } from '../config/experience'
import { useFocus } from '../store/useFocus'

// kanvas DOM (px) lalu diskala ke dunia
const W = 900
const H = 520
// <Html transform> mengubah px->dunia dengan faktor internal ~1/41; plane
// (backing & idle) harus pakai faktor sama agar ukurannya cocok dengan DOM.
const CSS3D = 1 / 41

// transform TERPISAH (hasil kalibrasi) — mock image & desktop HTML tidak konflik
const IMG = { px: 1.001, py: -0.955, pz: -1.204, rx: 0, ry: -0.4712, rz: 0, s: 0.0219 }
const HTML = { px: 0.999, py: -0.957, pz: -1.205, rx: 0, ry: -0.4712, rz: 0, s: 0.0214 }

// gambar statis layar (screenshot desktop) saat tidak fokus
function IdleScreen({ pw, ph }: { pw: number; ph: number }) {
  const tex = useTexture('/images/monitor-screen.png')
  tex.colorSpace = THREE.SRGBColorSpace
  return (
    <mesh position={[0, 0, 0.005]}>
      <planeGeometry args={[pw, ph]} />
      <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// tangkap error bila /images/monitor-screen.png belum ada -> pakai DarkScreen
class ImgBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function MonitorScreen() {
  const [open, setOpen] = useState<Project | null>(null)
  const [resume, setResume] = useState(false)
  // desktop interaktif hanya saat fokus Experience; selain itu tampil mock image.
  const active = useFocus((s) => s.view === 'desk')

  return (
    <>
      {/* === MOCK IMAGE (saat TIDAK fokus) === */}
      {!active && (
        <group position={[IMG.px, IMG.py, IMG.pz]} rotation={[IMG.rx, IMG.ry, IMG.rz]}>
          <mesh position={[0, 0, 0.003]}>
            <planeGeometry args={[W * IMG.s * CSS3D, H * IMG.s * CSS3D]} />
            <meshBasicMaterial color="#0b1020" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <ImgBoundary fallback={null}>
            <Suspense fallback={null}>
              <IdleScreen pw={W * IMG.s * CSS3D} ph={H * IMG.s * CSS3D} />
            </Suspense>
          </ImgBoundary>
        </group>
      )}

      {/* === DESKTOP HTML (saat fokus Experience) === */}
      {active && (
        <group position={[HTML.px, HTML.py, HTML.pz]} rotation={[HTML.rx, HTML.ry, HTML.rz]}>
          <mesh position={[0, 0, 0.003]}>
            <planeGeometry args={[W * HTML.s * CSS3D, H * HTML.s * CSS3D]} />
            <meshBasicMaterial color="#0b1020" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <Html transform occlude="blending" scale={HTML.s} position={[0, 0, 0.006]} zIndexRange={[10, 0]}>
        <div
          style={{
            width: W,
            height: H,
            overflow: 'hidden',
            borderRadius: 6,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: 'radial-gradient(circle at 30% 20%, #21314f, #0b1020 70%)',
            fontFamily: 'system-ui, sans-serif',
            userSelect: 'none',
          }}
        >
          {/* top bar ala OS */}
          <div
            style={{
              height: 30,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: 10,
              fontSize: 13,
              color: '#dfe6f5',
              background: 'rgba(0,0,0,0.28)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ fontWeight: 700 }}>🖥️ Hadi OS</span>
            <span style={{ opacity: 0.7 }}>Portfolio</span>
            <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{PROJECTS.length} proyek</span>
          </div>

          {/* grid ikon desktop */}
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              padding: '14px 24px',
              alignContent: 'space-evenly',
            }}
          >
            {/* App Resume / Karier */}
            <button
              onClick={() => setResume(true)}
              title="Resume / Karier"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '10px 4px',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                background: 'transparent',
                color: '#eef3ff',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 38,
                  background: 'linear-gradient(145deg, #ffd27a, #e0a526)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
                }}
              >
                💼
              </span>
              <span style={{ fontSize: 11, textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>
                Resume
              </span>
            </button>

            {PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpen(p)}
                title={p.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#eef3ff',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 38,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
                  }}
                >
                  {p.icon}
                </span>
                <span style={{ fontSize: 11, textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          {/* taskbar */}
          <div
            style={{
              flex: 'none',
              height: 32,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              fontSize: 12,
              color: '#cdd6ea',
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            <span>👋 Klik ikon untuk lihat detail proyek</span>
          </div>

          {/* jendela detail proyek */}
          {open && (
            <div
              style={{
                position: 'absolute',
                top: 52,
                left: 60,
                right: 60,
                bottom: 50,
                background: '#161b27',
                borderRadius: 10,
                boxShadow: '0 18px 50px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* title bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 34,
                  padding: '0 12px',
                  background: '#222a3a',
                }}
              >
                <span onClick={() => setOpen(null)} style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', cursor: 'pointer' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                <span style={{ marginLeft: 8, color: '#e7ecf7', fontSize: 13, fontWeight: 600 }}>
                  {open.icon} {open.name}
                </span>
                <button
                  onClick={() => setOpen(null)}
                  style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#9aa3b8', fontSize: 18, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              {/* body */}
              <div style={{ padding: 18, overflowY: 'auto', color: '#dfe5f2' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8ab4ff', background: 'rgba(138,180,255,0.12)', padding: '3px 9px', borderRadius: 999 }}>
                    {open.category}
                  </span>
                  <span style={{ fontSize: 12, color: '#c7a3ff', background: 'rgba(199,163,255,0.12)', padding: '3px 9px', borderRadius: 999 }}>
                    {open.role}
                  </span>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.55, color: '#cdd5e6' }}>{open.desc}</p>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#8893a8', marginBottom: 6 }}>HIGHLIGHTS</div>
                <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
                  {open.highlights.map((h, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{h}</li>
                  ))}
                </ul>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#8893a8', marginBottom: 6 }}>TECH STACK</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {open.tech.map((t) => (
                    <span key={t} style={{ fontSize: 12, color: '#bfe3c8', background: 'rgba(80,200,120,0.12)', border: '1px solid rgba(80,200,120,0.3)', padding: '3px 9px', borderRadius: 6 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* jendela Resume / Karier (timeline pengalaman kerja) */}
          {resume && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                left: 50,
                right: 50,
                bottom: 46,
                background: '#161b27',
                borderRadius: 10,
                boxShadow: '0 18px 50px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px', background: '#222a3a' }}>
                <span onClick={() => setResume(false)} style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', cursor: 'pointer' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                <span style={{ marginLeft: 8, color: '#e7ecf7', fontSize: 13, fontWeight: 600 }}>💼 Resume — Riwayat Karier</span>
                <button
                  onClick={() => setResume(false)}
                  style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#9aa3b8', fontSize: 18, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '16px 20px', overflowY: 'auto', color: '#dfe5f2' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Hadi Sianggono Halim · IT Manager / Senior Developer</div>
                <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative', borderLeft: '2px solid rgba(255,210,122,0.4)' }}>
                  {EXPERIENCE.map((e, i) => (
                    <li key={i} style={{ position: 'relative', paddingLeft: 18, marginBottom: 18 }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: -7,
                          top: 4,
                          width: 11,
                          height: 11,
                          borderRadius: '50%',
                          background: '#ffd27a',
                          boxShadow: '0 0 0 3px rgba(255,210,122,0.2)',
                        }}
                      />
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{e.role}</div>
                      <div style={{ fontSize: 12.5, color: '#8ab4ff' }}>
                        {e.company} · {e.period}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#c1c9da', margin: '4px 0 6px', lineHeight: 1.45 }}>{e.desc}</div>
                      {e.highlights && (
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.5, color: '#aeb7c9' }}>
                          {e.highlights.map((h, j) => (
                            <li key={j}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
          </Html>
        </group>
      )}
    </>
  )
}
