3D Profile Website — Part 10: Make It Fast by Cutting 172 MB Down to 25 MB

Welcome back to the 3D Profile Website series!

By Part 9 the room is interactive: a clickable desktop, a guided tour, deep links. But there’s an elephant in the room nobody mentioned — the page weighs 172 MB. One gaming chair model alone is 53 MB. On a phone or a hotel Wi-Fi, your beautiful portfolio is a spinner. In Part 10 we fix that, with zero visible quality loss:

• Audit the project and find the real offenders (it’s never what you’d guess)
• Compress every GLB with meshopt geometry + WebP textures — 152 MB → 20 MB
• The three gotchas that bit us: a broken output extension, skinned-avatar skeletons, and a model that got bigger
• Downscale the 24 MB HDRI to 1.4 MB (it’s barely visible — why ship 4K?)
• Delete textures you never used, and re-encode the rest — 10 MB → 1.4 MB
• Render budget: cap the device pixel ratio, shrink the shadow map, split the JS bundle

End result: 172 MB → 25 MB, a ~7× lighter page, and the scene looks identical.

Let’s go.

—  —  —

Step 0 — Audit First, Optimize Second

You can’t fix what you haven’t measured. One command tells you where the weight actually is:

    # every model, biggest first
    find public -iname '*.glb' -exec du -h {} \; | sort -rh

    53M  public/models/gaming chair.glb     ← one chair. 53 megabytes.
    24M  public/models/sofa.glb
    24M  public/hdri/dikhololo_sunset_4k.hdr
    16M  public/models/woman.glb
    14M  public/models/character.glb
    14M  public/models/kid.glb
     …
    172M public/   (total)

The lesson every single time: a few assets are 95% of the weight. Three avatars, a chair, a sofa, and one HDRI are the problem. Don’t waste an afternoon minifying JSON when one chair is 53 MB.

—  —  —

Step 1 — Compress the GLBs (the 132 MB win)

The tool is glTF-Transform, run via npx — no install:

    npx @gltf-transform/cli optimize in.glb out.glb \
      --compress meshopt \          # quantize + meshopt-compress geometry
      --texture-compress webp \     # re-encode textures as WebP
      --texture-size 1024 \         # cap texture resolution at 1K
      --simplify false              # do NOT decimate mesh topology

Two deliberate choices here:

• --compress meshopt, not draco. Both shrink geometry well. The difference that matters: drei’s useGLTF wires up the Meshopt decoder by default and it ships inside the bundle — no external CDN call at runtime. Draco’s decoder is fetched from a Google CDN. Meshopt = one fewer network dependency.
• --simplify false. The optimize pipeline will, by default, decimate your mesh (throw away triangles). That’s lossy and can wreck smooth or organic shapes. We compress the encoding, not the geometry — every vertex survives, the bytes just get packed tighter.

The best part: no code changes. drei’s useGLTF(url) already enables both the Draco and Meshopt decoders by default. Compress the files in place, keep the same filenames, and all 23 useGLTF calls just work — they now receive compressed bytes and decode them transparently.

Run it across the folder and the numbers are dramatic:

    gaming chair.glb   53MB → 9.1MB
    sofa.glb           24MB → 1.6MB
    woman.glb          16MB → 2.7MB
    character.glb      14MB → 2.7MB
    kid.glb            14MB → 2.3MB
    …
    models/ total     152MB → 20MB     (7.4× smaller)

—  —  —

Step 2 — Three Gotchas Nobody Warns You About

This is the part of the tutorial that saves you an evening.

Gotcha 1 — The output extension is load-bearing

Our first batch loop wrote to a temp name and moved it back:

    gltf-transform optimize "$f" "$f.tmp" …   # ❌ output is "model.glb.tmp"
    mv "$f.tmp" "$f"

glTF-Transform picks the output container from the file extension. .tmp isn’t .glb, so instead of a self-contained binary it wrote a loose glTF — a tiny JSON plus dozens of sidecar model.glb.bin and baseColor_3.webp files dumped next to it. The .glb files came out 8 KB (just the JSON), the scene broke, and the folder filled with junk.

