3D Profile Website — Part 13: Ship It — Deployment, SEO & a Social Card That Actually Looks Good

Welcome to the true finale. In Part 12 we called deployment “the final mile.” This is that mile.

A portfolio nobody can open is a private art project. In Part 13 we put the room behind a public URL — and make sure that when someone shares the link, it shows up as a polished card, not a naked https:// with a broken thumbnail. We cover:

• A production build — what Vite actually emits, and why our chunking already pays off
• Deploying a static SPA to Vercel, with the right cache headers for 40 MB of 3D assets
• The hash-routing dividend — why #experience means zero server config
• Full SEO and social meta — title, description, Open Graph, Twitter Card, canonical, JSON-LD
• A real OG image — a 1200x630 card so shares look intentional
• Favicon, web manifest and theme color — the small stuff that says “finished”
• The GitHub Pages caveat every Vite tutorial skips: absolute asset paths

—  —  —

Step 1 — What “npm run build” Really Produces

Our build script is “tsc -b && vite build”: type-check the whole project, then bundle. The output lands in dist/ — a fully static folder. No Node server, no runtime. That’s the whole point: a 3D portfolio is just files a CDN can serve.

    dist/
      index.html                 3.56 kB
      assets/index-*.css         0.91 kB
      assets/three-*.js        698 kB    <- three.js, its own chunk (Part 11)
      assets/index-*.js        865 kB    <- our app
      models/ hdri/ textures/ fonts/ images/   <- copied verbatim from public/
      favicon.svg  site.webmanifest  robots.txt  sitemap.xml

Two things to notice. First, three is its own chunk. Back in Part 11 we set manualChunks: { three: ['three'] }. three.js barely changes between deploys, so splitting it means a returning visitor re-downloads only our ~865 kB app chunk, not the ~700 kB engine — but only once caching is configured (Step 3). Second, everything in public/ is copied as-is. That’s why our GLBs live there: Vite doesn’t hash or transform them, so the URLs (/models/character.glb) are stable and cacheable.

A note on the 500 kB chunk warning: it’s expected. A WebGL app ships a real renderer; you can’t tree-shake three.js to nothing. We already did the meaningful wins — Draco compression in Part 10, vendor chunking in Part 11. Chasing the warning further with lazy import() buys little for a single-scene app.

—  —  —

Step 2 — The Hash-Routing Dividend

Here’s a decision from Part 9 that quietly makes deployment trivial. Our deep links are hash-based: https://your-site.com/#experience, https://your-site.com/#contact. The part after the # never reaches the server. The browser always requests the same /index.html, and our useHashRoute hook reads window.location.hash on the client to fly the camera to the right view.

Why this matters at deploy time: a path-based SPA (/experience) needs the host to rewrite every unknown path back to index.html, or a hard refresh on a deep link 404s. With hash routing there are no unknown paths — there’s only /. No rewrite rules, no _redirects file, no 404.html trick. It just works on any static host. Sometimes the most robust architecture is the one that asks the least of the server.

—  —  —

Step 3 — Deploy to Vercel (with Cache Headers That Matter)

Any static host works — Netlify, Cloudflare Pages, GitHub Pages, S3. I’ll use Vercel because it deploys at the root (your-site.com/), which keeps our absolute asset paths (/models/...) working unchanged, and its CDN handles big binary assets well.

The deploy itself is anticlimactic: push the repo to GitHub, then on vercel.com choose Add New, Project, Import the repo. Vercel auto-detects Vite (build npm run build, output dist/) — click Deploy. You get a https://<project>.vercel.app URL.

