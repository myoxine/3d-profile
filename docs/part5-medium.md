# Building a 3D Profile Website — Part 5: Interactive Lighting & Setting the Mood

### Make your React Three Fiber room come alive with clickable switches, glowing lamps, an LED ceiling, and automatic day/night.

*Suggested tags: React, Three.js, WebGL, React Three Fiber, Frontend*

![Add a cover image here: a screenshot of your room at night with the lamps glowing]

---

Welcome back to our **3D Profile Website** journey!

By now you have a fully enclosed room — walls, a floor, a shiny window, a door, a ceiling, real furniture, and beautiful HDRI lighting. It already feels like a real space. But it's still *static*: the lights never change, and visitors can only look, not touch.

In **Part 5**, we make the room come alive. This part is all about **light and interactivity**:

- A central lighting "brain" any component can read and control
- **Interactive 3D light switches** — click and the rocker physically flips
- A **modern LED ceiling** that turns on and off
- A **standing lamp** and a **table lamp** that emit real, warm light
- **Day / night mood** that follows your computer's dark mode automatically
- A **Bloom** glow effect so light sources actually look like they're glowing
- Cozy props: a sofa, an air conditioner, a credenza, and a plant

By the end, visitors can walk in, flip the switches, and watch the room respond.

Let's dive in.

---

## Why Interactive Lighting Matters

A 3D scene with baked, unchanging light is just a picture you can orbit around. The moment a user can **change** something — flip a switch, watch a lamp glow, see the room slide from day to night — it becomes an *experience*.

Three ideas drive this part:

- **State, not props.** Lighting touches many components (switches, lamps, the environment). Threading booleans through props gets messy fast, so we centralize the on/off state.
- **Emissive + Bloom = believable light.** A light source that doesn't visibly glow looks fake. We make bulbs *emissive* and add Bloom so the bright parts bleed light.
- **Respect the user's context.** Instead of guessing day or night, we read the OS dark-mode setting so the room matches the user's environment.

---

## Step 1 — Install Postprocessing

We'll use Bloom from `@react-three/postprocessing`:

```bash
yarn add @react-three/postprocessing
# or: npm install @react-three/postprocessing
```

---

## Step 2 — A Central Lighting "Brain" (Context)

The switches and the lamps live far apart in the component tree, so we share their state through a React Context. It tracks three lamps (`ceiling`, `standing`, `table`) and the time of day.

The clever bit: **`timeOfDay` follows the computer's dark mode** via the `prefers-color-scheme` media query, and updates live when the user changes their theme.

```tsx
// src/components/lighting/LightingContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type TimeOfDay = 'day' | 'night'

export interface LightingState {
  ceilingOn: boolean
  standingOn: boolean
  tableOn: boolean
  timeOfDay: TimeOfDay
  toggleCeiling: () => void
  toggleStanding: () => void
  toggleTable: () => void
}

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

function getSystemTimeOfDay(): TimeOfDay {
  if (typeof window === 'undefined' || !window.matchMedia) return 'day'
  return window.matchMedia(DARK_MODE_QUERY).matches ? 'night' : 'day'
}

const LightingContext = createContext<LightingState | null>(null)

export function LightingProvider({ children }: { children: ReactNode }) {
  // Default: all lamps off
  const [ceilingOn, setCeiling] = useState(false)
  const [standingOn, setStanding] = useState(false)
  const [tableOn, setTable] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getSystemTimeOfDay)

  // Follow the OS dark mode, live.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(DARK_MODE_QUERY)
    const handler = (e: MediaQueryListEvent) =>
      setTimeOfDay(e.matches ? 'night' : 'day')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const value = useMemo<LightingState>(
    () => ({
      ceilingOn, standingOn, tableOn, timeOfDay,
      toggleCeiling: () => setCeiling((v) => !v),
      toggleStanding: () => setStanding((v) => !v),
      toggleTable: () => setTable((v) => !v),
    }),
    [ceilingOn, standingOn, tableOn, timeOfDay]
  )

  return <LightingContext.Provider value={value}>{children}</LightingContext.Provider>
}

export function useLighting() {
  const ctx = useContext(LightingContext)
  if (!ctx) throw new Error('useLighting must be used inside a <LightingProvider>')
  return ctx
}
```

**Tip:** put the provider **inside** the `<Canvas>` so every 3D component (switches, lamps, environment) can call `useLighting()`.

---

## Step 3 — A Day / Night Environment

This component reads `timeOfDay` and dials the HDRI + sun up (day) or way down (night), so at night the room depends on the lamps.

```tsx
// src/components/SceneEnvironment.tsx
import { Environment } from '@react-three/drei'
import { useLighting } from './lighting/LightingContext'

export function SceneEnvironment() {
  const { timeOfDay } = useLighting()
  const isDay = timeOfDay === 'day'

  return (
    <>
      <Environment
        files="/hdri/dikhololo_sunset_4k.hdr"
        background
        environmentIntensity={isDay ? 0.3 : 0.02}
        backgroundIntensity={isDay ? 1 : 0.05}
      />
      <directionalLight
        color={isDay ? '#ffffff' : '#6677aa'}
        intensity={isDay ? 0.5 : 0.03}
        position={[3, 1, -2]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
    </>
  )
}
```

