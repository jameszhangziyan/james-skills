// Minimal Cloudflare Worker that serves the static James Skills site.
// Embeds the HTML at build time so the worker is self-contained and
// compatible with the Sites plugin's Cloudflare Workers contract.

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>James Skills — A growing constellation of Codex skills</title>
<meta name="description" content="A growing library of Codex skills by James Zhang. Browse, download, and install finance, design, and presentation skills on any platform." />
<meta name="theme-color" content="#000000" />
<meta property="og:title" content="James Skills" />
<meta property="og:description" content="A growing library of Codex skills. Download and install on any platform." />
<meta property="og:type" content="website" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root {
    --color-void: #000000;
    --color-bone-white: #ffffff;
    --color-ash-gray: #9a9a9a;
    --color-silver-mist: #bdbdbd;
    --color-electric-iris: #8052ff;
    --color-saffron-spark: #ffb829;
    --color-deep-verdant: #15846e;

    --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

    --tracking-display: -0.04em;
    --tracking-heading-lg: -0.04em;
    --tracking-heading: -0.035em;

    --page-max: 1280px;
    --pad-x: clamp(24px, 6vw, 96px);
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }

  body {
    background: var(--color-void);
    color: var(--color-bone-white);
    font-family: var(--font-sans);
    font-weight: 400;
    font-size: 18px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    font-feature-settings: "ss01" on;
  }

  ::selection { background: var(--color-electric-iris); color: var(--color-bone-white); }

  a { color: inherit; text-decoration: none; }

  .wrap {
    max-width: var(--page-max);
    margin: 0 auto;
    padding: 0 var(--pad-x);
  }

  /* ---------- BACKGROUND CANVAS ---------- */
  .bg-particles {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
    touch-action: none;
  }
  .nav, main, footer { position: relative; z-index: 1; }

  /* Soft vignette behind text-heavy regions so copy stays readable
     over the bright particle field */
  .hero::before,
  #skills::before,
  .install::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 72% 62% at 42% 48%,
      rgba(0,0,0,0.62) 0%,
      rgba(0,0,0,0.28) 45%,
      transparent 78%);
    pointer-events: none;
    z-index: -1;
  }
  .hero, #skills, .install { position: relative; }

  /* ---------- SHARED TYPOGRAPHY ---------- */
  .eyebrow {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-saffron-spark);
    margin: 0 0 22px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--color-electric-iris);
    color: var(--color-bone-white);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    padding: 14px 24px;
    border-radius: 9999px;
    border: 0;
    cursor: pointer;
    transition: transform .15s ease, background .2s ease;
  }
  .pill:hover { transform: translateY(-1px); background: #8f66ff; }
  .pill .arrow { display: inline-block; transition: transform .2s ease; }
  .pill:hover .arrow { transform: translateX(3px); }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-bone-white);
    transition: color .2s ease;
  }
  .text-link:hover { color: var(--color-electric-iris); }
  .text-link .arrow { display: inline-block; transition: transform .2s ease; }
  .text-link:hover .arrow { transform: translateX(3px); }

  /* ---------- NAV ---------- */
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 26px 0;
  }
  .nav-inner {
    display: flex;
    align-items: center;
    gap: 40px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-bone-white);
    margin-right: auto;
  }
  .brand-mark {
    width: 20px; height: 20px;
    display: inline-block;
    flex: 0 0 20px;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }
  .nav-link {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-ash-gray);
    transition: color .2s ease;
  }
  .nav-link:hover, .nav-link.is-active { color: var(--color-bone-white); }
  .nav-cta { padding: 11px 20px; }

  /* ---------- HERO ---------- */
  .hero {
    padding: clamp(72px, 12vh, 150px) 0 120px;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: clamp(24px, 6vw, 80px);
    align-items: center;
  }
  .hero h1 {
    font-size: clamp(52px, 7.6vw, 106px);
    line-height: 1.04;
    letter-spacing: var(--tracking-display);
    font-weight: 400;
    margin: 0 0 40px;
  }
  .hero h1 .iris { color: var(--color-electric-iris); }
  .hero h1 .saff { color: var(--color-saffron-spark); }
  .hero .lede {
    font-size: 18px;
    font-weight: 200;
    line-height: 1.55;
    color: var(--color-silver-mist);
    max-width: 500px;
    margin: 0 0 44px;
  }
  .hero .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
    align-items: center;
  }

  /* ---------- META BAR ---------- */
  .meta { padding: 12px 0 40px; }
  .meta-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 48px 24px;
  }
  .meta-cell .k {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-ash-gray);
    margin-bottom: 8px;
  }
  .meta-cell .v {
    font-size: 27px;
    line-height: 1.05;
    letter-spacing: -0.02em;
    font-weight: 400;
  }
  .meta-cell .v .iris { color: var(--color-electric-iris); }
  .meta-cell .v .saff { color: var(--color-saffron-spark); }
  /* ---------- SECTION HEADERS ---------- */
  section { padding: 110px 0; }
  .section-head {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: clamp(24px, 6vw, 80px);
    margin-bottom: 84px;
  }
  .section-head h2 {
    font-size: clamp(48px, 6.4vw, 78px);
    line-height: 1.05;
    letter-spacing: var(--tracking-heading-lg);
    font-weight: 400;
    margin: 0;
  }
  .section-head h2 .iris { color: var(--color-electric-iris); }
  .section-head .head-side { align-self: end; }
  .section-head .body-copy {
    font-size: 18px;
    font-weight: 200;
    line-height: 1.55;
    color: var(--color-silver-mist);
    max-width: 480px;
    margin: 0;
  }
  .section-head .body-copy .iris { color: var(--color-electric-iris); }
  .section-head .body-copy code { font-family: var(--font-mono); font-size: 15px; color: var(--color-saffron-spark); }

  /* ---------- CATEGORY FILTERS (ghost text links) ---------- */
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 36px;
    margin-bottom: 84px;
  }
  .filter {
    background: none;
    border: 0;
    padding: 0;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-ash-gray);
    cursor: pointer;
    transition: color .2s ease;
  }
  .filter::before {
    content: '';
    display: inline-block;
    width: 0; height: 0;
    border-left: 6px solid var(--color-electric-iris);
    border-top: 4.5px solid transparent;
    border-bottom: 4.5px solid transparent;
    margin-right: 0;
    opacity: 0;
    transition: opacity .2s ease, margin-right .2s ease;
  }
  .filter:hover { color: var(--color-bone-white); }
  .filter.is-active { color: var(--color-bone-white); }
  .filter.is-active::before { opacity: 1; margin-right: 10px; }

  /* ---------- SKILL ENTRIES (no cards — floating on void) ---------- */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    column-gap: 80px;
    row-gap: 96px;
  }
  .skill {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .skill::before {
    content: '';
    position: absolute;
    left: -30px;
    top: 10px;
    width: 0; height: 0;
    border-left: 8px solid var(--color-electric-iris);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    opacity: 0;
    transition: opacity .2s ease;
  }
  .skill:hover::before { opacity: 1; }

  .skill-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }
  .skill-name {
    font-size: 27px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 400;
    margin: 0;
    transition: color .2s ease;
  }
  .skill:hover .skill-name { color: var(--color-electric-iris); }
  .skill-tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-electric-iris);
    border: 1px solid rgba(128,82,255,0.35);
    border-radius: 9999px;
    padding: 5px 12px;
    flex: 0 0 auto;
    white-space: nowrap;
  }
  .skill-tag.amber { color: var(--color-saffron-spark); border-color: rgba(255,184,41,0.4); }
  .skill-tag.green { color: #1fae8f; border-color: rgba(21,132,110,0.55); }

  .skill-desc {
    font-size: 15px;
    font-weight: 200;
    line-height: 1.6;
    color: var(--color-silver-mist);
    margin: 0;
    flex: 1 1 auto;
  }
  .skill-meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-top: 6px;
  }
  .skill-author {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-ash-gray);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .skill-author .iris { color: var(--color-electric-iris); }
  .skill-links { display: flex; gap: 22px; flex: 0 0 auto; }
  .link-dl, .link-src {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    transition: color .2s ease;
  }
  .link-dl { color: var(--color-bone-white); }
  .link-dl:hover { color: var(--color-electric-iris); }
  .link-dl .arrow { display: inline-block; transition: transform .2s ease; }
  .link-dl:hover .arrow { transform: translateY(2px); }
  .link-src { color: var(--color-ash-gray); }
  .link-src:hover { color: var(--color-bone-white); }

  /* ---------- INSTALL SECTION ---------- */
  .install-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(24px, 6vw, 80px);
    align-items: start;
  }
  .install .section-left h2 {
    font-size: clamp(48px, 6.4vw, 78px);
    line-height: 1.05;
    letter-spacing: var(--tracking-heading-lg);
    font-weight: 400;
    margin: 0 0 36px;
  }
  .install .section-left h2 .iris { color: var(--color-electric-iris); }
  .install .lede {
    font-size: 18px;
    font-weight: 200;
    line-height: 1.55;
    color: var(--color-silver-mist);
    margin: 0 0 48px;
    max-width: 500px;
  }
  .install .lede code { font-family: var(--font-mono); font-size: 15px; color: var(--color-saffron-spark); }
  .steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .step {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 20px;
    align-items: start;
  }
  .step .num {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-electric-iris);
    padding-top: 5px;
  }
  .step h4 {
    font-size: 18px;
    font-weight: 400;
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }
  .step h4 code { font-family: var(--font-mono); font-size: 15px; color: var(--color-saffron-spark); }
  .step p {
    font-size: 14px;
    font-weight: 200;
    line-height: 1.55;
    color: var(--color-ash-gray);
    margin: 0;
  }

  .code-block { position: relative; }
  .code-block + .code-block { margin-top: 64px; }
  .code-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }
  .code-head .platform {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-electric-iris);
  }
  .code-block pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-bone-white);
    white-space: pre-wrap;
    word-break: break-all;
  }
  .copy {
    background: none;
    border: 0;
    padding: 0;
    color: var(--color-ash-gray);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    cursor: pointer;
    transition: color .2s ease;
  }
  .copy:hover { color: var(--color-bone-white); }
  .copy.copied { color: var(--color-saffron-spark); }
  .code-block .c-comment { color: var(--color-ash-gray); }
  .code-block .c-cmd { color: var(--color-bone-white); }
  .code-block .c-iris { color: var(--color-electric-iris); }
  .code-block .c-saff { color: var(--color-saffron-spark); }

  /* ---------- FOOTER ---------- */
  .foot { padding: 40px 0 48px; }
  .foot-row {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
    gap: 48px 32px;
    margin-bottom: 72px;
  }
  .foot h5 {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: var(--color-ash-gray);
    margin: 0 0 20px;
  }
  .foot ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
  .foot ul a {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-bone-white);
    transition: color .2s ease;
  }
  .foot ul a:hover { color: var(--color-electric-iris); }
  .foot .tagline {
    font-size: 14px;
    font-weight: 200;
    color: var(--color-ash-gray);
    max-width: 360px;
    line-height: 1.6;
    margin: 18px 0 0;
  }
  .foot .tagline .iris { color: var(--color-electric-iris); }
  .legal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: var(--color-ash-gray);
  }
  .legal .links { display: flex; gap: 22px; }
  .legal .links a { transition: color .2s ease; }
  .legal .links a:hover { color: var(--color-bone-white); }

  /* ---------- HIDDEN ---------- */
  .hidden { display: none !important; }

  /* ---------- RESPONSIVE ---------- */
  @media (max-width: 960px) {
    .hero { padding: 60px 0 90px; }
    .hero-grid, .section-head, .install-grid { grid-template-columns: 1fr; }
    .meta-row { grid-template-columns: repeat(2, 1fr); gap: 32px 24px; }
    section { padding: 84px 0; }
    .section-head { margin-bottom: 56px; }
    .filters { margin-bottom: 64px; }
    .foot-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .nav-links { display: none; }
    .grid { grid-template-columns: 1fr; row-gap: 72px; }
    .meta-row { grid-template-columns: 1fr; }
    .foot-row { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .pill, .filter, .nav-link, .text-link, .link-dl, .link-src, .skill-name, a { transition: none; }
  }
</style>
</head>
<body>

<!-- Full-page background particle constellation (Canvas 2D) -->
<canvas id="bgParticles" class="bg-particles" aria-hidden="true"></canvas>

<header class="nav" role="banner">
  <div class="wrap nav-inner">
    <a href="#top" class="brand" aria-label="James Skills home">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#8052ff"/>
              <stop offset="1" stop-color="#15846e"/>
            </linearGradient>
          </defs>
          <path d="M12 3.5 L20.5 19.5 L3.5 19.5 Z" stroke="url(#brandGrad)" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M12 9.5 L16 16.5 L8 16.5 Z" fill="#8052ff"/>
        </svg>
      </span>
      James&nbsp;Skills
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a class="nav-link is-active" href="#skills">Skills</a>
      <a class="nav-link" href="#install">Install</a>
      <a class="nav-link" href="https://github.com/jameszhangziyan" target="_blank" rel="noopener">GitHub</a>
    </nav>
    <a class="pill nav-cta" href="#skills">Get skills</a>
  </div>
</header>

<main id="top">

<!-- HERO -->
<section class="hero" aria-label="Hero">
  <div class="wrap hero-grid">
    <div>
      <h1>
        Skills, <span class="iris">on tap.</span><br/>
        <span class="saff">Installable</span> anywhere.
      </h1>
      <p class="eyebrow">Open source · 19 skills · macOS / Linux / Cloud</p>
      <p class="lede">
        A growing library of Codex skills for finance, design, and presentations.
        Every skill is self-contained and one command away from running
        anywhere you work.
      </p>
      <div class="actions">
        <a class="pill" href="#skills">
          Browse the 19 skills
          <span class="arrow" aria-hidden="true">→</span>
        </a>
        <a class="text-link" href="#install">Install guide <span class="arrow" aria-hidden="true">→</span></a>
      </div>
    </div>
    <div aria-hidden="true"></div>
  </div>
</section>

<!-- META -->
<section class="meta" aria-label="Library statistics">
  <div class="wrap">
    <div class="meta-row">
      <div class="meta-cell">
        <div class="k">Skills</div>
        <div class="v"><span class="iris">19</span> in library</div>
      </div>
      <div class="meta-cell">
        <div class="k">Categories</div>
        <div class="v">Finance · Design · Decks</div>
      </div>
      <div class="meta-cell">
        <div class="k">Platforms</div>
        <div class="v">macOS · Linux · <span class="saff">Cloud</span></div>
      </div>
      <div class="meta-cell">
        <div class="k">License</div>
        <div class="v">Open source, <span class="iris">MIT</span></div>
      </div>
    </div>
  </div>
</section>

<!-- SKILLS -->
<section id="skills" aria-label="Skill library">
  <div class="wrap">
    <div class="section-head">
      <h2>The <span class="iris">constellation.</span></h2>
      <div class="head-side">
        <p class="eyebrow">Browse by need</p>
        <p class="body-copy">
          Nineteen self-contained skills, each one a zip away. Download straight
          from this page, unpack into <code>~/.codex/skills/</code>, and restart
          Codex — the skill is live in the same conversation.
        </p>
      </div>
    </div>

    <div class="filters" role="tablist" aria-label="Skill categories">
      <button class="filter is-active" data-filter="all" role="tab" aria-selected="true">All · 19</button>
      <button class="filter" data-filter="finance" role="tab" aria-selected="false">Finance · 11</button>
      <button class="filter" data-filter="design" role="tab" aria-selected="false">Design · 6</button>
      <button class="filter" data-filter="decks" role="tab" aria-selected="false">Decks · 2</button>
    </div>

    <div class="grid" id="grid">
      <!-- finance -->
      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">alphaear-news</h3>
          <span class="skill-tag">News</span>
        </div>
        <p class="skill-desc">实时财经新闻与热点趋势聚合。盘前梳理、事件驱动分析、热点轮动追踪与情绪冲击扫描。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/alphaear-news.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">alphaear-search</h3>
          <span class="skill-tag">Search</span>
        </div>
        <p class="skill-desc">财经检索与本地 RAG 技能。补充新闻检索、查找公司背景、做多源交叉验证与资料回忆。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/alphaear-search.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">alphaear-sentiment</h3>
          <span class="skill-tag amber">Sentiment</span>
        </div>
        <p class="skill-desc">金融情绪打分。新闻、社媒、研报多空语气对比，辅助判断风险偏好与热点持续性。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/alphaear-sentiment.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">alphaear-stock</h3>
          <span class="skill-tag">Ticker</span>
        </div>
        <p class="skill-desc">Search A-Share / HK / US tickers and retrieve historical OHLCV price data through a unified Python toolkit.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/alphaear-stock.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">wudao-ashare</h3>
          <span class="skill-tag">A 股</span>
        </div>
        <p class="skill-desc">悟道 A 股套件总入口，路由行情、涨停、资金分析、市场情报五大子技能，应对个股估值与板块轮动。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/wudao-ashare.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">wudao-market</h3>
          <span class="skill-tag">Quote</span>
        </div>
        <p class="skill-desc">A 股基础行情。股票搜索、日线 / 分时 / K 线、涨跌幅排行、市场概况与交易日历。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/wudao-market.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">wudao-analysis</h3>
          <span class="skill-tag amber">Flow</span>
        </div>
        <p class="skill-desc">资金面深度分析。异动检测、资金流向、板块轮动、股票关联、概念排行与成分股映射。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/wudao-analysis.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">wudao-intel</h3>
          <span class="skill-tag green">Intel</span>
        </div>
        <p class="skill-desc">盘前盘后情报。智能热榜、研报、竞价、每日简报与龙虎榜分析，事件驱动一站到底。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/wudao-intel.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">wudao-limitup</h3>
          <span class="skill-tag amber">Limit-up</span>
        </div>
        <p class="skill-desc">短线情绪生态。涨停梯队、炸板池、跌停池、封板事件流、最强风口与溢价统计。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/wudao-limitup.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">yfinance-data</h3>
          <span class="skill-tag">US · Global</span>
        </div>
        <p class="skill-desc">Fetch financial and market data using the yfinance Python library — prices, statements, options, dividends, analysts.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/yfinance-data.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="finance">
        <div class="skill-head">
          <h3 class="skill-name">a-stock-data</h3>
          <span class="skill-tag green">Curated</span>
        </div>
        <p class="skill-desc">A 股全栈数据工具包 V3.2.2 — 行情 / 研报 / 信号 / 资金面 / 新闻 / 基础数据 / 公告七层数据源，自包含零外部依赖。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>simonlin1212/a-stock-data</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/a-stock-data.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
            <a class="link-src" href="https://github.com/simonlin1212/a-stock-data" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>

      <!-- design -->
      <article class="skill" data-cat="design">
        <div class="skill-head">
          <h3 class="skill-name">baoyu-cover-image</h3>
          <span class="skill-tag">Cover</span>
        </div>
        <p class="skill-desc">Generate article cover images with 5 dimensions, 11 color palettes, 7 rendering styles — cinematic, widescreen, square.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>JimLiu/baoyu-skills</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/baoyu-cover-image.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
            <a class="link-src" href="https://github.com/JimLiu/baoyu-skills" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="design">
        <div class="skill-head">
          <h3 class="skill-name">baoyu-format-markdown</h3>
          <span class="skill-tag">Markdown</span>
        </div>
        <p class="skill-desc">Format plain text or markdown with frontmatter, titles, summaries, headings, bold, lists and code blocks. Beautify any article.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>JimLiu/baoyu-skills</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/baoyu-format-markdown.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
            <a class="link-src" href="https://github.com/JimLiu/baoyu-skills" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="design">
        <div class="skill-head">
          <h3 class="skill-name">baoyu-infographic</h3>
          <span class="skill-tag amber">Infographic</span>
        </div>
        <p class="skill-desc">Professional infographics with 21 layout types and 22 visual styles. Analyzes content and recommends layout×style combos.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>JimLiu/baoyu-skills</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/baoyu-infographic.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
            <a class="link-src" href="https://github.com/JimLiu/baoyu-skills" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="design">
        <div class="skill-head">
          <h3 class="skill-name">baoyu-xhs-images</h3>
          <span class="skill-tag">XHS</span>
        </div>
        <p class="skill-desc">Image-card series with 12 visual styles, 8 layouts, 3 palettes. Built for 小红书 / 微信 / 视频号 social engagement.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>JimLiu/baoyu-skills</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/baoyu-xhs-images.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
            <a class="link-src" href="https://github.com/JimLiu/baoyu-skills" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="design">
        <div class="skill-head">
          <h3 class="skill-name">hatch-pet</h3>
          <span class="skill-tag green">Pet</span>
        </div>
        <p class="skill-desc">Create, repair, validate, QA, and package Codex-compatible animated pets — full 8×9 sprite atlas with transparent padding.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/hatch-pet.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="design">
        <div class="skill-head">
          <h3 class="skill-name">huashu-design</h3>
          <span class="skill-tag amber">Design OS</span>
        </div>
        <p class="skill-desc">HTML 高保真原型 / 幻灯片 / 动画 / 可视化专家。三个方向初稿，指定风格也得先选，质感到位才执行。</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>alchaincyf/huashu-design</span>
          <div class="skill-links">
            <a class="link-dl" href="https://github.com/alchaincyf/huashu-design" target="_blank" rel="noopener">Download <span class="arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>

      <!-- decks -->
      <article class="skill" data-cat="decks">
        <div class="skill-head">
          <h3 class="skill-name">keynote-ppt</h3>
          <span class="skill-tag">Keynote</span>
        </div>
        <p class="skill-desc">High-impact keynotes in three styles — SpaceX industrial roadshow, NVIDIA cinematic, McKinsey analytical. Native PPTX output.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>jameszhangziyan</span>
          <div class="skill-links">
            <a class="link-dl" href="downloads/keynote-ppt.zip" download>Download <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </article>

      <article class="skill" data-cat="decks">
        <div class="skill-head">
          <h3 class="skill-name">ppt-master</h3>
          <span class="skill-tag amber">PPTX</span>
        </div>
        <p class="skill-desc">AI-driven PPTX workflow — editable decks, reusable Brand / Layout / Deck workspaces, template filling, and finishing.</p>
        <div class="skill-meta">
          <span class="skill-author"><span class="iris">@</span>hugohe3/ppt-master</span>
          <div class="skill-links">
            <a class="link-dl" href="https://github.com/hugohe3/ppt-master" target="_blank" rel="noopener">Download <span class="arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- INSTALL -->
<section class="install" id="install" aria-label="Install guide">
  <div class="wrap install-grid">
    <div class="section-left">
      <h2>Install in <span class="iris">three moves.</span></h2>
      <p class="lede">
        Every card on this page serves its own zip. One download, one unzip,
        and the skill drops straight into <code>~/.codex/skills/</code> —
        no accounts, no keys, no waiting.
      </p>
      <ol class="steps">
        <li class="step">
          <span class="num">01</span>
          <div>
            <h4>Download the zip</h4>
            <p>Hit Download on any skill card — the file comes straight from this page, no detours.</p>
          </div>
        </li>
        <li class="step">
          <span class="num">02</span>
          <div>
            <h4>Unzip into <code>~/.codex/skills/</code></h4>
            <p>Each zip holds one self-contained folder with a SKILL.md at its root.</p>
          </div>
        </li>
        <li class="step">
          <span class="num">03</span>
          <div>
            <h4>Restart Codex</h4>
            <p>The skill shows up in the same conversation. No rebuild, no deploy step.</p>
          </div>
        </li>
      </ol>
    </div>

    <div>
      <div class="code-block">
        <div class="code-head">
          <span class="platform">macOS · zsh</span>
          <button class="copy" data-copy="mac">Copy</button>
        </div>
<pre><span class="c-comment"># pick any skill from the list above</span>
<span class="c-cmd">curl -L -o</span> <span class="c-saff">/tmp/alphaear-news.zip</span> <span class="c-iris">\\</span>
  <span class="c-iris">https://jameszhangziyan.github.io/james-skills/downloads/alphaear-news.zip</span>
<span class="c-cmd">unzip -o</span> <span class="c-saff">/tmp/alphaear-news.zip</span> <span class="c-cmd">-d</span> <span class="c-iris">~/.codex/skills/</span>

<span class="c-comment"># restart Codex and the skill shows up automatically</span></pre>
      </div>

      <div class="code-block">
        <div class="code-head">
          <span class="platform">Linux · bash</span>
          <button class="copy" data-copy="linux">Copy</button>
        </div>
<pre><span class="c-comment"># same move, different skill</span>
<span class="c-cmd">curl -L -o</span> <span class="c-saff">/tmp/wudao-ashare.zip</span> <span class="c-iris">\\</span>
  <span class="c-iris">https://jameszhangziyan.github.io/james-skills/downloads/wudao-ashare.zip</span>
<span class="c-cmd">unzip -o</span> <span class="c-saff">/tmp/wudao-ashare.zip</span> <span class="c-cmd">-d</span> <span class="c-iris">~/.codex/skills/</span></pre>
      </div>

      <div class="code-block">
        <div class="code-head">
          <span class="platform">Install them all</span>
          <button class="copy" data-copy="cloud">Copy</button>
        </div>
<pre><span class="c-comment"># grab the whole constellation in one loop</span>
<span class="c-cmd">for</span> s <span class="c-cmd">in</span> <span class="c-saff">alphaear-news wudao-ashare keynote-ppt</span>; <span class="c-cmd">do</span>
  <span class="c-cmd">curl -sL -o</span> /tmp/$s.zip <span class="c-iris">\\</span>
    <span class="c-iris">https://jameszhangziyan.github.io/james-skills/downloads/</span>$s.zip
  <span class="c-cmd">unzip -oq</span> /tmp/$s.zip <span class="c-cmd">-d</span> <span class="c-iris">~/.codex/skills/</span>
<span class="c-cmd">done</span></pre>
      </div>
    </div>
  </div>
</section>
</main>

<!-- FOOTER -->
<footer class="foot" role="contentinfo">
  <div class="wrap">
    <div class="foot-row">
      <div>
        <a class="brand" href="#top">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="brandGradFoot" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#8052ff"/>
                  <stop offset="1" stop-color="#15846e"/>
                </linearGradient>
              </defs>
              <path d="M12 3.5 L20.5 19.5 L3.5 19.5 Z" stroke="url(#brandGradFoot)" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M12 9.5 L16 16.5 L8 16.5 Z" fill="#8052ff"/>
            </svg>
          </span>
          James&nbsp;Skills
        </a>
        <p class="tagline">
          Built and curated by <span class="iris">James Zhang</span>. Each
          skill is open source, self-contained, and made to be forked.
        </p>
      </div>

      <div>
        <h5>Library</h5>
        <ul>
          <li><a href="#skills">All skills</a></li>
          <li><a href="#skills" data-jump="finance">Finance</a></li>
          <li><a href="#skills" data-jump="design">Design</a></li>
          <li><a href="#skills" data-jump="decks">Decks</a></li>
        </ul>
      </div>

      <div>
        <h5>Get started</h5>
        <ul>
          <li><a href="#install">Install guide</a></li>
          <li><a href="https://github.com/jameszhangziyan/james-skills" target="_blank" rel="noopener">Site repository</a></li>
          <li><a href="https://github.com/jameszhangziyan" target="_blank" rel="noopener">GitHub profile</a></li>
        </ul>
      </div>

      <div>
        <h5>Contact</h5>
        <ul>
          <li><a href="mailto:james.zhangziyan@gmail.com">james.zhangziyan@gmail.com</a></li>
          <li><a href="https://github.com/jameszhangziyan" target="_blank" rel="noopener">@jameszhangziyan</a></li>
        </ul>
      </div>
    </div>

    <div class="legal">
      <span>© 2026 James Zhang · Pure HTML + Canvas, hosted on GitHub Pages.</span>
      <span class="links">
        <a href="#top">Top ↑</a>
        <a href="https://github.com/jameszhangziyan" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:james.zhangziyan@gmail.com">Email</a>
      </span>
    </div>
  </div>
</footer>

<script>
  // category filter
  (function () {
    const buttons = document.querySelectorAll('.filter');
    const cards = document.querySelectorAll('#grid .skill');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        buttons.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        cards.forEach(card => {
          if (cat === 'all' || card.dataset.cat === cat) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });

    // footer deep links → filter
    document.querySelectorAll('a[data-jump]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const cat = a.dataset.jump;
        const target = document.querySelector('.filter[data-filter="' + cat + '"]');
        if (target) target.click();
        document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });
      });
    });

    // copy buttons
    const BASE = 'https://jameszhangziyan.github.io/james-skills/downloads/';
    const COPY_TEXT = {
      mac: "curl -L -o /tmp/alphaear-news.zip \\\\\\n  " + BASE + "alphaear-news.zip\\nunzip -o /tmp/alphaear-news.zip -d ~/.codex/skills/",
      linux: "curl -L -o /tmp/wudao-ashare.zip \\\\\\n  " + BASE + "wudao-ashare.zip\\nunzip -o /tmp/wudao-ashare.zip -d ~/.codex/skills/",
      cloud: "for s in alphaear-news wudao-ashare keynote-ppt; do\\n  curl -sL -o /tmp/$s.zip \\\\\\n    " + BASE + "$s.zip\\n  unzip -oq /tmp/$s.zip -d ~/.codex/skills/\\ndone",
    };
    document.querySelectorAll('.code-block .copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.copy;
        const text = COPY_TEXT[key] || '';
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (_) {}
          ta.remove();
        }
        const orig = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
      });
    });
  })();
