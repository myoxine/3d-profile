// src/components/StandingLamp.tsx
// Lampu baca berdiri (model GLB) dengan bulb menyala + pointLight nyata,
// dikontrol state `standingOn` dari LightingContext.

import * as THREE from 'three'
import type { JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { useLighting } from './lighting/LightingContext'

type GLTFResult = GLTF & {
  nodes: {
    Lamp_stand: THREE.Mesh
    Lamphead: THREE.Mesh
    Lightbulb: THREE.Mesh
  }
  materials: {
    ['Lamp stand']: THREE.MeshStandardMaterial
    Lamphead: THREE.MeshPhysicalMaterial
    Lightbulb: THREE.MeshStandardMaterial
  }
}

type StandingLampProps = JSX.IntrinsicElements['group'] & {
  /** warna cahaya lampu */
  color?: string
}

export function StandingLamp({ color = '#ffdca8', ...props }: StandingLampProps) {
  const { nodes, materials } = useGLTF('/models/lamp.glb') as unknown as GLTFResult
  const { standingOn } = useLighting()

  return (
    <group {...props} dispose={null}>
      <group position={[0, 1.746, 0]} scale={0.12}>
        <mesh
          geometry={nodes.Lamp_stand.geometry}
          material={materials['Lamp stand']}
          position={[0, -14.549, 0]}
          scale={0.803}
          castShadow
        />
        <mesh
          geometry={nodes.Lamphead.geometry}
          material={materials.Lamphead}
          position={[0, -3.736, 0]}
          scale={1.607}
          castShadow
        />
        {/* Bulb: material diganti agar bisa menyala (emissive) */}
        <mesh
          geometry={nodes.Lightbulb.geometry}
          position={[0, -3.036, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={6.789}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={standingOn ? 1.2 : 0}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Cahaya nyata di sekitar kepala lampu (hanya saat on) */}
      {standingOn && (
        <pointLight
          position={[0, 1.35, 0]}
          color={color}
          intensity={1.6}
          distance={7}
          decay={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
    </group>
  )
}

useGLTF.preload('/models/lamp.glb')
