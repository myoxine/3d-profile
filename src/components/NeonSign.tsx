// src/components/NeonSign.tsx
// Neon sign "Hadi Halim" di atas komputer, dua baris bertingkat.
// Tampilan neon: garis huruf tipis yang bercahaya (bloom halus), bukan sorot
// lampu yang membanjiri tembok. Huruf putih, halo kuning hangat.
// Dikontrol state `standingOn` (saklar yang dulu untuk standing lamp).

import { Text3D, Center } from '@react-three/drei'
import type { JSX } from 'react'
import { useLighting } from './lighting/LightingContext'

const FONT = '/fonts/helvetiker_regular.typeface.json'

const FACE = '#ffffff'
const GLOW = '#ffcf6b'

type LineProps = {
  text: string
  lit: boolean
  position: [number, number, number]
}

function Line({ text, lit, position }: LineProps) {
  return (
    <Center position={position}>
      <Text3D
        font={FONT}
        size={0.16}
        height={0.025}
        bevelEnabled
        bevelSize={0.002}
        bevelThickness={0.004}
        bevelSegments={2}
        letterSpacing={0.004}
      >
        {text}
        <meshStandardMaterial
          color={FACE}
          emissive={GLOW}
          emissiveIntensity={lit ? 1.25 : 0.1}
          roughness={0.35}
          toneMapped={false}
        />
      </Text3D>
    </Center>
  )
}

type NeonSignProps = JSX.IntrinsicElements['group']

export function NeonSign(props: NeonSignProps) {
  const { standingOn: lit } = useLighting()

  return (
    <group {...props}>
      {/* Dua baris bertingkat. Glow neon murni dari huruf emissive (+Bloom),
          tanpa pointLight supaya tidak ada hotspot seperti bohlam di tembok. */}
      <Line text="Hadi" lit={lit} position={[-0.15, 0.12, 0]} />
      <Line text="Halim" lit={lit} position={[0.15, -0.12, 0]} />
    </group>
  )
}