</script>

<!-- Background particle constellation (Canvas 2D, discrete shape switch) -->
<script>
// Thousands of tiny OUTLINED TRIANGLES in a vivid spectrum form one shape at
// a time (J / idea-bulb / human-brain) in the upper-right of the viewport,
// while a sparse ambient field drifts across the whole page. Mouse movement
// accumulates "energy"; every ENERGY_PER_CHANGE pixels of travel switches to
// the next shape with a radial flash + saffron→white color sweep.

(function () {
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // --- Config ---
  const PARTICLE_TARGET = 4200;
  const MOBILE_PARTICLE_TARGET = 1800;
  const AMBIENT_TARGET = 240;
  const MOBILE_AMBIENT_TARGET = 100;
  const MOUSE_RADIUS = 380;
  const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
  const REPULSION_STRENGTH = 1.6;
  const SWIRL_STRENGTH = 0.35;
  const GLOW_DECAY = 0.91;
  const SIZE_DECAY = 0.90;
  const ENERGY_PER_CHANGE = 350;     // needs 350px of mouse travel per switch
  const ENERGY_DECAY_IDLE = 0.94;
  const FLASH_DECAY = 0.95;

  // --- Vivid spectrum palette (Dala: violet / amber / teal / magenta / blue) ---
  const PALETTE = [
    [128, 82, 255], [128, 82, 255], [128, 82, 255], [128, 82, 255],
    [255, 184, 41], [255, 184, 41],
    [20, 200, 164],
    [255, 79, 160],
    [79, 143, 255],
    [235, 235, 255],
  ];

  // --- State ---
  let W = 0, H = 0, DPR = 1;
  let CX = 0, CY = 0, SHAPE_HALF = 360;
  let particles = [];
  let ambient = [];
  const homes = { 0: [], 1: [], 2: [] };   // 0=J, 1=idea-bulb, 2=brain
  let currentShape = 0;
  let energy = 0;
  let flash = 0;
  const mouse = {
    x: -9999, y: -9999, px: -9999, py: -9999,
    vx: 0, vy: 0, speed: 0,
    active: false, lastMoveAt: -Infinity,
  };
  let t0 = performance.now();

  // --- Layout: upper-right on wide, upper-center on narrow ---
  function computeLayout() {
    if (W > 960) {
      return { cx: W * 0.72, cy: H * 0.35, half: Math.min(W, H) * 0.42 };
    }
    return { cx: W * 0.5, cy: H * 0.34, half: Math.min(W, H) * 0.32 };
  }

  // --- Noise ---
  function hash(x, y) {
    const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  function noise2D(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = smooth(xf), v = smooth(yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return ((a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v) * 2 - 1;
  }

  // --- Shape drawing ---
  function makeMask(size, drawFn) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx2 = c.getContext('2d');
    ctx2.fillStyle = '#fff';
    drawFn(ctx2, size);
    return c;
  }

  // J — bold, with a clear hook (stem right, hook curling left at the bottom)
  function drawJ(ctx, s) {
    const barX = s * 0.6, topY = s * 0.15, bendY = s * 0.65, t = s * 0.16;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = t;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(barX, topY);
    ctx.lineTo(barX, bendY);
    ctx.arc(s * 0.45, bendY, s * 0.18, 0, Math.PI, false);
    ctx.stroke();
  }

  // Idea-bulb — classic round bulb + 10 idea rays around the upper hemisphere
  function drawBulb(ctx, s) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    const cx = s * 0.5;
    const cy = s * 0.34;
    const br = s * 0.26;

    ctx.lineWidth = s * 0.045;
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI + (i / 9) * Math.PI;
      const r1 = br + s * 0.07;
      const r2 = br + s * 0.16;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(cx, cy, br, br * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(cx - s * 0.10, s * 0.55, s * 0.20, s * 0.07);

    ctx.beginPath();
    ctx.moveTo(cx - s * 0.10, s * 0.62);
    ctx.lineTo(cx - s * 0.14, s * 0.78);
    ctx.lineTo(cx + s * 0.14, s * 0.78);
    ctx.lineTo(cx + s * 0.10, s * 0.62);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(cx - s * 0.12, s * 0.80, s * 0.24, s * 0.018);
    ctx.fillRect(cx - s * 0.12, s * 0.84, s * 0.24, s * 0.018);
    ctx.fillRect(cx - s * 0.10, s * 0.88, s * 0.20, s * 0.025);
  }

  // Human brain — bilateral SDF with two lobes, central sulcus, multi-freq folds
  function drawBrain(ctx, s) {
    const w = s, h = s;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x / w) * 2 - 1;
        const ny = -((y / h) * 2 - 1);

        const nyS = ny * 1.15;
        const r = Math.sqrt(nx * nx + nyS * nyS);
        const a = Math.atan2(ny, nx);

        const leftLobe  = Math.exp(-((nx + 0.35) ** 2) * 6)  * 0.10;
        const rightLobe = Math.exp(-((nx - 0.35) ** 2) * 6)  * 0.10;
        const centralSulcus = Math.exp(-nx * nx * 35) * 0.10;

        const sulci1 = Math.sin(a * 7)  * 0.04;
        const sulci2 = Math.sin(a * 11) * 0.025;
        const sulci3 = Math.cos(a * 5 + 1) * 0.03;
        const bumps = Math.sin(nx * 14 + ny * 9) * Math.cos(nx * 7 - ny * 11) * 0.018;

        const limit = 0.72 + leftLobe + rightLobe + sulci1 + sulci2 + sulci3 - centralSulcus + bumps;

        if (r < limit) {
          const i = (y * w + x) * 4;
          d[i] = 255; d[i+1] = 255; d[i+2] = 255; d[i+3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // --- Sample interior pixels (screen coords: canvas y-down maps straight) ---
  function sampleMask(mask, count) {
    const { width, height } = mask;
    const ctx2 = mask.getContext('2d');
    const data = ctx2.getImageData(0, 0, width, height).data;
    const pts = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 128) {
          pts.push({ x: (x / width) * 2 - 1, y: (y / height) * 2 - 1 });
        }
      }
    }
    if (pts.length === 0) return [];
    const result = [];
    const step = pts.length / count;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(i * step) % pts.length;
      const p = pts[idx];
      const jx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const jy = (Math.sin(i * 78.233) * 43758.5453) % 1;
      result.push({
        x: p.x + jx * 0.04,
        y: p.y + jy * 0.04,
      });
    }
    return result;
  }

  function pickColor() {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }

  // --- Resize / boot ---
  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = rect.width; H = rect.height;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const layout = computeLayout();
    CX = layout.cx; CY = layout.cy; SHAPE_HALF = layout.half;

    const isMobile = matchMedia('(max-width: 720px)').matches;
    const N = isMobile ? MOBILE_PARTICLE_TARGET : PARTICLE_TARGET;
    const NA = isMobile ? MOBILE_AMBIENT_TARGET : AMBIENT_TARGET;

    const maskSize = 768;
    homes[0] = sampleMask(makeMask(maskSize, drawJ),     N);
    homes[1] = sampleMask(makeMask(maskSize, drawBulb),  N);
    homes[2] = sampleMask(makeMask(maskSize, drawBrain), N);

    particles = homes[currentShape].map((h, i) => {
      const color = pickColor();
      const p = {
        x: h.x * SHAPE_HALF + CX,
        y: h.y * SHAPE_HALF + CY,
        vx: 0, vy: 0,
        size: 2.4 + Math.random() * 2.4,
        baseSize: 0,
        alpha: 0.5 + Math.random() * 0.4,
        r: color[0] + (Math.random() - 0.5) * 24,
        g: color[1] + (Math.random() - 0.5) * 18,
        b: color[2] + (Math.random() - 0.5) * 24,
        glow: 0,
        sizeBoost: 0,
        flashMix: 0,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        h0: homes[0][i], h1: homes[1][i], h2: homes[2][i],
      };
      p.baseSize = p.size;
      return p;
    });

    // Ambient field — sparse drifting triangles across the whole page
    ambient = [];
    for (let i = 0; i < NA; i++) {
      const color = pickColor();
      ambient.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 1.6 + Math.random() * 2.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        r: color[0], g: color[1], b: color[2],
        alpha: 0.05 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
        drift: 0.25 + Math.random() * 0.55,
      });
    }
  }

  // --- Mouse tracking ---
  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.px = mouse.x; mouse.py = mouse.y;
    mouse.x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
    mouse.y = (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - rect.top;
    const dx = mouse.x - mouse.px;
    const dy = mouse.y - mouse.py;
    mouse.vx = mouse.vx * 0.6 + dx * 0.4;
    mouse.vy = mouse.vy * 0.6 + dy * 0.4;
    mouse.speed = Math.min(60, Math.hypot(mouse.vx, mouse.vy));
    mouse.active = true;
    mouse.lastMoveAt = performance.now();
  }
  function onLeave() {
    mouse.active = false;
    mouse.x = -9999; mouse.y = -9999;
    mouse.vx = 0; mouse.vy = 0; mouse.speed = 0;
  }
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('touchmove', (e) => { if (e.touches[0]) onMove(e.touches[0]); }, { passive: true });
  canvas.addEventListener('touchend', onLeave);

  // --- Shape change ---
  function advanceShape() {
    currentShape = (currentShape + 1) % 3;
    flash = 1.0;
  }

  // --- Triangle renderer ---
  function strokeTri(x, y, s, rot) {
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = rot + k * 2.0943951;
      const vx = x + Math.cos(a) * s;
      const vy = y + Math.sin(a) * s;
      if (k === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // --- Animation loop ---
  function frame(now) {
    const t = (now - t0) * 0.001;
    const idle = (now - mouse.lastMoveAt) > 1500;

    // Energy & shape change
    if (!idle && mouse.active) {
      energy += mouse.speed;
    } else {
      energy *= ENERGY_DECAY_IDLE;
    }
    let safety = 4;
    while (energy > ENERGY_PER_CHANGE && safety-- > 0) {
      energy -= ENERGY_PER_CHANGE;
      advanceShape();
    }
    flash *= FLASH_DECAY;
    if (flash < 0.005) flash = 0;

    mouse.vx *= 0.92; mouse.vy *= 0.92;
    mouse.speed *= 0.92;

    // Soft trail
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    // --- Ambient field (drawn first, dimmest) ---
    ctx.lineWidth = 1;
    for (let i = 0; i < ambient.length; i++) {
      const a = ambient[i];
      a.rot += a.rotSpeed;
      a.x += noise2D(a.x * 0.001 + t * 0.06, a.y * 0.001) * a.drift;
      a.y += noise2D(a.y * 0.001 + 3.7, a.x * 0.001 - t * 0.06) * a.drift;

      // gentle mouse stir
      if (!idle && mouse.active) {
        const mx = a.x - mouse.x, my = a.y - mouse.y;
        const d2 = mx * mx + my * my;
        if (d2 < MOUSE_RADIUS_SQ && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = (1 - d / MOUSE_RADIUS) * 0.6;
          a.x += (mx / d) * f * 2.2;
          a.y += (my / d) * f * 2.2;
        }
      }

      // wrap around edges
      if (a.x < -24) a.x = W + 24; else if (a.x > W + 24) a.x = -24;
      if (a.y < -24) a.y = H + 24; else if (a.y > H + 24) a.y = -24;

      const tw = 0.6 + 0.4 * Math.sin(t * 0.9 + a.phase);
      ctx.strokeStyle = \`rgba(\${a.r|0}, \${a.g|0}, \${a.b|0}, \${(a.alpha * tw).toFixed(3)})\`;
      strokeTri(a.x, a.y, a.size, a.rot);
    }

    // --- Shape constellation ---
    const H_arr = homes[currentShape];
    const ns = 0.0014;
    const nt = t * 0.20;
    ctx.lineWidth = 1.1;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const h = H_arr[i];

      // 1) Spring to current-shape home
      const targetX = h.x * SHAPE_HALF + CX;
      const targetY = h.y * SHAPE_HALF + CY;
      p.vx += (targetX - p.x) * 0.020;
      p.vy += (targetY - p.y) * 0.020;

      // 2) Noise drift
      p.vx += noise2D(p.x * ns + nt, p.y * ns) * 0.20;
      p.vy += noise2D(p.y * ns + 7.3, p.x * ns - nt) * 0.20;

      // 3) Mouse field
      if (!idle && mouse.active) {
        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const d2 = mx * mx + my * my;
        if (d2 < MOUSE_RADIUS_SQ && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = 1 - d / MOUSE_RADIUS;
          const f2 = f * f;
          const invD = 1 / d;
          p.vx += mx * invD * f2 * REPULSION_STRENGTH;
          p.vy += my * invD * f2 * REPULSION_STRENGTH;
          p.vx += -my * invD * f2 * SWIRL_STRENGTH;
          p.vy +=  mx * invD * f2 * SWIRL_STRENGTH;
          const boost = Math.min(1, f2 * 4);
          if (boost > p.glow) p.glow = boost;
          if (boost > p.sizeBoost) p.sizeBoost = boost;
        }
      }

      // 4) Flash pulse on shape change
      if (flash > 0.05) {
        const cx = p.x - CX, cy = p.y - CY;
        const d = Math.hypot(cx, cy) + 0.001;
        const k = flash * 1.2;
        p.vx += (cx / d) * k;
        p.vy += (cy / d) * k;
        if (flash * 0.9 > p.glow) p.glow = flash * 0.9;
        if (flash * 0.7 > p.sizeBoost) p.sizeBoost = flash * 0.7;
        if (flash > p.flashMix) p.flashMix = flash;
      }
      p.flashMix *= 0.88;

      // 5) Damping
      p.vx *= 0.86;
      p.vy *= 0.86;

      // 6) Integrate
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed + p.sizeBoost * 0.08;

      // 7) Decay
      p.glow *= GLOW_DECAY;
      p.sizeBoost *= SIZE_DECAY;

      // 8) Render — outlined triangle, base → saffron (glow) → white (flash)
      const pulse = 0.7 + 0.3 * Math.sin(t * 1.4 + p.phase);
      const a = p.alpha * pulse;
      const glowT = p.glow;
      let r = p.r * (1 - glowT) + 255 * glowT;
      let g = p.g * (1 - glowT) + 184 * glowT;
      let b = p.b * (1 - glowT) +  41 * glowT;
      if (p.flashMix > 0.2) {
        const ft = (p.flashMix - 0.2) / 0.8;
        r = r * (1 - ft) + 255 * ft;
        g = g * (1 - ft) + 255 * ft;
        b = b * (1 - ft) + 255 * ft;
      }
      const s = p.baseSize * (1 + p.sizeBoost * 0.7);
      ctx.strokeStyle = \`rgba(\${r|0}, \${g|0}, \${b|0}, \${a.toFixed(3)})\`;
      strokeTri(p.x, p.y, s, p.rot);
      if (p.glow > 0.25 || p.flashMix > 0.2) {
        const ah = (p.glow * 0.22 + p.flashMix * 0.25).toFixed(3);
        ctx.fillStyle = \`rgba(\${r|0}, \${g|0}, \${b|0}, \${ah})\`;
        ctx.fill();
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      if (a > 0.65 || p.glow > 0.2 || p.flashMix > 0.2) {
        const ah = (a * 0.4 + p.glow * 0.3 + p.flashMix * 0.3).toFixed(3);
        ctx.fillStyle = \`rgba(\${r|0}, \${g|0}, \${b|0}, \${ah})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      if (a > 0.65 || p.glow > 0.2 || p.flashMix > 0.2) {
        const ah = (a * 0.4 + p.glow * 0.3 + p.flashMix * 0.3).toFixed(3);
        ctx.fillStyle = \`rgba(\${r|0}, \${g|0}, \${b|0}, \${ah})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      if (a > 0.65 || p.glow > 0.2) {
        const ah = (a * 0.4 + p.glow * 0.3).toFixed(3);
        ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, \${ah})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      if (a > 0.65 || p.glow > 0.2) {
        const ah = (a * 0.4 + p.glow * 0.3).toFixed(3);
        ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, \${ah})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      // Bright particles get an extra glow halo
      if (a > 0.7 || p.glow > 0.2) {
        const ah = (a * 0.4 + p.glow * 0.3).toFixed(3);
        ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, \${ah})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      // Particle is a small soft square (looks like a glowing dot)
      const s = p.size;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      // Extra glow dot for higher-alpha particles
      if (a > 0.7) {
        ctx.fillStyle = \`rgba(\${p.r|0}, \${p.g|0}, \${p.b|0}, \${(a*0.4).toFixed(3)})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;
      // Particle is a small soft square (looks like a glowing dot)
      const s = p.size;
      ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      // Extra glow dot for higher-alpha particles
      if (a > 0.7) {
        ctx.fillStyle = \`rgba(\${p.r|0}, \${p.g|0}, \${p.b|0}, \${(a*0.4).toFixed(3)})\`;
        ctx.fillRect(p.x - s, p.y - s, s*2, s*2);
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Boot ---
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

</script>
</body>
</html>
`;

const FAVICON_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#000000"/>
  <g fill="#8052ff">
    <circle cx="14" cy="20" r="2.2"/>
    <circle cx="22" cy="14" r="1.6"/>
    <circle cx="30" cy="22" r="2.0"/>
    <circle cx="38" cy="16" r="1.4"/>
    <circle cx="46" cy="24" r="2.4"/>
    <circle cx="20" cy="30" r="1.6"/>
    <circle cx="32" cy="34" r="2.2"/>
    <circle cx="44" cy="38" r="1.6"/>
    <circle cx="14" cy="44" r="1.8"/>
    <circle cx="26" cy="46" r="1.4"/>
    <circle cx="38" cy="48" r="2.0"/>
    <circle cx="50" cy="50" r="1.4"/>
  </g>
  <g fill="#ffb829">
    <circle cx="24" cy="20" r="1.2"/>
    <circle cx="40" cy="28" r="1.4"/>
    <circle cx="22" cy="40" r="1.0"/>
  </g>
  <g stroke="#8052ff" stroke-width="0.6" stroke-opacity="0.4">
    <line x1="14" y1="20" x2="22" y2="14"/>
    <line x1="22" y1="14" x2="30" y2="22"/>
    <line x1="30" y1="22" x2="38" y2="16"/>
    <line x1="38" y1="16" x2="46" y2="24"/>
    <line x1="30" y1="22" x2="32" y2="34"/>
    <line x1="32" y1="34" x2="44" y2="38"/>
    <line x1="14" y1="20" x2="20" y2="30"/>
    <line x1="20" y1="30" x2="14" y2="44"/>
    <line x1="14" y1="44" x2="26" y2="46"/>
    <line x1="26" y1="46" x2="38" y2="48"/>
    <line x1="38" y1="48" x2="50" y2="50"/>
    <line x1="32" y1="34" x2="26" y2="46"/>
  </g>
</svg>
`;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function htmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      ...SECURITY_HEADERS,
    },
  });
}

function svgResponse(body) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      ...SECURITY_HEADERS,
    },
  });
}

function notFound() {
  return htmlResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Not found · James Skills</title><meta name="viewport" content="width=device-width,initial-scale=1"/><style>html,body{margin:0;background:#000;color:#fff;font-family:Inter,system-ui,sans-serif;height:100%}main{min-height:100vh;display:grid;place-items:center;padding:24px}h1{font-weight:400;font-size:clamp(48px,8vw,96px);letter-spacing:-0.04em;margin:0 0 12px}p{color:#9a9a9a;font-weight:200;margin:0 0 28px}a{color:#8052ff;text-decoration:none;border-bottom:1px solid #8052ff}</style></head><body><main><div><h1>404</h1><p>This route doesn't exist in the constellation.</p><a href="/">← Back to James Skills</a></div></main></body></html>`,
    404
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Strip trailing slash (except root)
    let cleanPath = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

    if (cleanPath === "/" || cleanPath === "/index.html" || cleanPath === "") {
      return htmlResponse(INDEX_HTML);
    }
    if (cleanPath === "/favicon.svg" || cleanPath === "/favicon.ico") {
      return svgResponse(FAVICON_SVG);
    }
    if (cleanPath === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\n", {
        status: 200,
        headers: { "Content-Type": "text/plain", ...SECURITY_HEADERS },
      });
    }
    if (cleanPath === "/healthz") {
      return new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    return notFound();
  },
};
