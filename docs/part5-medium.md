3D Profile Website — Part 5: Interactive Lighting & Setting the Mood

Welcome back to the 3D Profile Website series!

By Part 4 the room is fully enclosed — walls, floor, window, door, ceiling, furniture, and HDRI light. It feels real, but it’s static: the lights never change and visitors can only look. In Part 5 we make it come alive:

• A central lighting “brain” any component can read and control
• Clickable 3D light switches whose rocker physically flips
• An LED ceiling, a standing lamp, and a table lamp that emit real light
• Automatic day/night that follows the computer’s dark mode
• A Bloom glow so light sources actually look lit
• More cozy props: a sofa, an air conditioner, a credenza, a plant

By the end, visitors can walk in, flip the switches, and watch the room respond.

—  —  —

Why Interactive Lighting Matters

A scene with baked, unchanging light is a picture you orbit. The moment a user can change something — flip a switch, see a lamp glow, watch day turn to night — it becomes an experience. Three ideas drive this part: keep shared lighting state in a store rather than threading props; make bulbs emissive and add Bloom so light visibly glows; and respect the user’s context by reading their OS dark-mode setting instead of guessing.

—  —  —

Step 1 — A Central Lighting “Brain”

Switches and lamps live far apart in the tree, so we share their state through a small React context. The clever bit: timeOfDay follows the prefers-color-scheme media query and updates live.

    export function LightingProvider({ children }) {
      const [ceilingOn, setCeiling] = useState(false)
      const [standingOn, setStanding] = useState(false)
      const [tableOn, setTable] = useState(false)
      const [timeOfDay, setTimeOfDay] = useState(getSystemTimeOfDay) // 'day' | 'night'

      useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e) => setTimeOfDay(e.matches ? 'night' : 'day')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
      }, [])
      // …expose toggles via context…
    }

Put the provider inside <Canvas> so every 3D component can call useLighting(). (Two later refinements: the finished app defaults the ceiling lamp ON at night so a first load is never pitch-black, and Part 7 adds a fourth lamp + switch, sofaOn.)

—  —  —

Step 2 — A Day / Night Environment

SceneEnvironment reads timeOfDay and dials the HDRI and sun up for day or right down for night, so at night the room depends on its lamps:

    const isDay = timeOfDay === 'day'
    <Environment files="/hdri/dikhololo_sunset_4k.hdr" background
      environmentIntensity={isDay ? 0.3 : 0.02} backgroundIntensity={isDay ? 1 : 0.05} />
    <directionalLight color={isDay ? '#ffffff' : '#6677aa'} intensity={isDay ? 0.5 : 0.03} … />

(The HDRI drops to a 1k file in Part 10; the shadow frustum tightens there too.)

—  —  —

Step 3 — Provider + Bloom

Wrap the scene in the provider and add a Bloom pass. Bloom makes anything brighter than its threshold glow — perfect for emissive bulbs:

    <LightingProvider>
      <Suspense fallback={<Loader />}>
        <SceneEnvironment />
        <OrbitControls />
        <Room />
      </Suspense>
      <EffectComposer>
        <Bloom intensity={0.32} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </LightingProvider>

Anything you want to glow needs toneMapped={false} and an emissiveIntensity above the threshold.

—  —  —

Step 4 — Clickable Light Switches

We load a switch-plate GLB as a static frame, then add our own rocker button on top. Only the button flips — animated toward its on/off tilt in useFrame:

    useFrame(() => {
      const target = on ? FLIP : -FLIP
      pivot.current.rotation.x = THREE.MathUtils.lerp(pivot.current.rotation.x, target, 0.25)
    })

Three switches sit by the door, each wired to a lamp toggle from the context. Animate the button, not the frame — it’s a small, physical, satisfying detail.

—  —  —

Step 5 — Lights That Actually Glow

The LED ceiling and both lamps follow the same recipe: swap the bulb/strip mesh to an emissive material (so Bloom catches it) and add a real pointLight that only renders when the lamp is on.

    // ceiling LED strip
    <meshStandardMaterial color={color} emissive={color}
      emissiveIntensity={ceilingOn ? 2 : 0} toneMapped={false} />
    {ceilingOn && <pointLight color={color} intensity={5} distance={9} decay={2} castShadow />}

Tuning real-time lighting is all taste: too bright, lower the pointLight intensity and the bulb’s emissiveIntensity; too much glow, raise Bloom’s threshold or lower its intensity.

—  —  —

Step 6 — Furnish the Room

To make it lived-in, drop a few more GLB props into the room — a sofa, an air conditioner, a credenza, a plant — each converted with gltfjsx and positioned. One performance warning that bit us: watch your .glb sizes. A single bloated model tanks load time; swapping a 90 MB sofa for a 20 KB low-poly couch was night and day. (We compress everything properly in Part 10.)

—  —  —

Lessons Learned in Part 5

• State, not props, for cross-cutting concerns — lighting touches switches, lamps, and the environment, so centralize it.
• Emissive + Bloom = believable light; a bulb that doesn’t visibly glow looks fake. toneMapped={false} is the switch that lets it bloom.
• Respect the user’s context — read prefers-color-scheme for day/night and update it live with a matchMedia listener.
• Animate the button, not the frame — the rocker flips while the GLB plate stays put.
• Watch your .glb sizes — one bloated model tanks load time.

—  —  —

What’s Next (Part 6)

The room is interactive — next we make it personal, filling it with your content. In Part 6: a laptop and a monitor on the desk, a TV you can click to play a YouTube video right on the screen, a reusable PhotoFrame and a gallery wall of your photo and credentials, and a workflow to turn PDFs and images into web-ready textures.

Your 3D profile website is well on its way to a stunning interactive portfolio.

—  —  —

Asset Credits

All 3D assets are free models — check each asset’s license before commercial use.

• Sofa (Couch Small) — https://poly.pizza/m/ZOPP3KzNIk
• Standing lamp — https://www.cgtrader.com/items/3727623/download-page
• Table lamp — https://www.cgtrader.com/items/7091263/download-page
• Air conditioner — https://www.cgtrader.com/items/5800337/download-page
• Credenza (accent chest) — https://www.cgtrader.com/free-3d-models/furniture/kitchen-cabinet/accent-chest
• Plant (Cordyline glauca) — https://www.cgtrader.com/items/6315999/download-page
• HDRI: Dikhololo Sunset — https://polyhaven.com/ (CC0)
• Built with React Three Fiber, drei, and @react-three/postprocessing
