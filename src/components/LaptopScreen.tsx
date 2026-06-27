// src/components/LaptopScreen.tsx
// Layar laptop = gambar (screenshot VS Code) sebagai TEKSTUR pada sebuah plane.
// Simpan gambar di: public/images/laptop-screen.png
// Plane ini bagian dari 3D, jadi posisi/rotasi/skala stabil. Transform dari Room.

import * as THREE from 'three'
import type { JSX } from 'react'
import { useTexture } from '@react-three/drei'

// ukuran layar di dunia (meter) — hasil kalibrasi
const SCREEN_W = 0.405
const SCREEN_H = 0.255

export function LaptopScreen(props: JSX.IntrinsicElements['group']) {
  const tex = useTexture('/images/laptop-screen.png')
  tex.colorSpace = THREE.SRGBColorSpace

  return (
    <group {...props}>
      {/* offset kecil ke arah normal (lokal +Z) agar di depan permukaan lid */}
      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        {/* meshBasic = unlit, layar tampak terang seperti menyala */}
        <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

useTexture.preload('/images/laptop-screen.png')
