# 3D Profile Website - Part 6: Make It Personal — Media, Photos & a Playable TV

Welcome back to the **3D Profile Website** series!

In Part 5 we made the room *interactive* with switches, lamps, and day/night lighting. It looks and feels like a real space — but it's still a generic room. In **Part 6**, we make it **yours**.

This part is about **media and personal content**:

✅ A laptop and a monitor on your desk
✅ A **TV you can click to play a YouTube video** — right on the screen
✅ A reusable **PhotoFrame** component
✅ A **gallery wall** above the sofa with your photo, diplomas, and certificates
✅ A practical workflow to turn **PDFs and images into web-ready textures**
✅ Hard-won lessons about **3D asset file sizes**

By the end, a visitor can walk in, see your face, read your credentials, and watch your showreel on the TV.

Let's go.

---

## Why Personal Media Matters

A portfolio room with no *you* in it is just a furniture demo. Photos, diplomas, certificates, and a showreel turn the scene into an actual **profile**. The technical building blocks are simple and reusable:

- **GLB props** placed on surfaces (laptop, monitor).
- **Textured planes** for any image (photos, scanned documents).
- **An `<iframe>` in 3D** for live media like a YouTube video.

---

## Step 1 — Drop Props on the Desk (GLB)

Convert each model with `gltfjsx`, then clean up the generated file (type-only imports, fix the asset path, remove the unused `animations` field):

```bash
npx gltfjsx public/models/laptop.glb -t -o src/components/Laptop.tsx
npx gltfjsx public/models/monitor.glb -t -o src/components/Monitor.tsx
```

Place them on the desk in `Room.tsx`. The desk's top surface sits at about `y = -1.19` in this scene, so that's the height props rest at:

```tsx
<Laptop scale={0.08} position={[0.45, -1.19, -1]} />
<Monitor scale={1} rotation={[0, -0.15 * Math.PI, 0]} position={[1, -1.19, -1]} />
```

> ⚠️ **Watch model scale & origin.** Downloaded models come in wildly different units and are often off-center. Always check the bounding box first:
> ```bash
> npx @gltf-transform/cli inspect public/models/laptop.glb
> ```
> If a model's pivot is far from origin, wrap it and zero out the offset so `position` behaves predictably.

---

## Step 2 — A Reusable PhotoFrame

One small component renders a framed image anywhere. It supports an **optional image** (so you can lay out empty placeholders first), an optional **white backing** (great for cut-out PNGs), and it faces `+Z` by default.

```tsx
// src/components/PhotoFrame.tsx
import { useTexture } from '@react-three/drei'
import type { JSX } from 'react'

type PhotoFrameProps = JSX.IntrinsicElements['group'] & {
  image?: string
  width?: number
  height?: number
  frameColor?: string
  background?: string
}

// useTexture must run unconditionally, so isolate it in a child component.
function FramedImage({ image, width, height, z }:
  { image: string; width: number; height: number; z: number }) {
  const tex = useTexture(image)
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={tex} transparent roughness={0.9} />
    </mesh>
  )
}

export function PhotoFrame({
  image, width = 0.5, height = 0.65,
  frameColor = '#2b2b2b', background, ...props
}: PhotoFrameProps) {
  const border = 0.04
  const depth = 0.03
  return (
    <group {...props}>
      {/* Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width + border * 2, height + border * 2, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Optional white backing (for transparent PNGs) */}
      {background && (
        <mesh position={[0, 0, depth / 2 + 0.0005]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color={background} />
        </mesh>
      )}
      {/* Image, or a plain placeholder panel */}
      {image ? (
        <FramedImage image={image} width={width} height={height} z={depth / 2 + 0.001} />
      ) : (
        <mesh position={[0, 0, depth / 2 + 0.001]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#e9e9e9" />
        </mesh>
      )}
    </group>
  )
}
```

> 💡 Calling a hook conditionally is illegal in React. That's why `useTexture` lives in the `FramedImage` child — we render that child only when an `image` exists, but the hook itself always runs.

---

## Step 3 — Turn PDFs & Images Into Textures

Your diplomas are probably PDFs and your photos are huge. Two quick, repeatable steps fix that.

**PDF → PNG** (no Photoshop needed) with `pdf-to-img`:

```js
// render-pdf.mjs
import { pdf } from 'pdf-to-img'
import fs from 'node:fs'
const [, , src, prefix] = process.argv
const doc = await pdf(src, { scale: 2 })
let i = 1
for await (const page of doc) {
  fs.writeFileSync(`public/images/${prefix}-p${i}.png`, page); i++
}
```

```bash
node render-pdf.mjs "diploma.pdf" diploma
```

**Resize & compress** any image with `sharp-cli` (an 8 MB photo becomes ~1 MB):

```bash
npx sharp-cli --input public/images/profile.png --output public/images/profile.png resize 1024
```

Documents read fine at ~1100 px and compress beautifully to JPG (often under 150 KB each).

---

## Step 4 — Build the Gallery Wall

With `PhotoFrame` and a few textures, arrange a tidy grid on the wall above the sofa. Frames face `+Z` by default, so on the back wall (`z = -1.55`) we place them at `z = -1.5`:

```tsx
{/* Top row: certificates */}
<PhotoFrame image="/images/cert-javascript.jpg"   width={0.26} height={0.235} position={[-1.15, 0.56, -1.5]} />
<PhotoFrame image="/images/cert-react.jpg"        width={0.26} height={0.235} position={[-0.72, 0.56, -1.5]} />
<PhotoFrame image="/images/cert-react-redux.jpg"  width={0.26} height={0.235} position={[-0.29, 0.56, -1.5]} />
<PhotoFrame image="/images/cert-react-native.jpg" width={0.26} height={0.235} position={[ 0.14, 0.56, -1.5]} />

{/* Bottom row: diplomas + your photo (white backing) */}
<PhotoFrame image="/images/ijazah-s2-transkrip.jpg" width={0.2} height={0.28}  position={[-1.15, 0.12, -1.5]} />
<PhotoFrame image="/images/ijazah-s2.jpg"           width={0.3} height={0.213} position={[-0.72, 0.12, -1.5]} />
<PhotoFrame image="/images/ijazah-s1.jpg"           width={0.3} height={0.207} position={[-0.29, 0.12, -1.5]} />
<PhotoFrame image="/images/profile.png" background="#ffffff" width={0.3} height={0.39} position={[0.14, 0.12, -1.5]} />
```

> 🎯 Match each frame's `width`/`height` to the image's aspect ratio so nothing looks stretched: landscape certificates are wide, the transcript is portrait.

---

## Step 5 — A TV That Plays a YouTube Video

You can't use a YouTube URL as a `VideoTexture` (CORS/DRM). The trick is to mount a real **`<iframe>` in 3D** with drei's `<Html transform>` — glued to the TV screen. Clicking the TV toggles the video.

```tsx
// src/components/Tv.tsx (core)
import { useState } from 'react'
import { Html } from '@react-three/drei'
import { Model as TvModel } from './TVModel'

const VIDEO_ID = 'pRpeEdMmmQ0'
const SCREEN_POS = [0.02, 0.39, 0]            // local position of the screen
const SCREEN_ROT = [0, Math.PI / 2, 0]        // face the room
const HTML_SCALE = 0.065                       // tune so the video fills the screen

export function Tv(props) {
  const [playing, setPlaying] = useState(false)
  return (
    <group {...props} onClick={(e) => { e.stopPropagation(); setPlaying(p => !p) }}>
      <TvModel />
      {playing && (
        <Html
          transform
          occlude="blending"                   // <-- key: respect 3D depth
          position={[SCREEN_POS[0] + 0.01, SCREEN_POS[1], SCREEN_POS[2]]}
          rotation={SCREEN_ROT}
          scale={HTML_SCALE}
        >
          <iframe
            width={666} height={374}
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ border: 0 }}
          />
        </Html>
      )}
    </group>
  )
}
```

Two gotchas that cost real time here — and how to fix them:

- **The video is tiny.** drei's `transform` mode does *not* map 1 CSS pixel to 1 world unit. Don't compute the scale; just **tune `HTML_SCALE`** until the iframe fills the screen.
- **The video shows through walls.** An `<Html>` is a DOM element that, by default, renders *on top of everything*. Use **`occlude="blending"`** so the iframe is hidden by 3D geometry via the depth buffer (the plain `occlude` / raycast mode hides it all-or-nothing instead). 

> Autoplay with sound is allowed here because the play is triggered by the user's click (a user gesture).

---

## A Note on Asset File Size

Two models nearly broke this build:

- A **94 MB sofa** made `git push` time out and bloated the repo. We swapped it for a **20 KB low-poly couch** — instant fix.
- A "monitor" GLB turned out to be a **47 MB full scene** (walls + two monitors). We replaced it with a clean **0.4 MB** single-mesh monitor.

Rules of thumb: inspect every download, prefer low-poly, resize textures, and keep individual assets well under ~10 MB. Your load time and your git history will thank you.

---

## Lessons Learned in Part 6

- **A reusable component beats one-off meshes.** One `PhotoFrame` with props renders your photo, every diploma, and every certificate — the gallery wall is just data.
- **Render a video onto a material to make a "playable" screen.** A `<Html>` overlay (or video texture) turns the TV mesh into something a visitor can actually click and watch.
- **Build a content pipeline, not a pile of exports.** PDF → PNG → resized texture is a repeatable recipe; do it once and every credential drops straight in.
- **Inspect every download before you trust it.** A "monitor" can secretly be a 47 MB scene; a sofa can be 94 MB. Prefer low-poly, resize textures, keep assets well under ~10 MB.
- Your room is now unmistakably **yours**.

---

## What's Next (Part 7)

The room is furnished and personal — but it's empty of people and frozen in time. Next we **bring it to life**:

- 🧍 **Animated characters** from Mixamo (someone typing at the desk, people on the sofa)
- 🧑‍🎨 A drop-in pipeline for **Ready Player Me avatars** (real textures, real eyes)
- 🕐 A **wall clock whose hands track your real system time**
- ✨ A glowing **neon sign** built from extruded 3D letters + Bloom
- 💡 Two **lamps behind the sofa** wired to a new **4th light switch**

---

## Asset Credits

- **Laptop, Monitor, TV** — free GLB models (verify each license before commercial use).
- Photo, diplomas, and certificates — the author's own.
- Built with [React Three Fiber](https://r3f.docs.pmnd.rs/), [drei](https://github.com/pmndrs/drei), [pdf-to-img](https://www.npmjs.com/package/pdf-to-img), and [sharp](https://sharp.pixelplumbing.com/).

---

## 📦 Full Source Code

👉 Explore the complete code for this part on the [`part6` branch](https://github.com/myoxine/3d-profile/tree/part6).

The `part6` branch contains everything: the `Laptop`, `Monitor`, and `Tv` components, the reusable `PhotoFrame`, the gallery layout, and the PDF/image pipeline.
