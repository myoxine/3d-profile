# 3D Profile Website - Part 13: Ship It — Deployment, SEO & a Social Card That Actually Looks Good

Welcome to the **true finale**. In Part 12 we said deployment was "the final mile." This is that mile.

A portfolio nobody can open is a private art project. In **Part 13** we put the room behind a public URL and make sure that when someone shares the link, it shows up as a polished card — not a naked `https://…` with a broken thumbnail. We cover:

✅ **A production build** — what Vite actually emits, and why our chunking already pays off
✅ **Deploying a static SPA** — to Vercel, with the right **cache headers** for 40 MB of 3D assets
✅ **The hash-routing dividend** — why `#experience` means **zero** server config
✅ **Full SEO & social meta** — title, description, Open Graph, Twitter Card, canonical, JSON-LD
✅ **A real OG image** — a 1200×630 card so shares look intentional
✅ **Favicon, web manifest & theme color** — the small stuff that says "finished"
✅ The **GitHub Pages caveat** every Vite tutorial skips: absolute asset paths

---

## Step 1 — What `npm run build` Really Produces

Our `build` script is `tsc -b && vite build`: type-check the whole project, then bundle. The output lands in `dist/` — a fully static folder. No Node server, no runtime. That's the whole point: a 3D portfolio is just files a CDN can serve.

```
dist/
  index.html                 3.56 kB
  assets/index-*.css         0.91 kB
  assets/three-*.js        698 kB   ← three.js, its own chunk (Part 11)
  assets/index-*.js        865 kB   ← our app
  models/  hdri/  textures/  fonts/  images/   ← copied verbatim from public/
  favicon.svg  site.webmanifest  robots.txt  sitemap.xml
```

Two things to notice:

- **`three` is its own chunk.** Back in Part 11 we set `manualChunks: { three: ['three'] }`. three.js barely changes between our deploys; splitting it means a returning visitor re-downloads only our ~865 kB app chunk, not the ~700 kB engine. That split only *pays off* once caching is configured — which is Step 3.
- **Everything in `public/` is copied as-is.** That's why our GLBs live there: Vite doesn't hash or transform them, so the URLs (`/models/character.glb`) are stable and cacheable.

> ⚠️ **The 500 kB chunk warning is expected here.** A WebGL app ships a real renderer; you can't tree-shake three.js down to nothing. We've already done the meaningful win (Draco compression in Part 10, vendor chunking in Part 11). Chasing the warning further with lazy `import()` buys little for a single-scene app.

---

## Step 2 — The Hash-Routing Dividend

Here's a decision from Part 9 that quietly makes deployment trivial. Our deep links are **hash-based**:

```
https://your-site.com/#experience
https://your-site.com/#contact
```

The part after `#` never reaches the server. The browser always requests the same `/index.html`, and our `useHashRoute` hook reads `window.location.hash` on the client to fly the camera to the right view.

Why this matters at deploy time: a **path-based** SPA (`/experience`) needs the host to rewrite every unknown path back to `index.html`, or a hard refresh on a deep link 404s. With **hash** routing there are no unknown paths — there's only `/`. **No rewrite rules, no `_redirects`, no `404.html` trick.** It "just works" on any static host. Sometimes the most robust architecture is the one that asks the least of the server.

---

## Step 3 — Deploy to Vercel (with Cache Headers That Matter)

Any static host works (Netlify, Cloudflare Pages, GitHub Pages, S3). I'll use **Vercel** because it deploys at the **root** (`your-site.com/`), which keeps our absolute asset paths (`/models/...`) working unchanged, and its CDN handles big binary assets well.

**The deploy itself** is anticlimactic:

1. Push the repo to GitHub (already done).
2. On vercel.com → **Add New → Project → Import** the repo.
3. Vercel auto-detects Vite: build `npm run build`, output `dist/`. Click **Deploy**.

