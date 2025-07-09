import { Floor } from './Floor'
import { Wall } from "./Wall"
import { Window } from "./Window"
export const Room = () => {

    return (
        <>
            <Floor position={[0, -2 + 0.05, 0]} />
            <Wall wallSize={[3, 4]} position={[0, 0, -1.6]} />
            <Wall wallSize={[3.1, 4]} position={[1.5, 0, -0.05]} rotationY={0.5 * Math.PI} holePosition={[0.5, 0]} holeSize={[1.1, 1.6]} />
            <Wall wallSize={[3.1, 4]} position={[-1.5, 0, -0.05]} rotationY={0.5 * Math.PI} />
            <Window
                width={1}
                height={1.5}
                frameThickness={0.05}
                position={[1.55, 0, -0.55]}
                rotation={[0, 0.5 * Math.PI, 0]}
            />
            <mesh position={[0, -1 + 0.1, -1]} castShadow>
                <boxGeometry args={[1, 2, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </>
    );
};