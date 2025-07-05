import { Wall } from './Wall'
import { Floor } from './Floor'
import { WallWithWindow } from "./WallWithWindow"
import { Model as Window } from "./Window"
import * as THREE from "three"
export const Room = () => {

    return (
        <>
            {/* Floor */}
            <Floor />

            <WallWithWindow position={[-5.0, 2.5, -0]} rotationY={0.5 * Math.PI} holePosition={[2,0]} />
            <WallWithWindow position={[5.0, 2.5, -0]} rotationY={0.5 * Math.PI} holePosition={[2,0]} holeSize={[3,2]} />
            {/* <WallWithWindow position={[0, 2.5, -5.05]} />  */}
            {/* <WallWithWindow position={[2.5, 2.5, -0]} /> */}
            <Window scale={[0.1 / 0.05000030994415283, 2 / 0.5999999940395355, 3 / 0.560000091791153]} position={[5.05, 2.5, -2]} />
            {/* <Window scale={[1 / 648.115234375, 1.5 / 2546.5693359375, 2 / 3023.73046875,]} position={[5, 1, -2.5]} rotation-y={Math.PI * 0.055} /> */}
            {/*  <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="red" attach="material-0" />
                <meshBasicMaterial color="blue" attach="material-1" />
                <meshBasicMaterial color="orange" attach="material-2" />
                <meshBasicMaterial color="green" attach="material-3" />
                <meshBasicMaterial color="yellow" attach="material-4" />
                <meshBasicMaterial color="pink" attach="material-5" />
            </mesh> */}
            {/* <Torii
                scale={[5, 5, 5]}
                position={[0, 1, 0]}
            /> */}

            {/* <Model scale={[5, 5, 5]}
                position={[0, 1, 0]} /> */}
        </>
    );
};