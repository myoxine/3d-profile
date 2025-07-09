import { Floor } from './Floor'
import { Wall } from "./Wall"
import { Window } from "./Window"
import { Model as Desk } from './Desk';
import { AnimatedSpinningChair } from './AnimatedSpinningChair';
export const Room = () => {
    const deskScale = 1.5 / 2
    return (
        <>
            <Floor position={[0, -2 + 0.05, 0]} />
            {/* <Wall wallSize={[3, 4]} position={[0, 0, -1.6]} />
            <Wall wallSize={[3.1, 4]} position={[1.5, 0, -0.05]} rotationY={0.5 * Math.PI} holePosition={[0.5, -0.2]} holeSize={[1.1, 1.6]} />
            <Wall wallSize={[3.1, 4]} position={[-1.5, 0, -0.05]} rotationY={0.5 * Math.PI} />
            <Window
                width={1}
                height={1.5}
                frameThickness={0.05}
                position={[1.55, -0.2, -0.55]}
                rotation={[0, 0.5 * Math.PI, 0]}
            /> */}
            <Desk scale={[deskScale, deskScale, deskScale]} rotation={[0, -0.5 * Math.PI, 0]} position={[0.75, -2 + 0.1, -1.15]} />
            <AnimatedSpinningChair  position={[0.25, -2 + 0.7, -0.2]} rotation={[0, -Math.PI, 0]}  />
        </>
    );
};