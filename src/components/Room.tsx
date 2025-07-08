import { Floor } from './Floor'
import { Wall } from "./Wall"
import { Model as Window } from "./Window"
export const Room = () => {

    return (
        <>
            {/* Floor */}
            <Floor position={[0, -2 + 0.05, 0]} />
            <Wall wallSize={[3, 4]} position={[0, 0, -1.6]}  />
            <Wall wallSize={[3.1, 4]} position={[1.5, 0, -0.05]} rotationY={0.5 * Math.PI} holePosition={[0.8,0]} holeSize={[1,1.5]} />
            <Wall wallSize={[3.1, 4]} position={[-1.5, 0, -0.05]} rotationY={0.5 * Math.PI} />
            <Window scale={[0.05 / 0.05000030994415283, 1.5 / 0.5999999940395355, 1 / 0.560000091791153]}  position={[1.55, 0, -0.85]} />
            <mesh position={[0, -2 +0.55, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </>
    );
};