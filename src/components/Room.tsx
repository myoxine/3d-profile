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
import { Model as Laptop } from './Laptop'
import { Tv } from './Tv'
import { Model as Monitor } from './Monitor'
import { PhotoFrame } from './PhotoFrame'
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
            <Sofa scale={0.4} rotation={[0, 0, 0]} position={[-0.6, -1.9, -1.0]} />
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
            {/* Laptop di atas meja kerja (meja top ~y=-1.19) */}
            <Laptop scale={0.08} rotation={[0, 0, 0]} position={[0.45, -1.19, -1]} />
            {/* Monitor di meja, di belakang laptop, menghadap kursi (+Z) */}
            <Monitor scale={1} rotation={[0, -0.15 * Math.PI, 0]} position={[1, -1.19, -1]} />
            {/* TV di atas credenza, menghadap ke dalam ruangan */}
            <Tv scale={0.7} rotation={[0, 0.5 * Math.PI, 0]} position={[-0.7, -1.09, 1.35]} />
            {/* === Galeri dinding belakang (atas sofa): 2 baris x 4 kolom ===
                Menghadap +Z (default). Kolom x: -1.15 / -0.72 / -0.29 / 0.14 */}
            {/* Baris bawah (kiri->kanan): UBM transkrip, UBM sertifikat, Binus S1, foto profil */}
            <PhotoFrame image="/images/ijazah-s2-transkrip.jpg" width={0.2} height={0.28} position={[-1.15, 0.12, -1.5]} />
            <PhotoFrame image="/images/ijazah-s2.jpg" width={0.3} height={0.213} position={[-0.72, 0.12, -1.5]} />
            <PhotoFrame image="/images/ijazah-s1.jpg" width={0.3} height={0.207} position={[-0.29, 0.12, -1.5]} />
            <PhotoFrame image="/images/profile.png" background="#ffffff" width={0.3} height={0.39} position={[0.14, 0.12, -1.5]} />
            {/* Baris atas: 4 sertifikat TestDome */}
            <PhotoFrame image="/images/cert-javascript.jpg" width={0.26} height={0.235} position={[-1.15, 0.56, -1.5]} />
            <PhotoFrame image="/images/cert-react.jpg" width={0.26} height={0.235} position={[-0.72, 0.56, -1.5]} />
            <PhotoFrame image="/images/cert-react-redux.jpg" width={0.26} height={0.235} position={[-0.29, 0.56, -1.5]} />
            <PhotoFrame image="/images/cert-react-native.jpg" width={0.26} height={0.235} position={[0.14, 0.56, -1.5]} />
        </>
    );
};