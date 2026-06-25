// src/components/Cactus.tsx
// Kaktus dalam pot (model FBX->GLB, 5 bagian, tanpa tekstur). Tiap bagian
// diwarnai berdasarkan nama mesh: badan kaktus hijau, duri pucat, pot terakota,
// tanah cokelat gelap, piring keramik. index 1/2/3 = 3 varian model.

import * as THREE from 'three'
import { useMemo } from 'react'
import type { JSX } from 'react'
import { useGLTF } from '@react-three/drei'

function colorFor(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('pot')) return '#bd5d36' // pot terakota
  if (n.includes('ground')) return '#3a2a1c' // tanah
  if (n.includes('plate')) return '#d9cdb6' // piring keramik
  if (n.includes('spike')) return '#e2f0c6' // duri pucat
  return '#3a8a4a' // badan kaktus (hijau)
}

type CactusProps = JSX.IntrinsicElements['group'] & { index: 1 | 2 | 3 }

export function Cactus({ index, ...props }: CactusProps) {
  const { scene } = useGLTF(`/models/cactus${index}.glb`)
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (!(m as THREE.Mesh).isMesh) return
      m.material = new THREE.MeshStandardMaterial({ color: colorFor(m.name), roughness: 0.8 })
      m.castShadow = true
    })
    return c
  }, [scene])
  return <primitive object={cloned} {...props} />
}

useGLTF.preload('/models/cactus1.glb')
useGLTF.preload('/models/cactus2.glb')
useGLTF.preload('/models/cactus3.glb')
