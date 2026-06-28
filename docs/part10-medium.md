3D Profile Website — Part 10: Make It Fast by Cutting 172 MB Down to 44 MB

Welcome back to the 3D Profile Website series!

By Part 9 the room is interactive: a clickable desktop, a guided tour, deep links. But there’s an elephant in the room nobody mentioned — the page weighs 172 MB. One gaming chair model alone is 53 MB. On a phone or a hotel Wi-Fi, your beautiful portfolio is a spinner. In Part 10 we fix that, down to 44 MB, with no visible quality loss:

• Audit the project and find the real offenders (it’s never what you’d guess)
• Compress every GLB — and the hard-won lesson of which compressor to use (meshopt looked great and quietly mangled our models; Draco is what shipped)
• The gotchas that bit us: a crashed scene, white-glowing avatar eyes, and woven-looking furniture
• Downscale the 24 MB HDRI to 1.4 MB (it’s barely visible — why ship 4K?)
• Delete textures you never used, re-encode the rest — and never lossy-compress a normal map
• Render budget: cap the device pixel ratio, fix shadow acne, split the JS bundle

This part is as much a debugging story as a how-to. Every “obvious” first choice here was wrong, and the wrong ones looked fine until you stared at them. Let’s go.

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

Step 1 — Compress the GLBs (the big win)

The tool is glTF-Transform, run via npx — no install. Here’s the command we shipped — but every flag on it is a scar from something that went wrong first:

    npx @gltf-transform/cli optimize in.glb out.glb \
      --compress draco \            # geometry compression (NOT meshopt — see Step 2)
      --texture-size 1024 \         # cap texture resolution at 1K (keeps PNG/JPEG, no webp)
      --simplify false \            # don't decimate triangles
      --join false --flatten false \  # don't merge/rename meshes  (Step 3!)
      --palette false --instance false --prune false

That’s a lot of false. Every one turns off a pass optimize runs by default, and each of those passes can break a scene built from gltfjsx components. Two deliberate choices stand out, and both are the opposite of the obvious answer:

• --compress draco, not meshopt. This one cost us hours (Step 2).
• No --texture-compress webp. WebP is lossy, and lossy compression destroys normal maps (Step 4). We resize textures but keep their format.

The payoff: almost no code changes. drei’s useGLTF(url) enables the Draco decoder by default. Compress the files in place, keep the same filenames and the same node/material names, and your useGLTF calls just work — they receive compressed bytes and decode them transparently.

Run it across the folder and the numbers are dramatic — the sofa alone goes 24 MB → 0.5 MB:

    gaming chair.glb   53MB → 2.4MB
    sofa.glb           24MB → 0.5MB
    credenza.glb      4.4MB → 145KB

(The avatars are a special case worth their own section — Step 3.)

—  —  —

Step 2 — meshopt vs Draco: the bug that looked fine

Our first instinct was meshopt (--compress meshopt). The docs love it, drei decodes it with no CDN call, and the sizes were fantastic — the chair went 53 MB → 7.6 MB. Validation passed. We shipped it.

Then we actually looked at the chair from the side: the backrest was shattered into duplicated, warped shards. The sofa was subtly melted. The numbers were great; the geometry was wreckage.

What’s maddening is that the bounding boxes were byte-for-byte identical before and after — so “did it change scale?” said no. The damage was inside: meshopt’s vertex quantization mangled this particular dense, ~500k-vertex mesh. On simple props you’d never notice. On a heavy organic model, it’s obvious the moment it catches the light.

The fix was a one-word change — --compress draco — and the chair came back perfect, at 1.5 MB (smaller than meshopt, even). Draco’s quantization handled the same geometry without distortion.

The lesson isn’t “Draco is better than meshopt.” It’s that lossy geometry compression is lossy, and “the validator passed + the file is small” tells you nothing about whether it still looks right. Open every heavy model and rotate it. The bounding box lies; your eyes don’t.

The one trade-off: Draco’s decoder is fetched from a CDN (drei points at Google’s by default), where meshopt’s ships in-bundle. For a portfolio that’s online anyway, a one-time decoder fetch is a fine price for geometry that isn’t broken.

Two cheaper traps in the same step:

The output extension is load-bearing. Our first batch wrote to "$f.tmp" and moved it back. glTF-Transform picks the container from the extension — .tmp isn’t .glb, so it wrote a loose glTF (tiny JSON + dozens of sidecar files). The .glb files came out 8 KB, the scene broke, and the folder filled with junk. Fix: write to a real .glb path, validate, then move.

