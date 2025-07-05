import { Wall } from './Wall'
import { Floor } from './Floor'
import {WallWithWindow} from "./WallWithWindow"
import { Model as Window } from "./Window"
import * as THREE from "three"
export const Room = () => {

    return (
        <>
            {/* Floor */}
            <Floor />
            <WallWithWindow position={[5.0, 2.5, -0]}  />
            <WallWithWindow position={[-5.0, 2.5, -0]}  />
            <WallWithWindow position={[0, 2.5, -5.05]} />
            <Window scale={[1, 3, 3]} position={[5.1, 2.5, -0.05]} />
=           {/*  <mesh position={[0, 0.55, 0]} castShadow>
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