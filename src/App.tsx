import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Room } from './components/Room';
import { Loader } from './components/Loader';
import { SceneEnvironment } from './components/SceneEnvironment';
import { LightingProvider } from './components/lighting/LightingContext';
import { CameraRig } from './components/camera/CameraRig';
import { SceneMenu } from './components/ui/SceneMenu';
import { useHashRoute } from './hooks/useHashRoute';
import { useIsLowPower } from './hooks/useMediaQuery';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export default function App() {
  // deep link: URL hash <-> view kamera (#home, #experience, ...)
  useHashRoute();
  // quality tier: HP / layar kecil / pointer kasar -> render lebih hemat.
  const lowPower = useIsLowPower();
  return (
    <div style={{ width: "100vw", height: "100vh", position: 'relative' }}>
      {/* dpr di-cap: desktop 1.5 (retina tetap tajam tanpa render 3x);
          low-power (HP) dikunci 1 agar fill-rate tidak membakar GPU mobile. */}
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows dpr={lowPower ? [1, 1] : [1, 1.5]}>
        <LightingProvider>
          <Suspense fallback={<Loader />}>
            <SceneEnvironment />
            <CameraRig />
            <Room />
          </Suspense>

          {/* Bloom (postprocessing) mahal di GPU mobile -> hanya di non-low-power.
              Efek glow lembut pada bagian paling terang (bulb lampu). */}
          {!lowPower && (
            <EffectComposer>
              <Bloom
                intensity={0.32}
                luminanceThreshold={0.9}
                luminanceSmoothing={0.2}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </LightingProvider>
      </Canvas>

      {/* Menu shortcut kamera + modal foto + panel proyek (DOM, di atas Canvas) */}
      <SceneMenu />
    </div>
  );
}
