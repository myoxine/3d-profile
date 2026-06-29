3D Profile Website — Part 2: Textures, Walls With Holes & a Reflective Window

Welcome back to the 3D Profile Website series!

In Part 1 we built a basic room: white walls, a floor, a floating red box, some lights. Honest verdict — it looked like a cardboard box floating in space. In Part 2 we give it soul:

• Realistic PBR textures on the floor and walls
• Walls that can cut their own holes for windows and doors
• A reflective glass window with a frame
• The room rebuilt out of reusable components

By the end the scene reads as a real space, not a primitive demo.

—  —  —

Why Textures Matter

Flat colors read as fake because real surfaces aren’t flat or evenly lit. A physically-based material reads a stack of maps, each doing one job: color (the base photo detail), roughness (shiny vs matte), normal (fakes small bumps so light reacts), displacement (actually pushes geometry), and ambient occlusion (darkens crevices). Stack them and a plain box becomes wood or plaster.

—  —  —

Step 1 — Grab Some Textures

Download a free PBR set each for the floor (a wood) and the walls (a plaster) — ambientCG is a great CC0 source — and drop the JPGs under public/textures. We’ll also use two free models later (an Adjustable Desk from Poly Pizza, a Gaming Chair from Free3D) saved under public/models.

A note on filename case: we load the chair as /models/gaming chair.glb (lowercase). Windows treats Gaming Chair.glb and gaming chair.glb as the same file, but Linux hosts (Vercel, Netlify, GitHub Pages) are case-sensitive — a capitalized name that works locally will 404 in production. Keep the file and the useGLTF path identical.

—  —  —

Step 2 — A Textured Floor

useTexture loads several maps at once. Set them to RepeatWrapping so the texture tiles instead of stretching, then feed them all to a meshStandardMaterial:

    const [colorMap, roughnessMap, normalMap, displacementMap, aoMap] = useTexture([
      '/textures/WoodFloor039_1K-JPG_Color.jpg',
      '/textures/WoodFloor039_1K-JPG_Roughness.jpg',
      '/textures/WoodFloor039_1K-JPG_NormalGL.jpg',
      '/textures/WoodFloor039_1K-JPG_Displacement.jpg',
      '/textures/WoodFloor039_1K-JPG_AmbientOcclusion.jpg',
    ])
    ;[colorMap, roughnessMap, normalMap, displacementMap, aoMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(1, 1)   // bump to (4,4) for smaller planks
    })

    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial map={colorMap} roughnessMap={roughnessMap}
        normalMap={normalMap} displacementMap={displacementMap}
        displacementScale={0} aoMap={aoMap} />
    </mesh>

—  —  —

Step 3 — Walls That Cut Their Own Holes

A real room has windows and doors. The trick: define the wall as a THREE.Shape rectangle, optionally subtract a smaller THREE.Path as a hole, then extrude it into 3D so it has thickness.

    const shape = new THREE.Shape()
    // …moveTo / lineTo the four outer corners…

    if (holeSize) {
      const [hw, hh] = holeSize
      const [hx, hy] = holePosition
      const hole = new THREE.Path()
      // …trace the hole rectangle around (hx, hy)…
      shape.holes.push(hole)
    }

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false })

One design choice worth flagging: make Wall extend the standard group props and rotate it with the group’s rotation prop, rather than inventing a custom rotationY. Keeping the API the same as every other R3F object is what lets the room compose cleanly in later parts.

—  —  —

Step 4 — A Reflective Window

A hole is just a hole — add glass. The window is a frame built from a handful of thin boxes plus two reflective panes (front and back, so it looks right from either side). drei’s MeshReflectorMaterial does the reflection:

    <mesh>
      <planeGeometry args={[width, height]} />
      <MeshReflectorMaterial color="#ffffff" opacity={0.5} transparent
        mirror={0.5} distortion={1} reflectorOffset={0.2} />
    </mesh>

Tweak mirror, opacity, and distortion to taste for the glass look you want.

—  —  —

Step 5 — Assemble the Room

With Floor, Wall, and Window as components, the room is pure composition — position the walls, rotate the side walls with the rotation prop, give one wall a hole, and slot the window into it:

    <Floor position={[0, -2 + 0.05, 0]} />
    <Wall wallSize={[3, 4]} position={[0, 0, -1.6]} />
    <Wall wallSize={[3.1, 4]} position={[1.5, 0, -0.05]} rotation={[0, 0.5 * Math.PI, 0]}
      holePosition={[0.5, 0]} holeSize={[1.1, 1.6]} />
    <Wall wallSize={[3.1, 4]} position={[-1.5, 0, -0.05]} rotation={[0, 0.5 * Math.PI, 0]} />
    <Window width={1} height={1.5} position={[1.55, 0, -0.55]} rotation={[0, 0.5 * Math.PI, 0]} />

—  —  —

Lessons Learned in Part 2

• Textures, not flat colors, sell realism — a PBR material reads color, roughness, normal, displacement, and AO maps, each doing a specific job.
• RepeatWrapping plus repeat.set() tiles a texture instead of stretching it; tune the repeat to the real-world plank/tile size.
• Holes are subtracted geometry: a wall is a Shape, a window/door is a Path pushed into shape.holes, then ExtrudeGeometry gives it thickness.
• Let components take standard group props (position/rotation) — composition beats one-off meshes, and a consistent API pays off in every later part.

—  —  —

What’s Next (Part 3)

The shell is real — next we furnish it. In Part 3 we load actual GLB furniture (an adjustable desk, a gaming chair) with gltfjsx, learn to tame the wild scales downloaded models arrive at, animate the chair with a gentle sine-wave rock, and add a Suspense loader so nothing shows a blank screen while models stream in.

Stay tuned — your 3D profile is about to come to life.

—  —  —

Asset Credits

• Wood floor texture — WoodFloor039, ambientCG (CC0): https://ambientcg.com/
• Plaster wall texture — Plaster001, ambientCG (CC0): https://ambientcg.com/
• Built with React Three Fiber (https://r3f.docs.pmnd.rs/) and drei (https://github.com/pmndrs/drei)
