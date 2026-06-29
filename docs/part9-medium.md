3D Profile Website — Part 9: Make It Interactive with a Desktop-in-the-Monitor, Hover Tooltips, an Auto Tour & Deep Links

Welcome back to the 3D Profile Website series!

In Part 8 we made the room navigable: a menu flies the camera to each area, objects are clickable, and the camera can never escape the room. But every focus view was still a picture — you arrived, you looked, you left. In Part 9 we make the room answer back:

• A real desktop UI rendered inside the 3D monitor (“Hadi OS”) — clickable project icons that open detail windows, plus a “Resume” app with a career timeline
• The mesh-vs-DOM occlusion problem, and the idle-mock / focused-HTML swap that solves it
• The <Html transform> pixel-to-world factor (≈ 1/41) that makes a 900-px DOM canvas the exact size of the screen
• Hover tooltips on social cubes, tutorial books and light switches — gated to the relevant view so they only appear when you’re meant to see them
• An auto room tour with per-area explanations, a live seconds countdown, and Next / Previous controls
• Deep links — open …/#experience and land straight on the desk; every view updates the URL hash so any framing is shareable
• Lazy-loading the heavy avatars and a textured laptop screen so the first paint is fast

By the end your room isn’t a diorama — it’s an app you can walk through.

Let’s go.

—  —  —

The Big Idea: Two Kinds of “Screen Content”

The whole part hangs on one realization. We want a real, clickable UI on the monitor — buttons, windows, scrolling text. In react-three-fiber there are two ways to put 2D content on a 3D surface, and neither one alone is good enough:

• A textured mesh (an image on a planeGeometry) occludes correctly — it’s real geometry, so it sorts behind the seated character — but it can’t receive DOM events, so nothing is clickable.
• <Html transform> (real DOM projected onto the surface) is fully clickable HTML/CSS, but it’s an overlay — it bleeds over geometry that sits in front of it.

So we use both, and switch between them based on focus:

• When you’re not looking at the desk → show a textured mesh (a screenshot of the desktop). It sorts correctly behind the seated character and other furniture.
• When you focus the desk (Experience) → swap in the live <Html> desktop so every icon is clickable. At that camera angle nothing is in front of the screen, so the overlay caveat doesn’t bite.

That single rule drives the entire MonitorScreen component.

    const active = useFocus((s) => s.view === 'desk')

    return (
      <>
        {!active && (/* textured-mesh screenshot */)}
        {active  && (/* live <Html> desktop */)}
      </>
    )

Why not just always use <Html occlude>? drei’s occlude="blending" works for solid box geometry, but our seated avatar is a skinned mesh — the occlusion test doesn’t track its animated pose, so the DOM desktop visibly punched through the person sitting at the desk. Gating the DOM to the one camera angle where nothing overlaps it sidesteps the whole problem.

—  —  —

Step 1 — The <Html transform> Pixel-to-World Factor

When you put <Html transform> on a surface, drei renders your DOM through a CSS3D transform. The trap: the DOM’s pixel size and the 3D world’s metric size are related by an internal constant of roughly 1/41. Get it wrong and you get the classic bug — a huge black screen with a tiny UI in the corner, or a UI that spills far off the monitor.

The fix is to pick a fixed pixel canvas and convert it deliberately. We author the desktop at 900 × 520 px, then any backing plane we draw behind it must use the same conversion so its size matches the DOM:

    const W = 900, H = 520        // DOM canvas (pixels)
    const CSS3D = 1 / 41          // drei <Html transform> px -> world factor

    // world size of the screen = W * scale * CSS3D
    <planeGeometry args={[W * HTML.s * CSS3D, H * HTML.s * CSS3D]} />
    <Html transform scale={HTML.s} position={[0, 0, 0.006]}> … </Html>

With W * s * CSS3D the dark backing plane is exactly the size of the rendered DOM — no black margins, no overflow. The scale (s) then becomes your one knob to make the whole thing the right physical size on the monitor.

—  —  —

Step 2 — Two Independent Transforms (Mock vs HTML)

Here’s a subtle bug we hit. The idle mock-image and the focused HTML desktop looked correct individually but drifted apart when we shared one transform — the screenshot is a different aspect/scale than the live DOM, so a single position/scale couldn’t sit both flush on the glass.

The fix is blunt and reliable: give each its own calibrated transform.

    // calibrated separately so the mock image and the live desktop never conflict
    const IMG  = { px: 1.001, py: -0.955, pz: -1.204, rx: 0, ry: -0.4712, rz: 0, s: 0.0219 }
    const HTML = { px: 0.999, py: -0.957, pz: -1.205, rx: 0, ry: -0.4712, rz: 0, s: 0.0214 }

How we found these numbers: a throwaway “tuner” — a tiny zustand store wired to DOM number-inputs, read live by the component, with the desk camera temporarily unlocked so we could see the screen head-on while dragging values. Once both sat flush we baked the constants and deleted the tuner store + panel. It’s the same calibration pattern we used for the laptop screen. Keep that pattern in your back pocket — it turns “nudge, rebuild, squint, repeat” into a live slider.

