// src/components/LightSwitch.tsx
// Saklar single dari model GLB (public/models/switches.glb).
// Plat GLB (nodes['1'] / Plane.007) dipakai sebagai FRAME statis, lalu sebuah
// tombol rocker (box) ditaruh di tengahnya. Saat diklik HANYA tombol yang
// flip (frame diam). Tiga salinan ditaruh di samping pintu untuk
// ceiling / standing / table.

import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'
import type { JSX } from 'react'
import { useLighting } from './lighting/LightingContext'

type GLTFResult = GLTF & {
  nodes: {
    ['1']: THREE.Mesh // plat single switch (Plane.007), dipakai sebagai frame
  }
  materials: {
    BaseMaterial: THREE.MeshStandardMaterial
  }
}

const MODEL = '/models/switches.glb'

// Geometri plat: bidang X-Z (0.086 x 0.086), tebal di sumbu Y (~0.005).
const PLATE_HALF_THICKNESS = 0.0025
const PLATE_NATIVE = 0.086 // ukuran asli plat di model
const SWITCH_SIZE = 0.1 // ukuran target plat (0.10 x 0.10)
const SIZE_SCALE = SWITCH_SIZE / PLATE_NATIVE
// Sudut miring rocker (radian) untuk posisi on vs off.
const FLIP = 0.22

type SingleSwitchProps = JSX.IntrinsicElements['group'] & {
  on: boolean
  label: string
  onToggle: () => void
}

function SingleSwitch({ on, label, onToggle, ...props }: SingleSwitchProps) {
  const { nodes, materials } = useGLTF(MODEL) as unknown as GLTFResult
  const pivot = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Animasikan flip tombol ke posisi on/off secara halus.
  useFrame(() => {
    if (!pivot.current) return
    const target = on ? FLIP : -FLIP
    pivot.current.rotation.x = THREE.MathUtils.lerp(
      pivot.current.rotation.x,
      target,
      0.25
    )
  })

  const toggle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onToggle()
  }

  return (
    <group {...props}>
      {/* tooltip nama lampu + status saat hover */}
      {hovered && (
        <Html position={[0, 0.085, 0.02]} center style={{ pointerEvents: 'none' }} zIndexRange={[18, 0]}>
          <div
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              background: 'rgba(18,18,22,0.94)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              border: `1px solid ${on ? '#ffd27a' : 'rgba(255,255,255,0.25)'}`,
            }}
          >
            💡 {label}
            <span style={{ marginLeft: 6, color: on ? '#ffd27a' : '#8a8a96', fontWeight: 700 }}>
              {on ? 'NYALA' : 'MATI'}
            </span>
          </div>
        </Html>
      )}
      {/* Skala supaya plat jadi 0.10 x 0.10 */}
      <group scale={SIZE_SCALE}>
        {/* Berdirikan plat: normalnya (+Y lokal) menghadap -Z (ke dalam ruangan) */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* FRAME statis: plat GLB, dipusatkan di titik asal */}
        <mesh
          geometry={nodes['1'].geometry}
          material={materials.BaseMaterial}
          position={[0, -PLATE_HALF_THICKNESS, 0]}
          castShadow
          receiveShadow
        />

        {/* TOMBOL rocker: hanya bagian ini yang flip */}
        <group ref={pivot} position={[0, 0.008, 0]}>
          <mesh
            castShadow
            scale={hovered ? 1.04 : 1}
            onClick={toggle}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <boxGeometry args={[0.058, 0.014, 0.058]} />
            <meshStandardMaterial
              color="#f3f3f3"
              roughness={0.5}
              metalness={0.05}
              emissive="#0a1f7a"
              emissiveIntensity={on ? 0.9 : 0}
            />
          </mesh>
        </group>
        </group>
      </group>
    </group>
  )
}

// Empat single switch tersusun horizontal: ceiling, neon(standing), table, sofa-lamp.
export function LightSwitch(props: JSX.IntrinsicElements['group']) {
  const {
    ceilingOn,
    standingOn,
    tableOn,
    sofaOn,
    toggleCeiling,
    toggleStanding,
    toggleTable,
    toggleSofa,
  } = useLighting()

  // jarak antar pusat saklar = ukuran plat (0.10) + sedikit celah, agar berdekatan
  const spacing = SWITCH_SIZE + 0.01
  // 4 saklar dipusatkan: posisi -1.5,-0.5,0.5,1.5 x spacing
  return (
    <group {...props}>
      <SingleSwitch on={ceilingOn} label="Lampu Plafon" onToggle={toggleCeiling} position={[-1.5 * spacing, 0, 0]} />
      <SingleSwitch on={standingOn} label="Neon Sign" onToggle={toggleStanding} position={[-0.5 * spacing, 0, 0]} />
      <SingleSwitch on={tableOn} label="Lampu Meja" onToggle={toggleTable} position={[0.5 * spacing, 0, 0]} />
      <SingleSwitch on={sofaOn} label="Lampu Sofa" onToggle={toggleSofa} position={[1.5 * spacing, 0, 0]} />
    </group>
  )
}

useGLTF.preload(MODEL)
