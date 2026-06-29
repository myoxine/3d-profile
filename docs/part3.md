# 3D Profile Website - Part 3: Bringing Your Room to Life with 3D Models and Animation

Welcome back to our **3D Profile Website** journey!

So far, we've built a beautiful virtual room with textured walls, floors, and a shiny window. But let's be real: right now it's still an empty shell.

In Part 3, we're going to furnish it with real 3D furniture and make things move!

By the end of this part, you'll have:

- ✅ A realistic gaming chair gently rocking left and right (so cool!)
- ✅ An adjustable desk sitting perfectly in the room
- ✅ A cozy, believable 3D workspace to call your own

Let's dive in.

---

## Why Add Furniture and Animation?

Your scene might look beautiful — but it's empty. A virtual room without furniture feels like an unfurnished apartment. Cold. Echoey. Lonely.

Adding models like chairs, desks, plants, and more is what makes your 3D profile website feel personal and alive.

And animation? That's the icing on the cake. Even small movements, like a gently rocking chair, make your scene feel truly alive.

---

## How We'll Do This

Here's what we're building today:

- **Gaming Chair Model** → loaded from a `.glb` file
- **Adjustable Desk Model** → loaded from a `.glb` file
- **Animated Chair Component** → rocking left and right instead of spinning endlessly
- **Room Layout** → placing all objects into our 3D space
- **Loading Indicator** → to avoid blank screens while models load

---

## Step 1 — Download Your Textures

We'll use these two objects from Poly Pizza and Free3D:

- **Desk:** Adjustable Desk
- **Chair:** Gaming Chair

Download the GLB files and save them in your project under `public/models/`.

Example folder structure:

```
public/
  models/
    Adjustable Desk.glb
    gaming chair.glb
```

Copy your models into `public/models` so they're accessible in your app.

---

## Converting GLB Models into Components

We're using the fantastic tool:

```bash
npx gltfjsx your-model.glb -t
```

This command takes your exported `.glb` 3D model and generates a fully ready-to-use React component in TypeScript.

✨ Benefits:

- Models become reusable React components
- Mesh hierarchies are preserved
- Materials are imported automatically
- Position, scale, and rotation stay intact

✅ Your models in this tutorial:

- `/models/gaming chair.glb`
- `/models/Adjustable Desk.glb`

---

## Let's Load the Gaming Chair

The code for the gaming chair looks like this (simplified):

```tsx
export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/gaming chair.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group position={[16.339, -7.043, 105.163]} scale={287.601}>
        <mesh geometry={nodes.Group21.geometry} material={materials.lambert112SG} />
        {/* many more meshes */}
      </group>
    </group>
  )
}
```

> ⚠️ **Note:** Your chair model is massive, so we'll scale it down dramatically when we add it to the scene.

---

## Animating the Chair

Instead of spinning endlessly like a carnival ride, let's make our gaming chair rock left and right gently, just like a real chair when you fidget around.

We'll use a sine wave to rotate the chair smoothly left and right.

✅ Benefits of rocking motion:

- Looks more natural
- Adds life to the scene
- Easy to control speed and range

### The AnimatedSpinningChair Component

Here's your TypeScript code to make it happen:

```tsx
// src/components/AnimatedSpinningChair.tsx

import React, { useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { Model as GamingChair } from './GamingChair'
import type { JSX } from 'react'

export const AnimatedSpinningChair: React.FC<JSX.IntrinsicElements['group']> = (props) => {
  const pivotRef = useRef<Group>(null)
  const chairScale = 1.2 / 575.2021484375

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const maxAngle = 0.3 // ~17 degrees
    const speed = 1

    // Rock left and right in a sine wave
    const angle = Math.sin(time * speed) * maxAngle

    if (pivotRef.current) {
      pivotRef.current.rotation.y = angle
    }
  })

  return (
    <group {...props}>
      {/* Outer group for positioning */}
      <group ref={pivotRef} position={[0, 0, 0.24]}>
        {/* Offset the model back relative to pivot point */}
        <GamingChair
          position={[0, 0, -0.24]}
          scale={[chairScale, chairScale, chairScale]}
        />
      </group>
    </group>
  )
}
```

### How the Animation Works

Instead of spinning forever like this:

```tsx
pivotRef.current.rotation.y += delta * 0.5
```

…we gently rock left and right like so:

```tsx
pivotRef.current.rotation.y = Math.sin(time * speed) * maxAngle
```

- `speed` → controls how fast the rocking motion is
- `maxAngle` → sets how far the chair rocks to each side

