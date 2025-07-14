// import { NeonLightStrip } from './NeonLightStrip';
import type {JSX} from "react"
type CeilingProps = JSX.IntrinsicElements['group'] & {
    size?: [number, number]
}

export function Ceiling({size, ...props}:CeilingProps) {
  return (
    <group {...props}>
      {/* Panel Utama */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}