---

## Step 4 — Wire Up the App (Provider + Bloom)

Wrap the scene in the provider and add the Bloom pass. Bloom makes anything brighter than `luminanceThreshold` glow — perfect for emissive bulbs and LEDs.

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Room } from './components/Room'
import { Loader } from './components/Loader'
import { SceneEnvironment } from './components/SceneEnvironment'
import { LightingProvider } from './components/lighting/LightingContext'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <LightingProvider>
          <Suspense fallback={<Loader />}>
            <SceneEnvironment />
            <OrbitControls />
            <Room />
          </Suspense>

          <EffectComposer>
            <Bloom
              intensity={0.32}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
          </EffectComposer>
        </LightingProvider>
      </Canvas>
    </div>
  )
}
```

**Key rule:** any mesh you want to glow should use `toneMapped={false}` on its emissive material, with `emissiveIntensity` above the Bloom threshold.

---

## Step 5 — Interactive Light Switches

We use a switch-panel GLB, but keep only the **single-switch** plate as a static *frame*, then add our own **rocker button** on top. When clicked, **only the button flips** (the frame stays put) — a smooth animation driven by `useFrame`.

```tsx
// src/components/LightSwitch.tsx (core idea)
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLighting } from './lighting/LightingContext'

const FLIP = 0.22 // tilt angle for on vs off

function SingleSwitch({ on, onToggle, ...props }) {
  const { nodes, materials } = useGLTF('/models/switches.glb')
  const pivot = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Animate the rocker toward its on/off position.
  useFrame(() => {
    if (!pivot.current) return
    const target = on ? FLIP : -FLIP
    pivot.current.rotation.x = THREE.MathUtils.lerp(pivot.current.rotation.x, target, 0.25)
  })

  return (
    <group {...props}>
      {/* Static frame: the GLB plate */}
      <mesh geometry={nodes['1'].geometry} material={materials.BaseMaterial} castShadow />

      {/* The button — the only part that flips */}
      <group ref={pivot} position={[0, 0.008, 0]}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
          scale={hovered ? 1.04 : 1}
        >
          <boxGeometry args={[0.058, 0.014, 0.058]} />
          <meshStandardMaterial color="#f3f3f3" emissive="#0a1f7a" emissiveIntensity={on ? 0.9 : 0} />
        </mesh>
      </group>
    </group>
  )
}

export function LightSwitch(props) {
  const { ceilingOn, standingOn, tableOn,
          toggleCeiling, toggleStanding, toggleTable } = useLighting()
  const spacing = 0.11
  return (
    <group {...props}>
      <SingleSwitch on={ceilingOn}  onToggle={toggleCeiling}  position={[-spacing, 0, 0]} />
      <SingleSwitch on={standingOn} onToggle={toggleStanding} position={[0, 0, 0]} />
      <SingleSwitch on={tableOn}    onToggle={toggleTable}    position={[spacing, 0, 0]} />
    </group>
  )
}
```

Three switches sit side by side next to the door — one per light.

---

## Step 6 — A Modern LED Ceiling

Instead of a hanging lamp, we give the ceiling a recessed **LED strip** (a glowing square) plus a real `pointLight`, both controlled by `ceilingOn`.

```tsx
// src/components/Ceiling.tsx (core idea)
import { useLighting } from './lighting/LightingContext'

export function Ceiling({ size = [3, 3], color = '#dCEBFF', ...props }) {
  const { ceilingOn } = useLighting()
  const [w, h] = size
  const halfX = w / 2 - 0.4
  const halfY = h / 2 - 0.4
  const led = (
    <meshStandardMaterial color={color} emissive={color}
      emissiveIntensity={ceilingOn ? 2 : 0} toneMapped={false} />
  )

  return (
    <group {...props}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* LED frame (4 strips) */}
      <mesh position={[0,  halfY, 0.011]}><boxGeometry args={[halfX * 2 + 0.05, 0.05, 0.02]} />{led}</mesh>
      <mesh position={[0, -halfY, 0.011]}><boxGeometry args={[halfX * 2 + 0.05, 0.05, 0.02]} />{led}</mesh>
      <mesh position={[ halfX, 0, 0.011]}><boxGeometry args={[0.05, halfY * 2 - 0.05, 0.02]} />{led}</mesh>
      <mesh position={[-halfX, 0, 0.011]}><boxGeometry args={[0.05, halfY * 2 - 0.05, 0.02]} />{led}</mesh>

      {ceilingOn && (
        <pointLight position={[0, 0, 0.25]} color={color} intensity={5} distance={9} decay={2} castShadow />
      )}
    </group>
  )
}
```

---

## Step 7 — Lamps That Actually Glow

Both the **standing lamp** and the **table lamp** are GLB models. The recipe is identical:

1. Replace the bulb mesh's material with an **emissive** one (so it glows and Bloom catches it).
2. Add a real **`pointLight`** that only renders when the lamp is on.
3. Read the matching switch state from the context.

```tsx
// src/components/StandingLamp.tsx (core idea)
import { useGLTF } from '@react-three/drei'
import { useLighting } from './lighting/LightingContext'

