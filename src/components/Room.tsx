export const Room = () => {
    return (
        <>
            {/* Floor */}
            <mesh position={[0, 0, 0]} receiveShadow>
                <boxGeometry args={[10, 0.1, 10]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 2.5, -5]}>
                <boxGeometry args={[10, 5, 0.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-5, 2.5, 0]}>
                <boxGeometry args={[0.1, 5, 10]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* A Box (Maybe a chair or table?) */}
            <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </>
    );
};