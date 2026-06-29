# 3D Profile Website — A 13-Part Tutorial Series

Build a **navigable, interactive, fast, mobile-friendly 3D portfolio** with [React Three Fiber](https://r3f.docs.pmnd.rs/) — a room visitors can tour, click, and read, from an empty `<Canvas>` all the way to a live URL.

This is the full series index. Each part is one focused step that builds on the last, written as a hands-on walkthrough with the real code, the gotchas we hit, and the lessons learned.

---

## What You'll Build

A single room that doubles as a portfolio:

- 🏠 A **textured, furnished 3D room** — floor, walls, window, door, ceiling, real furniture
- 💡 **Interactive lighting** — clickable switches, lamps that glow, automatic day/night
- 🖥️ A **clickable desktop inside the monitor** ("Hadi OS"), a résumé timeline, a playable TV, a gallery wall
- 🧭 **Guided navigation** — a menu that flies the camera to each area, an auto tour, deep links
- 🧍 **Animated characters**, a live clock, and a glowing neon sign
- ⚡ **Fast & mobile** — 172 MB cut to 44 MB, a quality tier for weak GPUs, a responsive UI
- 🔊 **Procedural audio**, a branded loading screen, and micro-interactions
- 🚀 **Deployed** behind a URL with full SEO and a polished social-share card

**Tech stack:** React + TypeScript + Vite · React Three Fiber · drei · @react-three/postprocessing · zustand · Three.js.

**Who it's for:** anyone comfortable with React who wants to learn practical, production-minded 3D on the web. No prior Three.js experience required — Part 1 starts from zero.

---

## Table of Contents

Each part links to its full tutorial. Every part also has a condensed `*-medium.md` variant (the Medium-publication version), and its complete code on a matching `partN` branch.

### Act I — Build the Room (Foundation)

| # | Part | What you'll do |
|---|------|----------------|
| 1 | [Set Up & Build Your First 3D Room](part1.md) | Scaffold Vite + R3F; a floor, walls, a box, lights, shadows, and orbit controls |
| 2 | [Textures, Walls With Holes & a Reflective Window](part2.md) | PBR textures, `ExtrudeGeometry` walls that cut their own holes, reflective glass |
| 3 | [Furniture & Animation](part3.md) | Load GLB models with `gltfjsx`, tame their scale, add a Suspense loader |
| 4 | [Doors, Ceilings & HDRI Light](part4.md) | A 3D door, a ceiling, HDRI environment lighting, and shadow-casting sun |

### Act II — Make It Live (Interactivity & Content)

| # | Part | What you'll do |
|---|------|----------------|
| 5 | [Interactive Lighting & Setting the Mood](part5.md) | A lighting store, clickable switches, glowing lamps, day/night, Bloom |
| 6 | [Make It Personal — Media, Photos & a Playable TV](part6.md) | A reusable `PhotoFrame`, a gallery wall, a clickable YouTube TV |
| 7 | [Bring It to Life — Characters, a Clock & Neon](part7.md) | Mixamo + Ready Player Me avatars, a real-time clock, a neon sign |
| 8 | [Make It Navigable — Camera Menu & Clickable Objects](part8.md) | A zustand store, `CameraControls` view presets, a menu, clickable meshes |
| 9 | [Make It Interactive — Desktop-in-the-Monitor & Deep Links](part9.md) | "Hadi OS" desktop, hover tooltips, an auto tour, URL-hash deep links |

### Act III — Ship It (Production)

| # | Part | What you'll do |
|---|------|----------------|
| 10 | [Make It Fast — 172 MB → 44 MB](part10.md) | Audit, Draco-compress GLBs, fix the gotchas, set a render budget |
| 11 | [Make It Mobile — Responsive UI & a Quality Tier](part11.md) | A `useMediaQuery` hook, an auto quality tier, a menu that fits a phone |
| 12 | [Make It Delightful — Audio, Loading Screen & Micro-Interactions](part12.md) | Procedural Web-Audio SFX, a mute toggle, a branded loader, cinematic easing |
| 13 | [Ship It — Deployment, SEO & a Social Card](part13.md) | A production build, Vercel + cache headers, Open Graph, favicon & manifest |

---

## How to Read It

- **Follow in order.** Each part assumes the previous one; the room grows step by step.
- **Grab the code per part.** Every tutorial ends with a link to its `partN` branch on [GitHub](https://github.com/myoxine/3d-profile), so you can check out the exact state for that step.
- **Prefer the prose version?** Open the matching `*-medium.md` — same content, condensed for reading.

---

## Series Map at a Glance

```
Act I — Build           Act II — Make It Live        Act III — Ship It
1  Setup & first room    5  Interactive lighting       10  Performance (172→44 MB)
2  Textures & window     6  Media, photos, TV          11  Mobile & responsive
3  Models & animation    7  Characters, clock, neon    12  Audio & polish
4  Door, ceiling, HDRI   8  Camera menu & navigation   13  Deploy & SEO
                         9  Desktop, tour, deep links
```

From a black screen to a room with the lights on, behind a domain. Start with **[Part 1 →](part1.md)**.
