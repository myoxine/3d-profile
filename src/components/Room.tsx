import { Floor } from './Floor'
import { Wall } from "./Wall"
import { Window } from "./Window"
import { Model as Desk } from './Desk';
import { AnimatedSpinningChair } from './AnimatedSpinningChair';
import {Ceiling} from './Ceiling';
import { Model as Door } from "./Door"
import { LightSwitch } from './LightSwitch'
import { Model as Sofa } from './Sofa'
import { StandingLamp } from './StandingLamp'
import { Model as AirConditioner } from './AirConditioner'
import { Model as Credenza } from './Credenza'
import { Model as Plant } from './Plant'
import { TableLamp } from './TableLamp'
export const Room = () => {
    const deskScale = 1.5 / 2;
    const doorScale = 2.5 / 2.138395843336184
    return (
        <>
            <Floor position={[0, -2 + 0.05, 0]} />
            <Wall wallSize={[3, 4]} position={[0, 0, -1.55]} />
            <Wall wallSize={[3.2, 4]} position={[1.55, 0, 0]} rotation={[0, 0.5 * Math.PI, 0]} holePosition={[0.54, -0.2]} holeSize={[1.1, 1.6]} />
            <Wall wallSize={[3.2, 4]} position={[-1.55, 0, 0]} rotation={[0, 0.5 * Math.PI, 0]} />
            <Wall wallSize={[3.2, 4]} position={[0, 0, 1.55]} holePosition={[0.9, -0.65]} holeSize={[0.99, 2.5]} />
            <Door scale={doorScale} rotation={[0, -0.5 * Math.PI, 0]} position={[0.9, -1.9, 1.55]} />
            <Window
                width={1}
                height={1.5}
                frameThickness={0.05}
                position={[1.55, -0.2, -0.54]}
                rotation={[0, 0.5 * Math.PI, 0]}
            />
            <Desk scale={[deskScale, deskScale, deskScale]} rotation={[0, -0.5 * Math.PI, 0]} position={[0.75, -2 + 0.1, -1.15]} />
            <Ceiling size={[3,3]} position={[0,1.9,0]} rotation={[0.5 * Math.PI,0,0]} />
            <AnimatedSpinningChair position={[0.55, -2 + 0.7, -0.2]} rotation={[0, -Math.PI, 0]} />
            {/* 3 saklar single di samping kanan pintu (dinding depan z=1.55),
                sudah menghadap ke dalam ruangan. Sesuaikan angka setelah dilihat. */}
            <LightSwitch position={[0.2, -0.7, 1.49]} scale={1} />
            {/* Sofa di pojok depan-kiri, dekat saklar. Skala/rotasi perkiraan,
                sesuaikan setelah dilihat (model ini berukuran besar). */}
            <Sofa scale={0.5} rotation={[0, 0, 0]} position={[-0.5, -1.9, -1.0]} />
            {/* Standing lamp di sudut, di samping sofa */}
            <StandingLamp position={[-1.3, -1.9, -1.3]} />
            {/* AC di dinding belakang, di atas sofa */}
            <AirConditioner position={[-0.5, 1.2, -1.4]} />
            {/* Credenza dipanjangkan sepanjang lebar dinding (stretch sumbu X) */}
            <Credenza scale={[1, 1, 1]} position={[-0.8, -1.9, 1.32]} />
            {/* Tanaman di samping kanan credenza */}
            <Plant position={[0.1, -1.9, 1.3]} scale={[0.7, 0.7, 0.7]} />
            {/* Table lamp di atas credenza (saklar tableOn) */}
            <TableLamp position={[-1.25, -1.09, 1.32]} />
        </>
    );
};