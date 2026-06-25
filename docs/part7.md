# 3D Profile Website - Part 7: Bring It to Life — Animated Characters, a Live Clock & Neon

Welcome back to the **3D Profile Website** series!

In Part 6 we made the room *personal* — photos, diplomas, a playable TV. But the room is still **empty of people** and frozen in time. In **Part 7**, we bring it to life:

✅ **Animated characters** from Mixamo (a man typing at the desk, people sitting on the sofa)
✅ A drop-in pipeline for **Ready Player Me avatars** (real textures, real eyes — no manual painting)
✅ A **wall clock whose hands track your real system time**
✅ A glowing **neon sign** ("Hadi Halim") built from extruded 3D letters + Bloom
✅ Two **lamps behind the sofa** wired to a brand-new **4th light switch**
✅ A look at the **gotchas** that bit us: lost FBX textures, eyes on the back of the head, and over-bloomed "light bulbs"

By the end, the room feels *inhabited*: someone is working, a couple is watching TV, and the clock on the wall reads the actual time.

Let's go.

---

## Why Animation Changes Everything

A static scene reads as a *model*. The moment something moves — a character types, a second hand sweeps — the brain reads the scene as a *place*. We only need two ingredients:

- **Skeletal animation** for characters (Mixamo gives us this for free).
- **Per-frame transforms** for simple mechanical motion (the clock hands), driven from `useFrame`.

Everything else is placement and lighting, which we already know from Parts 4–6.

---

## Step 1 — Animated Characters from Mixamo (FBX → GLB)

