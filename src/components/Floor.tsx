import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
interface FloorProps {
    position?: [number, number, number]
    size?: [number, number, number]
}

export const Floor = ({ position = [0, 0.05, 0], size = [10, 0.1, 10] }: FloorProps) => {
    const [
        colorMap,
        roughnessMap,
        normalMap,
        displacementMap,
        aoMap
    ] = useTexture([
        '/textures/WoodFloor039_1K-JPG_Color.jpg',
        '/textures/WoodFloor039_1K-JPG_Roughness.jpg',
        '/textures/WoodFloor039_1K-JPG_NormalGL.jpg',
        '/textures/WoodFloor039_1K-JPG_Displacement.jpg',
        '/textures/WoodFloor039_1K-JPG_AmbientOcclusion.jpg'
    ])

        // Make the texture repeat across the floor
        ;[colorMap, roughnessMap, normalMap, displacementMap, aoMap].forEach(tex => {
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
                aoMap={aoMap}
            />
        </mesh>
    )
}