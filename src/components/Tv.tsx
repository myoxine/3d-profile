// src/components/Tv.tsx
// TV yang bisa diklik untuk memutar video YouTube, menempel di permukaan layar.
// YouTube tidak bisa jadi VideoTexture, jadi kita pasang <iframe> lewat
// drei <Html transform> tepat di muka layar TV.
//
// SCREEN_POS / SCREEN_ROT / SCREEN_W / SCREEN_H = koordinat LOKAL model TV
// (sebelum scale di Room). Sesuaikan setelah dilihat.

import { useState } from 'react'
import * as THREE from 'three'
import type { JSX } from 'react'
import { Html } from '@react-three/drei'
import { Model as TvModel } from './TVModel'

const VIDEO_ID = 'pRpeEdMmmQ0'

// Layar menghadap +X lokal (yang setelah rotasi di Room mengarah ke ruangan).
const SCREEN_POS: [number, number, number] = [0.0214, 0.395, 0]
const SCREEN_ROT: [number, number, number] = [0, Math.PI / 2, 0]
const SCREEN_W = 1.0 // lebar layar (unit lokal)
const SCREEN_H = 0.6 // tinggi layar (unit lokal)

// iframe dirender pada IFRAME_W x IFRAME_H px (aspek ~ SCREEN_W:SCREEN_H).
const IFRAME_W = 1280*2.6/5
const IFRAME_H = 720*2.6/5
// Skala <Html transform> -> dunia. Setel angka ini agar video memenuhi layar:
// terlalu KECIL -> naikkan (mis. 0.08); terlalu BESAR -> turunkan (mis. 0.04).
const HTML_SCALE = 0.065

export function Tv(props: JSX.IntrinsicElements['group']) {
  const [playing, setPlaying] = useState(false)

  return (
    <group
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        setPlaying((p) => !p)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <TvModel />

      {/* Layar gelap (terlihat saat video mati) */}
      <mesh position={SCREEN_POS} rotation={SCREEN_ROT}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive="#101418"
          emissiveIntensity={playing ? 0 : 0.5}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* iframe YouTube menempel di layar saat playing */}
      {playing && (
        <Html
          transform
          occlude="blending"
          position={[SCREEN_POS[0] + 0.01, SCREEN_POS[1], SCREEN_POS[2]]}
          rotation={SCREEN_ROT}
          scale={HTML_SCALE}
          zIndexRange={[10, 0]}
        >
          <iframe
            width={IFRAME_W}
            height={IFRAME_H}
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title="YouTube video"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block', border: 0 }}
          />
        </Html>
      )}
    </group>
  )
}
