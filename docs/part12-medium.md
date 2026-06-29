3D Profile Website — Part 12: Make It Delightful with Procedural Audio, a Real Loading Screen & Micro-Interactions

Welcome back — and this is the last build part of the 3D Profile Website series! (One short part remains after this: shipping it online.)

The room is fast (Part 10), works on a phone (Part 11), and every model is intact. What’s left is the layer that separates “a demo” from “a product”: the little touches you don’t consciously notice but absolutely feel. In Part 12 we add the polish:

• Procedural sound effects with the Web Audio API — clicks, whooshes, opens — with zero audio files
• A mute toggle that respects the browser’s autoplay rules and remembers your choice
• A real loading screen — branded, with an animated progress bar, instead of “Loading 47%”
• Cinematic camera easing so views glide instead of snapping
• Micro-interactions — buttons that lift, cubes that swell on hover

None of this is hard. All of it matters. Let’s finish strong.

—  —  —

Step 1 — Sound With No Sound Files

Audio is the fastest way to make an interface feel alive — and the fastest way to bloat your bundle with megabytes of MP3s. We skip the files entirely: the Web Audio API can synthesize every UI sound from an oscillator and a gain envelope. A click is just a short tone with a fast attack and decay.

The whole engine is one helper:

    // src/audio/sound.ts
    let ctx = null

    function getCtx() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
      if (ctx.state === 'suspended') void ctx.resume()   // unlock after a gesture
      return ctx
    }

    function blip({ freq, dur, type = 'sine', gain = 0.05, sweep = 0 }) {
      if (useAudio.getState().muted) return
      const ac = getCtx(); if (!ac) return
      const t = ac.currentTime
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t)
      if (sweep) osc.frequency.exponentialRampToValueAtTime(freq + sweep, t + dur)
      g.gain.setValueAtTime(0.0001, t)                          // fade in from ~0
      g.gain.exponentialRampToValueAtTime(gain, t + 0.01)       // fast attack
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)      // smooth decay
      osc.connect(g).connect(ac.destination)
      osc.start(t); osc.stop(t + dur + 0.03)
    }

That exponentialRampToValueAtTime envelope is the whole trick — start and end at near-zero (not exactly zero, exponential ramps can’t reach 0) so there’s no click-pop, and you get a soft musical blip. From that one primitive, a tiny vocabulary of sounds:

    export const sfx = {
      click:  () => blip({ freq: 430, dur: 0.08, type: 'triangle', sweep: 90 }),
      hover:  () => blip({ freq: 720, dur: 0.04, gain: 0.018 }),
      whoosh: () => { /* two stacked tones sweeping up — camera flying */ },
      open:   () => { /* rising pair — a panel appears */ },
      close:  () => blip({ freq: 480, dur: 0.14, sweep: -260 }),  // falling = closing
    }

Pitch carries meaning. Sweeping up reads as “opening / arriving”, sweeping down as “closing / leaving”. Your ear decodes direction before your brain reads the label — so close falls and open rises.

The autoplay rule you can’t skip

Browsers block all audio until the user interacts with the page — an AudioContext created on load starts suspended. So we create/resume it lazily, on the first real gesture, and call a tiny primeAudio() from the first click handler. The very first sound on page load is silently dropped (no gesture yet); every one after plays. Don’t fight this — design around it.

Wiring it in

Each interaction picks the sound that matches its meaning, not its widget:

    const onNav = (v) => { primeAudio(); sfx.whoosh(); /* fly camera */ }   // travel
    startTour:  () => { sfx.open() }       // something begins
    exit/close: () => { sfx.close() }      // something ends
    openSeries: () => { sfx.open() }       // drawer slides in

Because the sounds live in a plain module (not a hook), a 3D mesh inside the Canvas calls sfx.click() exactly the same way a DOM button does — no context plumbing across the renderer boundary.

—  —  —

Step 2 — A Mute Toggle That Remembers

Sound must always be dismissible, and the choice should stick. A four-line zustand store with localStorage does both, and — being a store — it’s readable from the synthesis code and the button:

    // src/store/useAudio.ts
    export const useAudio = create((set) => ({
      muted: localStorage.getItem('hadi-3d-muted') === '1',
      toggleMute: () => set((s) => {
        const muted = !s.muted
        localStorage.setItem('hadi-3d-muted', muted ? '1' : '0')
        return { muted }
      }),
    }))

blip() checks useAudio.getState().muted and bails before touching the audio context, so muting is instant and total. The button is a speaker pill that nudges on hover — itself a micro-interaction (Step 5).

Default to on, but make off one tap away and persistent. A muted-by-default portfolio loses the delight; an un-mutable one loses the visitor. Respect the toggle and remember it.

—  —  —

Step 3 — A Loading Screen Worth the Wait

