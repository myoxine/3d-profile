export const Room = () => {
    return (
        <>
            {/* Floor */}
            <mesh position={[0, 0.05, 0]} receiveShadow>
                <boxGeometry args={[10, 0.1, 10]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 2.5, -5.05]} receiveShadow>
                <boxGeometry args={[10, 5, 0.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-5.05, 2.5, -0.05]} receiveShadow>
                <boxGeometry args={[0.1, 5, 10.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* right Wall */}
            <mesh position={[5.05, 2.5, -0.05]} receiveShadow>
                <boxGeometry args={[0.1, 5, 10.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* A Box (Maybe a chair or table?) */}
            <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </>
    );
};