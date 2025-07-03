import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface WallProps {
  position: [number, number, number]
  size?: [number, number, number]
}

export const Wall = ({ position, size = [10, 5, 0.1] }: WallProps) => {
  const [colorMap, roughnessMap, normalMap, displacementMap] =
    useTexture([
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
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={colorMap}
        roughnessMap={roughnessMap}
        normalMap={normalMap}
        displacementMap={displacementMap}
        displacementScale={0}
      />
    </mesh>
  )
}
