import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { useTexture } from '@react-three/drei'

interface WallWithWindowProps {
  position?: [number, number, number]
  wallSize?: [number, number]
  holeSize?: [number, number]
}

export const WallWithWindow = ({
  position = [0, 0, 0],
  wallSize = [10, 5],
  holeSize = [2, 2]
}: WallWithWindowProps) => {
  const meshRef = useRef<Mesh>(null!)

  const wallGeometry = useMemo(() => {
    const [wallWidth, wallHeight] = wallSize
    const [holeWidth, holeHeight] = holeSize

    // Define outer rectangle (full wall shape)
    const shape = new THREE.Shape()
    shape.moveTo(-wallWidth / 2, -wallHeight / 2)
    shape.lineTo(wallWidth / 2, -wallHeight / 2)
    shape.lineTo(wallWidth / 2, wallHeight / 2)
    shape.lineTo(-wallWidth / 2, wallHeight / 2)
    shape.lineTo(-wallWidth / 2, -wallHeight / 2)

    // Define the window hole as a path
    const hole = new THREE.Path()
    hole.moveTo(-holeWidth / 2, -holeHeight / 2)
    hole.lineTo(holeWidth / 2, -holeHeight / 2)
    hole.lineTo(holeWidth / 2, holeHeight / 2)
    hole.lineTo(-holeWidth / 2, holeHeight / 2)
    hole.lineTo(-holeWidth / 2, -holeHeight / 2)

    shape.holes.push(hole)

    // Extrude the shape to create wall thickness
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: false
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [wallSize, holeSize])

  // Load plaster textures (optional)
  const [colorMap, roughnessMap, normalMap, displacementMap] =
    useTexture([
      '/textures/Plaster001_1K-JPG_Color.jpg',
      '/textures/Plaster001_1K-JPG_Roughness.jpg',
      '/textures/Plaster001_1K-JPG_NormalGL.jpg',
      '/textures/Plaster001_1K-JPG_Displacement.jpg'
    ]);
    [
        colorMap,
        roughnessMap,
        normalMap,
        displacementMap
      ].forEach(tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(0.2, 0.2)
      })

  

  return (
    <mesh
      ref={meshRef}
      geometry={wallGeometry}
      position={position}
      rotation-y={0.5*Math.PI}
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
