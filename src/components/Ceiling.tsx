// src/components/Ceiling.tsx
// Plafon modern dengan LED strip (garis menyala berbentuk persegi).
// LED + cahaya nyata menyala mengikuti state `ceilingOn` dari LightingContext.

import type { JSX } from 'react'
import { useLighting } from './lighting/LightingContext'

type CeilingProps = JSX.IntrinsicElements['group'] & {
  size?: [number, number]
  /** warna LED */
  color?: string
}

export function Ceiling({ size = [3, 3], color = '#dCEBFF', ...props }: CeilingProps) {
  const { ceilingOn } = useLighting()

  const [w, h] = size
  const margin = 0.4 // jarak LED dari tepi plafon
  const halfX = w / 2 - margin
  const halfY = h / 2 - margin
  const stripW = 0.05 // lebar strip LED
  const stripThk = 0.02 // ketebalan strip (menonjol ke bawah)
  const z = 0.011 // sedikit di bawah permukaan plafon (ke arah ruangan)

  const ledIntensity = ceilingOn ? 2 : 0

  // material LED dipakai 4 strip
  const led = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={ledIntensity}
      toneMapped={false}
    />
  )

  return (
    <group {...props}>
      {/* Panel plafon utama */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* LED strip — persegi (cove) */}
      {/* atas & bawah (memanjang sumbu X) */}
      <mesh position={[0, halfY, z]}>
        <boxGeometry args={[halfX * 2 + stripW, stripW, stripThk]} />
        {led}
      </mesh>
      <mesh position={[0, -halfY, z]}>
        <boxGeometry args={[halfX * 2 + stripW, stripW, stripThk]} />
        {led}
      </mesh>
      {/* kiri & kanan (memanjang sumbu Y) */}
      <mesh position={[halfX, 0, z]}>
        <boxGeometry args={[stripW, halfY * 2 - stripW, stripThk]} />
        {led}
      </mesh>
      <mesh position={[-halfX, 0, z]}>
        <boxGeometry args={[stripW, halfY * 2 - stripW, stripThk]} />
        {led}
      </mesh>

      {/* Cahaya nyata dari plafon (hanya saat on).
          z lokal positif = ke bawah (ke arah ruangan) setelah plafon dirotasi. */}
      {ceilingOn && (
        <pointLight
          position={[0, 0, 0.25]}
          color={color}
          intensity={5}
          distance={9}
          decay={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
    </group>
  )
}
