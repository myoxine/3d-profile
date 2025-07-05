import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Mesh } from 'three'
import { useTexture } from '@react-three/drei'

export interface WallWithWindowProps {
  position?: [number, number, number]
  wallSize?: [number, number]
  holeSize?: [number, number]
  holePosition?: [number, number] // NEW: offset lubang dari pusat wall
  rotationY?: number
}

export const WallWithWindow = ({
  position = [0, 0, 0],
  wallSize = [10, 5],
  holeSize = [2, 2],
  holePosition = [0, 0],
  rotationY = 0
}: WallWithWindowProps) => {
  const meshRef = useRef<Mesh>(null!)

  const wallGeometry = useMemo(() => {
    const [wallWidth, wallHeight] = wallSize
    const [holeWidth, holeHeight] = holeSize
    const [holeX, holeY] = holePosition

    // Outer rectangle
    const shape = new THREE.Shape()
    shape.moveTo(-wallWidth / 2, -wallHeight / 2)
    shape.lineTo(wallWidth / 2, -wallHeight / 2)
    shape.lineTo(wallWidth / 2, wallHeight / 2)
    shape.lineTo(-wallWidth / 2, wallHeight / 2)
    shape.lineTo(-wallWidth / 2, -wallHeight / 2)

    // Hole path
    const hole = new THREE.Path()
    hole.moveTo(
      holeX - holeWidth / 2,
      holeY - holeHeight / 2
    )
    hole.lineTo(
      holeX + holeWidth / 2,
      holeY - holeHeight / 2
    )
    hole.lineTo(
      holeX + holeWidth / 2,
      holeY + holeHeight / 2
    )
    hole.lineTo(
      holeX - holeWidth / 2,
      holeY + holeHeight / 2
    )
    hole.lineTo(
      holeX - holeWidth / 2,
      holeY - holeHeight / 2
    )

    shape.holes.push(hole)

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: false
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [wallSize, holeSize, holePosition])

  // Load plaster textures
  const [
    colorMap,
    roughnessMap,
    normalMap,
    displacementMap
  ] = useTexture([
    '/textures/Plaster001_1K-JPG_Color.jpg',
    '/textures/Plaster001_1K-JPG_Roughness.jpg',
    '/textures/Plaster001_1K-JPG_NormalGL.jpg',
    '/textures/Plaster001_1K-JPG_Displacement.jpg'
  ])

  ;[
    colorMap,
    roughnessMap,
    normalMap,
    displacementMap
  ].forEach(tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={wallGeometry}
      position={position}
      rotation-y={rotationY}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        map={colorMap}
        roughnessMap={roughnessMap}
        normalMap={normalMap}
        displacementMap={displacementMap}
        displacementScale={0}
        color={'white'}
      />
    </mesh>
  )
}
