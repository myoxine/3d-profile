import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Room } from './components/Room';
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas flat linear camera={{ position: [0, 2, 5], fov: 60 }} shadows>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 5]} intensity={1} castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10} />
        <OrbitControls />
        <Room />
      </Canvas>
    </div>
  );
}