But the important part is caching. Our scene pulls ~40 MB of GLB/HDR/texture on first load. Without cache headers, a returning visitor re-downloads all of it. We pin it with a vercel.json at the repo root:

    {
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "headers": [
        { "source": "/assets/(.*)",
          "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
        { "source": "/(models|hdri|textures|fonts)/(.*)",
          "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
        { "source": "/",
          "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] }
      ]
    }

The rule of static deploys: cache the fingerprinted files forever, never cache the HTML. index.html is the index into the hashed filenames — keep it fresh and every other URL can be immutable. The “immutable” directive tells the browser not to even send a revalidation request, so a second visit to the room is near-instant.

Custom domain? Add it in Vercel under Settings, Domains — then update the absolute URLs in index.html (canonical, og:url, og:image), robots.txt, and sitemap.xml to that domain. OG tags must be absolute; scrapers don’t resolve relative paths.

—  —  —

Step 4 — SEO Meta: From “Vite + React + TS” to a Real Page

The generated index.html shipped with the framework’s defaults — title “Vite + React + TS”, favicon vite.svg. That’s what Google would index and what appears in the browser tab. We replace the whole head with real metadata. The essentials: a human-written title and description (the two lines a search result shows), a canonical link (tells search engines the one true URL, collapsing ?utm= variants and www into a single indexed page), and a theme-color that tints the mobile browser chrome to match the room’s warm dark. We also set lang="id" since the UI is Indonesian, so screen readers and translators pick the right language.

—  —  —

Step 5 — Open Graph & Twitter: Make the Link Look Expensive

This is the highest-leverage SEO work for a portfolio, because portfolios get shared — in DMs, on LinkedIn, in a job application. A link with no Open Graph tags renders as a sad bare URL. With them, it’s a card with a title, a description, and a 1200x630 image.

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Hadi Halim - Interactive 3D Portfolio" />
    <meta property="og:description" content="Sebuah ruangan 3D yang bisa kamu jelajahi..." />
    <meta property="og:url" content="https://your-site.com/" />
    <meta property="og:image" content="https://your-site.com/images/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://your-site.com/images/og-image.png" />

Three things people get wrong. One: the image URL must be absolute — a relative /images/... works for your favicon, but a social scraper on another server can’t resolve it. Two: use summary_large_image, not the default small card — you built a visual site, show the big image. Three: declare og:image:width and height, so scrapers that don’t pre-fetch the image still reserve the right aspect ratio and the card never renders broken on first share.

After deploying, paste your URL into the Facebook Sharing Debugger and opengraph.xyz to see the live preview and force a re-scrape — caches are sticky, and a re-scrape is how you fix a stale card.

—  —  —

Step 6 — The OG Image: 1200x630, Generated Once

The one asset you can’t write in HTML is the card image itself. Social platforms want 1200x630 (a 1.91:1 ratio). My profile photo was 1024x1536 — portrait — so it would crop into an awkward sliver. So I made a dedicated card: a warm dark gradient matching the room, the name in the same gold the UI uses, and a one-line tagline.

You can design it in Figma, but for a repeatable asset I generated it programmatically — gradient background, a soft gold glow, gradient-filled title text. The point isn’t the tool; it’s that the OG image is a designed asset with its own aspect ratio, not your avatar reused. It lives at public/images/og-image.png and ships like any other static file. Match the card to the product: same palette and name treatment as the Part 12 loading screen. The share card is often the first thing someone sees — before they ever load the WebGL. Make it a promise the room keeps.

—  —  —

Step 7 — Favicon, Manifest & “Add to Home Screen”

Last mile of polish. We replaced vite.svg with an SVG favicon — a gold “H” monogram on the room’s dark background — so the browser tab is on-brand and crisp at any DPI. Then a tiny PWA layer: an apple-touch-icon and a site.webmanifest linked from the head. The manifest gives the site a name, icons (192 and 512, plus a maskable variant for Android), and a theme color — so a visitor can add the portfolio to their home screen and it opens standalone, like an app, with our icon and no browser chrome.

And robots.txt plus sitemap.xml round out crawlability. Because we’re a hash-routed SPA, the sitemap has exactly one URL — the root. Hash fragments aren’t separate pages to a crawler; pretending they are just adds noise.

—  —  —

The GitHub Pages Caveat (Read Before You Switch Hosts)

If you deploy to GitHub project Pages (username.github.io/3d-profile/) instead of Vercel, the room loads blank and the console 404s on every model. Here’s why, because every Vite tutorial glosses over it.

Our assets use absolute paths — useGLTF('/models/character.glb'). At the root domain, /models/... resolves correctly. But on a project page served under /3d-profile/, /models/... points at username.github.io/models/... — the wrong place. The fix is twofold: set base: '/3d-profile/' in vite.config.ts so Vite rewrites bundled asset URLs; but base does not rewrite the hard-coded strings in your useGLTF('/models/…') calls — you’d have to prefix each with import.meta.env.BASE_URL.

That’s a real refactor. The clean ways to avoid it entirely: deploy at a root — Vercel, Netlify, a custom domain, or a username.github.io user page where base is /. I chose Vercel precisely so the absolute paths — and the monitor calibration, and every deep link — keep working untouched. Pick your host before you hard-code your paths; we got lucky, but knowing the rule is the lesson.

—  —  —

Lessons Learned in Part 13

• A static build is the whole deploy. vite build, then dist/, then any CDN. No server to run for a 3D portfolio.
• Hash routing is a deploy superpower. No rewrites, no 404 tricks — there’s only /.
• Cache the hashed files forever; never cache the HTML. That’s the entire static-caching strategy, and it’s what makes the 40 MB room load instantly the second time.
• OG and Twitter tags are the highest-ROI SEO for a portfolio — and the image URL must be absolute.
• Design a real 1200x630 OG card. Your avatar is the wrong shape and the wrong message.
• Favicon, manifest, and theme-color are cheap signals of “finished.”
• Absolute asset paths tie you to a root deploy. Know it before you pick a host.

—  —  —

The Real End

Thirteen parts ago this was an empty Canvas. Now it’s a navigable, interactive, fast, mobile-friendly, delightful 3D portfolio — and as of this part, a public URL you can put on a résumé, that looks intentional the moment someone shares it.

That’s the series. From a black screen to a room with the lights on, behind a domain. Thanks for building every mile of it.

—  —  —

Asset Credits

• Hosting — Vercel (static, CDN, custom domains)
• OG image — generated as a 1200x630 card (gradient + gold title)
• Icons & favicon — custom “H” monogram (SVG + PNG)
• SEO testing — Facebook Sharing Debugger, opengraph.xyz
