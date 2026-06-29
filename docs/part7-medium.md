3D Profile Website — Part 7: Bring It to Life with Animated Characters, a Live Clock & Neon

Welcome back to the 3D Profile Website series!

In Part 6 we made the room personal — photos, diplomas, a playable TV. But it was still empty of people and frozen in time. In Part 7 we bring it to life:

• Animated characters from Mixamo (a man typing at the desk, people on the sofa)
• A drop-in pipeline for Ready Player Me avatars — real textures, real eyes, no manual painting
• A wall clock whose hands track your real system time
• A glowing neon sign built from extruded 3D letters + Bloom
• Two lamps behind the sofa wired to a brand-new 4th light switch
• The gotchas that bit us: lost FBX textures, eyes on the back of the head, over-bloomed “light bulbs”

By the end, the room feels inhabited: someone is working, a couple is watching TV, and the clock reads the actual time.

— — —

Why Animation Changes Everything

A static scene reads as a model. The moment something moves — a character types, a second hand sweeps — the brain reads it as a place. We need only two ingredients: skeletal animation for characters (Mixamo gives this for free), and per-frame transforms for simple mechanical motion (the clock hands), driven from useFrame.

— — —

Step 1 — Animated Characters from Mixamo (FBX → GLB)

Mixamo gives you rigged characters and thousands of animations as FBX. R3F wants GLB, so we convert.

Why not OBJ? OBJ stores geometry only — no skeleton, no animation. For an animated character you need a format that carries the rig: FBX (or glTF). MTL files are an OBJ-only thing; FBX embeds its own materials.

Convert with the fbx2gltf package:

    require('fbx2gltf')('Typing.fbx', 'public/models/character.glb', ['--binary'])

The key pieces for an animated, reusable character:

• SkeletonUtils.clone(scene) — a plain scene.clone() breaks skinned meshes; this clones the skeleton correctly so you can render the model more than once.
• useGraph(clone) — gives you nodes / materials from the clone.
• useAnimations(animations, group) — wires the clips to a mixer and plays them.

    export function Model(props) {
      const group = useRef(null)
      const { scene, animations } = useGLTF('/models/character.glb')
      const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
      const { nodes, materials } = useGraph(clone)
      const { actions } = useAnimations(animations, group)

      useEffect(() => {
        const action = actions['mixamo.com']
        action?.reset().fadeIn(0.3).play()
        return () => action?.fadeOut(0.2)
      }, [actions])

      return (
        <group ref={group} {...props} dispose={null}>
          <primitive object={nodes.Hips} />
          {/* skinnedMeshes... */}
        </group>
      )
    }

Mixamo names its clip “mixamo.com” — that’s why we look it up by that key.

— — —

Step 2 — Ready Player Me Avatars: Textures for Free

Not all character models are equal. We went through a few:

• Old Mixamo characters — no textures exported → hand-color every mesh.
• A “Stylized” avatar — shipped a 1×1 px dummy texture → useless, hand-color again.
• Ready Player Me avatars — full PBR textures → keep the materials, do nothing.

RPM avatars convert beautifully: separate textured meshes for body, head, hair, eyes (AvatarLeftEyeball / AvatarRightEyeball), eyelashes, teeth, outfit, even glasses. The component is a straight gltfjsx clean-up — keep every material.

Keep morphTargetDictionary / morphTargetInfluences on the head/teeth/eyelash meshes — that preserves the face blendshapes.

These avatars carry an internal scale={100} group, so they’re ~1.8 m tall at scale={1}. If you need someone shorter you scale the group down (e.g. scale={0.85}); our kid is a child-proportioned Ready Player Me avatar, so it stays at scale={1}.

The painful detour (so you can skip it)

Before we found RPM avatars, we hand-built eyes and eyebrows on a textureless model. Two bugs are worth remembering:

1) Iris/pupil landed on the back of the head. We placed iris discs along world +Z, assuming that’s “forward.” But the character is rotated Math.PI (it faces −Z), so the discs went behind the skull. Fix: derive “forward” from the geometry — the vector from the head joint to the eye centroid — so it’s correct regardless of rotation:

    const fwd = center.clone().addScaledVector(up, -center.dot(up)).normalize()
    const right = new THREE.Vector3().crossVectors(up, fwd).normalize()

2) The iris was hidden inside the white eyeball. We placed it at radius * 0.96 — just under the opaque sclera. Bumping to radius * 1.02 (just in front) made it visible.

To position anything on a skinned mesh you can’t use mesh.matrixWorld directly — you must account for the bind pose:

    world = headBone.matrixWorld × boneInverse(head) × mesh.bindMatrix × vertex

The lesson: if the model already ships with textured eyes, use them. We deleted ~80 lines of eye/eyebrow math the moment we switched to RPM avatars.

— — —

Step 3 — A Clock That Tells the Real Time