Fix: always write to a real .glb path (we used a _opt/ subfolder), validate, then move:

    mkdir -p public/models/_opt
    for f in public/models/*.glb; do
      gltf-transform optimize "$f" "public/models/_opt/$(basename "$f")" --compress meshopt …
    done
    # verify, then move the _opt/*.glb over the originals

Gotcha 2 — Don’t flatten a skinned avatar

The Ready Player Me avatars came back from optimize with a hard validation error:

    SKIN_SKELETON_INVALID  Skeleton node is not a common root.  /skins/0/skeleton

The culprit is optimize’s flatten and join passes: they restructure the node graph for efficiency, which is great for static props but invalidates the skeleton hierarchy that skinned meshes depend on. Turn those two passes off for anything rigged:

    gltf-transform optimize avatar.glb out.glb \
      --compress meshopt --texture-compress webp --texture-size 1024 \
      --simplify false --flatten false --join false   # ← preserve the rig

Plot twist: that exact SKIN_SKELETON_INVALID error was already present in the original RPM files — and three.js renders them perfectly anyway, because it skins from the joints array and ignores skeleton-root validity. So the “error” is benign and pre-existing. The real lesson isn’t “fix the error,” it’s: validate the original first, so you can tell which warnings you introduced from the ones that were always there.

Gotcha 3 — Compression isn’t always a win

One model, the potted plant, came out bigger:

    plant.glb   752KB → 976KB   ❌

Tiny meshes with already-small textures don’t benefit — meshopt’s quantization tables and WebP’s container overhead cost more than they save. Always compare sizes and keep the smaller file. We kept the original plant and shipped the compressed everything-else.

—  —  —

Step 3 — The 24 MB HDRI Nobody Sees

The environment map is dikhololo_sunset_4k.hdr — 4096 × 2048, 24 MB. But look at how it’s actually used:

    <Environment files="/hdri/…_4k.hdr" background
      environmentIntensity={isDay ? 0.3 : 0.02} />   // 0.3?! barely contributing

It lights the room at 0.3 intensity and is only glimpsed through one window. Shipping 4K for that is pure waste. A 1K version is plenty. There’s no CLI for HDR resizing in our toolchain, but OpenCV reads and writes Radiance .hdr natively, preserving the float data:

    import cv2
    img = cv2.imread('…_4k.hdr', cv2.IMREAD_ANYDEPTH | cv2.IMREAD_COLOR)  # float32
    out = cv2.resize(img, (1024, 512), interpolation=cv2.INTER_AREA)
    cv2.imwrite('…_1k.hdr', out)
    # 23.9 MB → 1.39 MB

Point <Environment> at the new file, delete the 4K, done. 24 MB → 1.4 MB, no perceptible difference at 0.3 intensity.

—  —  —

Step 4 — Audit Your Textures (you’re shipping ones you don’t use)

PBR texture sets from sites like ambientCG ship both normal-map conventions — NormalGL (OpenGL, what three.js wants) and NormalDX (DirectX, green channel flipped). Our code only ever loaded NormalGL:

    grep -rn "NormalGL\|NormalDX" src/
    # → only NormalGL is referenced

So the two NormalDX files (2.0 MB + 1.2 MB) were 3.2 MB of pure dead weight. Delete them.

For the textures we do use, the normal maps were absurdly heavy JPEGs (a “1K” normal map at 2 MB). Re-encoding at quality 88 is invisible on a surface but enormous on disk:

    from PIL import Image
    im = Image.open(f).convert('RGB')
    im.save(f, 'JPEG', quality=88, optimize=True, progressive=True)
    # NormalGL: 1.99MB → 0.32MB, Color: 0.79MB → 0.14MB, …

And the profile photo was a 1.8 MB PNG — PNG is the wrong format for a photograph. Flattened onto white and saved as JPEG:

    im = Image.open('profile.png').convert('RGBA')
    bg = Image.new('RGB', im.size, (255,255,255)); bg.paste(im, mask=im.split()[3])
    bg.save('profile.jpg', quality=88, optimize=True, progressive=True)
    # 1.80MB → 0.17MB

Update the one reference (/images/profile.png → /images/profile.jpg) and the textures folder drops 10 MB → 1.4 MB.

Format rule of thumb: photographs and busy color maps → JPEG/WebP. Anything needing crisp edges or transparency (UI, logos, line art) → PNG/WebP. A photo saved as PNG is almost always a mistake.

—  —  —

Step 5 — A Render Budget (CPU/GPU, not download)

Smaller files fix load time. Three quick settings fix frame time.

Cap the device pixel ratio. On a phone or retina laptop the DPR can be 3, meaning the GPU renders 9× the pixels. Cap it — the scene stays sharp, the fill-rate cost plummets:

    <Canvas shadows dpr={[1, 1.5]}>   // never render above 1.5× native

Right-size the shadow map. A 2048² shadow map for a single small room is overkill; 1024² is identical to the eye at a quarter of the memory and bandwidth:

    <directionalLight castShadow
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

Split the JS bundle. three.js is ~700 KB and changes rarely; your app code changes constantly. Putting three in its own chunk lets the browser cache it across deploys:

    // vite.config.ts
    build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } }
    // one 1.56 MB chunk  →  three (698 KB) + app (859 KB), cached separately

—  —  —

The Scoreboard

                      before     after
    models            152 MB  →  20 MB
    hdri               24 MB  →  1.4 MB
    textures           10 MB  →  1.4 MB
    images              3 MB  →  1.6 MB
    ────────────────────────────────────
    public/  total    172 MB  →  25 MB     (~7× lighter)

Same room. Same models. Same lighting. A seventh of the bytes.

—  —  —

Lessons Learned in Part 10

• Measure before you touch anything. A handful of assets are almost always 95% of the weight; optimize those and ignore the rest.
• gltf-transform optimize --compress meshopt --texture-compress webp is the 10× button — and because drei enables the Meshopt decoder by default, you change zero lines of loader code.
• Keep --simplify false unless you actually want fewer triangles; compress the encoding, not the geometry.
• The output extension decides the container. Write to .glb, not .glb.tmp, or you get a broken loose-glTF and a folder full of sidecar junk.
• Don’t flatten/join rigged models — it breaks the skeleton. And validate the original first so you can tell new errors from pre-existing ones.
• Compression can backfire on tiny assets. Compare sizes; keep the smaller file.
• Right-size assets to their actual use. A 4K HDRI at 0.3 intensity, glimpsed through one window, has no business being 24 MB.
• Delete what you never load (that unused NormalDX), and match format to content (photos are JPEG/WebP, not PNG).
• Budget frames too: cap dpr, shrink shadow maps, and split your vendor chunk for caching.

—  —  —

What’s Next

The portfolio is now fast enough to open on a phone over cellular. That sets up Part 11 — Mobile & Responsive: touch controls for the camera, a menu and drawers that reflow on small screens, framing that adapts to portrait, and a quality tier for weaker GPUs. After that, Part 12 — Audio & Polish (ambient sound, click SFX, smoother transitions, a nicer loader).

Thanks for following along — go put your room on a diet.

—  —  —

Asset Credits

• Geometry/texture compression — glTF-Transform (gltf-transform.dev), meshoptimizer
• HDRI resize — OpenCV; original HDRI from Poly Haven
• Avatars — Ready Player Me
