import { Suspense } from 'react'
import { Floor } from './Floor'
import { Wall } from "./Wall"
import { Window } from "./Window"
import { Model as Desk } from './Desk';
import { AnimatedSpinningChair } from './AnimatedSpinningChair';
import {Ceiling} from './Ceiling';
import { Model as Door } from "./Door"
import { LightSwitch } from './LightSwitch'
import { Model as Sofa } from './Sofa'
import { NeonSign } from './NeonSign'
import { WallLamp } from './WallLamp'
import { Model as AirConditioner } from './AirConditioner'
import { Model as Credenza } from './Credenza'
import { Model as Plant } from './Plant'
import { TableLamp } from './TableLamp'
import { Model as Laptop } from './Laptop'
import { LaptopScreen } from './LaptopScreen'
import { Tv } from './Tv'
import { Model as Monitor } from './Monitor'
import { MonitorScreen } from './MonitorScreen'
import { PhotoFrame } from './PhotoFrame'
import { Model as Character } from './Character'
import { Model as Mouse } from './Mouse'
import { Model as Kid } from './Kid'
import { Model as Woman } from './Woman'
import { Model as Clock } from './Clock'
import { SocialShelf } from './SocialShelf'
import { BookShelf } from './BookShelf'
import { Cactus } from './Cactus'
import { useFocus } from '../store/useFocus'
import { sfx, primeAudio } from '../audio/sound'
export const Room = () => {
    const deskScale = 1.5 / 2;
    const doorScale = 2.5 / 2.138395843336184
    const setView = useFocus((s) => s.setView)
    // handler klik untuk monitor & laptop -> fokus ke layar monitor
    // (interaktivitas di dalam layar komputer akan ditambahkan nanti)
    const deskClick = (e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        primeAudio()
        sfx.whoosh()
        setView('desk')
    }
    const pointer = {
        onPointerOver: (e: { stopPropagation: () => void }) => { e.stopPropagation(); document.body.style.cursor = 'pointer' },
        onPointerOut: () => { document.body.style.cursor = 'auto' },
    }
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
            <LightSwitch position={[0.18, -0.7, 1.49]} scale={1} />
            {/* Sofa di pojok depan-kiri, dekat saklar. Skala/rotasi perkiraan,
                sesuaikan setelah dilihat (model ini berukuran besar). */}
            <Sofa scale={[23, 30, 30]} rotation={[0, 0, 0]} position={[-0.75, -1.9, -1.1]} />
            {/* Papan neon "Hadi Halim" di dinding belakang, di atas komputer.
                Menghadap +Z (ke dalam ruangan). Dikontrol saklar standingOn. */}
            <NeonSign position={[0.9, 0.1, -1.48]} />
            {/* Floating shelf di BAWAH tulisan "Hadi Halim" + ikon sosial (klik buka tautan).
                z dimajukan dari dinding (-1.55) agar kubus yang berputar tidak menembus tembok. */}
            <SocialShelf position={[0.9, -0.42, -1.44]} />
            {/* Rak buku tile (grid 2x2) di dinding kiri (x=-1.55), menghadap +X.
                Tiap sel = 1 series; klik buku -> artikel, klik sel -> panel. */}
            <BookShelf position={[-1.53, -0.35, 0]} rotation={[0, Math.PI / 2, 0]} />
            {/* 3 kaktus duduk di atas papan rak (top lokal ~0.367, tidak melayang). */}
            <group position={[-1.53, -0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
                <Cactus index={1} position={[-0.42, 0.366, 0.08]} scale={0.42} />
                <Cactus index={2} position={[0, 0.366, 0.08]} scale={0.46} />
                <Cactus index={3} position={[0.42, 0.366, 0.08]} scale={0.42} />
            </group>
            {/* 2 lampu di belakang sofa (flanking), dikontrol saklar sofaOn */}
            <WallLamp position={[-1.3, -0.5, -1.46]} scale={1} />
            <WallLamp position={[-0.2, -0.5, -1.46]} scale={1} />
            {/* AC di dinding belakang, di atas sofa */}
            <AirConditioner position={[-0.5, 1.2, -1.4]} />
            {/* Credenza dipanjangkan sepanjang lebar dinding (stretch sumbu X) */}
            <Credenza scale={[1, 1, 1]} position={[-0.8, -1.9, 1.32]} />
            {/* Tanaman di samping kanan credenza */}
            <Plant position={[0.1, -1.9, 1.3]} scale={[0.7, 0.7, 0.7]} />
            {/* Table lamp di atas credenza (saklar tableOn) */}
            <TableLamp position={[-1.25, -1.09, 1.32]} />
            {/* Avatar berat (Ready Player Me) di-lazy-load di Suspense terpisah:
                kerangka ruangan + furnitur tampil dulu, karakter menyusul (fallback null). */}
            <Suspense fallback={null}>
                {/* Karakter duduk mengetik di kursi kerja, menghadap meja (-Z). */}
                <Character position={[0.55, -1.86, -0.53]} rotation={[0, Math.PI, 0]} scale={1} />
                {/* Kid duduk di sofa menonton TV (+Z). Avatar bertekstur, tinggi ~1.8m pada scale 1. */}
                <Kid position={[-0.4, -1.9, -0.8]} rotation={[0, 0, 0]} scale={1} />
                {/* Wanita duduk di sofa menonton TV (+Z). Sudah bertekstur. */}
                <Woman position={[-1.05, -1.9, -0.9]} rotation={[0, 0.10*Math.PI, 0]} scale={1} />
            </Suspense>
            {/* Laptop di atas meja kerja (meja top ~y=-1.19). Klik -> panel proyek */}
            <Laptop scale={0.09} rotation={[0, 0, 0]} position={[0.45, -1.19, -1.05]} onClick={deskClick} {...pointer} />
            {/* Layar laptop = screenshot, menempel di muka lid (hasil kalibrasi). */}
            <LaptopScreen position={[0.45, -1.025, -1.21]} rotation={[0, 0, 0]} />
            {/* Mouse di meja, di kanan laptop (panjang ~12cm) */}
            <Mouse scale={0.07} rotation={[0, 0, 0]} position={[0.8, -1.19, -1.13]} />
            {/* Monitor di meja, di belakang laptop, menghadap kursi (+Z). Klik -> fokus desk */}
            <Monitor scale={1} rotation={[0, -0.15 * Math.PI, 0]} position={[0.999, -1.194, -1.2]} onClick={deskClick} {...pointer} />
            {/* Desktop interaktif (ikon proyek). Transform mock & html dari slider (useScreenTuner). */}
            <MonitorScreen />
            {/* TV di atas credenza, menghadap ke dalam ruangan */}
            <Tv scale={0.8} rotation={[0, Math.PI, 0]} position={[-0.55, -1.09, 1.3]} />
            {/* Jam dinding di atas TV (dinding depan z=1.55), menghadap -Z (ke dalam ruangan).
                Jarum berputar mengikuti jam asli. Setel y (tinggi) & scale setelah dilihat. */}
            <Clock scale={1} rotation={[0, Math.PI, 0]} position={[-0.55, -0.12, 1.5]} />
            {/* === Galeri dinding belakang (atas sofa): 2 baris x 4 kolom ===
                Menghadap +Z (default). Kolom x: -1.15 / -0.72 / -0.29 / 0.14 */}
            {/* Baris bawah (kiri->kanan): UBM transkrip, UBM sertifikat, Binus S1, foto profil */}
            <PhotoFrame image="/images/ijazah-s2-transkrip.jpg" width={0.2} height={0.28} position={[-1.15, 0.12, -1.5]} />
            <PhotoFrame image="/images/ijazah-s2.jpg" width={0.3} height={0.213} position={[-0.72, 0.12, -1.5]} />
            <PhotoFrame image="/images/ijazah-s1.jpg" width={0.3} height={0.207} position={[-0.29, 0.12, -1.5]} />
            <PhotoFrame image="/images/profile.jpg" background="#ffffff" width={0.3} height={0.39} position={[0.14, 0.12, -1.5]} />
            {/* Baris atas: 4 sertifikat TestDome */}
            <PhotoFrame image="/images/cert-javascript.jpg" width={0.26} height={0.235} position={[-1.15, 0.56, -1.5]} />
            <PhotoFrame image="/images/cert-react.jpg" width={0.26} height={0.235} position={[-0.72, 0.56, -1.5]} />
            <PhotoFrame image="/images/cert-react-redux.jpg" width={0.26} height={0.235} position={[-0.29, 0.56, -1.5]} />
            <PhotoFrame image="/images/cert-react-native.jpg" width={0.26} height={0.235} position={[0.14, 0.56, -1.5]} />
        </>
    );
};