That's it — you get `https://<project>.vercel.app`. But the *important* part is caching. Our scene pulls **~40 MB of GLB/HDR/texture** on first load. Without cache headers, a returning visitor re-downloads all of it. We pin it with a `vercel.json` at the repo root:

```jsonc
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      // Vite's hashed assets are content-addressed → safe to cache forever
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      // heavy 3D assets rarely change → cache 1 year
      "source": "/(models|hdri|textures|fonts)/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      // index.html must stay fresh so it points at the newest hashed assets
      "source": "/",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
    }
  ]
}
```

The rule of static deploys: **cache the fingerprinted files forever, never cache the HTML.** `index.html` is the index *into* the hashed filenames — keep it fresh and every other URL can be immutable. `immutable` tells the browser not to even send a revalidation request, so a second visit to the room is near-instant.

> 💡 **Custom domain?** Add it in Vercel → Settings → Domains, then **update the absolute URLs** in `index.html` (canonical, `og:url`, `og:image`), `robots.txt`, and `sitemap.xml` to that domain. OG tags *must* be absolute — scrapers don't resolve relative paths.

---

## Step 4 — SEO Meta: From "Vite + React + TS" to a Real Page

The generated `index.html` shipped with the framework's defaults:

```html
<title>Vite + React + TS</title>
<link rel="icon" href="/vite.svg" />
```

That's what Google would index and what would appear in a browser tab. We replace the whole `<head>` with real metadata. The essentials:

```html
<title>Hadi Halim · Interactive 3D Portfolio</title>
<meta name="description" content="Portofolio 3D interaktif — sebuah ruangan yang bisa kamu jelajahi…" />
<link rel="canonical" href="https://your-site.com/" />
<meta name="theme-color" content="#1a160f" />
```

- **`<title>` + `description`** are the two lines a search result shows. Write them for a human, not a keyword stuffer.
- **`canonical`** tells search engines the one true URL — it collapses `?utm=…` variants and `www`/non-`www` into a single indexed page.
- **`theme-color`** tints the mobile browser chrome to match the room's warm dark — a tiny touch that makes the site feel native on a phone.

We also set `<html lang="id">` (the UI is Indonesian) so screen readers and translators pick the right language.

---

## Step 5 — Open Graph & Twitter: Make the Link Look Expensive

This is the highest-leverage SEO work for a portfolio, because portfolios get **shared** — in DMs, on LinkedIn, in a job application. A link with no Open Graph tags renders as a sad bare URL. With them, it's a card with a title, a description, and a 1200×630 image.

```html
<!-- Open Graph: Facebook, LinkedIn, WhatsApp, Slack, Discord… -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Hadi Halim · Interactive 3D Portfolio" />
<meta property="og:description" content="Sebuah ruangan 3D yang bisa kamu jelajahi…" />
<meta property="og:url" content="https://your-site.com/" />
<meta property="og:image" content="https://your-site.com/images/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://your-site.com/images/og-image.png" />
```

Three things people get wrong:

1. **The image URL must be absolute.** `/images/og-image.png` works in your `<head>` for the favicon, but a social scraper on another server can't resolve it — it needs the full `https://…`.
2. **`summary_large_image`**, not the default small card. You built a visual site; show the big image.
3. **Declare `og:image:width`/`height`.** Scrapers that don't pre-fetch the image still reserve the right aspect ratio, so the card never renders broken on first share.

After deploying, paste your URL into the **Facebook Sharing Debugger** and **opengraph.xyz** to see the live preview and force a re-scrape (caches are sticky — a re-scrape is how you fix a stale card).

---

## Step 6 — The OG Image: 1200×630, Generated Once

The one asset you can't write in HTML is the card image itself. Social platforms want **1200×630** (a 1.91:1 ratio). My profile photo was 1024×1536 — portrait — so it would crop into an awkward sliver. So I made a dedicated card: a warm dark gradient (matching the room), the name in the same gold the UI uses, and a one-line tagline.

