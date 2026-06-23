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
        files="/hdri/dikhololo_sunset_4k.hdr"
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
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
    </>
  )
}
