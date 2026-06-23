// src/components/PhotoFrame.tsx
// Bingkai foto reusable: pigura (box) + foto (plane bertekstur).
// - `image` opsional; tanpa image akan tampil panel kosong (placeholder).
// - `background` opsional; mis. "#ffffff" untuk latar putih di belakang foto
//   (berguna untuk foto PNG transparan / cutout).
// Menghadap +Z secara default.

import { useTexture } from '@react-three/drei'
import type { JSX } from 'react'

type PhotoFrameProps = JSX.IntrinsicElements['group'] & {
  image?: string
  width?: number
  height?: number
  frameColor?: string
  background?: string
}

// Sub-komponen agar useTexture hanya dipanggil saat ada image.
function FramedImage({ image, width, height, z }: { image: string; width: number; height: number; z: number }) {
  const tex = useTexture(image)
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={tex} transparent roughness={0.9} />
    </mesh>
  )
}

export function PhotoFrame({
  image,
  width = 0.5,
  height = 0.65,
  frameColor = '#2b2b2b',
  background,
  ...props
}: PhotoFrameProps) {
  const border = 0.04
  const depth = 0.03

  return (
    <group {...props}>
      {/* Pigura */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width + border * 2, height + border * 2, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Latar (opsional, mis. putih) */}
      {background && (
        <mesh position={[0, 0, depth / 2 + 0.0005]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color={background} />
        </mesh>
      )}

      {/* Foto, atau panel placeholder bila belum ada gambar */}
      {image ? (
        <FramedImage image={image} width={width} height={height} z={depth / 2 + 0.001} />
      ) : (
        <mesh position={[0, 0, depth / 2 + 0.001]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#e9e9e9" />
        </mesh>
      )}
    </group>
  )
}
