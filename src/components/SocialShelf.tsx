// src/components/SocialShelf.tsx
// Floating shelf + 4 KUBUS dekoratif. Tiap kubus punya logo TIMBUL (extruded
// dari path SVG brand) di keenam sisinya, berputar pelan, dan bisa diklik untuk
// membuka tautan.

import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { SVGLoader } from 'three-stdlib'
import { LINKS, openLink } from '../config/links'
import { useFocus } from '../store/useFocus'

// Path single-path brand (viewBox 24x24).
const PATHS: Record<string, string> = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  medium:
    'M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  email:
    'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  whatsapp:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
}

// Bangun geometri logo TIMBUL dari path SVG: parse -> shapes -> extrude,
// lalu dibalik sumbu Y (SVG Y-turun) + dipusatkan + diskala ke ukuran target.
function useLogoGeometry(path: string, target = 0.09, depth = 0.012) {
  return useMemo(() => {
    const data = new SVGLoader().parse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`
    )
    const shapes: THREE.Shape[] = []
    data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => shapes.push(s)))

    const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false })
    geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const sx = bb.max.x - bb.min.x
    const sy = bb.max.y - bb.min.y
    const scale = target / Math.max(sx, sy)
    geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0)
    geo.scale(scale, -scale, 1) // -y: betulkan orientasi (SVG Y-turun)
    return geo
  }, [path, target, depth])
}

type CubeProps = {
  name: string
  label: string
  url: string
  bg: string
  size: number
  spin: number
  position: [number, number, number]
}

function LogoCube({ name, label, url, bg, size, spin, position }: CubeProps) {
  const ref = useRef<THREE.Group>(null)
  const logo = useLogoGeometry(PATHS[name], size * 0.62)
  const h = size / 2
  const [hovered, setHovered] = useState(false)
  // hover/tooltip hanya aktif saat kamera fokus ke area sosial ("Contact Me")
  const active = useFocus((s) => s.view === 'shelf')

  // sisi yang diberi logo (TANPA sisi atas +Y). +Z lokal logo mengarah keluar.
  const faces: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [0, 0, h], rot: [0, 0, 0] },
    { pos: [0, 0, -h], rot: [0, Math.PI, 0] },
    { pos: [h, 0, 0], rot: [0, Math.PI / 2, 0] },
    { pos: [-h, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [0, -h, 0], rot: [Math.PI / 2, 0, 0] },
  ]

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += spin * dt
  })

  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        openLink(url)
      }}
      onPointerOver={(e) => {
        if (!active) return
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        setHovered(true)
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
        setHovered(false)
      }}
    >
      {/* tooltip saat hover (di atas kubus, di sumbu Y jadi tidak ikut berputar) */}
      {hovered && active && (
        <Html position={[0, size * 1.15, 0]} center distanceFactor={1.4} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <div
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              background: 'rgba(18,18,22,0.92)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
              border: `1px solid ${bg}`,
            }}
          >
            {label}
          </div>
        </Html>
      )}
      {/* badan kubus — menyala lembut (tidak terlalu terang) */}
      <mesh castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={bg} emissive={bg} emissiveIntensity={0.28} roughness={0.45} metalness={0.15} />
      </mesh>
      {/* logo timbul di sisi (tanpa sisi atas) */}
      {faces.map((f, i) => (
        <mesh key={i} geometry={logo} position={f.pos} rotation={f.rot} castShadow>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.15} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

// Bracket artistik: gusset segitiga dengan sisi miring melengkung (logam).
function Bracket({ x }: { x: number }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.1, 0) // back-top (menempel dinding, di bawah papan)
    s.lineTo(0.07, 0) // front-top (mengikuti depan papan)
    s.quadraticCurveTo(-0.015, -0.06, -0.1, -0.2) // sisi miring melengkung
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      bevelSegments: 1,
    })
    g.translate(0, 0, -0.011) // pusatkan ketebalan
    return g
  }, [])

  return (
    <mesh geometry={geo} position={[x, -0.02, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
      <meshStandardMaterial color="#2b2b30" metalness={0.85} roughness={0.35} />
    </mesh>
  )
}

const ITEMS = [
  { key: 'github', label: 'GitHub', url: LINKS.github, bg: '#24292e' },
  { key: 'email', label: 'Email', url: LINKS.email, bg: '#ea4335' },
  { key: 'linkedin', label: 'LinkedIn', url: LINKS.linkedin, bg: '#0a66c2' },
  { key: 'whatsapp', label: 'WhatsApp', url: LINKS.whatsapp, bg: '#25d366' },
  { key: 'medium', label: 'Medium', url: LINKS.medium, bg: '#111111' },
]

export function SocialShelf(props: JSX.IntrinsicElements['group']) {
  const gap = 0.26
  const cube = 0.13
  const cubeY = 0.02 + cube / 2 // di atas papan shelf
  const n = ITEMS.length
  const boardW = n * gap + 0.1
  // bracket di-inset dari ujung agar KEDUANYA terlihat (tidak tertanam dinding samping)
  const supportX = boardW / 2 - 0.28

  return (
    <group {...props}>
      {/* Papan shelf (kayu tipis), menempel ke dinding belakang */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[boardW, 0.04, 0.2]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.7} />
      </mesh>
      {/* 2 bracket artistik */}
      <Bracket x={-supportX} />
      <Bracket x={supportX} />

      {/* kubus logo */}
      {ITEMS.map((it, i) => (
        <LogoCube
          key={it.key}
          name={it.key}
          label={it.label}
          url={it.url}
          bg={it.bg}
          size={cube}
          spin={0.4 + i * 0.1}
          position={[(i - (n - 1) / 2) * gap, cubeY, 0]}
        />
      ))}
    </group>
  )
}
