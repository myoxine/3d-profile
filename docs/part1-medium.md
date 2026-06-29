3D Profile Website — Part 1: Set Up & Build Your First 3D Room with React Three Fiber

Welcome to the 3D Profile Website series!

This is where it all starts. Over the next thirteen parts we’ll build an interactive 3D portfolio — a room you can tour, click, and read — but every bit of it hangs off the small foundation we lay here. In Part 1 we get the loop running:

• Set up a Vite + React + TypeScript project
• Install and configure React Three Fiber and drei
• Build a basic 3D room (floor, walls, a box)
• Add lighting, shadows, and orbit camera controls

By the end you’ll have a real 3D scene you can spin around in the browser.

—  —  —

Why Start With a Simple Room

A 3D scene is just four pieces — a canvas, some lights, a camera, and meshes — and the fastest way to understand how they fit together is to build the smallest possible room and orbit around it. We keep this part deliberately minimal: get the render loop running, watch a box cast a shadow, and you’re ready to grow it into a furnished, interactive space.

—  —  —

Step 1 — Project Setup

Scaffold a Vite project with the React + TypeScript template, then add the 3D libraries:

    npm create vite@latest 3d-profile -- --template react-ts
    cd 3d-profile
    npm install
    npm install three @react-three/fiber @react-three/drei
    npm run dev

Open http://localhost:5173 and the app is live.

—  —  —

Step 2 — A 3D Scene with React Three Fiber

React Three Fiber lets you describe a Three.js scene as JSX. Clear out the boilerplate App and drop in a canvas with lights and orbit controls:

    import { Canvas } from '@react-three/fiber'
    import { OrbitControls } from '@react-three/drei'

    export default function App() {
      return (
        <div style={{ width: '100vw', height: '100vh' }}>
          <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
            <ambientLight intensity={1} />
            <directionalLight position={[0, 2, 3]} intensity={1} />
            <OrbitControls />
          </Canvas>
        </div>
      )
    }

That’s a full 3D canvas with basic lighting and drag-to-orbit controls.

—  —  —

Step 3 — Simple Lighting

Lighting defines shape, depth, and mood. Two lights go a long way: an ambientLight is a soft global fill that keeps nothing pure-black, and a directionalLight acts like the sun — a parallel beam from one direction that gives highlights and shadows.

    <ambientLight intensity={0.5} />
    <directionalLight position={[0, 2, 3]} intensity={1} />

—  —  —

Step 4 — Build a Simple Room

A room is just a few boxes: a floor slab, three walls, and a placeholder box in the middle (it’ll become furniture later).

    export const Room = () => (
      <>
        {/* Floor */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[3, 0.1, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Back wall */}
        <mesh position={[0, 2, -1.55]} receiveShadow>
          <boxGeometry args={[3, 4, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* A box (a chair? a table? later…) */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </>
    )

Add a left and right wall the same way, then render <Room /> inside the Canvas.

—  —  —

Step 5 — Lighting With Shadows

Shadows give objects weight — without them everything floats. In React Three Fiber, shadows are opt-in at three levels, and all three must agree before a shadow appears:

1. The canvas: <Canvas shadows>.
2. The light: add castShadow (and a shadow camera frustum for a directional light).
3. The meshes: castShadow on what blocks light, receiveShadow on what catches it.

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

Now the box drops a soft shadow onto the floor, and the scene finally reads as a space rather than floating cards.

—  —  —

Lessons Learned in Part 1

• A 3D scene is four pieces — a Canvas, lights, a camera, and meshes. Once those click into place, everything else is composition.
• Shadows are opt-in at every level: the renderer, each light, and each mesh must all agree before one appears.
• Two lights go a long way — a soft ambientLight plus a directionalLight for shape and a sun-like shadow.
• OrbitControls is the fastest way to see your scene while you build; we’ll trade it for animated camera moves much later (Part 8).

—  —  —

What’s Next (Part 2)

Right now everything is flat color and a floating box. In Part 2 we give the room some soul: realistic PBR textures on the floor and walls (color, roughness, normal, AO), walls with holes for windows and doors built from ExtrudeGeometry, and a reflective glass window with a frame — all rebuilt as reusable components.

Stay tuned — your cardboard box is about to become a real space.

—  —  —

Asset Credits

• No external assets yet — Part 1 is pure geometry and lights.
• Built with React Three Fiber (https://r3f.docs.pmnd.rs/), drei (https://github.com/pmndrs/drei), and Vite (https://vite.dev/).
