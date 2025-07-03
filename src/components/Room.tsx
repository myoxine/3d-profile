import { Wall } from './Wall'
import { Floor } from './Floor'
export const Room = () => {

    return (
        <>
            {/* Floor */}
            <Floor />
            <Wall position={[0, 2.5, -5.05]} />
            <Wall position={[-5.05, 2.5, -0.05]} size={[0.1, 5, 10.1]} />
            <Wall position={[5.05, 2.5, -0.05]} size={[0.1, 5, 10.1]} />
            {/* A Box (Maybe a chair or table?) */}
            <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </>
    );
};