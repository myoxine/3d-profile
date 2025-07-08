export const Room = () => {
    return (
        <>
            {/* Floor */}
            <mesh position={[0, -2 + 0.05, 0]} receiveShadow>
                <boxGeometry args={[3, 0.1, 3]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 0, -1.55]} receiveShadow>
                <boxGeometry args={[3, 4, 0.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-1.55, 0, -0.05]} receiveShadow>
                <boxGeometry args={[0.1, 4, 3.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* right Wall */}
            <mesh position={[1.55, 0, -0.05]} receiveShadow>
                <boxGeometry args={[0.1, 4, 3.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* A Box (Maybe a chair or table?) */}
            <mesh position={[0, -2 +0.55, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </>
    );
};