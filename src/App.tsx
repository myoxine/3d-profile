import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Room } from './components/Room';
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas flat linear camera={{ position: [0, 2, 5], fov: 60 }} shadows>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 5]} intensity={1} castShadow />
        <OrbitControls />
        <Room />
      </Canvas>
    </div>
  );
}