You can design it in Figma, but for a repeatable asset I generated it programmatically (a small image-library script: gradient background, a soft gold glow, gradient-filled title text). The point isn't the tool — it's that the **OG image is a designed asset with its own aspect ratio**, not your avatar reused. It lives at `public/images/og-image.png` and ships like any other static file.

> 🎨 **Match the card to the product.** Same palette, same typeface feel, same name treatment as the loading screen (Part 12). The share card is often the *first* thing someone sees — before they ever load the WebGL. Make it a promise the room keeps.

---

## Step 7 — Favicon, Manifest & "Add to Home Screen"

Last mile of polish. We replaced `vite.svg` with an **SVG favicon** — a gold "H" monogram on the room's dark background — so the browser tab is on-brand and crisp at any DPI. Then a tiny PWA layer:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

The `site.webmanifest` gives the site a name, icons (192/512, plus a `maskable` variant for Android), and a theme color — so a visitor can **add the portfolio to their home screen** and it opens standalone, like an app, with our icon and no browser chrome.

```jsonc
{
  "name": "Hadi Halim · Interactive 3D Portfolio",
  "short_name": "Hadi 3D",
  "display": "standalone",
  "theme_color": "#1a160f",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

And `robots.txt` + `sitemap.xml` round out crawlability. Because we're a hash-routed SPA, the sitemap has exactly **one** URL — the root. (Hash fragments aren't separate pages to a crawler; pretending they are just adds noise.)

---

## The GitHub Pages Caveat (Read Before You Switch Hosts)

If you deploy to **GitHub *project* Pages** (`username.github.io/3d-profile/`) instead of Vercel, the room will load blank and the console will 404 on every model. Here's why, because every Vite tutorial glosses over it:

Our assets use **absolute** paths — `useGLTF('/models/character.glb')`. At the root domain `/models/...` resolves correctly. But on a project page served under `/3d-profile/`, `/models/...` points at `username.github.io/models/...` — the wrong place. The fix is twofold:

1. Set `base: '/3d-profile/'` in `vite.config.ts` so Vite rewrites *bundled* asset URLs.
2. But `base` does **not** rewrite the hard-coded strings in your `useGLTF('/models/…')` calls — you'd have to prefix each with `import.meta.env.BASE_URL`.

That's a real refactor. The clean ways to avoid it entirely: deploy at a **root** (Vercel, Netlify, a custom domain, or a `username.github.io` *user* page where base is `/`). I chose Vercel precisely so the absolute paths — and the monitor calibration, and every deep link — keep working untouched. **Pick your host before you hard-code your paths**; we got lucky, but knowing the rule is the lesson.

---

## Lessons Learned in Part 13

- **A static build is the whole deploy.** `vite build` → `dist/` → any CDN. No server to run for a 3D portfolio.
- **Hash routing is a deploy superpower.** No rewrites, no 404 tricks — there's only `/`.
- **Cache the hashed files forever; never cache the HTML.** That's the entire static-caching strategy, and it's what makes the 40 MB room load instantly the second time.
- **OG/Twitter tags are the highest-ROI SEO for a portfolio** — and the image URL must be absolute.
- **Design a real 1200×630 OG card.** Your avatar is the wrong shape and the wrong message.
- **Favicon + manifest + theme-color** are cheap signals of "finished."
- **Absolute asset paths tie you to a root deploy.** Know it before you pick a host.

---

## The Real End

Thirteen parts ago this was an empty `<Canvas>`. Now it's a navigable, interactive, fast, mobile-friendly, *delightful* 3D portfolio — and as of this part, **a public URL you can put on a résumé**, that looks intentional the moment someone shares it.

That's the series. From a black screen to a room with the lights on, behind a domain. Thanks for building every mile of it. 🏠✨🚀

---

### Asset Credits

- Hosting — [Vercel](https://vercel.com) (static, CDN, custom domains)
- OG image — generated as a 1200×630 card (gradient + gold title)
- Icons & favicon — custom "H" monogram (SVG + PNG)
- SEO testing — [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), [opengraph.xyz](https://www.opengraph.xyz/)