drei’s useProgress() hands you { progress, active } for free. The old loader spent it on bare text — “Loading 47%”. The first thing a visitor sees deserves better, and it costs nothing but CSS:

    const { progress, active } = useProgress()
    const pct = Math.round(progress)

    <Html center>
      <div /* branded card: gradient, name in gold gradient-text */>
        Hadi Halim · 3D Portfolio
        <div /* track */>
          <div style={{ width: `${pct}%`, transition: 'width 0.25s ease-out',
                        background: 'linear-gradient(90deg,#ffd27a,#ffb347)' }} />
        </div>
        <span>{active ? 'Memuat ruangan…' : 'Hampir siap…'}</span>
        <span>{pct}%</span>
      </div>
    </Html>

Two details do the heavy lifting: a transition: width 0.25s so the bar glides between progress jumps instead of teleporting, and a gentle keyframes pulse on the status text so the screen feels alive even when a big GLB stalls the number. The brand name uses gradient-clipped text (background-clip: text) — a free touch of premium.

—  —  —

Step 4 — Cinematic Camera Easing

The camera already animates between views (Part 8). CameraControls exposes smoothTime — the seconds it eases toward a target — and we’d been on the snappy default. Bumping it makes every fly-to feel directed:

    <CameraControls
      smoothTime={0.5}            // cinematic glide between view presets
      draggingSmoothTime={0.12}   // but keep manual rotation crisp
      makeDefault
    />

The split matters: slow the scripted transitions, keep the direct manipulation fast. A 0.5 s glide when you click “Experience” feels expensive and intentional; a 0.5 s lag while you drag would feel broken. Different smoothing for different intents.

—  —  —

Step 5 — Micro-Interactions: the 2-Pixel Difference

The smallest changes give the most “feel”. Two examples.

DOM buttons lift on hover. A 2 px rise and a quick transition turns a flat target into something that responds to your cursor:

    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseOut={(e)  => (e.currentTarget.style.transform = 'translateY(0)')}
    style={{ transition: 'background 0.2s, color 0.2s, transform 0.15s' }}

3D objects swell on hover — but smoothly, lerped per-frame, never a snap. The social cubes already track a hovered flag for their tooltip; one line in their existing useFrame makes them breathe:

    useFrame((_, dt) => {
      ref.current.rotation.y += spin * dt
      const target = hovered && active ? 1.16 : 1
      const s = THREE.MathUtils.damp(ref.current.scale.x, target, 10, dt)  // frame-rate-independent
      ref.current.scale.setScalar(s)
    })

THREE.MathUtils.damp, not lerp. damp(current, target, lambda, dt) is the frame-rate-independent cousin of lerp — it eases the same on a 144 Hz monitor and a 30 fps phone. Any time you smooth toward a target in useFrame, reach for damp and pass dt. (And pair the swell with a soft hover blip, gated to the focused view so it never becomes noise.)

—  —  —

Lessons Learned in Part 12

• Synthesize UI sound, don’t ship it. The Web Audio API turns an oscillator + a gain envelope into clicks, whooshes, and opens — kilobytes of code instead of megabytes of MP3.
• Pitch direction is language: sweep up to open, down to close. Ears read it before eyes read the label.
• Respect the autoplay rule. Create/resume the AudioContext on the first gesture; let the very first sound drop.
• Sound must be mutable and sticky — a tiny persisted store, checked before you make a peep.
• A loading screen is your first impression — brand it, animate the bar’s width, pulse the status. It’s all CSS.
• Smooth scripted motion, keep manual motion crisp — smoothTime vs draggingSmoothTime.
• Micro-interactions are 2 pixels and one line. Lift DOM buttons on hover; damp 3D objects toward a hover scale. Small, smooth, frame-rate-independent.

—  —  —

What You’ve Built So Far

Twelve parts ago this was an empty <Canvas>. Now it’s a navigable, interactive, fast, mobile-friendly, delightful 3D portfolio: a room you can tour, a desktop you can click, a résumé you can read, tutorials you can open, lights you can flip — and now, one that sounds and feels like a finished product.

Everything except the final mile — deployment — is done. That’s exactly what we tackle next.

—  —  —

What’s Next (Part 13)

The room looks, works, sounds, and feels finished. All that’s left is to put it online — the focus of Part 13: a production build and deploying the static SPA (to Vercel), cache headers so the 40 MB of 3D assets load instantly on return visits, and full SEO and social meta — Open Graph, Twitter Card, a real 1200×630 share image, favicon, and a web manifest. Put it behind a URL and let it speak for you — see you in the finale.

—  —  —

Asset Credits

• Sound — synthesized at runtime with the Web Audio API (no files)
• Loading progress — useProgress from @react-three/drei
• State — zustand
