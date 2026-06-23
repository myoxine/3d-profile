// src/components/TableLamp.tsx
// Table lamp (model GLB) yang diletakkan di atas credenza.
// Model di-recenter (alas ke y=0, terpusat di x/z) lalu diperkecil.
// Bulb glow + pointLight nyata dikontrol state `tableOn` dari LightingContext.

import * as THREE from 'three'
import type { JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { useLighting } from './lighting/LightingContext'

type GLTFResult = GLTF & {
  nodes: {
    Sphere001_1: THREE.Mesh
    Sphere001_2: THREE.Mesh
    Sphere001_3: THREE.Mesh
    Sphere001_4: THREE.Mesh
    Sphere001_5: THREE.Mesh
  }
  materials: {
    ['Material.005']: THREE.MeshStandardMaterial
    ['Material.004']: THREE.MeshStandardMaterial
    ['Material.001']: THREE.MeshStandardMaterial
    ['Material.002']: THREE.MeshStandardMaterial
    ['Material.003']: THREE.MeshStandardMaterial
  }
}

const MODEL = '/models/table_lamp.glb'
const S = 0.18 // skala akhir lampu

// Offset recenter: alas model (bbox min y) ke 0, dan pusat x/z ke 0.
// Dihitung dari bbox scene model: center=(0.447, _, 0.539), minY=-1.067.
const OFFSET: [number, number, number] = [-0.447 * S, 1.067 * S, -0.539 * S]

type TableLampProps = JSX.IntrinsicElements['group'] & {
  /** warna cahaya lampu */
  color?: string
}

export function TableLamp({ color = '#ffdca8', ...props }: TableLampProps) {
  const { nodes, materials } = useGLTF(MODEL) as unknown as GLTFResult
  const { tableOn } = useLighting()

  return (
    <group {...props} dispose={null}>
      {/* Model di-recenter + diperkecil */}
      <group position={OFFSET} scale={S}>
        <group position={[0.42, 1.514, 0.502]} scale={[0.186, 0.216, 0.227]}>
          <mesh geometry={nodes.Sphere001_1.geometry} material={materials['Material.005']} castShadow />
          <mesh geometry={nodes.Sphere001_2.geometry} material={materials['Material.004']} castShadow />
          <mesh geometry={nodes.Sphere001_3.geometry} material={materials['Material.001']} castShadow />
          <mesh geometry={nodes.Sphere001_4.geometry} material={materials['Material.002']} castShadow />
          <mesh geometry={nodes.Sphere001_5.geometry} material={materials['Material.003']} castShadow />
        </group>
      </group>

      {/* Bulb glow (emissive) di area atas lampu */}
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={tableOn ? 1.2 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* Cahaya nyata (hanya saat on) */}
      {tableOn && (
        <pointLight
          position={[0, 0.36, 0]}
          color={color}
          intensity={1.1}
          distance={5}
          decay={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
    </group>
  )
}

useGLTF.preload(MODEL)
