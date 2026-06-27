// src/components/camera/CameraRig.tsx
// Mengganti OrbitControls dengan CameraControls (drei) yang bisa di-animasikan
// ke preset tiap area. Mendengarkan `view` dari store fokus.
//
// Aturan kamera:
// - 'overview' (awal): menghadap pusat ruangan (0,0,0), boleh diputar, boleh
//   sedikit zoom, TAPI tidak bisa zoom keluar melebihi ruangan (maxDistance).
// - view lain (fokus area): zoom dikunci (min == max distance) sehingga user
//   tidak bisa zoom in/out; keluar lewat tombol Exit di SceneMenu (-> overview).

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CameraControls } from '@react-three/drei'
import { useFocus, type ViewName } from '../../store/useFocus'

// kotak batas = bagian dalam ruangan (sedikit di dalam dinding) supaya kamera
// tidak pernah keluar ruangan saat diputar.
const ROOM_BOUNDARY = new THREE.Box3(
  new THREE.Vector3(-1.4, -1.85, -1.4),
  new THREE.Vector3(1.4, 1.85, 1.4)
)

// Tiap view: posisi kamera + titik yang dilihat (target). Setel sesuai selera.
const VIEWS: Record<ViewName, { pos: [number, number, number]; target: [number, number, number] }> = {
  // di DALAM ruangan (z < dinding depan 1.55), menghadap dinding belakang
  // (meja/neon/galeri). Dinding berupa slab padat, jadi kamera harus di dalam.
  overview: { pos: [0, 0, 1.3], target: [0, -0.05, -0.6] },
  photos: { pos: [-0.5, 0.34, -0.3], target: [-0.5, 0.34, -1.5] },
  // sertakan TV + jam di atasnya: level (tanpa keystone), mundur agar keduanya muat
  tv: { pos: [-0.55, -0.45, -0.2], target: [-0.55, -0.45, 1.3] },
  // fokus rapat ke layar monitor saja (monitor di [1,-1.19,-1.2], menghadap
  // +Z sedikit ke -X karena rotasi -0.15π). Kamera tepat di depan layar.
  desk: { pos: [0.83, -0.97, -0.82], target: [1.0, -0.97, -1.15] },
  // barisan kubus sosial: pusat x=0.9, y≈-0.33, z=-1.44. Kamera lurus di depan.
  shelf: { pos: [0.9, -0.05, -0.3], target: [0.9, -0.05, -1.44] },
  books: { pos: [-0.35, -0.3, 0], target: [-1.5, -0.35, 0] },
}

// batas zoom-out untuk overview agar kamera tidak keluar ruangan
const OVERVIEW_MIN = 0.8
const OVERVIEW_MAX = 2.0 // batasi agar saat zoom-out kamera tetap di dalam ruangan

function distance(v: { pos: [number, number, number]; target: [number, number, number] }) {
  return Math.hypot(v.pos[0] - v.target[0], v.pos[1] - v.target[1], v.pos[2] - v.target[2])
}

export function CameraRig() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  const view = useFocus((s) => s.view)
  // homeKey dinaikkan tiap klik "Beranda"/reset -> paksa kamera kembali ke
  // framing overview yang rapi (berguna jika user sudah memutar kamera).
  const homeKey = useFocus((s) => s.homeKey)

  // sekali: kurung kamera di dalam ruangan
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.setBoundary(ROOM_BOUNDARY)
    c.boundaryEnclosesCamera = true
  }, [])

  // CATATAN: FOV sengaja DIBIARKAN TETAP (60, diset di <Canvas>). Sempat dicoba
  // FOV adaptif untuk portrait, tapi memperlebar FOV di ruangan sekecil ini
  // menimbulkan distorsi fisheye (objek dekat membesar) DAN merusak kalibrasi
  // layar monitor (Part 9) yang disetel pada FOV 60. Responsivitas ditangani di
  // layer UI (menu) saja, bukan dengan mengubah lensa.

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const v = VIEWS[view]

    if (view === 'overview') {
      // overview: boleh diputar bebas + sedikit zoom (dibatasi maxDistance &
      // boundary supaya tetap di dalam ruangan). Klik "Beranda" me-reset
      // framing via homeKey kalau kamera sempat diputar ke sudut aneh.
      c.minDistance = OVERVIEW_MIN
      c.maxDistance = OVERVIEW_MAX
      c.enabled = true
    } else {
      // fokus area: kunci total (tidak bisa rotate / zoom / pan).
      // Keluar lewat tombol "Keluar" di SceneMenu -> kembali ke overview.
      const d = distance(v)
      c.minDistance = d
      c.maxDistance = d
      c.enabled = false
    }

    c.setLookAt(v.pos[0], v.pos[1], v.pos[2], v.target[0], v.target[1], v.target[2], true)
  }, [view, homeKey])

  return <CameraControls ref={ref} makeDefault minDistance={OVERVIEW_MIN} maxDistance={OVERVIEW_MAX} />
}
