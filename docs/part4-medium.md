3D Profile Website — Part 4: Doors, Ceilings & Setting the Mood With HDRI Light

Welcome back to the 3D Profile Website series!

By Part 3 the room has walls, a floor, a window, and real furniture. It looks awesome — but a bit exposed and empty. In Part 4 we make it feel like a real architectural space:

• A 3D door with frame, handle, and hinges
• A ceiling that encloses the room
• HDRI environment lighting for reflections and global illumination
• A directional light for believable shadows
• Orbit controls so visitors can explore

By the end the room no longer floats in a void — it feels built.

—  —  —

Why Doors, Ceilings & Lighting Matter

Think about what makes a real room read as a room. A door gives scale and purpose. A ceiling traps light and grounds shadows — without it the space feels like an open diorama. HDRI lighting adds reflections and soft global illumination that point lights can’t easily fake, and a directional light adds the crisp shadows that give depth.

—  —  —

Step 1 — Add the Door

Grab a free door model (one with frame, handle, and hinges baked in), convert it with gltfjsx, and slot it into a wall’s hole:

    <Wall wallSize={[3.2, 4]} position={[0, 0, 1.55]} holePosition={[-0.75, -0.65]} holeSize={[0.99, 2.5]} />
    <Door scale={doorScale} rotation={[0, 0.5 * Math.PI, 0]} position={[-0.75, -1.9, 1.55]} />

A couple of notes for the finished project: the generated component logs the model’s bounding box (console.log('Model Door Size')) — handy while you dial in scale, but strip that debug line before shipping. And the door’s baked “Door_colors” texture rendered as a distracting woven pattern under compression, so later we drop the glTF materials and assign plain inline ones — a warm off-white panel (#d8d3c8) and near-black metal (#141414) for the handle and hinges.

—  —  —

Step 2 — A Ceiling

A ceiling is critical for realism — it encloses the space and catches shadows from lights above. At its simplest it’s a single plane:

    <mesh castShadow receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#111" metalness={0.7} roughness={0.4} />
    </mesh>

Place it at the top of the room, rotated flat:

    <Ceiling size={[3, 3]} position={[0, 1.9, 0]} rotation={[Math.PI * 0.5, 0, 0]} />

(In Part 5 this ceiling grows a switchable LED strip — for now it’s a clean panel.)

—  —  —

Step 3 — HDRI Lighting

An HDRI is a 360° high-dynamic-range image that wraps the scene, giving free global light and realistic reflections. drei’s Environment loads one:

    <Environment files="/hdri/dikhololo_sunset_4k.hdr" background environmentIntensity={0.3} />

Evolution note: the 4k HDR is several MB. Once page weight matters (Part 10) we switch to the 1k version — for a room this size, lit mostly by its own lamps, it’s visually identical and loads far faster.

—  —  —

Step 4 — Directional Light for Shadows

HDRI gives soft global light but casts no shadows. Add a directional light for sun-like rays:

    <directionalLight
      color="#ffffff" intensity={0.5} position={[3, 1, -2]} castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-far={50}
      shadow-camera-left={-5} shadow-camera-right={5}
      shadow-camera-top={5} shadow-camera-bottom={-5}
    />

—  —  —

Step 5 — Wire It Together

The room now composes Floor, four Walls (one holding the window, one the door), the Ceiling, the Desk, and the rocking chair. The App adds the directional light, the HDRI, OrbitControls, and a Suspense loader around it all:

    <Canvas camera={{ position: [0, 2, 1], fov: 60 }} shadows>
      <directionalLight … castShadow … />
      <Suspense fallback={<Loader />}>
        <Environment files="/hdri/dikhololo_sunset_4k.hdr" background environmentIntensity={0.3} />
        <OrbitControls />
        <Room />
      </Suspense>
    </Canvas>

—  —  —

Lessons Learned in Part 4

• A ceiling is what makes a room read as a room — enclosing the space traps light and grounds shadows.
• HDRI lighting does what point lights can’t: soft global illumination plus realistic reflections from one map.
• HDRI alone casts no shadows — pair it with a castShadow directional light for sun-like rays.
• Debug scaffolding is for you, not for shipping — strip stray console.logs (we do, in Part 10).

—  —  —

What’s Next (Part 5)

The room is fully built — next we make it interactive and atmospheric. In Part 5 we add a central lighting “brain” any component can read and control, clickable 3D light switches that physically flip, an LED ceiling and lamps that emit real light, and automatic day/night that follows your system’s dark mode. (Sound and deployment come later — Parts 12 and 13.)

Your 3D profile website is on its way to a stunning interactive portfolio.

—  —  —

Asset Credits

• Single Door (frame, handle, hinges) — CGTrader (free; check terms): https://www.cgtrader.com/
• HDRI — Dikhololo Sunset, Poly Haven (CC0): https://polyhaven.com/
• Built with React Three Fiber (https://r3f.docs.pmnd.rs/) and drei (https://github.com/pmndrs/drei)