The ry: -0.4712 is not arbitrary. The monitor is rotated −0.15π ≈ −0.4712 rad about Y (Part 8). The screen content has to share that exact yaw or it floats off-axis.

—  —  —

Step 3 — Don’t Let a Missing Image Crash the Scene

useTexture('/images/monitor-screen.png') throws if the file isn’t there — and a throw inside the Canvas takes down the entire scene (blank white page), not just the monitor. We wrap the idle screenshot in two guards:

    // 1) Suspense handles the "still loading" state
    // 2) an ErrorBoundary handles the "file is missing" state
    <ImgBoundary fallback={null}>
      <Suspense fallback={null}>
        <IdleScreen … />
      </Suspense>
    </ImgBoundary>

ImgBoundary is a tiny class component — error boundaries can’t be hooks:

    class ImgBoundary extends Component {
      state = { failed: false }
      static getDerivedStateFromError() { return { failed: true } }
      render() { return this.state.failed ? this.props.fallback : this.props.children }
    }

Now a missing asset degrades to a dark screen instead of a white-screen-of-death. And the idle texture itself is unlit so it reads as “powered on”:

    <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />

toneMapped={false} keeps the screenshot at full brightness regardless of scene lighting/Bloom — exactly what a glowing screen should do. We use the same trick for the laptop screen, which is just a meshBasicMaterial plane showing a VS Code screenshot at a hand-calibrated 0.405 × 0.255 m.

—  —  —

Step 4 — “Hadi OS”: a Desktop You Can Click

The focused view renders a full mini-OS in DOM: a top bar, a 5-column icon grid, a taskbar, and floating windows. The icons are data-driven — a Resume app plus one tile per project from a config file, so adding a project is a one-line edit:

    export const PROJECTS = [
      { id: 'twistxd', name: 'TwistXD', icon: '📊', category: 'BI Dashboard',
        role: 'IT Manager', desc: 'Portal web untuk dashboard & reporting …',
        tech: ['PHP','MySQL','SAP'], highlights: ['Integrasi data SAP …'] },
      /* …12 projects, each lifted from the CV… */
    ]

The grid maps that array to clickable tiles; a click sets local React state to open a window:

    const [open, setOpen] = useState(null)
    const [resume, setResume] = useState(false)

    {PROJECTS.map((p) => (
      <button key={p.id} onClick={() => setOpen(p)} title={p.name}>
        <span>{p.icon}</span>
        <span>{p.name}</span>
      </button>
    ))}

When open is set, a macOS-style window floats over the desktop — traffic-light dots, category/role chips, a description, highlights, and tech-stack pills.

The “Resume” app = the Experience timeline

For work history we didn’t add another drawer — we put a Resume icon on the desktop that opens a vertical timeline built from a second config file:

    export const EXPERIENCE = [
      { role: 'IT Manager', company: 'PT Jaya Swarasa Agung', period: 'Okt 2021 — Sekarang',
        desc: 'Perusahaan manufaktur FMCG …', highlights: ['Maintenance & optimasi ERP (SAP)'] },
      /* …7 roles… */
    ]

Two configs, one screen: projects.ts feeds the desktop icons; experience.ts feeds the Resume app. Both are plain data — the 3D code never changes when your CV does.

—  —  —

Step 5 — Hover Tooltips, Gated to the Right View

We added <Html> tooltips to three things: social cubes, tutorial books, and light switches. The important design choice: a tooltip only shows when you’re focused on that area. Floating labels everywhere, all the time, would turn the overview into noise.

The pattern is hovered && active, where active reads the current view from the store:

    const active = useFocus((s) => s.view === 'shelf')
    const [hovered, setHovered] = useState(false)

    {hovered && active && (
      <Html position={[0, size * 1.15, 0]} center distanceFactor={1.4}
            style={{ pointerEvents: 'none' }}>
        <div>{label}</div>
      </Html>
    )}

Two gotchas worth calling out, both of which we hit:

• Give the tooltip a fixed width. A bare <Html> div collapses to min-content, so a label wrapped one word per line. Setting width: 180 (books) fixed it.
• Place the tooltip over the object’s body, not its top edge. The book tooltip vanished when the pointer moved off the spine; lowering it to sit over the book body kept hover stable.

The light switches get the same treatment with a friendly label + on/off status (Lampu Plafon, Neon Sign, Lampu Meja, Lampu Sofa), so hovering “Lampu Meja” tells you what it controls before you flip it.

—  —  —

Step 6 — An Auto Tour With a Live Countdown

The tour is a small state machine living in SceneMenu. It walks an ordered list of views, shows an explanation card for each, and auto-advances after a dwell time — with a visible seconds countdown so the visitor knows when it’ll move on.

    const TOUR = ['overview', 'photos', 'desk', 'tv', 'books', 'shelf']
    const dwellOf = (v) => (v === 'overview' ? 11000 : 8000) // Beranda reads longer

    const [step, setStep] = useState(0)
    const [remaining, setRemaining] = useState(0)

    useEffect(() => {
      if (!touring) return
      setView(TOUR[step])                              // fly camera to this area
      const total = dwellOf(TOUR[step])
      setRemaining(Math.round(total / 1000))
      const tick  = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
      const timer = setTimeout(() => {
        if (step + 1 >= TOUR.length) reset()           // last step -> stop the tour
        else setStep(step + 1)
      }, total)
      return () => { clearInterval(tick); clearTimeout(timer) }
    }, [touring, step, setView, reset])