Our wall-clock GLB has three hands as separate nodes: H, M, Sec. We ignore the model’s baked animation (it was inconsistent) and drive the hands ourselves from new Date() every frame. The hands spin around their local Y axis; we keep each hand’s rest orientation as the basis and add a time rotation:

    useFrame(() => {
      const now = new Date()
      const s = now.getSeconds() + now.getMilliseconds() / 1000
      const m = now.getMinutes() + s / 60
      const h = (now.getHours() % 12) + m / 60
      set(second.current, s / 60)
      set(minute.current, m / 60)
      set(hour.current,   h / 12)
    })

    const Y = new THREE.Vector3(0, 1, 0)
    const set = (o, frac) =>
      o.quaternion.copy(restOf(o)).multiply(tmp.setFromAxisAngle(Y, DIR * frac * Math.PI * 2))

Two knobs you’ll always need: a DIR = -1 to flip clockwise vs counter-clockwise, and — if the model’s “12 o’clock” rest pose isn’t straight up — an auto-calibration that measures each hand’s direction from its geometry and rotates it to 12 first. Deriving the spin axis and “up” from the mesh (not a hard-coded world axis) is the same trick we used for the eyes, and it’s why the clock just works regardless of how it’s mounted.

The glass cover arrived as an opaque grey disc (its texture wasn’t included), so we made it transparent: transparent = true, opacity = 0.12, depthWrite = false.

— — —

Step 4 — A Neon Sign from Extruded 3D Letters

For a personal touch we put a glowing “Hadi Halim” sign above the desk. “Raised letters” means extruded geometry, so we use drei’s <Text3D> (which needs a typeface JSON font — grab helvetiker_regular.typeface.json from the three.js examples into public/fonts/).

    <Center position={[-0.15, 0.12, 0]}>
      <Text3D font="/fonts/helvetiker_regular.typeface.json"
              size={0.16} height={0.025} bevelEnabled bevelThickness={0.004}>
        Hadi
        <meshStandardMaterial color="#ffffff" emissive="#ffcf6b"
                              emissiveIntensity={lit ? 1.25 : 0.1} toneMapped={false} />
      </Text3D>
    </Center>

The glow is just an emissive material + the Bloom post-processing from Part 5. Two lessons from getting it wrong:

• Don’t add a pointLight for the glow. A point light next to the wall paints a big bright bulb hotspot — the opposite of neon. Real neon glow comes from the emissive letters being picked up by Bloom, nothing else.
• Don’t over-drive the emissive. At 2.4 the sign blew out into a white blob; around 1.25 with a thin font reads as crisp tubes.

toneMapped={false} is what keeps the color bright enough to cross Bloom’s luminance threshold.

— — —

Step 5 — Two Lamps Behind the Sofa + a New Switch

We added two small lamps behind the sofa. The interesting part is wiring a new switch into the lighting system from Part 5.

1) Add state to the LightingContext:

    const [sofaOn, setSofa] = useState(false)
    // expose: sofaOn, toggleSofa: () => setSofa(v => !v)

2) Add a 4th switch and re-center the row so four plates sit evenly:

    <SingleSwitch on={ceilingOn}  onToggle={toggleCeiling}  position={[-1.5 * spacing, 0, 0]} />
    <SingleSwitch on={standingOn} onToggle={toggleStanding} position={[-0.5 * spacing, 0, 0]} />
    <SingleSwitch on={tableOn}    onToggle={toggleTable}    position={[ 0.5 * spacing, 0, 0]} />
    <SingleSwitch on={sofaOn}     onToggle={toggleSofa}     position={[ 1.5 * spacing, 0, 0]} />

3) The lamp reads sofaOn and lights its shade (emissive) plus a real pointLight.

Reuse, don’t duplicate: when we removed the old standing lamp, its switch (standingOn) was free — so we repurposed it to toggle the neon sign. One boolean, any number of lights can subscribe to it.

— — —

Step 6 — Quiet the Spinning Chair

The gaming chair had a gentle auto-rotate from earlier parts. With a character now sitting at the desk, the spinning looked wrong, so we made it static — just delete the useFrame and the pivot wrapper. A good reminder: animation is a choice per object, not a default. Movement should mean something.

— — —

Lessons Learned in Part 7

• OBJ can’t animate — use FBX/glTF for anything rigged.
• SkeletonUtils.clone + useGraph is the reliable way to instance and read a skinned model.
• Prefer avatars that ship with textures (Ready Player Me). Hand-painting meshes is a fallback, not a goal.
• Skinned-mesh placement needs the bind matrix (bindMatrix + boneInverses), and “forward” should come from geometry, not a world axis — that one rule fixed both the eyes and the clock.
• Glow = emissive + Bloom, not a point light. Point lights make bulbs; emissive makes neon.
• toneMapped={false} is the switch that lets a material bloom.

— — —

What’s Next (Part 8)

The room is now alive: people, a ticking clock, glowing signage, switchable lamps. But a visitor still has to fly the camera around by hand to find anything. In Part 8 we turn it into a guided experience: a zustand state store that works both inside and outside the R3F Canvas, swapping OrbitControls for CameraControls with named “view” presets the camera animates to, and a menu bar that flies you to each area plus an Exit button.

Thanks for following along — go make your room navigable next.

Asset credits: characters & animations from Mixamo / Ready Player Me; wall clock and lamp are free GLB/glTF assets (see each model’s license); typeface helvetiker_regular from the three.js examples; Bloom via @react-three/postprocessing.
