import React from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'

type GroupProps = ThreeElements['group']

export interface WindowProps extends GroupProps {
  width?: number
  height?: number
  frameThickness?: number
}

export const Window: React.FC<WindowProps> = ({
  width = 1,
  height = 1,
  frameThickness = 0.05,
  ...props
}) => {
  return (
    <group {...props}>
      {/* Bingkai */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry
          args={[
            width + frameThickness * 2,
            frameThickness,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color={'#444444'} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, (height + frameThickness) / 2, 0]}>
        <boxGeometry
          args={[
            width + frameThickness * 2,
            frameThickness,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, (height + frameThickness) / -2, 0]}>
        <boxGeometry
          args={[
            width + frameThickness * 2,
            frameThickness,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry
          args={[
            frameThickness,
            height,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color={'#444444'} />
      </mesh>

      <mesh castShadow receiveShadow position={[(width + frameThickness) / 2, 0, 0]}>
        <boxGeometry
          args={[
            frameThickness,
            height,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color={'#444444'} />
      </mesh>

      <mesh castShadow receiveShadow position={[(width + frameThickness) / -2, 0, 0]}>
        <boxGeometry
          args={[
            frameThickness,
            height,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <MeshReflectorMaterial
          color={"#ffffff"}
          opacity={0.5} // Adjust opacity as needed
          transparent={true}
          blur={[0, 0]} // Blur ground reflections (width, height), 0 skips blur
          mixBlur={0} // How much blur mixes with surface roughness (default = 1)
          mixStrength={1} // Strength of the reflections
          mixContrast={1} // Contrast of the reflections
          resolution={256} // Off-buffer resolution, lower=faster, higher=better quality, slower
          mirror={0.5} // Mirror environment, 0 = texture colors, 1 = pick up env colors
          depthScale={0} // Scale the depth factor (0 = no depth, default = 0)
          minDepthThreshold={0.9} // Lower edge for the depthTexture interpolation (default = 0)
          maxDepthThreshold={1} // Upper edge for the depthTexture interpolation (default = 0)
          depthToBlurRatioBias={0.25} // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
          distortion={1} // Amount of distortion based on the distortionMap texture
          //distortionMap={distortionTexture} // The red channel of this texture is used as the distortion map. Default is null
          reflectorOffset={0.2} // Offsets the virtual camera that projects the reflection. Useful when the reflective surface is some distance from the object's origin (default = 0)
        />
      </mesh>
      <mesh rotation={[0,Math.PI,0]}>
        <planeGeometry args={[width, height]} />
        <MeshReflectorMaterial
          color={"#ffffff"}
          opacity={0.8} // Adjust opacity as needed
          transparent={true}
          blur={[0, 0]} // Blur ground reflections (width, height), 0 skips blur
          mixBlur={0} // How much blur mixes with surface roughness (default = 1)
          mixStrength={1} // Strength of the reflections
          mixContrast={1} // Contrast of the reflections
          resolution={256} // Off-buffer resolution, lower=faster, higher=better quality, slower
          mirror={0.5} // Mirror environment, 0 = texture colors, 1 = pick up env colors
          depthScale={0} // Scale the depth factor (0 = no depth, default = 0)
          minDepthThreshold={0.9} // Lower edge for the depthTexture interpolation (default = 0)
          maxDepthThreshold={1} // Upper edge for the depthTexture interpolation (default = 0)
          depthToBlurRatioBias={0.25} // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
          distortion={1} // Amount of distortion based on the distortionMap texture
          //distortionMap={distortionTexture} // The red channel of this texture is used as the distortion map. Default is null
          reflectorOffset={0.2} // Offsets the virtual camera that projects the reflection. Useful when the reflective surface is some distance from the object's origin (default = 0)
          //side= {THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
