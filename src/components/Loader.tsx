// src/components/Loader.tsx

import { Html, useProgress } from '@react-three/drei'

export function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div style={{
        background: '#222',
        padding: '10px 20px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'sans-serif',
      }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}