A gentle sway makes it feel alive without making your visitors seasick. 😉

> 🔄 **Evolution note (final code).** In the finished project this rocking animation is **disabled** — the `useFrame` rotation is commented out and the chair sits still. Once the room filled up with people, a desktop you focus the camera on, and click-to-focus navigation (Parts 7–9), a perpetually swaying chair became a distraction rather than a delight. The component (`AnimatedSpinningChair` → `GamingChair`) is kept exactly as below; only the one rotation line is commented out. Re-enable it any time by uncommenting `pivotRef.current.rotation.y = angle`.

---

## Loading the Adjustable Desk

Your adjustable desk comes in as another gltfjsx component. Example usage:

```tsx
import { Model as Desk } from './Desk'

<Desk
  scale={[deskScale, deskScale, deskScale]}
  rotation={[0, -0.5 * Math.PI, 0]}
  position={[0.75, -2 + 0.1, -1.15]}
/>
```

---

## Assembling the Full Room

Here's the full `Room` component with:

- Walls and window
- Floor
- Desk
- Animated gaming chair

👇 Copy this into your `Room.tsx`:

```tsx
// src/components/Room.tsx

import { Floor } from './Floor'
import { Wall } from './Wall'
import { Window } from './Window'
import { Model as Desk } from './Desk'
import { AnimatedSpinningChair } from './AnimatedSpinningChair'

export const Room = () => {
  const deskScale = 1.5 / 2

  return (
    <>
      <Floor position={[0, -2 + 0.05, 0]} />

      {/* Back wall */}
      <Wall wallSize={[3, 4]} position={[0, 0, -1.6]} />

      {/* Right wall with window hole */}
      <Wall
        wallSize={[3.1, 4]}
        position={[1.5, 0, -0.05]}
        rotation={[0, 0.5 * Math.PI, 0]}
        holePosition={[0.5, -0.2]}
        holeSize={[1.1, 1.6]}
      />

      {/* Left wall */}
      <Wall
        wallSize={[3.1, 4]}
        position={[-1.5, 0, -0.05]}
        rotation={[0, 0.5 * Math.PI, 0]}
      />

      {/* Window */}
      <Window
        width={1}
        height={1.5}
        frameThickness={0.05}
        position={[1.55, -0.2, -0.55]}
        rotation={[0, 0.5 * Math.PI, 0]}
      />

      {/* Desk */}
      <Desk
        scale={[deskScale, deskScale, deskScale]}
        rotation={[0, -0.5 * Math.PI, 0]}
        position={[0.75, -2 + 0.1, -1.15]}
      />

      {/* Rocking gaming chair */}
      <AnimatedSpinningChair
        position={[0.55, -2 + 0.7, -0.2]}
        rotation={[0, -Math.PI, 0]}
      />
    </>
  )
}
```

---

## Add a Loading Indicator

Don't leave users staring at a blank screen. Let's add a friendly loading bar!

```tsx
// src/components/Loader.tsx

import { Html, useProgress } from '@react-three/drei'

export function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div style={{
        background: '#222',
        padding: '10px 20px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'sans-serif',
      }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}
```

This floats text over your canvas like: `Loading… 53%`

Finally, integrate your `Room` and `Loader`:

```tsx
// src/App.tsx

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Room } from './components/Room'
import { Loader } from './components/Loader'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 3]} intensity={1} castShadow />
        <OrbitControls />
        <Suspense fallback={<Loader />}>
          <Room />
        </Suspense>
      </Canvas>
    </div>
  )
}
```

> 🎥 We keep the **same camera** (`position={[0, 2, 1]}`, `fov={60}`) and the `OrbitControls` + lights from Parts 1–2 — Part 3 only *adds* the `Suspense` + `Loader` so the screen isn't blank while the GLB models stream in.

✅ This ensures:

- Loader appears while GLTF models load
- Room shows only when ready
- Smooth experience for your visitors

---

## ✨ What You've Built

- ✅ A stylish 3D room with real furniture
- ✅ A gaming chair rocking gently left and right
- ✅ A cozy virtual workspace perfect for your portfolio

Your 3D website is no longer just a white box — it's transforming into your own personal space.

---

## 🚀 Next Up…

In the next part, we'll:

- Explore lighting moods for different atmospheres
- Add environment maps for ultra-realistic reflections
- Make objects clickable for interactivity

Your 3D profile website is getting closer to becoming a fully immersive experience!

---

## 📦 Full Source Code

👉 Check out the full project here: https://github.com/myoxine/3d-profile/tree/part3

See the `part3` branch for the latest code.
