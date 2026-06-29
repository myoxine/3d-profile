# 3D Profile Website - Part 4: Doors, Ceilings & Setting the Mood with Light

Welcome back to our **3D Profile Website** journey!

By now, you have a virtual room with walls, a floor, a shiny window, and real 3D furniture. It's starting to look awesome — but it still feels a bit empty and exposed.

In Part 4, we're going to make your room feel like a real architectural space by adding:

- ✅ A realistic 3D door with frame and hinges
- ✅ A modern ceiling to enclose the room
- ✅ An HDRI environment map for beautiful lighting and reflections
- ✅ Directional light to cast realistic shadows
- ✅ Orbit controls so visitors can explore your space
- ✅ Proper credits for all the amazing free assets we're using

By the end of this tutorial, your 3D website will feel like a real room — no longer just floating in a blank void!

Let's dive in.

---

## Why Doors, Ceilings & Lighting Matter

Think about how a real room feels:

- **Doors** create a sense of scale and purpose. They connect spaces.
- **Ceilings** trap the light and make shadows look believable. Without a ceiling, your space feels like an open diorama.
- **HDRI lighting** creates reflections and global illumination that pure lights can't easily replicate.
- **Directional lights** produce shadows that give depth and realism.
- **Interactive controls** let users explore your scene from any angle.

These details are what transform your scene from "just a 3D model" into a virtual experience.

---

## Step 1 — Add the Door Model

We're using this free door model:

👉 Single Door with Molds, Frame, Handle and Hinges on CGTrader