Compression isn’t always a win. The potted plant came out bigger. Tiny meshes with already-small textures don’t benefit. Compare sizes and keep the smaller file.

—  —  —

Step 3 — Why the Scene Crashed, and Why the Avatars Need Special Care

Two more failures, both about structure rather than size.

The crash: gltfjsx addresses things by name

Run the default optimize and the page goes white:

    Desk.tsx:57  Uncaught TypeError: Cannot read properties of undefined (reading 'geometry')

    // Desk.tsx — generated by gltfjsx
    <mesh geometry={nodes.Cube006_Cube007.geometry} material={materials.BlackCoatSteel} />

gltfjsx components address meshes and materials by name. But three of optimize’s default passes rewrite those names:

• join — merges meshes to cut draw calls → the named nodes are gone → nodes.X is undefined
• flatten — collapses the node hierarchy → node names/paths change
• palette — merges materials into a palette → materials.Y is undefined

So nodes.Cube006_Cube007 becomes undefined, and .geometry throws. Disable every pass that renames or merges named things — the wall of false flags from Step 1. Draco quantization and texture resizing are safe; they shrink data, not names.

If you load GLBs through gltfjsx, compress the bytes, never the structure. optimize is built for engine-agnostic delivery where nobody addresses nodes by name. The moment your code says nodes.Something, half its passes become landmines.

The avatars: glowing white eyes

The same --join false --flatten false keeps the Ready Player Me rigs intact (flatten/join also invalidate the skeleton hierarchy a skinned mesh needs). But the avatars had a second, sneakier failure: after compression, their eyes glowed solid white — most visibly in the dark.

It took isolating one variable at a time to pin down. Two things both hurt the (very delicate, glossy) RPM corneas:

1. Re-encoding the eye textures (resize/webp) corrupted the tiny iris detail.
2. Aggressive normal quantization on the eye geometry made the cornea reflect light as a flat white blob.

So avatars get their own recipe — Draco at high precision, and original textures, untouched:

    # avatars: preserve the eyes
    npx @gltf-transform/cli draco character.glb out.glb \
      --quantize-position 16 --quantize-normal 16 --quantize-texcoord 16
    # (no texture re-encoding at all)

16-bit precision compresses far less than the default (the avatars only drop from ~14 MB to ~11 MB), but the eyes are perfect. Some assets cost what they cost. Trying to squeeze the last megabyte out of a face is how you ship a portrait with dead white eyes.

A pre-existing herring: the validator also flagged SKIN_SKELETON_INVALID on the RPM files — but that’s present in the originals and three.js renders them fine anyway (it skins from the joints array). Validate the original first, so you can tell warnings you introduced from ones that were always there.

—  —  —

Step 4 — Textures: Delete the Unused, and Never Lossy-Compress a Normal Map

Two texture lessons, one obvious and one that cost an evening.

Delete what you never load. PBR sets from sites like ambientCG ship both normal-map conventions — NormalGL (OpenGL, what three.js wants) and NormalDX (DirectX). Our code only referenced NormalGL, so the two NormalDX files (3.2 MB) were pure dead weight. grep your src/, delete the rest.

Never run a normal map through WebP (or JPEG). This is the one that fooled us. We webp-compressed all model textures — and the door and credenza came back covered in a fine woven, grid-like pattern, as if upholstered in wicker. We chased it as a shadow bug, a geometry bug, a UV bug... it was the normal map.

A normal map isn’t a picture — its R/G/B channels encode a direction vector (X/Y/Z) per texel. Lossy compression smears those channels, and smeared directions become visible noise across the whole surface. Normal/ORM maps must stay lossless (PNG, or lossless WebP). That’s why Step 1’s command resizes textures but omits --texture-compress webp for models.

For standalone image files it’s different — there a photo should be lossy. The profile portrait was a 1.8 MB PNG (wrong format for a photo); flattened onto white and saved as JPEG q88 it’s 0.17 MB, and the wall/floor color maps re-encode happily too.

Format rule of thumb: photographs & color maps → JPEG/WebP. Crisp edges, transparency, or direction-encoded data (normal/ORM) → PNG / lossless. A normal map in a lossy format is always a bug.

—  —  —

Step 5 — The 24 MB HDRI Nobody Sees

