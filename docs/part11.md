# 3D Profile Website - Part 11: Make It Mobile — Responsive UI, a Quality Tier & Sane Camera Bounds

Welcome back to the **3D Profile Website** series!

After Part 10 the portfolio is light enough to open on a phone — but "loads on a phone" and "*works* on a phone" are different things. A landscape-tuned camera crops the room on a tall screen, a six-item menu overflows a 360-px-wide viewport, and full-fat postprocessing makes a budget GPU chug. **Part 11** fixes the experience on small screens:

✅ A tiny **`useMediaQuery` hook** — reactive breakpoints with no library
✅ A **quality tier**: drop the pixel ratio and switch off Bloom on phones, automatically
✅ A **responsive menu** — icon-only and horizontally scrollable when space is tight
✅ A cautionary tale: **why we tried adaptive FOV and then ripped it out**
✅ The reasoning behind *what* to scale back on mobile, and what to leave alone

The same scene, now comfortable from a 13" laptop down to a phone in portrait.

Let's go.

---

## The Core Tool: a Reactive Media Query

Everything in this part keys off "how big / what kind of screen is this?" We want that as **reactive React state**, so the UI and the renderer re-evaluate when the viewport changes (rotate the phone, resize the window). `window.matchMedia` gives us the signal; a 15-line hook turns it into state:

```ts
// src/hooks/useMediaQuery.ts
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsMobile   = () => useMediaQuery('(max-width: 640px)')
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)')
// small screen OR a coarse (finger) pointer — the quality-tier target
export const useIsLowPower = () =>
  useMediaQuery('(max-width: 820px), (pointer: coarse)')
```

Three named breakpoints, three jobs:

- **`useIsMobile`** drives *layout* (menu shape).
- **`useIsLowPower`** drives the *render budget*. Note the `(pointer: coarse)` clause — it catches tablets and touch laptops, not just narrow windows.
- **`useIsPortrait`** is there for orientation-specific tweaks.

> 💡 **Why `matchMedia` and not a resize listener?** `matchMedia` only fires when you *cross* a breakpoint, not on every pixel of a drag. It's the difference between a handful of state updates and hundreds.

---

## Step 1 — A Quality Tier (the renderer adapts itself)

A desktop GPU shrugs at a 1.5× pixel ratio plus a postprocessing pass. A phone does not. Two settings carry most of the cost, and we tie both to `useIsLowPower`:

```tsx
// src/App.tsx
const lowPower = useIsLowPower()

<Canvas shadows dpr={lowPower ? [1, 1] : [1, 1.5]}>
  …
  {!lowPower && (
    <EffectComposer>
      <Bloom intensity={0.32} luminanceThreshold={0.9} mipmapBlur />
    </EffectComposer>
  )}
</Canvas>
```

**Pixel ratio is the single biggest lever.** A phone at DPR 3 renders **9× the fragments** of a 1× buffer — for a glossy, shadowed, bloomed scene that's the difference between 60 fps and a slideshow. Capping `dpr` at **1** on mobile keeps it crisp enough (phone pixels are tiny) at a third of the fill-rate.

**Bloom is the second.** Postprocessing means an extra full-screen pass (several, with mipmap blur). It's a lovely touch on the lamp bulbs — and the first thing to cut on a weak GPU. We simply don't mount the `EffectComposer` when `lowPower`.

> 🧠 **Cut fill-rate before you cut geometry.** Triangles are cheap on modern mobile GPUs; *pixels and passes* are what hurt. So the mobile tier targets DPR and postprocessing, not model detail — the room looks identical, it just renders fewer pixels less often.

---

## Step 2 — The Adaptive-FOV Trap (a thing we *removed*)

Here's a "clever" idea that seemed obviously right and turned out to be wrong — worth showing in full, because you'll be tempted by it too.

A portrait phone has a tall, narrow viewport. A perspective camera's vertical FOV is fixed, so a taller viewport sees *less* horizontally and crops the room. The "fix" looks trivial: **widen the FOV as the screen gets taller.**

```tsx
// ❌ DON'T DO THIS — it backfired on us
useEffect(() => {
  const cam = camera as THREE.PerspectiveCamera
  const aspect = size.width / size.height
  cam.fov = aspect < 1 ? 82 : aspect < 1.4 ? 70 : 60   // portrait → wide
  cam.updateProjectionMatrix()
}, [camera, size])
```

It shipped, and the scene looked *broken*: the monitor ballooned into a giant grey slab, the bookshelf loomed like skyscrapers, everything near the camera bulged. Two reasons, both fundamental:

1. **Wide FOV in a small room = fisheye.** Our room is barely a couple of metres across and the camera sits *inside* it. At 70–82°, objects near the lens distort violently — that's wide-angle perspective doing exactly what it does, just in a space too tight to hide it.
2. **FOV is global — it wrecked the calibration.** All of Part 9's painstaking monitor-screen alignment (the `<Html transform>` desktop, the mock image, the CSS3D factor) was tuned at **FOV 60**. Change the lens and every hand-calibrated focus view shifts off its mark.

So we **deleted it** and pinned the FOV at a fixed 60:

```tsx
// FOV is intentionally LEFT FIXED (60, set on <Canvas>). Adaptive FOV
// fisheye'd this tiny room AND broke the Part-9 monitor calibration.
// Responsiveness is handled in the UI layer, not by changing the lens.
```

