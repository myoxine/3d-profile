// src/components/BookShelf.tsx
// Rak buku bentuk TILE (grid kotak 2x2). Tiap sel = satu series tutorial.
// Buku (model GLB) berdiri spine-out, judul menempel di spine (1-2 baris), tiap
// buku diklik membuka artikel. Tiap sel punya back-panel bertema + tag label;
// klik bingkai sel -> panel daftar artikel.

import * as THREE from 'three'
import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import { useGLTF, Text, RoundedBox, Html } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { useFocus } from '../store/useFocus'
import { TUTORIALS, type Article } from '../config/tutorials'
import { openLink } from '../config/links'

type BooksGLTF = GLTF & { nodes: { Book: THREE.Mesh; Sheets: THREE.Mesh } }

// --- dimensi grid ---
const COLS = 2
const ROWS = 2
const CELL_W = 0.66
const CELL_H = 0.34
const WALL = 0.018 // rak tipis
const DEPTH = 0.16
const TOTAL_W = COLS * CELL_W + (COLS + 1) * WALL
const TOTAL_H = ROWS * CELL_H + (ROWS + 1) * WALL
export const SHELF_TOP = TOTAL_H / 2 // dipakai Room untuk menaruh kaktus

// --- buku ---
const BOOK_S = 0.7
const BOOK_H = 0.3 * BOOK_S
const BOOK_DEPTH = 0.205 * BOOK_S
const BOOK_CTR = 0.0325 * BOOK_S // koreksi origin model yang tidak center (sumbu X)
const MIN_T = 0.018
const FONT_SIZE = 0.0085 // ukuran judul SERAGAM

function cellCenter(j: number, k: number): [number, number] {
  return [
    -TOTAL_W / 2 + WALL + CELL_W / 2 + j * (CELL_W + WALL),
    -TOTAL_H / 2 + WALL + CELL_H / 2 + k * (CELL_H + WALL),
  ]
}

// sel (kolom j, baris k; k=0 bawah) -> index series
const CELL_SERIES: { j: number; k: number; series: number }[] = [
  { j: 0, k: 1, series: 0 }, // kiri-atas  : Expo Router
  { j: 1, k: 1, series: 1 }, // kanan-atas : Fastify
  { j: 0, k: 0, series: 2 }, // kiri-bawah : ExpressJS
  { j: 1, k: 0, series: 3 }, // kanan-bawah: 3D Profile
]

function Book({ color, ...props }: { color: THREE.ColorRepresentation } & JSX.IntrinsicElements['group']) {
  const { nodes } = useGLTF('/models/books.glb') as unknown as BooksGLTF
  return (
    <group {...props}>
      <mesh geometry={nodes.Book.geometry} castShadow>
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh geometry={nodes.Sheets.geometry}>
        <meshStandardMaterial color="#efe6d2" roughness={0.95} />
      </mesh>
    </group>
  )
}

// Tag nama series gaya LABEL TEPI RAK ("shelf talker"): pelat miring menempel di
// sisi depan papan bawah sel, menghadap ke atas-depan.
function SeriesTag({ name, color }: { name: string; color: string }) {
  return (
    <group position={[0, -CELL_H / 2 - WALL / 2, DEPTH + 0.006]} rotation={[-0.6, 0, 0]}>
      <RoundedBox args={[CELL_W * 0.96, 0.07, 0.014]} radius={0.008} smoothness={3} castShadow>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </RoundedBox>
      <Text position={[0, 0, 0.009]} fontSize={0.034} maxWidth={CELL_W * 0.9} anchorX="center" anchorY="middle" textAlign="center">
        {name}
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </Text>
    </group>
  )
}