Two timers, both cleaned up on every step change — that cleanup is what makes manual Next / Previous work without leaking a stale auto-advance. The button label even doubles as the countdown:

    <button onClick={tourPrev} disabled={step === 0}>‹ Sebelumnya</button>
    <button onClick={tourNext}>
      {step + 1 >= TOUR.length ? `Selesai ✓ (${remaining}s)` : `Lanjut › (${remaining}s)`}
    </button>

Each area’s card pulls from a VIEW_INFO map with a title, a one-liner, and bullet points describing exactly what’s clickable there — so the tour teaches the room, it doesn’t just pan around it.

Tour ends cleanly: reaching the last step calls reset() (which sets touring: false and returns to overview). Clicking any menu item mid-tour calls stopTour() first, so navigation always wins over the auto-advance.

—  —  —

Step 7 — Deep Links: the URL Hash is the View

We want …/#experience to open straight on the desk, and we want every navigation to update the URL so any framing is bookmarkable. A small hook maps views to slugs in both directions:

    const VIEW_TO_SLUG = {
      overview: 'home', photos: 'education', desk: 'experience',
      tv: 'video', books: 'tutorial', shelf: 'contact',
    }

    export function useHashRoute() {
      const view = useFocus((s) => s.view)
      const setView = useFocus((s) => s.setView)

      // hash -> view  (initial load + back/forward)
      useEffect(() => {
        const apply = () => { const v = viewFromHash(); if (v) setView(v) }
        apply()
        window.addEventListener('hashchange', apply)
        return () => window.removeEventListener('hashchange', apply)
      }, [setView])

      // view -> hash  (replaceState, so we don't spam browser history)
      useEffect(() => {
        const slug = VIEW_TO_SLUG[view]
        if (window.location.hash.replace(/^#/, '') !== slug)
          window.history.replaceState(null, '', `#${slug}`)
      }, [view])
    }

replaceState, not pushState. Every camera move would otherwise stack a history entry, and the Back button would crawl through views instead of leaving the site. replaceState keeps the URL shareable without hijacking Back. The guard (!== slug) prevents an update loop between the two effects.

Mount it once at the top of App, and deep links + shareable framings come for free.

—  —  —

Step 8 — Lazy-Load the Heavy Stuff

Ready Player Me avatars are the heaviest assets in the scene. Wrapping just the characters in their own <Suspense fallback={null}> lets the room shell + furniture paint immediately, with the people streaming in a beat later instead of blocking first paint:

    <Suspense fallback={null}>
      <Character … />   {/* seated, typing */}
      <Kid …       />   {/* on the sofa */}
      <Woman …     />   {/* on the sofa */}
    </Suspense>

It’s the same <Suspense> you already use for the whole scene — the trick is nesting a second boundary around only the slow part, so its loading state doesn’t gate everything around it.

—  —  —

Lessons Learned in Part 9

• DOM-on-a-surface is two tools, not one. Textured meshes occlude correctly but can’t be clicked; <Html transform> is clickable but overlays geometry. Use the mesh when idle, swap to HTML only at the focus angle where nothing overlaps.
• <Html transform> has a ~1/41 px→world factor. Size backing planes as W * scale * CSS3D or you’ll get a giant black screen with a tiny UI.
• When two layers must sit on the same surface but differ in aspect/scale, give each its own calibrated transform. One shared transform can’t flatter both.
• Guard every useTexture you don’t fully control with Suspense and an ErrorBoundary — a missing file otherwise whites out the whole Canvas.
• Gate hover affordances to context. Tooltips that only appear in the relevant focus view keep the overview calm. And give every <Html> tooltip a fixed width.
• A tour is just setTimeout + cleanup. Clean up both timers each step and Next/Previous fall out for free; show the countdown so auto-advance never feels like a hijack.
• The URL hash makes a 3D scene shareable. Map views to slugs, sync with replaceState, guard the loop.
• Nest a second <Suspense> around only the heavy assets so first paint isn’t held hostage by your biggest GLBs.

—  —  —

What’s Next (Part 10)

The room is now genuinely interactive: a desktop you can click, a resume you can read, tooltips that teach, a guided tour, and links you can share. From here the series can turn outward — performance budgets (draco/meshopt compression, instancing, on-demand frames), mobile controls & layout, and finally deploying the whole thing so recruiters can walk through your portfolio from a single link.

Thanks for following along — go make your room talk back.

—  —  —

Asset Credits

• Avatars — Ready Player Me (readyplayer.me)
• DOM-in-3D — <Html> from @react-three/drei
• State — zustand
• Project & experience content — from the author’s CV
