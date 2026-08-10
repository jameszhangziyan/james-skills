# James Skills

> A growing constellation of Codex skills — open-source, self-contained, and
> one command away from running on any platform.

This repository is the home of the **James Skills** showcase site. It is
designed in the Dala dark-void style (see `DESIGN.md`) and lists every
Codex skill curated or built by James Zhang, each with a description and a
direct GitHub download link.

## Live site

The site is fully static. Open `index.html` in any modern browser to preview.
The production deployment is intended to be one of the options below.

## Repository layout

```
website/
├── index.html                       Self-contained static site (Dala design)
├── public/favicon.svg               Constellation mark
├── dist/
│   ├── server/index.js              Cloudflare Worker (embeds index.html)
│   └── .openai/hosting.json         Sites / Workers hosting metadata
├── .github/workflows/
│   └── deploy-pages.yml             GitHub Pages auto-deploy
├── wrangler.toml                    Cloudflare Workers config
├── scripts/rebuild-worker.mjs       Rebuild dist/server/index.js after edits
├── DESIGN.md                        Design system reference (Dala dark-void)
└── README.md                        This file
```

## Skills included (20)

| Category | Count | Skills |
|----------|-------|--------|
| **Finance** | 11 | alphaear-news · alphaear-search · alphaear-sentiment · alphaear-stock · wudao-ashare · wudao-market · wudao-analysis · wudao-intel · wudao-limitup · yfinance-data · a-stock-data |
| **Design** | 6 | baoyu-cover-image · baoyu-format-markdown · baoyu-infographic · baoyu-xhs-images · hatch-pet · huashu-design |
| **Decks** | 2 | keynote-ppt · ppt-master |
| **Other** | 1 | finance-market-analysis |

Each card links to the upstream repository. The default prefix is
`github.com/jameszhangziyan/<skill>`; for known third-party skills
(a-stock-data, baoyu-*, huashu-design, ppt-master) the original author's
repo is used so attribution stays honest.

## Local preview

```bash
# 1. Open directly
open index.html

# 2. Or serve locally
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deployment

You have three turnkey options. Pick the one that matches your stack.

### Option 1 — GitHub Pages (recommended, free)

1. Push this folder to a new GitHub repo (e.g. `jameszhangziyan/james-skills`).
2. In **Settings → Pages**, set Source to **GitHub Actions**.
3. Push to `main`. The included workflow at
   `.github/workflows/deploy-pages.yml` rebuilds the worker and publishes
   the site to `https://<user>.github.io/<repo>/`.

### Option 2 — Cloudflare Workers (fast, global edge)

```bash
npm install -g wrangler
wrangler login
node scripts/rebuild-worker.mjs      # refresh dist/server/index.js
wrangler deploy                     # publishes to <your-subdomain>.workers.dev
```

`wrangler.toml` is already configured with `main = "dist/server/index.js"`.

### Option 3 — Any static host (Netlify, Vercel, S3, …)

The site is one file. Upload `index.html` plus the `public/` folder, and
set the index document to `index.html`. That's it.

## Editing the skill list

1. Open `index.html` and add, edit, or remove `<article class="skill" data-cat="…">`
   blocks. The category values are `finance`, `design`, `decks`, and `other`.
2. Update the filter counts in the `.filter` chips if the totals change.
3. If you plan to deploy via Cloudflare Workers, run:

   ```bash
   node scripts/rebuild-worker.mjs
   ```

   The script is idempotent — it can be run on a fresh template or on a
   previously built worker.

## Design tokens

Followed from `DESIGN.md`:

| Token | Value | Use |
|-------|-------|-----|
| `--color-void` | `#000000` | Page background |
| `--color-bone-white` | `#ffffff` | Primary text |
| `--color-electric-iris` | `#8052ff` | Accent / CTA / links |
| `--color-saffron-spark` | `#ffb829` | Highlights, hot tags |
| `--color-ash-gray` | `#9a9a9a` | Muted text |
| `--color-deep-verdant` | `#15846e` | Tertiary accent |
| Font | Inter (sub for PPNeueMontreal) | All text |
| Display | 78–113px, weight 400, -0.04em | Headlines |

The constellation visual at the top of the page is the brand mark — a
hand-tuned organic shape made from animated iris / amber / verdant dots
with thin connecting lines, deliberately reminiscent of the Dala brain
constellation.

## License

MIT — the website code is open. Skill contents remain under their original
licenses; see each upstream repository for details.
