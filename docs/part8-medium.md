3D Profile Website — Part 8: Make It Navigable with a Camera Menu, Focus Views & Clickable Objects

Welcome back to the 3D Profile Website series!

By Part 7 the room is alive — people, a ticking clock, glowing neon. But a visitor still has to fly the camera around by hand to find anything. In Part 8 we turn the room into a guided experience:

• A state store (zustand) that works both inside and outside the R3F Canvas
• Replacing OrbitControls with CameraControls and a set of named “view” presets the camera animates to
• A bottom menu bar (Beranda · Pencapaian · Portofolio · My Video · Tutorial · Terhubung) that flies you to each area, plus an Exit button
• Locking interaction per view — the overview rotates freely; a focused view freezes so the framing stays perfect
• Keeping the camera inside the room so it can never end up staring at the outside wall
• Clickable 3D objects — click the monitor to focus the desk, click a social cube to open a link
• The framing gotchas that bit us: keystone tilt, the camera escaping through a solid wall, aiming at the wrong height

By the end, anyone can land on your page and tour it from a menu — no 3D skills required.

—  —  —

The One Idea That Makes This Hard: the Canvas Boundary

Our menu is plain HTML buttons. The camera lives inside <Canvas> (the react-three-fiber world). These are two different React reconcilers, and React Context does not cross between them — a provider wrapped around both won’t deliver the same context to a DOM button and a 3D mesh.

The clean fix is a store that lives outside React’s tree entirely. We use zustand: a hook you can read from a DOM component and from a mesh, and they both see the same state.

    export type ViewName = 'overview' | 'photos' | 'tv' | 'desk' | 'shelf' | 'books'

    export const useFocus = create((set) => ({
      view: 'overview',
      photo: null,
      setView: (view) => set({ view }),
      openPhoto: (photo) => set({ photo, view: 'photos' }),
      closePhoto: () => set({ photo: null }),
      reset: () => set({ view: 'overview', photo: null }),
    }))

That’s the whole architecture: the menu writes view, the camera reads view. Everything else is geometry.

—  —  —

Step 1 — Swap OrbitControls for CameraControls

OrbitControls is great for free-look, but it can’t animate to a destination. drei’s CameraControls can: one call, setLookAt(camX, camY, camZ, targetX, targetY, targetZ, enableTransition), smoothly flies the camera and its look-at target to a new pose.

We define one preset per area — a camera position and a target (the point it looks at):

    const VIEWS = {
      overview: { pos: [0, 0, 1.3],        target: [0, -0.05, -0.6] },
      photos:   { pos: [-0.5, 0.34, -0.3], target: [-0.5, 0.34, -1.5] },
      tv:       { pos: [-0.55, -0.45, -0.2], target: [-0.55, -0.45, 1.3] },
      desk:     { pos: [0.83, -0.97, -0.82], target: [1.0, -0.97, -1.15] },
      shelf:    { pos: [0.9, -0.05, -0.3], target: [0.9, -0.05, -1.44] },
      books:    { pos: [-0.35, -0.3, 0],   target: [-1.5, -0.35, 0] },
    }

A single effect drives the camera whenever view changes:

    useEffect(() => {
      const c = ref.current
      if (!c) return
      const v = VIEWS[view]
      c.setLookAt(...v.pos, ...v.target, true) // true = animate
    }, [view])

    return <CameraControls ref={ref} makeDefault />

makeDefault tells R3F this is the controls instance, so other helpers respect it.

—  —  —

Step 2 — The Menu (HTML, outside the Canvas)

The menu is a normal React component rendered as a sibling of <Canvas>, not inside it. That keeps it as crisp DOM (no 3D text blurriness) and lets us use CSS freely.

    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas> … <CameraRig /> … </Canvas>
      <SceneMenu />   {/* absolutely-positioned overlay */}
    </div>

