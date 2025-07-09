import React, { useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { Model as GamingChair } from './GamingChair'
import type { JSX } from 'react'

export const AnimatedSpinningChair: React.FC< JSX.IntrinsicElements['group']> = (props) => {
  const pivotRef = useRef<Group>(null)
  const chairScale = 1.2 / 575.2021484375
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const maxAngle = 0.3 // radians (~17 degrees)
    const speed = 1
    const angle = Math.sin(time * speed) * maxAngle

    if (pivotRef.current) {
        pivotRef.current.rotation.y = angle
    }
  })

  return (
    <group {...props}>
      {/* Pivot wrapper */}
      <group ref={pivotRef} position={[0, 0, 0.24 ]}>
        {/* Move chair back to center relative to pivot */}
        <GamingChair  position={[0, 0, -0.24 ]} scale={[chairScale,chairScale,chairScale]} />
      </group>
    </group>
  )
}
