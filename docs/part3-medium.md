3D Profile Website — Part 3: Furniture & Animation — Load GLB Models and Make Them Move

Welcome back to the 3D Profile Website series!

In Part 2 we built a textured room with walls, a floor, and a reflective window. It looks good — but it’s an empty shell. In Part 3 we furnish it and make something move:

• Load real GLB furniture (an adjustable desk, a gaming chair)
• Turn models into React components with gltfjsx
• Animate the chair with a gentle left-right rock
• Add a loading indicator so visitors never stare at a blank screen

By the end the room is a believable little workspace.

—  —  —

Why Furniture and Animation?

A beautiful empty room feels like an unfurnished apartment — cold and echoey. Furniture makes the space personal; a touch of motion makes it feel alive. Even a chair swaying a few degrees reads as “this is a real place,” not a static render.

—  —  —

Step 1 — Models Into Components

Download the GLBs into public/models, then convert each with gltfjsx:

    npx gltfjsx "gaming chair.glb" -t

This emits a typed React component with the mesh hierarchy, materials, and transforms preserved. You drop it into the scene like any other component:

    export function Model(props) {
      const { nodes, materials } = useGLTF('/models/gaming chair.glb')
      return (
        <group {...props} dispose={null}>
          <mesh geometry={nodes.Group21.geometry} material={materials.lambert112SG} />
          {/* …many more meshes… */}
        </group>
      )
    }

Heads-up: downloaded models arrive at wild scales — this chair is roughly 575× too big — so we normalize with a single scale factor when we place it.

—  —  —

Step 2 — Rock, Don’t Spin

An endlessly spinning chair feels like a carnival ride. A subtle sine-wave rock feels like someone just sat down. Drive the rotation from useFrame:

    const chairScale = 1.2 / 575.2021484375

    useFrame(({ clock }) => {
      const angle = Math.sin(clock.getElapsedTime() * 1) * 0.3 // speed · maxAngle (~17°)
      if (pivotRef.current) pivotRef.current.rotation.y = angle
    })

speed sets how fast it rocks, maxAngle how far to each side. A gentle sway makes the scene alive without making anyone seasick.

(Evolution note: in the finished project this rock is switched off — once a character sits in the chair, perpetual motion became a distraction. The useFrame rocking is stripped out of GamingChair and AnimatedSpinningChair becomes a thin positioning wrapper; restore the sine-wave useFrame above to bring it back.)

—  —  —

Step 3 — Place the Desk

The desk is another gltfjsx component, scaled and rotated into place:

    <Desk
      scale={[deskScale, deskScale, deskScale]}
      rotation={[0, -0.5 * Math.PI, 0]}
      position={[0.75, -2 + 0.1, -1.15]}
    />

—  —  —

Step 4 — A Loading Indicator

GLBs take a moment to fetch. drei’s useProgress + Html float a simple overlay so the screen is never blank:

    function Loader() {
      const { progress } = useProgress()
      return (
        <Html center>
          <div style={{ background: '#222', padding: '10px 20px', borderRadius: 8, color: '#fff' }}>
            Loading… {progress.toFixed(0)}%
          </div>
        </Html>
      )
    }

Wrap the room in Suspense with the loader as fallback, and the heavy models stream in gracefully:

    <Suspense fallback={<Loader />}>
      <Room />
    </Suspense>

—  —  —

Lessons Learned in Part 3

• gltfjsx turns a .glb into a typed React component — meshes, materials, and transforms preserved, ready to drop in.
• Downloaded models come at wild scales; normalize with one scale factor instead of guessing per-axis.
• A sine wave beats an endless spin — Math.sin(time · speed) · maxAngle is the whole animation API. Animation is a choice per object, not a default.
• Suspense with a fallback loader prevents the blank-screen wait while heavy GLBs stream in.

—  —  —

What’s Next (Part 4)

The room is furnished — next we make it feel like real architecture. In Part 4 we add a 3D door with frame, handle, and hinges, a ceiling to fully enclose the space, HDRI environment lighting for soft global illumination and reflections, and a directional light that casts believable shadows.

Your 3D profile website is getting closer to a fully immersive experience.

—  —  —

Asset Credits

• Adjustable Desk — Poly Pizza (free): https://poly.pizza/
• Gaming Chair — Free3D (free): https://free3d.com/
• Model-to-component pipeline — gltfjsx: https://github.com/pmndrs/gltfjsx
