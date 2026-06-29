# 3D Profile Website - Part 2: Textures, Walls with Holes, and a Shiny Window

Welcome back to our **3D Profile Website** tutorial!

In Part 1, we built a basic 3D room using React Three Fiber: white walls, a floor, a floating red box, and some lights. Cool… but let's be honest — it still looked like a cardboard box floating in space.

Now, it's time to give it some soul.

In this part, you'll learn how to:

- ✅ Add realistic textures to your floor and walls
- ✅ Create walls with holes for windows or doors
- ✅ Model a cool window with reflective glass
- ✅ Rebuild the room using your new components

By the end, you'll have a room that looks way closer to real life.

Let's dive in!

---

## ✨ Why Textures Matter

So far, all our objects are just flat colors.

Real-life surfaces aren't perfectly flat or evenly colored. Wood planks have grains, plaster walls have bumps, glass reflects light… This is where textures come in.

Types of textures you'll often use:

- **Color (Diffuse) Map** → the photo-realistic color detail of a surface.
- **Roughness Map** → how shiny or matte the surface looks. Black = shiny, white = matte.
- **Normal Map** → fakes small surface bumps so light behaves realistically.
- **Displacement Map** → physically pushes geometry in or out (like real bumps).
- **Ambient Occlusion Map (AO)** → simulates small shadowy crevices and details.

We'll use these to transform our boring white room into a photorealistic space.

---

## Step 1 — Download Your Textures

Let's bring your 3D scene to life with some awesome models!

For this tutorial, we'll use two free 3D assets:

- **Desk:** Adjustable Desk from Poly Pizza
- **Chair:** Gaming Chair from Free3D

✅ Download the GLB files for both objects and save them in your project under:

```
public/
  models/
    Adjustable Desk.glb
    gaming chair.glb
```

> ⚠️ **Mind the filename case.** We load this model as `/models/gaming chair.glb` (lowercase). Windows treats `Gaming Chair.glb` and `gaming chair.glb` as the same file, but Linux hosts (Vercel, Netlify, GitHub Pages) are **case-sensitive** — a capitalized filename that works locally will 404 in production. Keep the file and the `useGLTF(...)` path identical.

If your models come with texture images (like JPG or PNG files), copy those into the same `public/models` folder. This way, your app can easily load and display the textures when rendering the models.

Now you're ready to load these models into your 3D scene!

---

## Step 2 — Create a Textured Floor Component

Let's turn our white floor into beautiful wood. Create a new component:

```tsx
// src/components/Floor.tsx

import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface FloorProps {
  position?: [number, number, number]
  size?: [number, number, number]
}

export const Floor = ({
  position = [0, 0.05, 0],
  size = [3, 0.1, 3]
}: FloorProps) => {
  const [
    colorMap,
    roughnessMap,
    normalMap,
    displacementMap,
    aoMap
  ] = useTexture([
    '/textures/WoodFloor039_1K-JPG_Color.jpg',
    '/textures/WoodFloor039_1K-JPG_Roughness.jpg',
    '/textures/WoodFloor039_1K-JPG_NormalGL.jpg',
    '/textures/WoodFloor039_1K-JPG_Displacement.jpg',
    '/textures/WoodFloor039_1K-JPG_AmbientOcclusion.jpg'
  ])

  ;[
    colorMap,
    roughnessMap,
    normalMap,
    displacementMap,
    aoMap
  ].forEach(tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 1)
  })

  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={colorMap}
        roughnessMap={roughnessMap}
        normalMap={normalMap}
        displacementMap={displacementMap}
        displacementScale={0}
        aoMap={aoMap}
      />
    </mesh>
  )
}
```

### How This Works:

- `useTexture` → loads multiple images as textures.
- `RepeatWrapping` → lets the texture tile over big surfaces rather than stretching.
- `repeat.set(1, 1)` → how many times the texture repeats across the mesh surface.
- `meshStandardMaterial` → modern physically-based shading that works great with textures.

> 💡 **Tip:** Try increasing repeat to `(4, 4)` if you want smaller wooden planks.

---

## Step 3 — Create Walls with Optional Holes

A real room has windows and doors. Let's make a wall that can optionally cut holes into itself.

What's the trick? We'll:

1. Define the wall as a large rectangle shape.
2. Define holes as smaller rectangles.
3. Subtract holes from the wall shape using Three.js's powerful shape tools.
4. Extrude the shape into 3D.

Here's the code:

```tsx
// src/components/Wall.tsx
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Mesh } from 'three'
import { useTexture } from '@react-three/drei'
import type { JSX } from 'react'

// Wall extends the standard <group> props, so position / rotation / scale
// all work like any other R3F object. (We intentionally do NOT add a custom
// `rotationY` prop — rotating via the group's `rotation` prop keeps the API
// consistent with the rest of the scene.)
export type WallProps = JSX.IntrinsicElements['group'] & {
  wallSize?: [number, number]
  holeSize?: [number, number]
  holePosition?: [number, number]
}

export const Wall = ({
  wallSize = [10, 5],
  holeSize,
  holePosition = [0, 0],
  ...props
}: WallProps) => {
  const meshRef = useRef<Mesh>(null!)

  const wallGeometry = useMemo(() => {
    const [wallWidth, wallHeight] = wallSize

    // Define outer rectangle
    const shape = new THREE.Shape()
    shape.moveTo(-wallWidth / 2, -wallHeight / 2)
    shape.lineTo(wallWidth / 2, -wallHeight / 2)
    shape.lineTo(wallWidth / 2, wallHeight / 2)
    shape.lineTo(-wallWidth / 2, wallHeight / 2)
    shape.lineTo(-wallWidth / 2, -wallHeight / 2)

    // Optionally subtract a hole
    if (holeSize) {
      const [holeWidth, holeHeight] = holeSize
      const [holeX, holeY] = holePosition

      const hole = new THREE.Path()
      hole.moveTo(holeX - holeWidth / 2, holeY - holeHeight / 2)
      hole.lineTo(holeX + holeWidth / 2, holeY - holeHeight / 2)
      hole.lineTo(holeX + holeWidth / 2, holeY + holeHeight / 2)
      hole.lineTo(holeX - holeWidth / 2, holeY + holeHeight / 2)
      hole.lineTo(holeX - holeWidth / 2, holeY - holeHeight / 2)

      shape.holes.push(hole)
    }

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: false
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [wallSize, holeSize, holePosition])

  // Load plaster textures
  const [colorMap, roughnessMap, normalMap, displacementMap] = useTexture([
    '/textures/Plaster001_1K-JPG_Color.jpg',
    '/textures/Plaster001_1K-JPG_Roughness.jpg',
    '/textures/Plaster001_1K-JPG_NormalGL.jpg',
    '/textures/Plaster001_1K-JPG_Displacement.jpg'
  ])

  ;[
    colorMap,
    roughnessMap,
    normalMap,
    displacementMap
  ].forEach(tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(0.2, 0.2)
  })

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={meshRef}
        geometry={wallGeometry}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={colorMap}
          roughnessMap={roughnessMap}
          normalMap={normalMap}
          displacementMap={displacementMap}
          displacementScale={0}
          color={'white'}
        />
      </mesh>
    </group>
  )
}
```

### How This Works:

- We create a `THREE.Shape` for the wall rectangle.
- We create `THREE.Path` for the hole and subtract it.
- `ExtrudeGeometry` gives our wall thickness.
- Textures make the wall look like real plaster.

> 💡 **Try this:** comment out the hole code and watch your window disappear!

---

## Step 4 — Create a Reflective Window

A hole in a wall is just… a hole. Let's add glass!

Let's build a window with:

- a simple frame
- a reflective glass surface

Here's our component:

```tsx
// src/components/Window.tsx
import React from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'

type GroupProps = ThreeElements['group']

export interface WindowProps extends GroupProps {
  width?: number
  height?: number
  frameThickness?: number
}

export const Window: React.FC<WindowProps> = ({
  width = 1,
  height = 1,
  frameThickness = 0.05,
  ...props
}) => {
  return (
    <group {...props}>
      {/* Top, bottom, and sides of the frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameThickness]} />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh position={[0, (height + frameThickness) / 2, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameThickness]} />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh position={[0, -(height + frameThickness) / 2, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameThickness]} />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameThickness]} />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh position={[(width + frameThickness) / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameThickness]} />
        <meshStandardMaterial color={'#444444'} />
      </mesh>
      <mesh position={[(-width - frameThickness) / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameThickness]} />
        <meshStandardMaterial color={'#444444'} />
      </mesh>

      {/* Glass pane */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <MeshReflectorMaterial
          color={'#ffffff'}
          opacity={0.5}
          transparent
          mirror={0.5}
          distortion={1}
          reflectorOffset={0.2}
        />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <MeshReflectorMaterial
          color={'#ffffff'}
          opacity={0.8}
          transparent
          mirror={0.5}
          distortion={1}
          reflectorOffset={0.2}
        />
      </mesh>
    </group>
  )
}
```

### How This Works:

- We create a frame out of several small boxes.
- The `MeshReflectorMaterial` from drei adds beautiful reflections.
- Two panes are rendered facing opposite directions so the window looks right from both sides.

✅ Try tweaking:

- `mirror`
- `opacity`
- `distortion`

…for cool glass effects!

---

## Step 5 — Put It All Together

Finally, let's assemble our room. Update your `Room` component:

```tsx
import { Floor } from './Floor'
import { Wall } from './Wall'
import { Window } from './Window'

export const Room = () => {
  return (
    <>
      <Floor position={[0, -2 + 0.05, 0]} />
      <Wall wallSize={[3, 4]} position={[0, 0, -1.6]} />
      <Wall
        wallSize={[3.1, 4]}
        position={[1.5, 0, -0.05]}
        rotation={[0, 0.5 * Math.PI, 0]}
        holePosition={[0.5, 0]}
        holeSize={[1.1, 1.6]}
      />
      <Wall wallSize={[3.1, 4]} position={[-1.5, 0, -0.05]} rotation={[0, 0.5 * Math.PI, 0]} />
      <Window
        width={1}
        height={1.5}
        frameThickness={0.05}
        position={[1.55, 0, -0.55]}
        rotation={[0, 0.5 * Math.PI, 0]}
      />
      <mesh position={[0, -1 + 0.1, -1]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  )
}
```

---

## 🎉 What You Have Now

- ✅ A realistic wooden floor
- ✅ Plaster walls that look like real architecture
- ✅ Walls with customizable holes for doors or windows
- ✅ A reflective window with frame
- ✅ A modern 3D room that's ready to be expanded

Your scene has officially transformed from a blank white box into a beautiful virtual room — the perfect foundation for your interactive 3D profile website.

---

## 🚀 What's Next (Part 3)

In the next part, we'll take this even further:

- ✨ Add furniture and props (like a desk, chair, or laptop)
- ✨ Animate parts of the scene (like a spinning chair or floating objects)
- ✨ Experiment with materials, lighting moods, and even environment maps

Stay tuned — your 3D profile is about to come to life!

---

## 📦 Get the Source Code

Want to explore the full working project or customize it yourself?

👉 Check out the source code on GitHub: https://github.com/myoxine/3d-profile/tree/part2