export function StandingLamp({ color = '#ffdca8', ...props }) {
  const { nodes, materials } = useGLTF('/models/lamp.glb')
  const { standingOn } = useLighting()

  return (
    <group {...props} dispose={null}>
      <group position={[0, 1.746, 0]} scale={0.12}>
        <mesh geometry={nodes.Lamp_stand.geometry} material={materials['Lamp stand']} castShadow />
        <mesh geometry={nodes.Lamphead.geometry}  material={materials.Lamphead} castShadow />
        {/* Bulb: swap in an emissive material */}
        <mesh geometry={nodes.Lightbulb.geometry} position={[0, -3.036, 0]} rotation={[Math.PI / 2, 0, 0]} scale={6.789}>
          <meshStandardMaterial color={color} emissive={color}
            emissiveIntensity={standingOn ? 1.2 : 0} toneMapped={false} />
        </mesh>
      </group>

      {standingOn && (
        <pointLight position={[0, 1.35, 0]} color={color} intensity={1.6} distance={7} decay={2} castShadow />
      )}
    </group>
  )
}
```

The **table lamp** follows the same pattern with `tableOn`, sitting on top of the credenza.

**Tuning brightness.** Real-time lighting is all about taste. If a lamp is too bright, lower its `pointLight` `intensity` and the bulb's `emissiveIntensity`. If the glow is too strong, raise the Bloom `luminanceThreshold` or lower its `intensity`.

---

## Step 8 — Furnish the Room

To make the space feel lived-in, drop in a few more GLB props. Each is converted with `gltfjsx` and placed in `Room.tsx`:

```tsx
// src/components/Room.tsx (excerpt)
<Sofa scale={0.4} position={[-0.6, -1.9, -1.0]} />
<StandingLamp position={[-1.3, -1.9, -1.3]} />
<AirConditioner position={[-0.5, 1.2, -1.4]} />     {/* back wall, above the sofa */}
<Credenza position={[-0.8, -1.9, 1.32]} />
<Plant position={[0.1, -1.9, 1.3]} scale={[0.7, 0.7, 0.7]} />
<TableLamp position={[-1.25, -1.09, 1.32]} />        {/* on top of the credenza */}
<LightSwitch position={[0.2, -0.7, 1.49]} />         {/* next to the door */}
```

**Performance tip:** watch your `.glb` file sizes! A single 90 MB sofa will make your site crawl — and choke your `git push`. Prefer low-poly models, or optimize with Draco compression / texture resizing. In this project, swapping one bloated 90 MB model for a 20 KB low-poly couch made a massive difference.

---

## What You've Built

- A central lighting system any component can read and control
- Clickable 3D switches with a satisfying rocker flip
- An LED ceiling, a standing lamp, and a table lamp that emit real light
- Automatic day / night that follows the user's system theme
- Bloom glow that sells the light sources
- A cozy, furnished room — sofa, AC, credenza, plant

Your 3D website is no longer just a model you orbit around — it's a little space people can **interact with**.

---

## What's Next (Part 6)

The room is interactive — next we make it personal, filling it with your content:

- A laptop and a monitor on the desk
- A TV you can click to play a YouTube video right on the screen
- A reusable PhotoFrame component and a gallery wall of your photo, diplomas, and certificates
- A practical workflow to turn PDFs and images into web-ready textures

Your 3D profile website is well on its way to becoming a stunning interactive portfolio.

---

## Asset Credits

All 3D assets are free models — check each asset's license before commercial use.

- Sofa (Couch Small) — https://poly.pizza/m/ZOPP3KzNIk
- Standing lamp — https://www.cgtrader.com/items/3727623/download-page
- Table lamp — https://www.cgtrader.com/items/7091263/download-page
- Air conditioner — https://www.cgtrader.com/items/5800337/download-page
- Credenza (accent chest) — https://www.cgtrader.com/free-3d-models/furniture/kitchen-cabinet/accent-chest
- Plant (Cordyline glauca) — https://www.cgtrader.com/items/6315999/download-page
- HDRI: Dikhololo Sunset — https://polyhaven.com/ (CC0)

## Tools & Libraries

- React Three Fiber — https://r3f.docs.pmnd.rs/
- drei — https://github.com/pmndrs/drei
- react-postprocessing — https://github.com/pmndrs/react-postprocessing
- gltfjsx (turn GLB into React components) — https://github.com/pmndrs/gltfjsx

*If this helped, give it a few claps and follow for Part 6.*
