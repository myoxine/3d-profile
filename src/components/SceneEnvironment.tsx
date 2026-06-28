// src/components/SceneEnvironment.tsx
// Pencahayaan global (HDRI) + matahari (directional light) yang menyesuaikan
// preset siang/malam dari LightingContext.

import { Environment } from '@react-three/drei'
import { useLighting } from './lighting/LightingContext'

export function SceneEnvironment() {
  const { timeOfDay } = useLighting()
  const isDay = timeOfDay === 'day'

  return (
    <>
      <Environment
        files="/hdri/dikhololo_sunset_1k.hdr"
        background
        // siang: terang; malam: hampir gelap supaya lampu yang dominan
        environmentIntensity={isDay ? 0.3 : 0.02}
        backgroundIntensity={isDay ? 1 : 0.05}
      />

      <directionalLight
        color={isDay ? '#ffffff' : '#6677aa'}
        intensity={isDay ? 0.5 : 0.03}
        position={[3, 1, -2]}
        castShadow
        // Frustum shadow DIRAPATKAN ke ukuran ruangan (~±2.5) — sebelumnya ±5
        // (area 10×10m) membuang texel shadow map sehingga timbul "shadow acne"
        // (pola grid/titik di permukaan pintu & kredensa), apalagi pada 1024.
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={12}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        // geser sampling bayangan sepanjang normal -> hilangkan acne sisa
        shadow-normalBias={0.03}
        shadow-bias={-0.0001}
      />
    </>
  )
}
