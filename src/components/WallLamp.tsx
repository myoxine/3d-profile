// src/components/WallLamp.tsx
// Lampu kecil (GLB) di belakang sofa. Lampshade (Sphere) dibuat emissive + ada
// pointLight nyata. Dikontrol state `sofaOn` dari LightingContext.

import * as THREE from 'three'
import type { JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { useLighting } from './lighting/LightingContext'

type GLTFResult = GLTF & {
  nodes: {
    Circle016: THREE.Mesh
    Circle017: THREE.Mesh
    Sphere002: THREE.Mesh
  }
  materials: {
    ['Lamp golden']: THREE.MeshStandardMaterial
    Lampshade: THREE.MeshStandardMaterial
  }
}

type WallLampProps = JSX.IntrinsicElements['group'] & {
  color?: string
}

export function WallLamp({ color = '#ffd9a0', ...props }: WallLampProps) {
  const { nodes, materials } = useGLTF('/models/wall_lamp.glb') as unknown as GLTFResult
  const { sofaOn } = useLighting()

  return (
    <group {...props} dispose={null}>
      <group scale={0.029}>
        <mesh geometry={nodes.Circle016.geometry} material={materials['Lamp golden']} position={[0, 2.97, -0.128]} rotation={[Math.PI / 2, 0, 0]} scale={2.608} castShadow />
        <mesh geometry={nodes.Circle017.geometry} material={materials['Lamp golden']} position={[0, 2.195, 1.928]} rotation={[Math.PI / 2, 0, 0]} scale={[7.684, 7.684, 6.215]} castShadow />
        {/* Lampshade: emissive saat nyala */}
        <mesh geometry={nodes.Sphere002.geometry} position={[-0.001, 8.421, 1.929]} scale={2.655}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={sofaOn ? 0.7 : 0}
            roughness={0.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Cahaya nyata di kepala lampu (hanya saat on) */}
      {sofaOn && (
        <pointLight color={color} intensity={1} distance={3} decay={1} position={[0, 0.24, 0.05]} castShadow />
      )}
    </group>
  )
}

useGLTF.preload('/models/wall_lamp.glb')