The menu maps a small config to buttons; clicking one just calls setView:

    const NAV = [
      { view: 'overview', label: 'Beranda',    icon: '🏠' },
      { view: 'photos',   label: 'Pencapaian', icon: '🏆' },
      { view: 'desk',     label: 'Portofolio', icon: '🚀' },
      { view: 'tv',       label: 'My Video',   icon: '🎬' },
      { view: 'books',    label: 'Tutorial',   icon: '📚' },
      { view: 'shelf',    label: 'Terhubung',  icon: '🤝' },
    ]

whiteSpace: 'nowrap' matters: “My Video” wrapped to two lines in the pill until we added it.

—  —  —

Step 3 — Lock Interaction Per View

This is the bit that makes it feel designed instead of loose. We want:

• Overview: the visitor can orbit and zoom a little — it’s the “explore” state.
• A focused view: the framing is hand-tuned, so any rotate/zoom would ruin it. Freeze all input; the only way out is an Exit button.

CameraControls exposes enabled, minDistance, and maxDistance on the ref, so we set them per view:

    if (view === 'overview') {
      c.minDistance = 0.8
      c.maxDistance = 2.0       // see Step 4
      c.enabled = true
    } else {
      const d = Math.hypot(...)  // preset distance
      c.minDistance = d          // lock zoom: min == max
      c.maxDistance = d
      c.enabled = false          // no rotate / zoom / pan
    }
    c.setLookAt(...v.pos, ...v.target, true)

enabled = false does not stop the animation. CameraControls runs its transition from useFrame, independent of user input — so the fly-to still plays, the visitor just can’t grab it afterward.

The Exit button only appears when we’re focused, and returns to overview:

    const focused = view !== 'overview'
    {focused && <button onClick={() => reset()}>✕ Keluar</button>}

—  —  —

Step 4 — Keep the Camera Inside the Room

Here’s a gotcha specific to this scene. Our walls aren’t single-sided planes that vanish when you look from behind — they’re ExtrudeGeometry slabs, solid from both sides. So the moment the camera drifts outside, you see the blank outer wall (and the door), not the room.

Two things conspire to push the camera out:

1. The initial overview sat at z = 2.9 — behind the front wall (z = 1.55). We were literally outside looking at the door. Moving it to z = 1.3 puts it inside.
2. Orbiting at a large distance swings the camera around the target and straight through a wall.

The fix for both is one feature of CameraControls: a boundary box that can also enclose the camera.

    const ROOM_BOUNDARY = new THREE.Box3(
      new THREE.Vector3(-1.4, -1.85, -1.4),
      new THREE.Vector3( 1.4,  1.85,  1.4),
    )

    c.setBoundary(ROOM_BOUNDARY)
    c.boundaryEnclosesCamera = true   // clamp the camera, not just the target

Combined with the maxDistance = 2.0 cap on the overview, the camera now rotates freely but can never leave the room — it slides along the inner wall instead of punching through it.

—  —  —

Step 5 — Framing: Two Rules That Kill “It Looks Off”

We iterated the focus views against screenshots, and every “it looks wrong” came down to one of two rules.

Rule 1 — To face a screen square-on, sit on its normal. Our monitor is rotated −0.15π about Y, so its screen doesn’t face straight down +Z. Aiming from the wrong side makes the screen a trapezoid (keystone). The screen’s forward direction is its rotated normal, (sin θ, 0, cos θ) = (−0.454, 0, 0.891). Put the camera on that line at the screen’s center, and pos − target matches the normal — perfectly perpendicular.

    desk: { pos: [0.83, -0.97, -0.82], target: [1.0, -0.97, -1.15] }
    // pos − target = (−0.17, 0, 0.33) ∝ (−0.454, 0, 0.891) ✓

Rule 2 — For a level shot, keep pos.y === target.y. Any vertical difference between camera height and target height tilts the camera, and vertical lines lean. The Social shelf looked “miring” (tilted) until we set both y to the same value:

    shelf: { pos: [0.9, -0.05, -0.3], target: [0.9, -0.05, -1.44] }  // dead level

When you need to show two things at different heights (the TV and the clock above it), don’t tilt — back the camera up and aim level at the midpoint:

    tv: { pos: [-0.55, -0.45, -0.2], target: [-0.55, -0.45, 1.3] }   // level, pulled back

