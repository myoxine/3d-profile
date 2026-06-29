# 3D Profile Website - Part 1: Set Up & Build Your First 3D Room with React Three Fiber

Welcome to the **3D Profile Website** tutorial series!

In this first part, we're going to create the foundation of your very own interactive 3D website — starting with a simple but stylish virtual room using **React Three Fiber** (a React renderer for Three.js) and **Vite** for blazing fast development.

Whether you're new to 3D or just want to build a portfolio that actually feels alive, you're in the right place.

In this first part, we'll:

- ✅ Set up a Vite + React + TypeScript project
- ✅ Install and configure React Three Fiber and Drei
- ✅ Create a basic 3D room (floor, walls, box)
- ✅ Enable orbit camera controls

---

## Why Start With a Simple Room

Before furniture, lighting moods, and clickable interactivity, you need a stage to put them on. A 3D scene is just a few core pieces — a **canvas**, some **lights**, a **camera**, and **meshes** — and the fastest way to understand how they fit together is to build the smallest possible room and orbit around it. Everything in the next twelve parts hangs off this foundation, so we keep it deliberately minimal: get the loop running, see a box cast a shadow, and you're ready to grow it.

---

## Step 1 — Project Setup

Let's create a new Vite project using the React + TypeScript template.

Open your terminal and run:

```bash
npm create vite@latest 3d-profile --template react-ts
cd 3d-profile
npm install
```

Now, install the 3D libraries we'll need:

```bash
npm install three @react-three/fiber @react-three/drei
```

Then start the dev server:

```bash
npm run dev
```

Head over to http://localhost:5173 — your app is live.

---

## Step 2 — Create a 3D Scene with React Three Fiber

Let's clean up the homepage and drop in a 3D canvas. Let's update our `App.tsx` to show a simple 3D canvas with some lights and camera controls:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 3]} intensity={1} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
```

This gives you a 3D canvas with basic lighting and interactive orbit controls.

> 💡 **Everything inside `<Canvas>` is a Three.js object described as JSX.** `<mesh>`, `<ambientLight>`, `<OrbitControls>` — React Three Fiber turns each tag into the matching Three.js class, so you compose a 3D scene the same way you compose a UI.

---

## Step 3 — Add Simple Lighting

Lighting is one of the most important parts of 3D scenes — it helps define shape, depth, and atmosphere.

In this setup, we use two basic types of lights:

### ambientLight

A soft, global light that lights up everything equally. It keeps your scene from being completely dark.

```tsx
<ambientLight intensity={0.5} />
```

### directionalLight

A light that acts like sunlight, shining in a specific direction. Great for creating shadows and highlights.

```tsx
<directionalLight position={[0, 2, 3]} intensity={1} />
```

These two combined give a nice soft light setup, perfect for previewing objects in a neutral environment.

---

## Step 4 — Build a Simple Room

Now let's create a minimal room — just a floor, some walls, and a box that will later become furniture, a desk, or whatever you want it to be!

Create a new component:

```tsx
export const Room = () => {
  return (
    <>
      {/* Floor */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2, -1.55]} receiveShadow>
        <boxGeometry args={[3, 4, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-1.55, 2, -0.05]} receiveShadow>
        <boxGeometry args={[0.1, 4, 3.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[1.55, 2, -0.05]} receiveShadow>
        <boxGeometry args={[0.1, 4, 3.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* A Box (Maybe a chair or table?) */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
};
```

Then import and use it inside `App.tsx`:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Room } from './components/Room';

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 2, 3]} intensity={1} castShadow />
        <OrbitControls />
        <Room />
      </Canvas>
    </div>
  );
}
```

---

## Step 5 — Add Lighting with Shadows

So far, we've added some simple lighting. But to make your scene look realistic, you also need **shadows**.

Shadows are what give your 3D objects a sense of depth and weight. Without them, everything looks like it's floating in space!

Here's how to add lighting with shadows in React Three Fiber.

> ⚠️ **Shadows are opt-in three times.** Nothing casts a shadow until the canvas (`shadows`), the light (`castShadow`), *and* the mesh (`castShadow` / `receiveShadow`) all agree. Miss any one and you'll wonder why the floor stays flat.

### 1. Enable Shadows in the Canvas

First, you need to tell your `<Canvas />` to support shadows. Update your Canvas like this:

```tsx
<Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
  ...
</Canvas>
```

### 2. Configure the Light to Cast Shadows

Next, your light source must be able to cast shadows. For example, with a directional light:

```tsx
<directionalLight
  position={[0, 2, 3]}
  intensity={1}
  castShadow
  shadow-mapSize-width={1024}
  shadow-mapSize-height={1024}
  shadow-camera-far={20}
  shadow-camera-left={-10}
  shadow-camera-right={10}
  shadow-camera-top={10}
  shadow-camera-bottom={-10}
/>
```

- `castShadow` → tells the light to generate shadows.
- `shadow-mapSize` → controls shadow quality (higher = sharper shadows).
- The camera bounds define the area where shadows will appear.

### 3. Set Objects to Cast or Receive Shadows

Objects that cast shadows must have `castShadow` set to true:

```tsx
<mesh castShadow position={[0, 0.55, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="orange" />
</mesh>
```

Objects that should show shadows falling onto them need `receiveShadow`:

```tsx
<mesh receiveShadow position={[0, 0, 0]}>
  <boxGeometry args={[10, 0.1, 10]} />
  <meshStandardMaterial color="#ffffff" />
</mesh>
```

---

## Lessons Learned in Part 1

- **A 3D scene is four pieces.** A `<Canvas>`, lights, a camera, and meshes — once those click into place, everything else is composition.
- **`<Canvas shadows>` is opt-in, and so is every shadow.** The renderer, each light (`castShadow`), and each mesh (`castShadow` / `receiveShadow`) must all agree before a shadow appears.
- **Two lights go a long way.** A soft `ambientLight` keeps nothing pure-black; a `directionalLight` gives shape and a sun-like shadow.
- **`OrbitControls` is the fastest way to *see* your scene** while you build — we'll trade it for animated camera moves much later (Part 8).
- It looks simple now, but this minimal room is the canvas for your future 3D profile website.

---

## What's Next (Part 2)

Right now everything is flat color and a floating box. In the next part we give the room some soul:

- 🪵 **Realistic textures** on the floor and walls (color, roughness, normal, AO maps)
- 🧱 **Walls with holes** for windows and doors, built with `ExtrudeGeometry`
- 🪟 A **reflective glass window** with a frame
- 🛠️ Rebuilding the room out of reusable components

Stay tuned — your cardboard box is about to become a real space!

---

## Asset Credits

- No external assets yet — Part 1 is pure geometry and lights.
- Built with [React Three Fiber](https://r3f.docs.pmnd.rs/), [drei](https://github.com/pmndrs/drei), and [Vite](https://vite.dev/).

---

## 📦 Full Source Code

👉 Explore the complete code for this part on the [`part1` branch](https://github.com/myoxine/3d-profile/tree/part1).