The environment map is dikhololo_sunset_4k.hdr — 4096 × 2048, 24 MB — but it lights the room at 0.3 intensity and is only glimpsed through one window. Shipping 4K for that is pure waste. There’s no CLI for HDR resizing in our toolchain, but OpenCV reads and writes Radiance .hdr natively:

    import cv2
    img = cv2.imread('…_4k.hdr', cv2.IMREAD_ANYDEPTH | cv2.IMREAD_COLOR)  # float32
    out = cv2.resize(img, (1024, 512), interpolation=cv2.INTER_AREA)
    cv2.imwrite('…_1k.hdr', out)
    # 23.9 MB → 1.39 MB

Point <Environment> at the new file, delete the 4K. 24 MB → 1.4 MB, no perceptible difference.

—  —  —

Step 6 — A Render Budget (CPU/GPU, not download)

Smaller files fix load time. Three settings fix frame time.

Cap the device pixel ratio. On a phone or retina laptop the DPR can be 3 — the GPU renders 9× the pixels. Cap it; the scene stays sharp, the fill-rate cost plummets:

    <Canvas shadows dpr={[1, 1.5]}>   // never render above 1.5× native

Fix shadow acne the right way. A naive “shrink the shadow map to 1024 for performance” backfired — the door and credenza broke out in a grid of self-shadowing speckles. The real culprit wasn’t resolution, it was an oversized shadow frustum: a ±5 (10 m) ortho box spreading a few thousand texels across a 3 m room. Tighten the frustum to the room and add a normalBias, and the acne vanishes at any resolution:

    <directionalLight castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-left={-2.5} shadow-camera-right={2.5}
      shadow-camera-top={2.5}   shadow-camera-bottom={-2.5}
      shadow-camera-near={0.1}  shadow-camera-far={12}
      shadow-normalBias={0.03} />

Shadow acne is about texel density and bias, not raw map size. A tight frustum + normalBias beats a giant high-res map aimed at empty space.

Split the JS bundle. three.js is ~700 KB and changes rarely; your app code changes constantly. Give three its own cacheable chunk:

    // vite.config.ts
    build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } }
    // one 1.56 MB chunk → three (698 KB) + app (859 KB), cached separately

—  —  —

The Scoreboard

                      before     after
    models            152 MB  →  40 MB    (avatars are ~34 MB of it — eyes cost bytes)
    hdri               24 MB  →  1.4 MB
    textures           10 MB  →  1.4 MB
    images              3 MB  →  1.6 MB
    ────────────────────────────────────
    public/  total    172 MB  →  44 MB    (~4× lighter, every model pristine)

Could we go smaller? Yes — meshopt or aggressive Draco would get the avatars to ~6 MB. But we tried that, and it broke the eyes. 44 MB of correct beats 25 MB of broken.

—  —  —

Lessons Learned in Part 10

• Measure before you touch anything. A handful of assets are almost always 95% of the weight.
• Lossy geometry compression is lossy — verify with your eyes, not the validator. meshopt produced tiny files with byte-identical bounding boxes and visibly shattered geometry. Draco preserved it. Open and rotate every heavy model.
• If you load GLBs through gltfjsx, compress the bytes, never the structure. Turn off join/flatten/palette/instance/prune; they rename the named nodes & materials your code addresses and crash the scene.
• Delicate assets get a gentler recipe. RPM avatar eyes break under texture re-encoding and low-precision normals → high-precision Draco + original textures. Some bytes aren’t worth squeezing.
• Never lossy-compress a normal/ORM map. WebP/JPEG smear the direction vectors into visible woven noise. Keep them PNG/lossless; lossy is only for photos & color maps.
• The output extension decides the container. Write to .glb, not .glb.tmp, or you get a broken loose-glTF and sidecar junk.
• Compression can backfire on tiny assets. Compare sizes; keep the smaller file.
• Shadow acne is texel density + bias, not map size. Tighten the frustum and add normalBias instead of cranking resolution.
• Right-size assets to their use, and validate the original first so you can tell new problems from pre-existing ones.

—  —  —

What’s Next

The portfolio is now a quarter of its weight and every model is intact. That sets up Part 11 — Mobile & Responsive: touch controls, a menu that reflows on small screens, and a quality tier for weaker GPUs. After that, Part 12 — Audio & Polish.

Thanks for following along — go put your room on a diet, carefully.

—  —  —

Asset Credits

• Geometry compression — glTF-Transform · Draco
• HDRI resize — OpenCV; original HDRI from Poly Haven
• Avatars — Ready Player Me
