import React from 'react'
import { Model as GamingChair } from './GamingChair'
import type { JSX } from 'react'

// Kursi gaming statis (tanpa animasi berputar).
export const AnimatedSpinningChair: React.FC<JSX.IntrinsicElements['group']> = (props) => {
  const chairScale = 1.2 / 575.2021484375

  return (
    <group {...props}>
      <GamingChair scale={[chairScale, chairScale, chairScale]} />
    </group>
  )
}
