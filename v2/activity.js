/* ============================================================
   Portfolio v2 — Work activity module
   GitHub contributions + Claude Code usage, drawn as bklit-style
   charts in plain SVG: area (hero), ring, radar, gauge, sparklines.
   No dependencies. Auto-mounts into #activityV2.
   ============================================================ */
(() => {
  "use strict";

  const ROOT_ID = "activityV2";
  const NS_TXT = {
    languages: "Languages",
    recent: "Recent activity",
    noActivity: "No public activity yet — first commits incoming.",
    noRepos: "No public repositories yet.",
    ghError: "GitHub API unreachable right now (rate limit?). Try again in a few minutes."
  };
  const T = () => Object.assign({}, NS_TXT, window.UI || {});
  const motionQ = matchMedia("(prefers-reduced-motion: reduce)");
  const still = () => motionQ.matches;

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = new Intl.NumberFormat("en");
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
  const num = (v) => (Math.abs(v) >= 10000 ? compact.format(v) : nf.format(Math.round(v)));
  const tick = (v) => (Math.abs(v) >= 1000 ? compact.format(v) : nf.format(v));
  const dLong = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const dShort = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const dMonth = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => new Date(s + "T00:00:00");
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  let uidSeq = 0;

  // rAF tween; returns a cancel function. Reduced motion → jump to the end.
  function tween(dur, fn, done) {
    if (still() || dur <= 0) { fn(1); if (done) done(); return () => {}; }
    let start = null, id = 0;
    const step = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      fn(ease(p));
      if (p < 1) id = requestAnimationFrame(step); else if (done) done();
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }

  function rel(date) {
    const s = (Date.now() - new Date(date)) / 1000;
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
    for (const [u, n] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
      if (s >= n) return rtf.format(-Math.floor(s / n), u);
    }
    return rtf.format(0, "second");
  }

  function describe(ev) {
    const repo = `<b>${esc(String(ev.repo?.name || "").split("/")[1] || ev.repo?.name || "")}</b>`;
    const p = ev.payload || {};
    switch (ev.type) {
      case "PushEvent": { const n = p.size ?? p.commits?.length ?? 1; return [`push`, `pushed ${n} commit${n > 1 ? "s" : ""} to ${repo}`]; }
      case "CreateEvent": return ["create", `created ${esc(p.ref_type)} in ${repo}`];
      case "DeleteEvent": return ["delete", `deleted ${esc(p.ref_type)} in ${repo}`];
      case "WatchEvent": return ["star", `starred ${repo}`];
      case "ForkEvent": return ["fork", `forked ${repo}`];
      case "PullRequestEvent": return ["pr", `${esc(p.action)} a PR in ${repo}`];
      case "IssuesEvent": return ["issue", `${esc(p.action)} an issue in ${repo}`];
      case "ReleaseEvent": return ["release", `released ${repo}`];
      case "PublicEvent": return ["public", `made ${repo} public`];
      default: return [esc(String(ev.type || "").replace("Event", "").toLowerCase()), repo];
    }
  }

  // monotone cubic (Fritsch–Carlson): smooth like bklit's monotoneX, never dips below 0
  function monotone(pts) {
    const n = pts.length;
    if (!n) return "";
    if (n === 1) return `M${pts[0][0]},${pts[0][1]}`;
    const dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1); }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) {
      t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    }
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = dx[i] / 3;
      d += `C${(x0 + h).toFixed(1)},${(y0 + t[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)},${(y1 - t[i + 1] * h).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return d;
  }

  // clean y max with an integer midpoint: 2, 4, 6, 8, 10, 20, 40 …
  function niceMax(v) {
    for (let e = 1; e < 1e12; e *= 10) for (const k of [2, 4, 6, 8, 10]) if (k * e >= v) return k * e;
    return v;
  }

  // 0° = 12 o'clock, clockwise
  const polar = (cx, cy, r, a) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  function arc(cx, cy, r, a0, a1) {
    if (a1 - a0 >= 359.9) return arc(cx, cy, r, a0, a0 + 180) + arc(cx, cy, r, a0 + 180, a0 + 359.9).replace(/^M[^A]+/, "");
    const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
    return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }

  /* ---------- data ---------- */
  const RANGES = {
    "30d": { days: 30, label: "last 30 days", short: "30D", step: 1 },
    "90d": { days: 90, label: "last 90 days", short: "90D", step: 1 },
    "1y": { days: 365, label: "last year", short: "1Y", step: 7 }
  };
  const MODES = {
    all: { on: (d) => d.code > 0 || d.prompts > 0, total: (s) => s.active, unit: "active days", color: "var(--av2-mix)" },
    code: { on: (d) => d.code > 0, total: (s) => s.code, unit: "contributions", color: "var(--av2-code)" },
    claude: { on: (d) => d.prompts > 0, total: (s) => s.prompts, unit: "Claude prompts", color: "var(--av2-claude)" }
  };
  const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // radar order
  const DOW_IDX = [6, 0, 1, 2, 3, 4, 5]; // JS getDay() → radar slot

  // the last 365 days, today included
  function buildDays(ghCal, claude) {
    const gh = {}, cl = {};
    (ghCal?.contributions || []).forEach((d) => { gh[d.date] = d.count; });
    (claude?.days || []).forEach((d) => { cl[d.date] = d; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const k = iso(d), c = cl[k];
      days.push({ date: k, dow: d.getDay(), code: +gh[k] || 0, prompts: +c?.prompts || 0, sessions: +c?.sessions || 0, tokens: +c?.tokens || 0 });
    }
    return days;
  }

  // group days into buckets of `step`, anchored on today (last bucket ends today)
  function bucketize(days, step) {
    const out = [];
    for (let end = days.length; end > 0; end -= step) {
      const part = days.slice(Math.max(0, end - step), end);
      out.unshift({
        from: part[0].date, to: part[part.length - 1].date, days: part,
        code: sum(part, (d) => d.code), prompts: sum(part, (d) => d.prompts),
        sessions: sum(part, (d) => d.sessions), tokens: sum(part, (d) => d.tokens),
        active: part.filter(MODES.all.on).length
      });
    }
    return out;
  }

  function streaks(days, on) {
    let cur = 0, best = 0, run = 0;
    days.forEach((d) => { run = on(d) ? run + 1 : 0; best = Math.max(best, run); });
    let i = days.length - 1;
    if (i >= 0 && !on(days[i])) i--; // today may still be empty
    while (i >= 0 && on(days[i])) { cur++; i--; }
    return { cur, best };
  }

  const bucketLabel = (b) => (b.from === b.to ? dLong.format(parse(b.from)) : `${dShort.format(parse(b.from))} – ${dShort.format(parse(b.to))} ${parse(b.to).getFullYear()}`);

  /* ============================================================
     Mount
     ============================================================ */
  function mount(root, opts = {}) {
    if (!root || root.__av2) return root?.__av2;
    const D = window.PORTFOLIO || {};
    const uid = `av2-${++uidSeq}`;
    const S = { mode: "all", range: "1y", days: null, repos: null, events: null, err: {}, area: null, totalShown: 0, cancel: {} };
    const user = opts.github || root.dataset.github || D.github;
    const claudeSrc = opts.claudeSrc || root.dataset.claudeSrc || "../data/claude.json";

    root.classList.add("av2-root");
    root.innerHTML = `
      <div class="av2 is-loading">
        <div class="av2-bar">
          <div class="av2-seg" role="group" aria-label="Activity source" data-k="mode">
            <button type="button" data-v="all" aria-pressed="true">All</button>
            <button type="button" data-v="code" aria-pressed="false"><i class="av2-key av2-key--code"></i>Code</button>
            <button type="button" data-v="claude" aria-pressed="false"><i class="av2-key av2-key--claude"></i>Claude</button>
          </div>
          <div class="av2-seg av2-seg--sm" role="group" aria-label="Time range" data-k="range">
            ${Object.entries(RANGES).map(([k, r]) => `<button type="button" data-v="${k}" aria-pressed="${k === S.range}">${r.short}</button>`).join("")}
          </div>
          <div class="av2-total" aria-live="polite"><strong class="av2-total__v">—</strong><span class="av2-total__k">loading activity…</span></div>
        </div>

        <div class="av2-grid">
          <section class="av2-card av2-hero">
            <header class="av2-card__h">
              <h3 class="av2-h">Activity over time</h3>
              <div class="av2-legend">
                <span data-s="code"><i class="av2-sw av2-sw--code"></i>Code <em>contributions</em></span>
                <span data-s="claude"><i class="av2-sw av2-sw--claude"></i>Claude <em>prompts</em></span>
              </div>
            </header>
            <div class="av2-plot" tabindex="0" role="img" aria-label="Activity area chart">
              <div class="av2-svgbox"></div>
              <div class="av2-pill" hidden></div>
              <p class="av2-empty" hidden></p>
            </div>
            <details class="av2-table"><summary>Data table</summary><div class="av2-table__wrap"></div></details>
          </section>

          <section class="av2-card av2-ringcard">
            <header class="av2-card__h"><h3 class="av2-h">Code vs Claude</h3><span class="av2-sub" data-sub></span></header>
            <div class="av2-ring"></div>
            <ul class="av2-list av2-ringlegend"></ul>
          </section>

          <section class="av2-card av2-radarcard">
            <header class="av2-card__h"><h3 class="av2-h">Active days by weekday</h3><span class="av2-sub" data-sub></span></header>
            <div class="av2-radar"></div>
            <div class="av2-legend av2-legend--sm av2-radarlegend"></div>
          </section>

          <section class="av2-card av2-gaugecard">
            <header class="av2-card__h"><h3 class="av2-h">Consistency</h3><span class="av2-sub" data-sub></span></header>
            <div class="av2-gaugewrap">
              <div class="av2-gauge"></div>
              <dl class="av2-streaks"></dl>
            </div>
          </section>

          <div class="av2-kpis"></div>

          <section class="av2-card av2-langs">
            <header class="av2-card__h"><h3 class="av2-h">${esc(T().languages)}</h3><span class="av2-sub">by code size</span></header>
            <ul class="av2-bars"></ul>
          </section>

          <section class="av2-card av2-feed">
            <header class="av2-card__h"><h3 class="av2-h">${esc(T().recent)}</h3>${user ? `<a class="av2-sub av2-link" href="https://github.com/${esc(user)}" target="_blank" rel="noopener">@${esc(user)} ↗</a>` : ""}</header>
            <ul class="av2-events"></ul>
          </section>
        </div>
        <div class="av2-tip" hidden aria-hidden="true"></div>
      </div>`;

    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];
    const box = $(".av2"), tip = $(".av2-tip"), plot = $(".av2-plot"), svgbox = $(".av2-svgbox"), pill = $(".av2-pill");

    /* ---------- derived numbers for the current range/mode ---------- */
    function slice() {
      const r = RANGES[S.range];
      const days = S.days.slice(-r.days);
      const buckets = bucketize(days, r.step);
      const tot = {
        code: sum(days, (d) => d.code), prompts: sum(days, (d) => d.prompts),
        sessions: sum(days, (d) => d.sessions), tokens: sum(days, (d) => d.tokens),
        active: days.filter(MODES.all.on).length
      };
      return { r, days, buckets, tot };
    }

    /* ---------- tooltip (shared) ---------- */
    function showTip(html, x, y, prefer = "above") {
      tip.innerHTML = html;
      tip.hidden = false;
      const rr = root.getBoundingClientRect();
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let left = x - rr.left - w / 2, top = prefer === "side" ? y - rr.top - h / 2 : y - rr.top - h - 14;
      if (prefer === "side") { left = x - rr.left + 16; if (left + w > rr.width - 4) left = x - rr.left - w - 16; }
      tip.style.left = clamp(left, 4, Math.max(4, rr.width - w - 4)) + "px";
      tip.style.top = Math.max(4, top) + "px";
    }
    const hideTip = () => { tip.hidden = true; };

    // small charts: any element with data-tip shows it on hover / focus
    root.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.("[data-tip]");
      if (!e.target.closest?.(".av2-plot") && S.crossOn && document.activeElement !== plot) hideCross();
      if (!el || !root.contains(el)) { if (!e.target.closest?.(".av2-plot")) hideTip(); return; }
      showTip(el.getAttribute("data-tip"), e.clientX, e.clientY);
    });
    root.addEventListener("pointerleave", () => { hideTip(); hideCross(); });
    root.addEventListener("focusin", (e) => {
      const el = e.target.closest?.("[data-tip]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      showTip(el.getAttribute("data-tip"), r.left + r.width / 2, r.top);
    });
    root.addEventListener("focusout", (e) => { if (e.target.closest?.("[data-tip]")) hideTip(); });
    document.addEventListener("pointerdown", (e) => { if (!root.contains(e.target)) { hideTip(); hideCross(); } });
    addEventListener("scroll", () => { if (!tip.hidden && !S.crossOn) hideTip(); }, { passive: true });

    /* ---------- controls ---------- */
    root.addEventListener("click", (e) => {
      const b = e.target.closest(".av2-seg button");
      if (!b || !S.days) return;
      const k = b.parentElement.dataset.k, v = b.dataset.v;
      if (S[k] === v) return;
      S[k] = v;
      $$(`.av2-seg[data-k="${k}"] button`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      update(k === "range" ? "range" : "mode");
    });

    /* ============================================================
       Hero area chart
       ============================================================ */
    let G = null; // geometry + element refs of the current SVG

    function targetSeries(buckets) {
      const code = buckets.map((b) => b.code), claude = buckets.map((b) => b.prompts);
      const show = { code: S.mode !== "claude", claude: S.mode !== "code" };
      const max = Math.max(1, ...(show.code ? code : [0]), ...(show.claude ? claude : [0]));
      return {
        n: buckets.length, show,
        code: show.code ? code : code.map(() => 0),
        claude: show.claude ? claude : claude.map(() => 0),
        ymax: niceMax(max)
      };
    }

    function buildArea(buckets) {
      const W = Math.max(240, Math.floor(svgbox.clientWidth || plot.clientWidth || 600));
      const H = Math.round(clamp(W * 0.34, 190, 300));
      const m = { l: 36, r: 12, t: 14, b: 28 };
      const iw = W - m.l - m.r, ih = H - m.t - m.b, n = buckets.length;
      const x = (i) => m.l + (n === 1 ? iw / 2 : (i * iw) / (n - 1));

      // x labels: months for 1Y, every k days otherwise — never closer than ~52px
      const labels = [];
      let lastX = -1e9;
      if (RANGES[S.range].step > 1) {
        let lastM = -1;
        buckets.forEach((b, i) => {
          const d = parse(b.to), mo = d.getMonth();
          if (mo !== lastM && i > 0 && x(i) - lastX >= 40) { labels.push([x(i), dMonth.format(d)]); lastX = x(i); }
          lastM = mo;
        });
      } else {
        const k = Math.max(1, Math.ceil(56 / (iw / Math.max(1, n - 1))));
        for (let i = n - 1; i >= 0; i -= k) labels.unshift([x(i), dShort.format(parse(buckets[i].to))]);
      }

      const id = (s) => `${uid}-${s}`;
      svgbox.innerHTML = `
        <svg class="av2-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="${id("gc")}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style="stop-color:var(--av2-code);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--av2-code);stop-opacity:0"/>
            </linearGradient>
            <linearGradient id="${id("gl")}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style="stop-color:var(--av2-claude);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--av2-claude);stop-opacity:0"/>
            </linearGradient>
            <pattern id="${id("dots")}" width="14" height="14" patternUnits="userSpaceOnUse" x="${m.l}" y="${m.t}">
              <circle cx="1" cy="1" r=".9" class="av2-dot"/>
            </pattern>
            <linearGradient id="${id("fg")}" x1="${m.l}" x2="${m.l + iw}" y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".05" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
            </linearGradient>
            <mask id="${id("fade")}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id("fg")})"/></mask>
            <clipPath id="${id("clip")}"><rect class="av2-cliprect" x="0" y="0" width="${W}" height="${H}"/></clipPath>
          </defs>
          <rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="url(#${id("dots")})"/>
          <g class="av2-grid-y"></g>
          <g class="av2-axis-x">${labels.map(([lx, t], i) => {
            const anchor = lx < m.l + 18 ? "start" : lx > W - m.r - 18 ? "end" : "middle";
            return `<text x="${lx.toFixed(1)}" y="${H - 8}" text-anchor="${anchor}">${esc(t)}</text>`;
          }).join("")}</g>
          <g mask="url(#${id("fade")})" clip-path="url(#${id("clip")})">
            <path class="av2-area av2-area--claude" fill="url(#${id("gl")})"/>
            <path class="av2-line av2-line--claude"/>
            <path class="av2-area av2-area--code" fill="url(#${id("gc")})"/>
            <path class="av2-line av2-line--code"/>
          </g>
          <line class="av2-base" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}"/>
          <g class="av2-cross" visibility="hidden">
            <line class="av2-cross__l" y1="${m.t}" y2="${m.t + ih}"/>
            <circle class="av2-cross__d av2-cross__d--claude" r="4.5"/>
            <circle class="av2-cross__d av2-cross__d--code" r="4.5"/>
          </g>
        </svg>`;
      const q = (s) => svgbox.querySelector(s);
      G = {
        W, H, m, iw, ih, n, x, buckets,
        clip: q(".av2-cliprect"), gridY: q(".av2-grid-y"), cross: q(".av2-cross"), crossL: q(".av2-cross__l"),
        dot: { code: q(".av2-cross__d--code"), claude: q(".av2-cross__d--claude") },
        area: { code: q(".av2-area--code"), claude: q(".av2-area--claude") },
        line: { code: q(".av2-line--code"), claude: q(".av2-line--claude") }
      };
    }

    function paintArea(v) {
      if (!G) return;
      const { m, ih, x } = G, base = m.t + ih;
      const y = (val) => base - (val / v.ymax) * ih;
      ["code", "claude"].forEach((s) => {
        const pts = v[s].map((val, i) => [x(i), y(val)]);
        const line = monotone(pts);
        G.line[s].setAttribute("d", line);
        G.area[s].setAttribute("d", pts.length ? `${line}L${pts[pts.length - 1][0].toFixed(1)},${base}L${pts[0][0].toFixed(1)},${base}Z` : "");
      });
    }

    function paintYAxis(ymax) {
      if (!G) return;
      const { m, ih, W } = G;
      G.gridY.innerHTML = [0.5, 1].map((f) => {
        const yy = (m.t + ih - f * ih).toFixed(1);
        return `<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/><text x="${m.l - 8}" y="${yy}" dy=".32em" text-anchor="end">${tick(ymax * f)}</text>`;
      }).join("") + `<text x="${m.l - 8}" y="${m.t + ih}" dy=".32em" text-anchor="end">0</text>`;
    }

    function setSeriesVis(show) {
      ["code", "claude"].forEach((s) => {
        root.querySelectorAll(`.av2-area--${s}, .av2-line--${s}, .av2-cross__d--${s}`).forEach((el) => el.classList.toggle("is-off", !show[s]));
        root.querySelectorAll(`.av2-legend [data-s="${s}"]`).forEach((el) => el.classList.toggle("is-off", !show[s]));
      });
    }

    function drawArea(kind, sl) {
      const tgt = targetSeries(sl.buckets);
      const empty = sl.tot.code + sl.tot.prompts === 0;
      const note = $(".av2-empty");
      note.hidden = !empty;
      note.textContent = S.err.cal && S.err.claude
        ? "Live activity data couldn't be loaded right now."
        : `No activity in the ${sl.r.label} yet.`;
      plot.setAttribute("aria-label", `Area chart of GitHub contributions and Claude prompts, ${sl.r.label}: ${nf.format(sl.tot.code)} contributions, ${nf.format(sl.tot.prompts)} prompts. A data table follows.`);
      if (S.cancel.area) S.cancel.area();

      const rebuild = kind !== "mode" || !G || G.n !== tgt.n;
      if (rebuild) buildArea(sl.buckets);
      G.buckets = sl.buckets;
      setSeriesVis(tgt.show);
      paintYAxis(tgt.ymax);

      if (kind === "mode" && S.area && S.area.n === tgt.n) {
        // morph: interpolate values + y scale from the current frame
        const from = S.area;
        S.cancel.area = tween(650, (p) => {
          const v = {
            ymax: from.ymax + (tgt.ymax - from.ymax) * p,
            code: tgt.code.map((t, i) => from.code[i] + (t - from.code[i]) * p),
            claude: tgt.claude.map((t, i) => from.claude[i] + (t - from.claude[i]) * p)
          };
          S.area = Object.assign({ n: tgt.n }, v);
          paintArea(v);
        });
      } else if (kind === "intro" || kind === "range") {
        // draw-in: sweep a clip rect left → right
        S.area = tgt;
        paintArea(tgt);
        G.clip.setAttribute("width", "0");
        S.cancel.area = tween(kind === "intro" ? 1300 : 800, (p) => G.clip.setAttribute("width", String(G.W * p)));
      } else {
        S.area = tgt;
        paintArea(tgt);
      }
      if (kind === "mode" && S.crossOn && S.crossI != null) moveCross(Math.min(S.crossI, tgt.n - 1));
      else if (rebuild) { S.crossI = null; hideCross(); hideTip(); }
    }

    /* crosshair + tooltip */
    function hideCross() {
      S.crossOn = false;
      if (G) G.cross.setAttribute("visibility", "hidden");
      pill.hidden = true;
    }
    function moveCross(i, clientY) {
      if (!G || !S.area) return;
      i = clamp(i, 0, G.n - 1);
      S.crossI = i; S.crossOn = true;
      const b = G.buckets[i], v = S.area, { m, ih, x } = G, base = m.t + ih;
      const xi = x(i);
      G.cross.setAttribute("visibility", "visible");
      G.crossL.setAttribute("x1", xi); G.crossL.setAttribute("x2", xi);
      ["code", "claude"].forEach((s) => {
        G.dot[s].setAttribute("cx", xi);
        G.dot[s].setAttribute("cy", base - (v[s][i] / v.ymax) * ih);
      });
      // date pill on the x axis
      pill.textContent = RANGES[S.range].step > 1 ? `${dShort.format(parse(b.from))} – ${dShort.format(parse(b.to))}` : dShort.format(parse(b.to));
      pill.hidden = false;
      const pw = pill.offsetWidth;
      pill.style.left = clamp(xi - pw / 2, 0, G.W - pw) + "px";
      pill.style.top = (m.t + ih + 4) + "px";
      // tooltip card — values lead, line keys
      const rows = [];
      if (S.mode !== "claude") rows.push(`<div class="av2-tip__row"><i class="av2-lk av2-lk--code"></i><b>${nf.format(b.code)}</b><span>contribution${b.code === 1 ? "" : "s"}</span></div>`);
      if (S.mode !== "code") {
        rows.push(`<div class="av2-tip__row"><i class="av2-lk av2-lk--claude"></i><b>${nf.format(b.prompts)}</b><span>Claude prompt${b.prompts === 1 ? "" : "s"}</span></div>`);
        rows.push(`<div class="av2-tip__sub">${nf.format(b.sessions)} session${b.sessions === 1 ? "" : "s"} · ${compact.format(b.tokens)} tokens</div>`);
      }
      const head = RANGES[S.range].step > 1 ? `Week · ${esc(bucketLabel(b))}` : esc(dLong.format(parse(b.to)));
      const pr = plot.getBoundingClientRect();
      const topVal = Math.max(v.code[i], v.claude[i]);
      const py = clientY ?? pr.top + base - (topVal / v.ymax) * ih;
      showTip(`<div class="av2-tip__h">${head}</div>${rows.join("")}`, pr.left + xi, Math.min(py, pr.top + base - 20), "side");
    }
    plot.style.touchAction = "pan-y";
    plot.addEventListener("pointermove", (e) => {
      if (!G) return;
      const r = plot.getBoundingClientRect();
      const px = e.clientX - r.left;
      if (px < G.m.l - 10 || px > G.W - G.m.r + 10) { hideCross(); hideTip(); return; }
      const i = G.n === 1 ? 0 : Math.round(((px - G.m.l) / G.iw) * (G.n - 1));
      moveCross(i, e.clientY);
    });
    plot.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hideCross(); hideTip(); } });
    plot.addEventListener("keydown", (e) => {
      if (!G) return;
      const k = { ArrowLeft: -1, ArrowRight: 1, Home: -1e9, End: 1e9 }[e.key];
      if (k == null) return;
      e.preventDefault();
      moveCross((S.crossI ?? G.n - 1) + k);
    });
    plot.addEventListener("focus", () => { if (G) moveCross(S.crossI ?? G.n - 1); });
    plot.addEventListener("blur", () => { hideCross(); hideTip(); });

    function drawTable(sl) {
      const det = $(".av2-table");
      if (!det.open) return;
      const step = sl.r.step > 1;
      det.querySelector(".av2-table__wrap").innerHTML = `
        <table>
          <thead><tr><th scope="col">${step ? "Week" : "Day"}</th><th scope="col">Contributions</th><th scope="col">Prompts</th><th scope="col">Sessions</th><th scope="col">Tokens</th></tr></thead>
          <tbody>${sl.buckets.slice().reverse().map((b) => `<tr><th scope="row">${esc(bucketLabel(b))}</th><td>${nf.format(b.code)}</td><td>${nf.format(b.prompts)}</td><td>${nf.format(b.sessions)}</td><td>${compact.format(b.tokens)}</td></tr>`).join("")}</tbody>
        </table>`;
    }
    $(".av2-table").addEventListener("toggle", () => { if (S.days) drawTable(slice()); });

    /* ============================================================
       Ring — share of active days: Code only / both / Claude only
       ============================================================ */
    function drawRing(sl, animate) {
      const codeOnly = sl.days.filter((d) => d.code > 0 && !d.prompts).length;
      const both = sl.days.filter((d) => d.code > 0 && d.prompts > 0).length;
      const claudeOnly = sl.days.filter((d) => !d.code && d.prompts > 0).length;
      const total = codeOnly + both + claudeOnly;
      const segs = [
        { k: "code", name: "Code only", v: codeOnly, cls: "code", lit: S.mode !== "claude" },
        { k: "both", name: "Code + Claude", v: both, cls: "both", lit: true },
        { k: "claude", name: "Claude only", v: claudeOnly, cls: "claude", lit: S.mode !== "code" }
      ];
      const cx = 100, cy = 100, R = 76, nz = segs.filter((s) => s.v > 0).length, gap = nz > 1 ? 3 : 0;
      let a = 0;
      segs.forEach((s) => { s.a0 = a; s.a1 = a + (total ? (s.v / total) * 360 : 0); a = s.a1; });
      const hid = `${uid}-hatch`;
      const ring = $(".av2-ring");
      const centerV = { all: total, code: codeOnly + both, claude: both + claudeOnly }[S.mode];
      const centerK = { all: "active days", code: "days with code", claude: "days with Claude" }[S.mode];
      ring.innerHTML = `
        <svg viewBox="0 0 200 200" role="img" aria-label="Active days split: ${codeOnly} code only, ${both} both, ${claudeOnly} Claude only">
          <defs>
            <pattern id="${hid}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" class="av2-hatch-bg"/><rect width="2.4" height="6" class="av2-hatch-fg"/>
            </pattern>
          </defs>
          <circle cx="${cx}" cy="${cy}" r="${R}" class="av2-track" stroke-width="22" fill="none"/>
          <circle cx="${cx}" cy="${cy}" r="${R - 20}" class="av2-track av2-track--thin" fill="none"/>
          ${segs.map((s) => s.v ? `<path class="av2-seg-arc av2-seg-arc--${s.cls}${s.lit ? "" : " is-dim"}" data-a0="${s.a0}" data-a1="${s.a1}" stroke-width="22" fill="none" ${s.cls === "both" ? `style="stroke:url(#${hid})"` : ""}
              tabindex="0" data-tip="${esc(`<div class="av2-tip__h">${s.name}</div><div class="av2-tip__row"><b>${s.v}</b><span>day${s.v === 1 ? "" : "s"} · ${Math.round((s.v / total) * 100)}%</span></div>`)}"/>` : "").join("")}
          <text x="${cx}" y="${cy - 2}" class="av2-ring__v" text-anchor="middle">${nf.format(centerV)}</text>
          <text x="${cx}" y="${cy + 18}" class="av2-ring__k" text-anchor="middle">${centerK}</text>
        </svg>`;
      const arcs = [...ring.querySelectorAll(".av2-seg-arc")];
      const paint = (p) => arcs.forEach((el) => {
        const a0 = +el.dataset.a0, a1 = +el.dataset.a1, end = Math.min(a1, 360 * p);
        const g = a1 - a0 > gap * 2 ? gap / 2 : 0;
        el.setAttribute("d", end - g > a0 + g ? arc(cx, cy, R, a0 + g, end - g) : "");
      });
      if (S.cancel.ring) S.cancel.ring();
      if (animate) S.cancel.ring = tween(1100, paint); else paint(1);

      $(".av2-ringlegend").innerHTML = segs.map((s) => `
        <li class="${s.lit ? "" : "is-dim"}"><span><i class="av2-sw av2-sw--${s.cls}"></i>${s.name}</span><b>${s.v}</b><em>${total ? Math.round((s.v / total) * 100) : 0}%</em></li>`).join("");
    }

    /* ============================================================
       Radar — active days per weekday
       ============================================================ */
    function drawRadar(sl, animate, prev) {
      const per = (on) => { const a = [0, 0, 0, 0, 0, 0, 0]; sl.days.forEach((d) => { if (on(d)) a[DOW_IDX[d.dow]]++; }); return a; };
      const series = S.mode === "all"
        ? [{ k: "claude", v: per(MODES.claude.on), name: "Claude" }, { k: "code", v: per(MODES.code.on), name: "Code" }]
        : [{ k: S.mode, v: per(MODES[S.mode].on), name: S.mode === "code" ? "Code" : "Claude" }];
      const all = per(MODES[S.mode].on);
      const max = Math.max(1, ...series.flatMap((s) => s.v));
      const cx = 130, cy = 118, R = 82;
      const ang = (i) => (i * 360) / 7;
      const ringPts = (f) => WEEK.map((_, i) => polar(cx, cy, R * f, ang(i)).map((n) => n.toFixed(1)).join(",")).join(" ");
      const el = $(".av2-radar");
      el.innerHTML = `
        <svg viewBox="0 0 260 236" role="img" aria-label="Active days by weekday: ${WEEK.map((w, i) => `${w} ${all[i]}`).join(", ")}">
          <g class="av2-web">
            ${[0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${ringPts(f)}"/>`).join("")}
            ${WEEK.map((_, i) => { const [x, y] = polar(cx, cy, R, ang(i)); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join("")}
          </g>
          ${series.map((s) => `<polygon class="av2-radar__poly av2-radar__poly--${s.k}"/>`).join("")}
          ${series.map((s) => s.v.map((_, i) => `<rect class="av2-radar__pt av2-radar__pt--${s.k}" width="8" height="8" rx="1.5" data-i="${i}"/>`).join("")).join("")}
          <g class="av2-radar__labels">
            ${WEEK.map((w, i) => {
              const [x, y] = polar(cx, cy, R + 17, ang(i));
              const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
              const tipHtml = `<div class="av2-tip__h">${w}</div>` + series.map((s) => `<div class="av2-tip__row"><i class="av2-lk av2-lk--${s.k}"></i><b>${s.v[i]}</b><span>${s.name} day${s.v[i] === 1 ? "" : "s"}</span></div>`).join("");
              return `<g class="av2-radar__hit" tabindex="0" data-tip="${esc(tipHtml)}">
                <circle cx="${polar(cx, cy, R * 0.62, ang(i))[0].toFixed(1)}" cy="${polar(cx, cy, R * 0.62, ang(i))[1].toFixed(1)}" r="26" class="av2-hitarea"/>
                <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" dy=".35em" text-anchor="${anchor}">${w}</text></g>`;
            }).join("")}
          </g>
        </svg>`;
      const polys = series.map((s) => el.querySelector(`.av2-radar__poly--${s.k}`));
      const pts = series.map((s) => [...el.querySelectorAll(`.av2-radar__pt--${s.k}`)]);
      const from = prev && prev.max ? prev : null;
      const paint = (p) => series.forEach((s, j) => {
        const fv = from?.vals?.[s.k];
        const coords = s.v.map((v, i) => {
          const start = fv ? fv[i] / from.max : 0;
          const f = start + (v / max - start) * p;
          return polar(cx, cy, R * f, ang(i));
        });
        polys[j].setAttribute("points", coords.map((c) => c.map((n) => n.toFixed(1)).join(",")).join(" "));
        pts[j].forEach((r, i) => { r.setAttribute("x", (coords[i][0] - 4).toFixed(1)); r.setAttribute("y", (coords[i][1] - 4).toFixed(1)); });
      });
      if (S.cancel.radar) S.cancel.radar();
      if (animate) S.cancel.radar = tween(900, paint); else paint(1);
      S.radar = { max, vals: Object.fromEntries(series.map((s) => [s.k, s.v])) };
      $(".av2-radarlegend").innerHTML = series.slice().reverse().map((s) => `<span><i class="av2-sw av2-sw--${s.k}"></i>${s.name}</span>`).join("");
    }

    /* ============================================================
       Gauge — share of days active, plus streaks
       ============================================================ */
    function drawGauge(sl, animate) {
      const on = MODES[S.mode].on;
      const active = sl.days.filter(on).length;
      const pct = sl.days.length ? active / sl.days.length : 0;
      const N = 34, cx = 110, cy = 104, r1 = 66, r2 = 84, lit = Math.round(pct * N);
      const ticks = Array.from({ length: N }, (_, i) => {
        const a = -135 + (i * 270) / (N - 1);
        const [x1, y1] = polar(cx, cy, r1, a), [x2, y2] = polar(cx, cy, r2, a);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" data-i="${i}"/>`;
      }).join("");
      const el = $(".av2-gauge");
      el.innerHTML = `
        <svg viewBox="0 0 220 176" role="img" aria-label="${Math.round(pct * 100)}% of days active in the ${sl.r.label}">
          <g class="av2-ticks av2-ticks--${S.mode}">${ticks}</g>
          <text x="${cx}" y="${cy + 2}" class="av2-gauge__v" text-anchor="middle"><tspan class="av2-gauge__n">0</tspan><tspan class="av2-gauge__u" dx="2">%</tspan></text>
          <text x="${cx}" y="${cy + 22}" class="av2-gauge__k" text-anchor="middle">days active</text>
          <text x="${cx}" y="${cy + 64}" class="av2-gauge__k" text-anchor="middle">${active} / ${sl.days.length}</text>
        </svg>`;
      const lines = [...el.querySelectorAll("line")], numEl = el.querySelector(".av2-gauge__n");
      const paint = (p) => {
        const k = Math.round(lit * p);
        lines.forEach((l, i) => l.classList.toggle("is-on", i < k));
        numEl.textContent = String(Math.round(pct * 100 * p));
      };
      if (S.cancel.gauge) S.cancel.gauge();
      if (animate) S.cancel.gauge = tween(1000, paint); else paint(1);

      // streaks run over the whole year, independent of the range
      const st = streaks(S.days, on);
      const metric = { all: (d) => d.code + d.prompts, code: (d) => d.code, claude: (d) => d.prompts }[S.mode];
      const busiest = sl.days.reduce((b, d) => (metric(d) > (b ? metric(b) : 0) ? d : b), null);
      const unit = { all: "actions", code: "contributions", claude: "prompts" }[S.mode];
      $(".av2-streaks").innerHTML = `
        <div><dt>Current streak</dt><dd>${st.cur}<small>d</small></dd></div>
        <div><dt>Best streak <span>1y</span></dt><dd>${st.best}<small>d</small></dd></div>
        <div class="av2-streaks__wide"><dt>Busiest day</dt><dd>${busiest ? `${esc(dShort.format(parse(busiest.date)))} <small>${nf.format(metric(busiest))} ${unit}</small>` : "—"}</dd></div>`;
    }

    /* ============================================================
       KPI tiles with sparklines
       ============================================================ */
    function spark(vals, color) {
      const w = 120, h = 34, n = vals.length, max = Math.max(1, ...vals);
      if (!n) return "";
      const pts = vals.map((v, i) => [n === 1 ? w / 2 : (i * (w - 6)) / (n - 1) + 1, h - 4 - (v / max) * (h - 8)]);
      const line = monotone(pts), last = pts[n - 1];
      return `<svg class="av2-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" style="--c:${color}">
        <path class="av2-spark__a" d="${line}L${last[0].toFixed(1)},${h}L${pts[0][0].toFixed(1)},${h}Z"/>
        <path class="av2-spark__l" d="${line}" vector-effect="non-scaling-stroke"/>
      </svg><i class="av2-spark__dot" style="--c:${color};top:${((last[1] / h) * 100).toFixed(1)}%"></i>`;
    }

    function drawKpis(sl) {
      const B = sl.buckets;
      const own = (S.repos || []).filter((r) => !r.fork);
      const repoSeries = B.map((b) => own.filter((r) => (r.created_at || "").slice(0, 10) <= b.to).length);
      const tiles = [
        ["Contributions", num(sl.tot.code), B.map((b) => b.code), "var(--av2-code)", "code", "GitHub contributions"],
        ["Repositories", S.repos ? num(own.length) : "—", repoSeries, "var(--av2-code)", "code", "public repos, cumulative"],
        ["Claude prompts", num(sl.tot.prompts), B.map((b) => b.prompts), "var(--av2-claude)", "claude", "prompts sent"],
        ["Claude sessions", num(sl.tot.sessions), B.map((b) => b.sessions), "var(--av2-claude)", "claude", "sessions"],
        ["Tokens", compact.format(sl.tot.tokens), B.map((b) => b.tokens), "var(--av2-claude)", "claude", "tokens processed"],
        ["Active days", num(sl.tot.active), B.map((b) => b.active), "var(--av2-mix)", "all", "days with any activity"]
      ];
      $(".av2-kpis").innerHTML = tiles.map(([k, v, series, color, grp, hint]) => {
        const dim = (S.mode === "code" && grp === "claude") || (S.mode === "claude" && grp === "code");
        return `<div class="av2-kpi${dim ? " is-dim" : ""}" tabindex="0" data-tip="${esc(`<div class="av2-tip__h">${k}</div><div class="av2-tip__row"><b>${v}</b><span>${hint} · ${sl.r.label}</span></div>`)}">
          <span class="av2-kpi__k">${k}</span>
          <span class="av2-kpi__v">${esc(v)}</span>
          <span class="av2-kpi__s">${spark(series, color)}</span>
        </div>`;
      }).join("");
    }

    /* ============================================================
       Languages + recent events (range/mode independent)
       ============================================================ */
    function drawLangs() {
      const ul = $(".av2-bars");
      if (S.err.repos) { ul.innerHTML = `<li class="av2-none">${esc(T().ghError)}</li>`; return; }
      const own = (S.repos || []).filter((r) => !r.fork);
      const langs = {};
      own.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + (r.size || 1); });
      const total = Object.values(langs).reduce((a, b) => a + b, 0);
      const top = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
      ul.innerHTML = top.length ? top.map(([k, v], i) => {
        const p = (v / total) * 100;
        return `<li tabindex="0" data-tip="${esc(`<div class="av2-tip__h">${esc(k)}</div><div class="av2-tip__row"><b>${p.toFixed(1)}%</b><span>of code size</span></div>`)}">
          <span class="av2-bars__k">${esc(k)}</span>
          <span class="av2-bars__t"><span class="av2-bars__f" style="--w:${Math.max(1.5, p).toFixed(2)}%;--d:${i * 70}ms"></span></span>
          <span class="av2-bars__v">${p.toFixed(1)}%</span>
        </li>`;
      }).join("") : `<li class="av2-none">${esc(T().noRepos)}</li>`;
    }

    function drawEvents() {
      const ul = $(".av2-events");
      if (S.err.events) { ul.innerHTML = `<li class="av2-none">${esc(T().ghError)}</li>`; return; }
      const ev = (S.events || []).slice(0, 7);
      ul.innerHTML = ev.length ? ev.map((e) => {
        const [type, text] = describe(e);
        return `<li><span class="av2-ev__t av2-ev__t--${esc(type)}">${esc(type)}</span><span class="av2-ev__d">${text}</span><time datetime="${esc(e.created_at)}">${esc(rel(e.created_at))}</time></li>`;
      }).join("") : `<li class="av2-none">${esc(T().noActivity)}</li>`;
    }

    /* ============================================================
       Header total + orchestration
       ============================================================ */
    function drawTotal(sl) {
      const v = MODES[S.mode].total(sl.tot);
      const el = $(".av2-total__v"), from = S.totalShown;
      $(".av2-total__k").textContent = `${MODES[S.mode].unit} in the ${sl.r.label}`;
      el.style.setProperty("--av2-tc", MODES[S.mode].color);
      if (S.cancel.total) S.cancel.total();
      S.cancel.total = tween(700, (p) => { el.textContent = nf.format(Math.round(from + (v - from) * p)); });
      S.totalShown = v;
    }

    function update(kind) {
      if (!S.days) return;
      const sl = slice();
      const animate = kind !== "static";
      box.dataset.mode = S.mode;
      $$("[data-sub]").forEach((el) => { el.textContent = sl.r.short; });
      drawTotal(sl);
      drawArea(kind, sl);
      drawRing(sl, animate && kind !== "mode");
      drawRadar(sl, animate, kind === "mode" || kind === "range" ? S.radar : null);
      drawGauge(sl, animate);
      drawKpis(sl);
      drawTable(sl);
    }

    async function loadClaude() {
      const url = new URL(claudeSrc, location.href);
      url.searchParams.set("t", String(Math.floor(Date.now() / 600000)));
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }

    async function load() {
      const GH = window.GH;
      const gh = (fn) => (GH && user && typeof GH[fn] === "function" ? GH[fn](user) : Promise.reject(new Error("GH unavailable")));
      const [repos, events, cal, claude] = await Promise.allSettled([gh("repos"), gh("events"), gh("calendar"), loadClaude()]);
      S.err = { repos: repos.status === "rejected", events: events.status === "rejected", cal: cal.status === "rejected", claude: claude.status === "rejected" };
      S.repos = Array.isArray(repos.value) ? repos.value : null;
      S.events = Array.isArray(events.value) ? events.value : null;
      S.days = buildDays(cal.value, claude.value);
      // start on the shortest range that still holds all the history (young data looks flat on 1Y)
      if (!opts.range) {
        const first = S.days.findIndex(MODES.all.on), age = first < 0 ? 365 : S.days.length - first;
        S.range = age <= 30 ? "30d" : age <= 90 ? "90d" : "1y";
      } else if (RANGES[opts.range]) S.range = opts.range;
      $$('.av2-seg[data-k="range"] button').forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === S.range)));
      box.classList.remove("is-loading");
      const missing = [S.err.cal && "GitHub contributions", S.err.claude && "Claude usage"].filter(Boolean);
      if (missing.length && !(S.err.cal && S.err.claude)) {
        const hero = $(".av2-hero .av2-card__h");
        hero.insertAdjacentHTML("beforeend", `<span class="av2-warn">${esc(missing.join(" & "))} unavailable</span>`);
      }
      drawLangs();
      drawEvents();
      update("intro");
    }

    /* resize + theme */
    let lastW = 0;
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => {
      const w = Math.floor(svgbox.clientWidth);
      if (!S.days || Math.abs(w - lastW) < 2) return;
      lastW = w;
      hideCross(); hideTip();
      drawArea("static", slice());
    }) : null;
    if (ro) ro.observe(svgbox);
    document.addEventListener("themechange", () => { if (S.days) update("static"); });

    // load lazily, when the section approaches the viewport (saves GitHub rate limit)
    const go = () => { load().catch((e) => { console.warn("[activity v2]", e); box.classList.remove("is-loading"); }); };
    if ("IntersectionObserver" in window && !opts.eager) {
      const io = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: "700px" });
      io.observe(root);
    } else go();

    const api = { root, state: S, refresh: () => update("static") };
    root.__av2 = api;
    return api;
  }

  window.ActivityV2 = { mount };
  const auto = () => { const el = document.getElementById(ROOT_ID); if (el) mount(el); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
