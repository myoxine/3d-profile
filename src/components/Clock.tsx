/*
Jam dinding ("-FREE- Wall Clock"). Tiga jarum (H/M/Sec) diputar sendiri lewat
useFrame mengikuti jam asli komputer — animasi bawaan model diabaikan
(animasinya tidak konsisten: tiap keyframe sumbunya beda).

KALIBRASI OTOMATIS: saat mount, untuk tiap jarum kita hitung arah tunjuknya
dari geometri (bounding box), lalu luruskan ke angka 12 (atas). Setelah itu
tiap frame jarum diputar sesuai jam/menit/detik. Jadi tidak perlu menebak
offset model.

Jarum berputar mengelilingi sumbu Y lokal-nya (yang—setelah model "ditegakkan"
saat dipasang di dinding—berimpit dengan normal muka jam).

Tekstur kertas asli tidak ikut diunggah, jadi material tampil sebagai warna polos.
*/

import * as THREE from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { JSX } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// Arah putaran. Jika jam berjalan mundur (CCW), ganti ke 1.
const DIR = -1

export function Model(props: JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF('/models/clock.glb')
  const clone = useMemo(() => scene.clone(true), [scene])

  const hour = useRef<THREE.Object3D | null>(null)
  const minute = useRef<THREE.Object3D | null>(null)
  const second = useRef<THREE.Object3D | null>(null)
  // quaternion tiap jarum yang sudah diluruskan ke 12:00 (basis).
  const base = useRef<Record<string, THREE.Quaternion>>({})

  useLayoutEffect(() => {
    hour.current = clone.getObjectByName('H') ?? null
    minute.current = clone.getObjectByName('M') ?? null
    second.current = clone.getObjectByName('Sec') ?? null

    clone.updateWorldMatrix(true, true)

    const up = new THREE.Vector3(0, 1, 0)
    const hands = [hour.current, minute.current, second.current].filter(Boolean) as THREE.Object3D[]

    hands.forEach((o) => {
      const mesh = o as THREE.Mesh
      const geo = mesh.geometry as THREE.BufferGeometry | undefined
      // sumbu putar jarum = sumbu Y lokal-nya, dinyatakan di dunia.
      const n = new THREE.Vector3(0, 1, 0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())).normalize()

      // arah tunjuk jarum (dari poros ke ujung) di dunia, lewat pusat bbox geometri.
      const pivotW = o.getWorldPosition(new THREE.Vector3())
      let tipW = pivotW.clone()
      if (geo) {
        geo.computeBoundingBox()
        const c = geo.boundingBox!.getCenter(new THREE.Vector3())
        tipW = o.localToWorld(c)
      }
      const t = tipW.sub(pivotW)
      // buang komponen sepanjang sumbu putar -> proyeksi ke bidang muka jam.
      t.sub(n.clone().multiplyScalar(t.dot(n)))
      if (t.lengthSq() < 1e-9) {
        base.current[o.uuid] = o.quaternion.clone()
        return
      }
      t.normalize()

      // "atas" (arah angka 12) pada bidang muka jam.
      const u = up.clone().sub(n.clone().multiplyScalar(up.dot(n)))
      if (u.lengthSq() < 1e-6) u.set(1, 0, 0)
      u.normalize()

      // sudut bertanda dari u ke t mengelilingi n.
      const sin = new THREE.Vector3().crossVectors(u, t).dot(n)
      const cos = u.dot(t)
      const theta = Math.atan2(sin, cos)

      // luruskan ke 12: putar sumbu Y lokal sebesar -theta.
      const aligned = o.quaternion
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -theta))
      base.current[o.uuid] = aligned
    })

    // Kaca depan: tekstur asli tidak ikut terupload sehingga material-nya tampil
    // sebagai disc abu-abu solid yang menutupi muka jam. Buat transparan.
    const glass = clone.getObjectByName('glass') as THREE.Mesh | null
    if (glass) {
      const mats = Array.isArray(glass.material) ? glass.material : [glass.material]
      mats.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial
        m.transparent = true
        m.opacity = 0.12
        m.depthWrite = false
        m.roughness = 0.05
        m.metalness = 0
        m.color = new THREE.Color('#ffffff')
      })
    }
  }, [clone])

  const Y = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const tmp = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    const now = new Date()
    const s = now.getSeconds() + now.getMilliseconds() / 1000
    const m = now.getMinutes() + s / 60
    const h = (now.getHours() % 12) + m / 60

    const set = (o: THREE.Object3D | null, frac: number) => {
      if (!o) return
      const b = base.current[o.uuid]
      if (!b) return
      o.quaternion.copy(b).multiply(tmp.setFromAxisAngle(Y, DIR * frac * Math.PI * 2))
    }

    set(second.current, s / 60)
    set(minute.current, m / 60)
    set(hour.current, h / 12)
  })

  return <primitive object={clone} {...props} />
}

useGLTF.preload('/models/clock.glb')