// Deret buku berdiri di dalam satu sel, judul di spine, tiap buku diklik.
function CellBooks({ articles, color }: { articles: Article[]; color: string }) {
  const n = articles.length
  const t = Math.max(Math.min(0.05 * BOOK_S, (CELL_W - 0.05) / n), MIN_T)
  const sy = t / 0.05
  const halfH = 0.15 * BOOK_S
  const bottomY = -CELL_H / 2 + 0.002 // buku duduk di papan bawah sel
  const bookZ = DEPTH / 2 + BOOK_CTR // buku terpusat di kedalaman sel
  const zSpine = DEPTH / 2 + BOOK_DEPTH / 2 + 0.001 // teks menempel di permukaan spine
  const base = useMemo(() => new THREE.Color(color), [color])
  const [hover, setHover] = useState<number | null>(null)
  // hover/tooltip hanya aktif saat fokus ke rak ("Tutorial Series")
  const active = useFocus((s) => s.view === 'books')

  return (
    <group>
      {articles.map((a, i) => {
        const x = (i - (n - 1) / 2) * t
        const c = base.clone().multiplyScalar(0.7 + (i % 4) * 0.13)
        const open = (e: { stopPropagation: () => void }) => {
          e.stopPropagation()
          openLink(a.url)
        }
        const over = (e: { stopPropagation: () => void }) => {
          if (!active) return
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHover(i)
        }
        const out = () => {
          document.body.style.cursor = 'auto'
          setHover(null)
        }
        return (
          <group key={i} onClick={open} onPointerOver={over} onPointerOut={out}>
            <group position={[x, bottomY + halfH, bookZ]} rotation={[0, Math.PI / 2, 0]}>
              <Book color={c} rotation={[-Math.PI / 2, 0, 0]} scale={[BOOK_S, sy, BOOK_S]} />
            </group>
            <Text
              position={[x, bottomY + halfH, zSpine]}
              rotation={[0, 0, Math.PI / 2]}
              fontSize={FONT_SIZE}
              maxWidth={BOOK_H * 0.92}
              lineHeight={1}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              onClick={open}
            >
              {a.title}
              {/* material BER-CAHAYA (bukan unlit default troika) supaya teks
                  ikut gelap saat lampu dimatikan, tidak "menyala" di dark mode */}
              <meshStandardMaterial color="#f5f5f5" roughness={1} metalness={0} />
            </Text>
            {active && hover === i && (
              <Html
                position={[x, bottomY + halfH * 1.92, zSpine]}
                center
                style={{ pointerEvents: 'none' }}
                zIndexRange={[18, 0]}
              >
                <div
                  style={{
                    width: 180,
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'rgba(20,20,26,0.96)',
                    color: '#fff',
                    fontFamily: 'system-ui, sans-serif',
                    boxShadow: '0 8px 22px rgba(0,0,0,0.55)',
                    border: `1px solid ${color}`,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.35 }}>{a.title}</div>
                  <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 600, color, letterSpacing: 0.2 }}>
                    Baca di Medium →
                  </div>
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

export function BookShelf(props: JSX.IntrinsicElements['group']) {
  const openSeries = useFocus((s) => s.openSeries)
  const frameMat = <meshStandardMaterial color="#6b4a2f" roughness={0.7} metalness={0} />

  return (
    <group {...props}>
      {/* papan horizontal (ROWS+1) — sudut membulat */}
      {Array.from({ length: ROWS + 1 }, (_, k) => (
        <RoundedBox
          key={`h${k}`}
          args={[TOTAL_W, WALL, DEPTH]}
          radius={WALL * 0.45}
          smoothness={3}
          position={[0, -TOTAL_H / 2 + WALL / 2 + k * (CELL_H + WALL), DEPTH / 2]}
          castShadow
          receiveShadow
        >
          {frameMat}
        </RoundedBox>
      ))}
      {/* pemisah vertikal (COLS+1) */}
      {Array.from({ length: COLS + 1 }, (_, j) => (
        <RoundedBox
          key={`v${j}`}
          args={[WALL, TOTAL_H, DEPTH]}
          radius={WALL * 0.45}
          smoothness={3}
          position={[-TOTAL_W / 2 + WALL / 2 + j * (CELL_W + WALL), 0, DEPTH / 2]}
          castShadow
          receiveShadow
        >
          {frameMat}
        </RoundedBox>
      ))}

      {/* isi tiap sel: back-panel bertema + tag + buku */}
      {CELL_SERIES.map(({ j, k, series }) => {
        const [cx, cy] = cellCenter(j, k)
        const s = TUTORIALS[series]
        const backColor = new THREE.Color(s.color).multiplyScalar(0.28)
        return (
          <group
            key={series}
            position={[cx, cy, 0]}
            onClick={(e) => {
              e.stopPropagation()
              openSeries(series)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto'
            }}
          >
            <mesh position={[0, 0, 0.01]} receiveShadow>
              <boxGeometry args={[CELL_W, CELL_H, 0.012]} />
              <meshStandardMaterial color={backColor} roughness={0.85} />
            </mesh>
            <SeriesTag name={s.name} color={s.color} />
            <CellBooks articles={s.articles} color={s.color} />
          </group>
        )
      })}
    </group>
  )
}

useGLTF.preload('/models/books.glb')