Estimating a preset: target the center of the thing, then choose distance from how wide it is. With a ~50° vertical FOV, horizontal half-width ≈ distance × 0.65 (for a ~1.4 aspect). Five cubes spanning ~1.1 m need distance ≳ 1.0 to fit.

—  —  —

Step 6 — Clickable 3D Objects

A mesh in R3F takes pointer events just like DOM. We make the monitor and laptop focus the desk, and switch the cursor on hover:

    const deskClick = (e) => { e.stopPropagation(); setView('desk') }
    const pointer = {
      onPointerOver: (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' },
      onPointerOut:  () => { document.body.style.cursor = 'auto' },
    }
    <Monitor onClick={deskClick} {...pointer} … />

Always call e.stopPropagation() in 3D click handlers — a ray can hit several meshes along its path, and without it a click “falls through” to whatever is behind.

—  —  —

Step 7 — The “Terhubung” Cubes: Extruded Logos That Spin

For the social links we built glowing cubes with a raised brand logo on each face. The logo geometry comes from extruding an SVG path:

    const data = new SVGLoader().parse(
      `<svg viewBox="0 0 24 24"><path d="${PATHS[name]}"/></svg>`
    )
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p))
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.012, bevelEnabled: false })
    geo.center()
    geo.scale(scale, -scale, 1) // −y: SVG’s Y axis points down

Each cube places that logo on five faces (we skip the top so it reads as a tidy object from above), spins slowly in useFrame, and glows softly via an emissive material (picked up by the Bloom from Part 5). Clicking a cube opens its link. We centralize that so mailto: and https: are handled correctly:

    export function openLink(url) {
      if (url.startsWith('mailto:')) window.location.href = url
      else window.open(url, '_blank', 'noopener,noreferrer')
    }

—  —  —

Step 8 — A Bookshelf Driven by a Config

The “Tutorial” wall is a 2×2 tile shelf; each cell is one Medium series, and every book is one article. The data is plain config, so adding an article is a one-line edit — no scene surgery:

    export const TUTORIALS = [
      { name: 'Expo Router',            color: '#3a7bd5', articles: [/* … */] },
      { name: 'Fastify REST API',       color: '#22a06b', articles: [/* … */] },
      { name: 'ExpressJS + TypeScript', color: '#e0a526', articles: [/* … */] },
      { name: '3D Profile Website',     color: '#b5179e', articles: [/* … */] },
    ]

Books stand spine-out so the title is readable, which needs a nested rotation (the model’s “up” isn’t ours) and a small origin correction so the title text sticks to the spine instead of floating in front of it. We tie materials together too: the bookshelf frame matches the floating social shelf (#6b4a2f wood) so the two custom pieces read as one set.

—  —  —

Lessons Learned in Part 8

• State that must cross the <Canvas> boundary belongs in a store (zustand), not React Context.
• CameraControls.setLookAt(...) turns “fly to this view” into one line; presets are just position + target.
• Lock the camera per view (enabled, min/maxDistance). A focused shot you hand-tuned shouldn’t be draggable — give an Exit instead.
• Solid walls mean the camera can escape the room. setBoundary + boundaryEnclosesCamera keeps it inside; cap maxDistance so zoom-out can’t either.
• Keystone has two causes: not sitting on a screen’s normal, and pos.y ≠ target.y. Fix both and framing snaps to “professional.”
• 3D meshes take onClick/onPointerOver — just remember stopPropagation().
• Drive repeating content from config (links, tutorials). Adding an item should never mean editing the scene.

—  —  —

What’s Next

The room is now a guided portfolio: a menu tours every area, objects are clickable, and the camera always behaves. Next we can flesh out the book & project drawers (a side panel listing each series’ articles, app-style project icons), add deep links (open straight into a view via the URL hash), and lazy-load the heavy GLBs so the first paint is instant.

Thanks for following along — go make your room navigable. 🎥

—  —  —

Asset Credits

• Brand logos — official SVG paths (each brand’s trademark belongs to its owner; used here as link affordances)
• Camera controls — camera-controls via @react-three/drei
• State — zustand