- **License:** Free for personal and commercial use (check CGTrader's terms)
- **Format:** `.glb`
- **Details:** This door comes complete with frames, handles, and hinges for realism.

Download the GLB file and save it in your project under `public/models/`.

### Converting the Door to a Component

Run this command:

```bash
npx gltfjsx Door1_001.glb -t
```

It generates a React component for your door, preserving all meshes and materials. Your final code looks like this (simplified):

```tsx
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useLayoutEffect } from 'react'
import type { GLTF } from 'three-stdlib'
import type { JSX } from 'react'

type GLTFResult = GLTF & {
  nodes: {
    Cube157: THREE.Mesh
    Cube157_1: THREE.Mesh
    Cube157_2: THREE.Mesh
  }
  materials: {
    Door_colors: THREE.MeshStandardMaterial
    ['Material.001']: THREE.MeshStandardMaterial
    Hinge: THREE.MeshStandardMaterial
  }
}

export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials, scene } = useGLTF('/models/uploads_files_3300784_Door1_001.glb') as unknown as GLTFResult

  useLayoutEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      box.getSize(size)
      console.log('Model Door Size:', size)
    }
  }, [scene])

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Cube157.geometry} material={materials.Door_colors} />
      <mesh geometry={nodes.Cube157_1.geometry} material={materials['Material.001']} />
      <mesh geometry={nodes.Cube157_2.geometry} material={materials.Hinge} />
    </group>
  )
}

useGLTF.preload('/models/uploads_files_3300784_Door1_001.glb')
```

### Adding the Wall with Door to Your Room

Place your door inside a wall's hole:

```tsx
...
import { Model as Door } from './Door'

export const Room = () => {
  const doorScale = 2.5 / 2.138395843336184
  ...
  return (
    <>
      ...
      <Wall wallSize={[3.2, 4]} position={[0, 0, 1.55]} holePosition={[-0.75, -0.65]} holeSize={[0.99, 2.5]} />
      <Door
        scale={doorScale}
        rotation={[0, 0.5 * Math.PI, 0]}
        position={[-0.75, -1.9, 1.55]}
      />
      ...
    </>
  )
}
```

Boom — you have a realistic 3D door with hinges!

> 🔄 **Evolution note (final code).** Two things changed later. (1) The `useLayoutEffect` with `console.log('Model Door Size')` above is **debug scaffolding** — handy while you dial in the scale, but remove it before shipping (we clean it up in Part 10). (2) This door's baked `Door_colors` texture rendered as a distracting woven/grid pattern under compression, so in the final project we **drop the glTF materials and assign plain inline materials instead** — a warm off-white panel and near-black metal for the handle and hinges:
>
> ```tsx
> <mesh geometry={nodes.Cube157.geometry} castShadow receiveShadow>
>   <meshStandardMaterial color="#d8d3c8" roughness={0.8} metalness={0} />
> </mesh>
> <mesh geometry={nodes.Cube157_1.geometry} castShadow receiveShadow>
>   <meshStandardMaterial color="#141414" roughness={0.4} metalness={0.6} />
> </mesh>
> <mesh geometry={nodes.Cube157_2.geometry} castShadow receiveShadow>
>   <meshStandardMaterial color="#141414" roughness={0.4} metalness={0.6} />
> </mesh>
> ```

---

## Step 2 — Add a Modern Ceiling

A ceiling is critical for realism. It gives your space a sense of enclosure and helps catch shadows from lights above. Create a new file:

```tsx
// src/components/Ceiling.tsx
import type { JSX } from "react"

type CeilingProps = JSX.IntrinsicElements['group'] & {
  size?: [number, number]
}

export function Ceiling({ size, ...props }: CeilingProps) {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}
```

Add it to the room:

```tsx
<Ceiling
  size={[3, 3]}
  position={[0, 1.9, 0]}
  rotation={[Math.PI * 0.5, 0, 0]}
/>
```

---

## Step 3 — Add HDRI Lighting

HDRIs are high dynamic range images that wrap around your scene and create beautiful reflections and global illumination.

We're using this HDRI:

👉 Dikhololo Sunset on Poly Haven

- **License:** CC0 (public domain) — free for all uses
- **Vibes:** Warm sunset glow, perfect for a cozy workspace

Download the HDR file and save it in your project under `public/hdri/`.

Then add the HDRI to your canvas:

```tsx
...
import { Environment } from '@react-three/drei'

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <Suspense fallback={<Loader />}>
          <Environment
            files="/hdri/dikhololo_sunset_4k.hdr"
            background
            environmentIntensity={0.3}
          />
          ...
        </Suspense>
      </Canvas>
    </div>
  );
}
```

This instantly:

- ✅ Adds global ambient light
- ✅ Generates realistic reflections on materials
- ✅ Makes your space feel alive

> 🔄 **Evolution note (final code).** We load the **4k** HDRI here for the nicest preview, but a 4k `.hdr` is heavy (several MB). In the final project — once the page weight became a real concern (Part 10) — we switch to the **1k** version, `dikhololo_sunset_1k.hdr`. For a room this size, lit mostly by our own lamps, the 1k environment is visually indistinguishable and loads far faster. If you're optimizing, grab the 1k download from Poly Haven and update the `files` path.

---

## Step 4 — Add Directional Lighting

While HDRI creates soft global light, it doesn't cast shadows. Add a directional light for sun-like rays and shadows:

```tsx
<directionalLight
  color="#ffffff"
  intensity={0.5}
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
```

✅ This provides:

- Sharp shadows
- Directional sunlight effect

---

## Step 5 — Complete Room Code

Here's your updated `Room.tsx`:

```tsx
import { Floor } from './Floor'
import { Wall } from './Wall'
import { Window } from './Window'
import { Model as Desk } from './Desk'
import { AnimatedSpinningChair } from './AnimatedSpinningChair'
import { Ceiling } from './Ceiling'
import { Model as Door } from './Door'

export const Room = () => {
  const deskScale = 1.5 / 2
  const doorScale = 2.5 / 2.138395843336184

  return (
    <>
      <Floor position={[0, -2 + 0.05, 0]} />

      {/* Walls */}
      <Wall wallSize={[3, 4]} position={[0, 0, -1.55]} />
      <Wall wallSize={[3.2, 4]} position={[1.55, 0, 0]} rotation={[0, 0.5 * Math.PI, 0]} holePosition={[0.54, -0.2]} holeSize={[1.1, 1.6]} />
      <Wall wallSize={[3.2, 4]} position={[-1.55, 0, 0]} rotation={[0, 0.5 * Math.PI, 0]} />
      <Wall wallSize={[3.2, 4]} position={[0, 0, 1.55]} holePosition={[-0.75, -0.65]} holeSize={[0.99, 2.5]} />

      {/* Window */}
      <Window
        width={1}
        height={1.5}
        frameThickness={0.05}
        position={[1.55, -0.2, -0.54]}
        rotation={[0, 0.5 * Math.PI, 0]}
      />

      {/* Door */}
      <Door
        scale={doorScale}
        rotation={[0, 0.5 * Math.PI, 0]}
        position={[-0.75, -1.9, 1.55]}
      />

      {/* Desk */}
      <Desk
        scale={[deskScale, deskScale, deskScale]}
        rotation={[0, -0.5 * Math.PI, 0]}
        position={[0.75, -2 + 0.1, -1.15]}
      />

      {/* Ceiling */}
      <Ceiling
        size={[3, 3]}
        position={[0, 1.9, 0]}
        rotation={[0.5 * Math.PI, 0, 0]}
      />

      {/* Animated rocking chair */}
      <AnimatedSpinningChair
        position={[0.55, -2 + 0.7, -0.2]}
        rotation={[0, -Math.PI, 0]}
      />
    </>
  )
}
```

And your updated `App.tsx`:

```tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Room } from './components/Room'
import { Loader } from './components/Loader'
import { Environment, OrbitControls } from '@react-three/drei'

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <directionalLight
          color={"#ffffff"}
          intensity={0.5}
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
        <Suspense fallback={<Loader />}>
          <Environment files="/hdri/dikhololo_sunset_4k.hdr" background environmentIntensity={0.3} />
          <OrbitControls />
          <Room />
        </Suspense>
      </Canvas>
    </div>
  )
}
```

---

## What You've Built

- ✅ A fully enclosed room with a door and ceiling
- ✅ Natural HDRI lighting for realism
- ✅ Shadows from directional light
- ✅ Smooth user exploration with OrbitControls
- ✅ A cozy environment perfect for a portfolio or interactive website

Your 3D website is evolving from a collection of models into a real virtual space.

---

## Coming Up Next… (Part 5)

In the next part we'll make the room **interactive and atmospheric**:

- A central lighting "brain" any component can read and control
- **Clickable 3D light switches** that physically flip
- An LED ceiling, a standing lamp, and a table lamp that emit real light
- Automatic **day / night** that follows your system's dark mode

(Sound effects and online deployment come later in the series — Parts 12 and 13.)

Your 3D profile website is on its way to becoming a stunning interactive portfolio!

---

## 📦 Full Source Code

👉 Explore the complete code for this part on the [`part4` branch](https://github.com/myoxine/3d-profile/tree/part4).

The `part4` branch contains:

- The updated Room component
- The Door and Ceiling components
- Lighting and HDRI setup
- All code shown in this tutorial

Feel free to clone it, explore it, and customize it for your own 3D website!
