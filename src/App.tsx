import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Room } from './components/Room';
import { Suspense } from 'react'
import { Loader } from './components/Loader'
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from '@react-three/postprocessing';
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <Suspense fallback={<Loader />}>
        <Environment files="/hdri/dikhololo_sunset_4k.hdr" background environmentIntensity={0.3} />
        <directionalLight
            color={"#ffffff"}
            intensity={0.5}
            position={[3, 1, -2]}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <OrbitControls />
          <Room />
        </Suspense>
      </Canvas>
    </div>
  );
}
