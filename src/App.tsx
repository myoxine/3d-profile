import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Room } from './components/Room';
import { Loader } from './components/Loader';
import { SceneEnvironment } from './components/SceneEnvironment';
import { LightingProvider } from './components/lighting/LightingContext';
import { CameraRig } from './components/camera/CameraRig';
import { SceneMenu } from './components/ui/SceneMenu';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <LightingProvider>
          <Suspense fallback={<Loader />}>
            <SceneEnvironment />
            <CameraRig />
            <Room />
          </Suspense>

          {/* Efek glow lembut pada bagian paling terang (bulb lampu) */}
          <EffectComposer>
            <Bloom
              intensity={0.32}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
          </EffectComposer>
        </LightingProvider>
      </Canvas>

      {/* Menu shortcut kamera + modal foto + panel proyek (DOM, di atas Canvas) */}
      <SceneMenu />
    </div>
  );
}