> 🧠 **The real lesson:** responsiveness belongs in the **UI layer** (DOM that reflows), not in the **camera** (a calibrated instrument). When a view has been hand-framed, treat its lens as a fixed constant — adapt the *interface* around it, not the optics. Minor portrait cropping is a fair price for framing that never lies.

---

## Step 3 — A Menu That Survives 360 px

The bottom menu has six items. With full text labels they're fine on a laptop and a crowded mess on a phone — "Tutorial Series" alone is wider than a thumb. So on mobile we **collapse to icons** and let the bar **scroll horizontally** if it still doesn't fit:

```tsx
const isMobile = useIsMobile()

<nav style={{
  display: 'flex', flexWrap: 'nowrap',
  justifyContent: isMobile ? 'flex-start' : 'center',
  maxWidth: '96vw',
  overflowX: 'auto',                 // scroll instead of overflow
  scrollbarWidth: 'none',            // hide the scrollbar chrome
}}>
  {NAV.map((n) => (
    <button title={n.label} aria-label={n.label}   // label still available
      style={{
        flex: 'none',                               // don't shrink to mush
        gap: isMobile ? 0 : 7,
        padding: isMobile ? '10px 12px' : '9px 16px',
      }}>
      <span style={{ fontSize: isMobile ? 18 : 15 }}>{n.icon}</span>
      {!isMobile && n.label}
    </button>
  ))}
</nav>
```

The details that matter:

- **`flex: 'none'`** — without it, flexbox *shrinks* the buttons to fit, and you get six unreadable slivers. We'd rather they keep their size and scroll.
- **`title` + `aria-label`** — when the text is gone, the label lives on for hover tooltips and screen readers. Don't drop accessibility just because you dropped the text.
- **Bigger icon, zero gap** — an 18-px glyph with snug padding makes a comfortable touch target without the label.

The overlays we built earlier were already responsive — the tour card is `width: min(560px, 92vw)`, the drawers are `min(400px, 88vw)`, the photo modal is capped in `vw`/`vh`. The lesson there: **size overlays in viewport units with a `min()` cap** and they handle phones for free.

---

## What About Touch?

Good news: almost nothing to do. drei's **`CameraControls` is touch-native** — one finger orbits, two fingers dolly/truck. And the camera locks we added in Part 8 (`minDistance === maxDistance`, `enabled = false` on a focused view) work identically under touch, so a pinch can't wreck a hand-tuned framing. The room **boundary box** keeps a swiping finger from flinging the camera through a wall, exactly as it does with a mouse. Mobile interaction came mostly for free because the constraints were modeled on the camera, not the input device.

> 🧱 **A camera bound we tried, then backed out of.** Free orbit in the overview has an edge case: `boundaryEnclosesCamera` *slides* the camera along the wall as you swing it, so you can orbit until the lens is centimetres from the bookshelf and one book fills the screen. The "obvious" fix — clamp `minAzimuthAngle`/`maxAzimuthAngle` to a tight cone — **backfired badly**: camera-controls measures azimuth from its own zero axis, *not* from your view direction, so hardcoded absolute limits centred on `0` pinned the camera to the wrong heading (staring at the bookshelf) and barely let it rotate at all. Two failed guesses later, the lesson stuck: **don't clamp a control to magic angle constants you haven't measured.** We kept orbit *free* (the Part-8 behaviour) and instead made the **Home button a guaranteed reset**: clicking *Beranda* bumps a `homeKey` counter the camera effect depends on, so it re-runs `setLookAt` and snaps back to the perfect framing — even when the view was already "overview". One tap recovers from any orbit.

---

## Lessons Learned in Part 11

- **Make "what screen is this?" reactive.** A 15-line `useMediaQuery` over `window.matchMedia` beats a resize listener — it only fires on breakpoint crossings, and any component can read it.
- **On mobile, cut fill-rate first.** `dpr` and postprocessing dominate the frame cost; capping DPR to 1 and dropping Bloom recovers the most fps for the least visible change. Geometry detail is not the problem.
- **Don't make a calibrated camera responsive.** Adaptive FOV fisheyes a small room and shifts every hand-framed view off its calibration. Pin the lens; reflow the *UI* instead. Accept a little portrait cropping.
- **When labels won't fit, go icon-only — but keep `title`/`aria-label`.** Use `flex: none` + `overflow-x: auto` so buttons scroll instead of shrinking into slivers.
- **Size overlays in `vw`/`vh` with `min()`** and they're responsive without breakpoints.
- **Model constraints on the camera, not the input.** Because locks and the boundary live on `CameraControls`, touch behaves correctly with zero extra code.

---

## What's Next

The portfolio now adapts from desktop to a phone in portrait: it renders within budget, frames correctly, and the menu fits a thumb. That leaves the fun finishing touches for **Part 12 — Audio & Polish**: ambient room tone and click SFX, smoother camera easing, a friendlier loading screen, and a few small delights. After that, it's a portfolio you can confidently drop into a résumé link.

Thanks for following along — go shrink your room to pocket size. 📱

---

### Asset Credits

- Camera controls — [`camera-controls`](https://github.com/yomotsu/camera-controls) via [@react-three/drei](https://github.com/pmndrs/drei)
- Responsive signal — the platform's own [`window.matchMedia`](https://developer.mozilla.org/docs/Web/API/Window/matchMedia)

---

## 📦 Full Source Code

👉 Explore the complete code for this part on the [`part11` branch](https://github.com/myoxine/3d-profile/tree/part11).
