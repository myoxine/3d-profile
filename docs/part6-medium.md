3D Profile Website — Part 6: Make It Personal — Media, Photos & a Playable TV

Welcome back to the 3D Profile Website series!

In Part 5 we made the room interactive — switches, lamps, day/night. It feels real, but it’s still a generic room. In Part 6 we make it yours:

• A laptop and a monitor on the desk
• A TV you can click to play a YouTube video, right on the screen
• A reusable PhotoFrame component
• A gallery wall of your photo, diplomas, and certificates
• A workflow to turn PDFs and images into web-ready textures
• Hard-won lessons about 3D asset file sizes

By the end a visitor can walk in, see your face, read your credentials, and watch your showreel on the TV.

—  —  —

Why Personal Media Matters

A polished but generic room could belong to anyone. Photos, credentials, and a showreel are what make it unmistakably your portfolio — the difference between “a nice 3D demo” and “this is who I am.”

—  —  —

Step 1 — Props on the Desk

Drop a laptop and a monitor (gltfjsx components) onto the desk. These are mostly placement work — scale, position, rotate — but they instantly make the desk feel used.

—  —  —

Step 2 — A Reusable PhotoFrame

One component, used everywhere. It takes an image URL and renders a framed plane with the texture mapped onto it:

    function PhotoFrame({ src, ...props }) {
      const tex = useTexture(src)
      return (
        <group {...props}>
          <mesh>{/* frame border */}</mesh>
          <mesh>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial map={tex} />
          </mesh>
        </group>
      )
    }

Because it’s one reusable component, the whole gallery wall becomes data — a list of images and positions, not hand-built meshes.

—  —  —

Step 3 — PDFs & Images Into Textures

Diplomas and certificates arrive as PDFs, which WebGL can’t sample. Build a small pipeline: render each PDF page to a PNG (pdf-to-img), then resize it down to a sane texture size (sharp). Do it once and every credential drops straight into a PhotoFrame. The point is repeatability — a recipe, not a pile of one-off exports.

—  —  —

Step 4 — The Gallery Wall

With PhotoFrame reusable and the assets prepared, the wall above the sofa is just a mapped list: your photo, your diplomas, your certificates, each at a position. Adding one is a one-line edit.

—  —  —

Step 5 — A TV That Plays a YouTube Video

The fun one. We make the TV mesh clickable and show a real, playable video on its screen — an <Html> overlay positioned to the screen, correctly occluded by the room so it hides when the TV is behind a wall. Click to play, click to stop. A static screenshot says “demo”; a video you can actually start says “product.”

—  —  —

A Note on Asset File Size

Two models nearly broke this build. A 94 MB sofa made git push time out and bloated the repo — swapped for a 20 KB low-poly couch. A “monitor” GLB turned out to be a 47 MB full scene (walls + two monitors) — replaced with a clean 0.4 MB single mesh. Rules of thumb: inspect every download, prefer low-poly, resize textures, and keep individual assets well under ~10 MB. Your load time and your git history will thank you.

—  —  —

Lessons Learned in Part 6

• A reusable component beats one-off meshes — one PhotoFrame renders the whole gallery from a list of data.
• Render a video onto the screen to make a “playable” TV — an Html overlay (or video texture) turns a mesh into something a visitor can click and watch.
• Build a content pipeline, not a pile of exports — PDF → PNG → resized texture is a repeatable recipe.
• Inspect every download before you trust it — a “monitor” can secretly be a 47 MB scene; keep assets well under ~10 MB.

—  —  —

What’s Next (Part 7)

The room is furnished and personal — but it’s empty of people and frozen in time. Next we bring it to life. In Part 7: animated characters from Mixamo (someone typing at the desk, people on the sofa), a drop-in pipeline for Ready Player Me avatars, a wall clock whose hands track your real system time, a glowing neon sign built from extruded 3D letters, and two lamps behind the sofa wired to a new fourth light switch.

—  —  —

Asset Credits

• Laptop, Monitor, TV — free GLB models (verify each license before commercial use)
• Photo, diplomas, and certificates — the author’s own
• Built with React Three Fiber (https://r3f.docs.pmnd.rs/), drei (https://github.com/pmndrs/drei), pdf-to-img (https://www.npmjs.com/package/pdf-to-img), and sharp (https://sharp.pixelplumbing.com/)
