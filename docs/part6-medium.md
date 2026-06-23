# Building a 3D Profile Website — Part 6: Make It Personal (Media, Photos & a Playable TV)

### Put a laptop and monitor on the desk, hang your photo and diplomas on the wall, and click the TV to play a YouTube video — right on the screen.

*Suggested tags: React, Three.js, WebGL, React Three Fiber, Portfolio*

![Cover idea: a screenshot of the gallery wall above the sofa, with the TV playing]

---

In Part 5 we made the room *interactive* — switches, lamps, day/night. It feels real, but it's still a generic room. In **Part 6** we make it **yours**: a laptop and monitor on the desk, a gallery of your photo and credentials, and a TV you can click to play a video.

Here's what we'll build:

- A laptop and monitor on the desk
- A **TV you can click to play a YouTube video** on its screen
- A reusable **PhotoFrame** component
- A **gallery wall** with your photo, diplomas, and certificates
- A workflow to turn **PDFs and big images into web-ready textures**
- Real lessons about **3D asset file sizes**

---

## Why Personal Media Matters

A portfolio room with no *you* in it is just a furniture demo. The technical pieces are simple and reusable: **GLB props** on surfaces, **textured planes** for any image, and an **`<iframe>` in 3D** for live media like YouTube.

---

## Step 1 — Drop Props on the Desk (GLB)

Convert each model with `gltfjsx`, then clean up the generated file (type-only imports, fix the asset path, remove the unused `animations` field):

```bash
npx gltfjsx public/models/laptop.glb -t -o src/components/Laptop.tsx
npx gltfjsx public/models/monitor.glb -t -o src/components/Monitor.tsx
```

Place them where the desk surface is (≈ y = -1.19 in this scene):

```tsx
<Laptop scale={0.08} position={[0.45, -1.19, -1]} />
<Monitor scale={1} rotation={[0, -0.15 * Math.PI, 0]} position={[1, -1.19, -1]} />
```

Always check a model's bounding box first — downloads come in random units and are often off-center:

```bash
npx @gltf-transform/cli inspect public/models/laptop.glb
```

---

## Step 2 — A Reusable PhotoFrame

One small component renders a framed image anywhere. It supports an optional image (lay out empty placeholders first), an optional white backing (for cut-out PNGs), and faces +Z by default.

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

// useTexture must run unconditionally, so isolate it in a child.
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
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width + border * 2, height + border * 2, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>
      {background && (
        <mesh position={[0, 0, depth / 2 + 0.0005]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color={background} />
        </mesh>
      )}
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

Calling a hook conditionally is illegal in React, so `useTexture` lives in `FramedImage` — we render that child only when an image exists, but the hook itself always runs.

---

## Step 3 — Turn PDFs & Images Into Textures

Diplomas are usually PDFs and photos are huge. Two repeatable steps fix that.

PDF → PNG with `pdf-to-img`:

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

Resize & compress with `sharp-cli` (an 8 MB photo becomes ~1 MB; documents at ~1100 px compress to under 150 KB as JPG):

```bash
npx sharp-cli --input public/images/profile.png --output public/images/profile.png resize 1024
```

---

## Step 4 — Build the Gallery Wall

With `PhotoFrame` plus a few textures, arrange a tidy grid on the wall above the sofa (frames face +Z, so on the back wall at z = -1.55 we place them at z = -1.5):

```tsx
{/* Top row: certificates */}
<PhotoFrame image="/images/cert-javascript.jpg"   width={0.26} height={0.235} position={[-1.15, 0.56, -1.5]} />
<PhotoFrame image="/images/cert-react.jpg"        width={0.26} height={0.235} position={[-0.72, 0.56, -1.5]} />
<PhotoFrame image="/images/cert-react-redux.jpg"  width={0.26} height={0.235} position={[-0.29, 0.56, -1.5]} />
<PhotoFrame image="/images/cert-react-native.jpg" width={0.26} height={0.235} position={[ 0.14, 0.56, -1.5]} />

{/* Bottom row: diplomas + your photo */}
<PhotoFrame image="/images/ijazah-s2-transkrip.jpg" width={0.2} height={0.28}  position={[-1.15, 0.12, -1.5]} />
<PhotoFrame image="/images/ijazah-s2.jpg"           width={0.3} height={0.213} position={[-0.72, 0.12, -1.5]} />
<PhotoFrame image="/images/ijazah-s1.jpg"           width={0.3} height={0.207} position={[-0.29, 0.12, -1.5]} />
<PhotoFrame image="/images/profile.png" background="#ffffff" width={0.3} height={0.39} position={[0.14, 0.12, -1.5]} />
```

Match each frame's width/height to the image's aspect ratio so nothing looks stretched.

---

## Step 5 — A TV That Plays a YouTube Video

You can't use a YouTube URL as a VideoTexture (CORS/DRM). The trick: mount a real `<iframe>` in 3D with drei's `<Html transform>`, glued to the screen. Clicking the TV toggles it.

```tsx
// src/components/Tv.tsx (core)
import { useState } from 'react'
import { Html } from '@react-three/drei'
import { Model as TvModel } from './TVModel'

const VIDEO_ID = 'pRpeEdMmmQ0'
const SCREEN_POS = [0.02, 0.39, 0]
const SCREEN_ROT = [0, Math.PI / 2, 0]
const HTML_SCALE = 0.065   // tune until the video fills the screen

export function Tv(props) {
  const [playing, setPlaying] = useState(false)
  return (
    <group {...props} onClick={(e) => { e.stopPropagation(); setPlaying(p => !p) }}>
      <TvModel />
      {playing && (
        <Html
          transform
          occlude="blending"          // respect 3D depth
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

Two gotchas that cost real time:

- **The video is tiny.** drei's transform mode does NOT map 1 CSS pixel to 1 world unit. Don't compute the scale — just tune `HTML_SCALE` until it fills the screen.
- **The video shows through walls.** An `<Html>` is a DOM element that renders on top of everything by default. Use `occlude="blending"` so the iframe is hidden by 3D geometry via the depth buffer. (Plain `occlude`/raycast mode hides it all-or-nothing instead.)

Autoplay with sound works because the play is triggered by the user's click.

---

## Lessons on Asset File Size

Two models nearly broke this build:

- A 94 MB sofa made `git push` time out and bloated the repo. Swapped for a 20 KB low-poly couch.
- A "monitor" GLB was actually a 47 MB full scene (walls + two monitors). Replaced with a clean 0.4 MB single mesh.

Inspect every download, prefer low-poly, resize textures, and keep assets well under ~10 MB.

---

## What You've Built

- A laptop and monitor on the desk
- A clickable TV playing a YouTube video, correctly occluded by the room
- A reusable PhotoFrame for any image
- A gallery of your photo, diplomas, and certificates
- A reusable pipeline: PDF → PNG → resized texture

Your room is now unmistakably yours.

---

## Coming Up Next

- Clickable hotspots that focus the camera and reveal info panels (projects, about, contact)
- A guided tour and smooth camera transitions
- Deploying your 3D portfolio online

---

## Resources

- React Three Fiber — https://r3f.docs.pmnd.rs/
- drei (`Html`, `useTexture`) — https://github.com/pmndrs/drei
- pdf-to-img — https://www.npmjs.com/package/pdf-to-img
- sharp — https://sharp.pixelplumbing.com/
- gltfjsx — https://github.com/pmndrs/gltfjsx

*If this helped, leave a few claps and follow for Part 7.*