[Mixamo](https://www.mixamo.com) gives you rigged characters and thousands of animations as **FBX**. R3F wants **GLB**, so we convert.

> ❓ **Why not OBJ?** OBJ stores *geometry only* — no skeleton, no animation. For an animated character you need a format that carries the rig: **FBX** (or glTF). MTL files are an OBJ-only thing; FBX embeds its own materials.

Convert with the `fbx2gltf` package (Node API):

```js
// convert.js
require('fbx2gltf')('Typing.fbx', 'public/models/character.glb', ['--binary'])
  .then(() => console.log('done'))
```

Then load it. The key pieces for an **animated, reusable** character are:

- `SkeletonUtils.clone(scene)` — a plain `scene.clone()` breaks skinned meshes; this clones the skeleton correctly so you can render the same model more than once.
- `useGraph(clone)` — gives you `nodes` / `materials` from the clone.
- `useAnimations(animations, group)` — wires the clips to a mixer and plays them.

```tsx
import { useEffect, useMemo, useRef } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function Model(props) {
  const group = useRef(null)
  const { scene, animations } = useGLTF('/models/character.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  // auto-play the (single) Mixamo clip, looped
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
```

Mixamo names its clip `mixamo.com` — that's why we look it up by that key.

---

## Step 2 — Ready Player Me Avatars: Textures for Free

Not all character models are equal. We went through a few:

| Model source | Textures? | What we had to do |
|---|---|---|
| Old Mixamo characters | none exported | hand-color every mesh (skin, shirt, hair…) |
| A "Stylized" avatar | a **1×1 px dummy** | hand-color again (texture was useless) |
| **Ready Player Me** avatars | **full PBR textures** | nothing — just keep the materials |

[Ready Player Me](https://readyplayer.me) avatars convert beautifully: they arrive with **separate textured meshes** for body, head, hair, eyes (`AvatarLeftEyeball` / `AvatarRightEyeball`), eyelashes, teeth, outfit, even glasses. The component is a straight gltfjsx clean-up — **keep every material**, no painting required:

```tsx
<skinnedMesh geometry={nodes.AvatarHead.geometry} material={materials.AvatarHead}
             skeleton={nodes.AvatarHead.skeleton}
             morphTargetDictionary={nodes.AvatarHead.morphTargetDictionary}
             morphTargetInfluences={nodes.AvatarHead.morphTargetInfluences} castShadow />
```

> 💡 **Keep `morphTargetDictionary` / `morphTargetInfluences`** on the head/teeth/eyelash meshes — that's what preserves the face shape (blendshapes).

These avatars carry an internal `scale={100}` group, so they're ~1.8 m tall at `scale={1}` in the room. To make a **child** we just scale down — `scale={0.78}` ≈ 1.4 m.

### The painful detour (so you can skip it)

Before we found RPM avatars, we hand-built eyes and eyebrows on a textureless model. Two bugs are worth remembering because they teach how skinned meshes work:

**1. Iris/pupil landed on the *back* of the head.** We placed the iris discs along *world* `+Z`, assuming that's "forward." But the character is rotated `Math.PI` (it faces `−Z`), so the discs went behind the skull. **Fix:** derive "forward" from the *geometry itself* — the vector from the head joint to the eye centroid — so it's correct no matter how the character is rotated:

```ts
// forward = (eye centroid − head joint), with the vertical component removed
const fwd = center.clone().addScaledVector(up, -center.dot(up)).normalize()
const right = new THREE.Vector3().crossVectors(up, fwd).normalize()
```

**2. The iris was hidden *inside* the white eyeball.** We placed it at `radius * 0.96` — just under the opaque sclera surface. Bumping it to `radius * 1.02` (just in front) made it visible.

To position anything on a **skinned** mesh, you can't use `mesh.matrixWorld` directly — you must account for the bind pose:

```
world = headBone.matrixWorld × boneInverse(head) × mesh.bindMatrix × vertex
```

**The lesson:** if the model already ships with textured eyes, *use them*. We deleted ~80 lines of eye/eyebrow math the moment we switched to RPM avatars.

---

## Step 3 — A Clock That Tells the Real Time

We dropped in a wall-clock GLB whose three hands are separate nodes: **`H`**, **`M`**, **`Sec`**. We don't use the model's baked animation (it was inconsistent); instead we **drive the hands ourselves** from `new Date()` every frame.

The hands spin around their **local Y axis**. We keep each hand's rest orientation as the basis and add a time rotation:

```tsx
useFrame(() => {
  const now = new Date()
  const s = now.getSeconds() + now.getMilliseconds() / 1000
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60

  set(second.current, s / 60)   // fraction of a full turn
  set(minute.current, m / 60)
  set(hour.current,   h / 12)
})

const Y = new THREE.Vector3(0, 1, 0)
const set = (o, frac) => {
  o.quaternion.copy(restOf(o)).multiply(
    tmp.setFromAxisAngle(Y, DIR * frac * Math.PI * 2)
  )
}
```

> 🧭 **Two knobs you'll always need:** a `DIR = -1` to flip clockwise/counter-clockwise, and — if the model's "12 o'clock" rest pose isn't straight up — an **auto-calibration** that measures each hand's pointing direction from its geometry and rotates it to 12 before applying the time. Deriving the spin axis and "up" from the mesh (not from a hard-coded world axis) is the same trick we used for the eyes, and it's why the clock "just works" regardless of how the model is mounted.

The hands now sweep in real time. The glass cover came in as an opaque grey disc (its texture wasn't included), so we made it transparent:

```ts
glassMaterial.transparent = true
glassMaterial.opacity = 0.12
glassMaterial.depthWrite = false
```

---

## Step 4 — A Neon Sign from Extruded 3D Letters

For a personal touch we put a glowing **"Hadi Halim"** sign above the desk. "Raised letters" means **extruded geometry**, so we use drei's `<Text3D>` (which needs a typeface JSON font — grab `helvetiker_regular.typeface.json` from the three.js examples and drop it in `public/fonts/`).

```tsx
import { Text3D, Center } from '@react-three/drei'

<Center position={[-0.15, 0.12, 0]}>
  <Text3D font="/fonts/helvetiker_regular.typeface.json"
          size={0.16} height={0.025} bevelEnabled bevelThickness={0.004}>
    Hadi
    <meshStandardMaterial color="#ffffff" emissive="#ffcf6b"
                          emissiveIntensity={lit ? 1.25 : 0.1} toneMapped={false} />
  </Text3D>
</Center>
```

The glow itself is just an **emissive material + the Bloom** post-processing we added in Part 5. Two lessons we learned by getting it wrong:

- **Don't add a `pointLight` for the glow.** A point light right next to the wall paints a big bright **bulb hotspot** — the opposite of a neon look. Real neon glow comes from the *emissive letters being picked up by Bloom*, nothing else.
- **Don't over-drive the emissive.** At `emissiveIntensity = 2.4` the whole sign blew out into a white blob. Around `1.25` with a thin font reads as crisp tubes.

`toneMapped={false}` is what lets the color stay bright enough to cross Bloom's luminance threshold.

---

## Step 5 — Two Lamps Behind the Sofa + a New Switch

We added two small lamps behind the sofa. The interesting part is **wiring a new switch** into the lighting system from Part 5.

**1. Add state to the `LightingContext`:**

```tsx
const [sofaOn, setSofa] = useState(false)
// expose: sofaOn, toggleSofa: () => setSofa(v => !v)
```

**2. Add a 4th switch** to `LightSwitch` and re-center the row so four plates sit evenly:

```tsx
<SingleSwitch on={ceilingOn}  onToggle={toggleCeiling}  position={[-1.5 * spacing, 0, 0]} />
<SingleSwitch on={standingOn} onToggle={toggleStanding} position={[-0.5 * spacing, 0, 0]} />
<SingleSwitch on={tableOn}    onToggle={toggleTable}    position={[ 0.5 * spacing, 0, 0]} />
<SingleSwitch on={sofaOn}     onToggle={toggleSofa}     position={[ 1.5 * spacing, 0, 0]} />
```

**3. The lamp** reads `sofaOn` and lights its shade (emissive) plus a real `pointLight`:

```tsx
const { sofaOn } = useLighting()
// shade material: emissiveIntensity={sofaOn ? 1.4 : 0}
{sofaOn && <pointLight color="#ffd9a0" intensity={1.2} distance={3} />}
```

> ♻️ **Reuse, don't duplicate.** When we removed the old standing lamp, its switch (`standingOn`) was free — so we repurposed it to toggle the neon sign. One switch, one boolean, any number of lights can subscribe to it.

---

## Step 6 — Quiet the Spinning Chair

The gaming chair had a gentle auto-rotate from earlier parts. With a character now sitting at the desk, the spinning looked wrong, so we made it **static** — just delete the `useFrame` and the pivot wrapper:

```tsx
export const AnimatedSpinningChair = (props) => {
  const chairScale = 1.2 / 575.2
  return (
    <group {...props}>
      <GamingChair scale={[chairScale, chairScale, chairScale]} />
    </group>
  )
}
```

A good reminder: **animation is a choice per object**, not a default. Movement should mean something.

---

## Lessons Learned in Part 7

- **OBJ can't animate.** Use FBX/glTF for anything rigged.
- **`SkeletonUtils.clone` + `useGraph`** is the reliable way to instance and read a skinned model.
- **Prefer avatars that ship with textures** (Ready Player Me). Hand-painting meshes is a fallback, not a goal.
- **Skinned-mesh placement needs the bind matrix** (`bindMatrix` + `boneInverses`), and **"forward" should come from geometry**, not a world axis — that one rule fixed both the eyes and the clock.
- **Glow = emissive + Bloom**, not a point light. Point lights make bulbs; emissive makes neon.
- **`toneMapped={false}`** is the switch that lets a material bloom.

---

## What's Next

The room is now alive: people, a ticking clock, glowing signage, switchable lamps. From here you could add **scroll-driven camera moves**, **clickable hotspots** that open project details, or **lazy-loading** so the heavy character GLBs stream in after first paint.

Thanks for following the series — go make your room *yours*. 🎬

---

### Asset Credits

- Characters & animations — [Mixamo](https://www.mixamo.com) / [Ready Player Me](https://readyplayer.me)
- Wall clock, lamp — free GLB/glTF assets (see each model's source license)
- Typeface — `helvetiker_regular` from the [three.js](https://github.com/mrdoob/three.js) examples
- Post-processing — [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) (Bloom)
