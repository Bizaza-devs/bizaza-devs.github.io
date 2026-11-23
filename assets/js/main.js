/* ============================================================
   Portfolio — renderelés a data.js-ből, effektek, GitHub
   ============================================================ */
(() => {
  const D = window.PORTFOLIO;
  const U = window.UI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const set = (sel, fn) => { const el = $(sel); if (el) fn(el); }; // hiányzó elem ne állítsa le az oldalt
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SECTIONS = ["index", "work", "stack", "activity", "contact"];
  const ACCENT = { coral: "var(--coral)", violet: "var(--violet)", blue: "var(--blue)", lime: "var(--lime)" };
  const school = D.education.find((e) => !e.to) || D.education[0];

  /* ---------- renderelés ---------- */
  function render() {
    $$("[data-ui]").forEach((el) => { if (U[el.dataset.ui] != null) el.textContent = U[el.dataset.ui]; });
    $$(".cv-link").forEach((a) => { a.href = D.cvPdf; });

    set("#navLinks", (el) => { el.innerHTML = SECTIONS.map((id, i) => `<li><a href="#${id}" data-nav="${id}">${U.nav[i]}</a></li>`).join(""); });

    // hero
    const [first, ...rest] = D.person.name.split(" ");
    set("#heroName", (el) => { el.innerHTML = `<span class="l1">${esc(first)}</span><span class="l2">${esc(rest.join(" "))}</span>`; });
    set("#heroChip", (el) => { el.textContent = `${school.detail.split(" · ")[0]} · ${school.place}`; });
    set("#heroRole", (el) => { el.textContent = D.person.role; });
    set("#heroTagline", (el) => { el.textContent = D.person.tagline; });

    set("#idcard", (el) => {
      const rows = [
        ["Name", D.person.name],
        ["Age", `${D.age}`],
        ["Base", D.person.location],
        ["School", `${school.short || school.school.split(" ")[0]} · ${school.place}`],
        ["Building", "ALAN BIRTH", "hl"],
        ["Local", `<span id="clock">--:--:--</span>`]
      ];
      el.innerHTML = rows.map(([k, v, c]) => `<div><dt>${k}</dt><dd${c ? ` class="${c}"` : ""}>${k === "Local" ? v : esc(v)}</dd></div>`).join("");
    });
    set("#heroStatus", (el) => {
      el.innerHTML = D.person.status.map((s, i, a) => `<div>${esc(s)}${i === a.length - 1 ? '<span class="caret"></span>' : ""}</div>`).join("");
    });

    // futó szalag
    set("#marquee", (el) => {
      const words = ["ALAN BIRTH", ...D.stack.flatMap((g) => g.items.map((i) => i.name)).filter((n) => !/—/.test(n)), "Collection 01 — FW26", "Budapest"];
      const run = words.map((w) => `<span>${esc(w)}</span><span class="star">✦</span>`).join("");
      el.innerHTML = run + run; // kétszer, hogy végtelenül fusson
    });

    // számok
    set("#stats", (el) => {
      el.innerHTML = D.stats.map((s, i) => {
        const v = s.value === "age" ? D.age : s.value;
        return `<div class="stat" style="--stat-c:${ACCENT[s.color] || "var(--lime)"}">
          <div class="stat__top mono"><span>${String(i + 1).padStart(2, "0")}</span><span>${esc(s.label)}</span></div>
          <div class="stat__v"><span data-count="${v}">0</span>${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</div>
          <div class="stat__n">${esc(s.note)}</div>
        </div>`;
      }).join("");
    });

    // projektek
    set("#projects", (el) => {
      el.innerHTML = D.projects.map((p, i) => {
        const links = [...(p.links || [])];
        if (p.repo) links.push({ label: "GitHub", url: `https://github.com/${D.github}/${p.repo}` });
        const head = `
          <div class="project__top mono">
            <span class="project__num">${String(i + 1).padStart(2, "0")}</span>
            <span class="pill pill--${p.status}"><i></i>${esc(U.status[p.status])} · ${esc(p.year)}</span>
          </div>
          <div>
            <h3 class="project__name">${esc(p.name)}</h3>
            <div class="project__kind mono">${esc(p.kind)}</div>
          </div>`;
        const body = `
          <p class="project__sum">${esc(p.summary)}</p>
          <p class="project__role"><b>${esc(U.role)}:</b> ${esc(p.role)}</p>`;
        const side = `
          <div class="tags">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
          ${links.length ? `<div class="project__links">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>` : ""}
          <div class="project__metrics">${p.metrics.map((m) => `<div><div class="metric__v">${esc(m.v)}</div><div class="metric__k mono">${esc(m.k)}</div></div>`).join("")}</div>`;
        const style = `style="--accent:${ACCENT[p.accent] || "var(--lime)"}"`;
        return i === 0
          ? `<article class="card project project--feature reveal" id="p-${esc(p.id)}" ${style}><div>${head}${body}</div><div class="project__side">${side}</div></article>`
          : `<article class="card project reveal" id="p-${esc(p.id)}" ${style}>${head}${body}${side}</article>`;
      }).join("");
    });

    // tudás
    set("#legend", (el) => { el.innerHTML = ["using", "learning"].map((l) => `<span><i class="lv lv--${l}"></i>${esc(U.levels[l])}</span>`).join(""); });
    set("#stackGrid", (el) => {
      el.innerHTML = D.stack.map((g) => `
        <div class="card stack__group reveal">
          <h3 class="mono small">${esc(g.group)}</h3>
          <div class="stack__items">${g.items.map((it) => `<span class="skill" data-level="${it.level}" title="${esc(U.levels[it.level])}"><i class="lv lv--${it.level}"></i>${esc(it.name)}</span>`).join("")}</div>
        </div>`).join("");
    });

    // kapcsolat
    const c = D.contact;
    set("#contactMail", (el) => { if (c.email) { el.href = `mailto:${c.email}`; el.textContent = c.email; } else el.remove(); });
    set("#contactLinks", (el) => {
      el.innerHTML = [
        `<a class="btn btn--grad" href="${esc(D.cvPdf)}" download>${esc(U.cv)} <span class="btn__ext mono">PDF ↓</span></a>`,
        ...c.links.map((l) => `<a class="btn btn--ghost" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
      ].join("");
    });

    set("#ghProfile", (el) => { el.href = `https://github.com/${D.github}`; el.textContent = `@${D.github}`; });
    set("#updated", (el) => { el.textContent = D.updated; });
  }

  /* ---------- óra ---------- */
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const tick = () => set("#clock", (el) => { el.textContent = fmt.format(new Date()) + " CET"; });

  /* ---------- megjelenés görgetéskor ---------- */
  function observe() {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    $$(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  }

  function countUp() {
    const els = $$("[data-count]");
    const run = (el) => {
      const to = Number(el.dataset.count);
      if (reduced) { el.textContent = to; return; }
      const start = performance.now(), dur = 1600;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    }), { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- kurzor: a pontháló felizzik körülötte ---------- */
  if (!reduced && matchMedia("(pointer: fine)").matches) {
    const root = document.documentElement;
    let raf = 0, x = 0, y = 0;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => { root.style.setProperty("--cx", x + "px"); root.style.setProperty("--cy", y + "px"); raf = 0; });
    }, { passive: true });
  }

  /* ---------- görgetés: progress + aktív menüpont ---------- */
  const bar = $(".progress span");
  function setActive() {
    const y = scrollY + innerHeight * 0.35;
    let cur = SECTIONS[0];
    SECTIONS.forEach((id) => { const s = document.getElementById(id); if (s && s.offsetTop <= y) cur = id; });
    $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === cur));
  }
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    setActive();
  }, { passive: true });

  /* ---------- rejtett parancspaletta: Ctrl K / ⌘K / "/" ---------- */
  const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
  let sel = 0, items = [];
  const commands = () => [
    ...SECTIONS.map((id, i) => ({ label: U.nav[i], hint: "#" + id, run: () => document.getElementById(id).scrollIntoView() })),
    ...D.projects.map((p) => ({ label: p.name, hint: p.kind, run: () => document.getElementById("p-" + p.id).scrollIntoView({ block: "center" }) })),
    { label: U.cv, hint: "PDF", run: () => { const a = document.createElement("a"); a.href = D.cvPdf; a.download = ""; a.click(); } },
    { label: "GitHub ↗", hint: "@" + D.github, run: () => open(`https://github.com/${D.github}`, "_blank", "noopener") },
    ...(D.contact.email ? [{ label: "Email ↗", hint: D.contact.email, run: () => (location.href = "mailto:" + D.contact.email) }] : [])
  ];
  function drawPalette() {
    const q = pin.value.trim().toLowerCase();
    items = commands().filter((c) => !q || (c.label + " " + c.hint).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    plist.innerHTML = items.map((c, i) => `<li role="option" data-i="${i}" class="${i === sel ? "is-sel" : ""}"><span>${esc(c.label)}</span><span>${esc(c.hint)}</span></li>`).join("");
  }
  function openPalette() { pal.hidden = false; pin.value = ""; pin.placeholder = U.palette; sel = 0; drawPalette(); pin.focus(); }
  function closePalette() { pal.hidden = true; }
  function runSel() { const c = items[sel]; closePalette(); c?.run(); }
  if (pal && pin && plist) {
    pin.addEventListener("input", () => { sel = 0; drawPalette(); });
    plist.addEventListener("click", (e) => { const li = e.target.closest("li"); if (li) { sel = +li.dataset.i; runSel(); } });
    pal.addEventListener("click", (e) => { if (e.target === pal) closePalette(); });
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPalette() : closePalette(); return; }
      if (pal.hidden) { if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openPalette(); } return; }
      if (e.key === "Escape") closePalette();
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, items.length); drawPalette(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(1, items.length); drawPalette(); }
      else if (e.key === "Enter") { e.preventDefault(); runSel(); }
    });
  }

  /* ============================================================
     Work activity — GitHub + Claude egy naptárban
     ============================================================ */
  const palette = ["#c8ff3d", "#a35bff", "#4d6bfe", "#ff5b3a", "#ffd23f", "#3ddcff"];
  const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
  const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function rel(date) {
    const s = (Date.now() - new Date(date)) / 1000;
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
    for (const [u, n] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
      if (s >= n) return rtf.format(-Math.floor(s / n), u);
    }
    return rtf.format(0, "second");
  }

  function describe(ev) {
    const repo = `<b>${esc(ev.repo.name.split("/")[1])}</b>`;
    switch (ev.type) {
      case "PushEvent": { const n = ev.payload.size ?? ev.payload.commits?.length ?? 1; return `pushed ${n} commit${n > 1 ? "s" : ""} to ${repo}`; }
      case "CreateEvent": return `created ${esc(ev.payload.ref_type)} in ${repo}`;
      case "WatchEvent": return `starred ${repo}`;
      case "ForkEvent": return `forked ${repo}`;
      case "PullRequestEvent": return `${esc(ev.payload.action)} a PR in ${repo}`;
      case "IssuesEvent": return `${esc(ev.payload.action)} an issue in ${repo}`;
      case "ReleaseEvent": return `released ${repo}`;
      case "PublicEvent": return `made ${repo} public`;
      default: return `${esc(ev.type.replace("Event", ""))} · ${repo}`;
    }
  }

  // az utolsó 53 hét napjai, vasárnappal kezdve (mint a GitHubon)
  function buildDays(ghCal, claude) {
    const gh = {}, cl = {};
    (ghCal?.contributions || []).forEach((d) => { gh[d.date] = d.count; });
    (claude?.days || []).forEach((d) => { cl[d.date] = d; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - 364); start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const k = iso(d), c = cl[k];
      days.push({ date: k, dow: d.getDay(), code: gh[k] || 0, prompts: c?.prompts || 0, sessions: c?.sessions || 0, tokens: c?.tokens || 0 });
    }
    return days;
  }

  // 4 szint a 95. percentilishez mérve, hogy egy kiugró nap ne nyomja el a többit
  function scaler(vals) {
    const nz = vals.filter((v) => v > 0).sort((a, b) => a - b);
    const top = nz.length ? nz[Math.min(nz.length - 1, Math.floor(nz.length * 0.95))] : 1;
    return (v) => (v <= 0 ? 0 : Math.min(1, v / top));
  }
  const level = (x) => (x <= 0 ? 0 : x < 0.25 ? 1 : x < 0.5 ? 2 : x < 0.8 ? 3 : 4);

  function streaks(days, active) {
    let cur = 0, best = 0, run = 0;
    days.forEach((d) => { run = active(d) ? run + 1 : 0; best = Math.max(best, run); });
    let i = days.length - 1;
    if (i >= 0 && !active(days[i])) i--; // a mai nap még lehet üres
    while (i >= 0 && active(days[i])) { cur++; i--; }
    return { cur, best };
  }

  let ACT = null, mode = "all";

  function renderActivity() {
    if (!ACT) return;
    const { days, claude, user, repos } = ACT;
    const sc = scaler(days.map((d) => d.code)), sp = scaler(days.map((d) => d.prompts));
    const isOn = { all: (d) => d.code > 0 || d.prompts > 0, code: (d) => d.code > 0, claude: (d) => d.prompts > 0 }[mode];

    set("#actCal", (el) => {
      const cells = days.map((d, i) => {
        const c = sc(d.code), p = sp(d.prompts);
        let k = "", l = 0;
        if (mode === "code") { k = c ? "code" : ""; l = level(c); }
        else if (mode === "claude") { k = p ? "claude" : ""; l = level(p); }
        else if (c || p) { k = c && p ? (c > p * 2 ? "code" : p > c * 2 ? "claude" : "both") : c ? "code" : "claude"; l = level(Math.max(c, p)); }
        const delay = reduced ? 0 : Math.min(900, Math.floor(i / 7) * 14);
        return `<i data-i="${i}"${k ? ` data-k="${k}"` : ""} data-l="${l}" style="animation-delay:${delay}ms"></i>`;
      });
      el.innerHTML = cells.join("");
    });
    const mf = new Intl.DateTimeFormat("en", { month: "short" });
    const months = [];
    for (let i = 0; i < days.length; i += 61) months.push(mf.format(new Date(days[i].date + "T00:00:00")));
    set("#actMonths", (el) => { el.innerHTML = months.map((m) => `<span>${esc(m)}</span>`).join(""); });

    const yr = days.reduce((a, d) => ({ code: a.code + d.code, prompts: a.prompts + d.prompts, sessions: a.sessions + d.sessions, tokens: a.tokens + d.tokens }), { code: 0, prompts: 0, sessions: 0, tokens: 0 });
    const activeDays = days.filter(isOn).length;
    const total = { all: activeDays, code: yr.code, claude: yr.prompts }[mode];
    const label = { all: "active days in the last year", code: "contributions in the last year", claude: "Claude prompts in the last year" }[mode];
    set("#actTotal", (el) => { el.textContent = total.toLocaleString("en"); el.style.setProperty("--act-grad", { all: "var(--grad)", code: "var(--lime)", claude: "var(--violet)" }[mode]); });
    set("#actTotalLabel", (el) => { el.textContent = label; });
    set("#actLegend", (el) => {
      el.innerHTML = mode === "all"
        ? `<span><i style="background:var(--lime)"></i>Code (GitHub)</span><span><i style="background:var(--violet)"></i>Claude</span><span><i style="background:linear-gradient(135deg,var(--lime),var(--violet))"></i>Both</span>`
        : `<span>Less</span>${[1, 2, 3, 4].map((l) => `<i style="background:var(--${mode === "code" ? "lime" : "violet"});opacity:${[0.32, 0.55, 0.8, 1][l - 1]}"></i>`).join("")}<span>More</span>`;
    });

    const st = streaks(days, isOn);
    const own = (repos || []).filter((r) => !r.fork);
    const kpis = [
      ["Contributions", yr.code, "lime"],
      ["Repositories", own.length, "lime"],
      ["Claude prompts", yr.prompts, "violet"],
      ["Claude sessions", yr.sessions, "violet"],
      ["Tokens", compact.format(yr.tokens), "blue"],
      ["Active days", activeDays, "coral"],
      ["Streak", `${st.cur}d`, "coral"],
      ["Best streak", `${st.best}d`, "blue"]
    ];
    set("#actKpis", (el) => {
      el.innerHTML = kpis.map(([k, v, c]) => `<div class="card kpi" style="--accent:var(--${c})"><span class="kpi__v">${esc(v)}</span><span class="kpi__k mono">${esc(k)}</span></div>`).join("");
    });

    // aktív napok a hét napjai szerint
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], order = [1, 2, 3, 4, 5, 6, 0];
    const per = [0, 0, 0, 0, 0, 0, 0];
    days.forEach((d) => { if (isOn(d)) per[d.dow]++; });
    const max = Math.max(1, ...per);
    set("#actWeek", (el) => {
      el.innerHTML = order.map((w, i) => `<div><b style="height:${Math.max(3, (per[w] / max) * 100)}%;animation-delay:${i * 60}ms"></b><span><span class="n">${per[w]}</span><br>${names[w]}</span></div>`).join("");
    });

    if (user) set("#ghFollowers", (el) => { el.textContent = user.followers; });
  }

  // tooltip a naptár celláin
  const tip = $("#actTip");
  set("#actCal", (grid) => {
    grid.addEventListener("pointerover", (e) => {
      const c = e.target.closest("i[data-i]");
      if (!c || !ACT || !tip) return;
      const d = ACT.days[+c.dataset.i];
      tip.innerHTML = `${dayFmt.format(new Date(d.date + "T00:00:00"))} · <b>${d.code} contribution${d.code === 1 ? "" : "s"}</b> · <em>${d.prompts} Claude prompt${d.prompts === 1 ? "" : "s"}</em>`;
      tip.hidden = false;
    });
    grid.addEventListener("pointermove", (e) => {
      if (!tip || tip.hidden) return;
      const w = tip.offsetWidth;
      tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, e.clientX - w / 2)) + "px";
      tip.style.top = e.clientY - 46 + "px";
    });
    grid.addEventListener("pointerleave", () => { if (tip) tip.hidden = true; });
  });

  set("#actTabs", (tabs) => tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-mode]");
    if (!b) return;
    mode = b.dataset.mode;
    $$("button", tabs).forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", x === b); });
    renderActivity();
  }));

  function renderRepos(repos) {
    const own = repos.filter((r) => !r.fork);
    const langs = {};
    own.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + (r.size || 1); });
    const total = Object.values(langs).reduce((a, b) => a + b, 0);
    const top = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
    set("#ghLangBar", (el) => { el.innerHTML = top.map(([, v], i) => `<span style="width:${(v / total) * 100}%;background:${palette[i]}"></span>`).join(""); });
    set("#ghLangList", (el) => {
      el.innerHTML = top.length
        ? top.map(([k, v], i) => `<li><span><i style="background:${palette[i]}"></i>${esc(k)}</span><span>${((v / total) * 100).toFixed(1)}%</span></li>`).join("")
        : `<li class="empty">${esc(U.noRepos)}</li>`;
    });
    // csak a legújabb nyilvános projektek: létrehozás szerint, a profil-README repó nélkül
    const list = own
      .filter((r) => r.name.toLowerCase() !== D.github.toLowerCase())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
    set("#ghRepoList", (el) => {
      el.innerHTML = list.length ? list.map((r) => `
        <a class="card repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <span class="repo__name">${esc(r.name)}</span>
          <span class="repo__desc">${esc(r.description || "—")}</span>
          <span class="repo__meta"><span>${esc(r.language || "")}</span><span>★ ${r.stargazers_count}</span><span>${rel(r.created_at)}</span></span>
        </a>`).join("") : `<div class="card repo"><span class="empty">${esc(U.noRepos)}</span></div>`;
    });
  }

  async function loadClaude() {
    // a data/claude.json a scripts/claude_stats.py kimenete (csak névtelen napi számok)
    const r = await fetch(`data/claude.json?t=${Math.floor(Date.now() / 600000)}`);
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  async function loadActivity() {
    const u = D.github;
    const [user, repos, events, cal, claude] = await Promise.allSettled([GH.user(u), GH.repos(u), GH.events(u), GH.calendar(u), loadClaude()]);
    if (repos.value) renderRepos(repos.value);
    set("#ghFeed", (el) => {
      const ev = (events.value || []).slice(0, 7);
      el.innerHTML = events.status === "rejected"
        ? `<li class="empty">${esc(U.ghError)}</li>`
        : ev.length ? ev.map((e) => `<li><span>${describe(e)}</span><time datetime="${esc(e.created_at)}">${rel(e.created_at)}</time></li>`).join("")
        : `<li class="empty">${esc(U.noActivity)}</li>`;
    });
    ACT = { days: buildDays(cal.value, claude.value), claude: claude.value, user: user.value, repos: repos.value };
    renderActivity();
  }

  /* ---------- indulás ---------- */
  render();
  tick(); setInterval(tick, 1000);
  // a hero azonnal beúszik, nem vár a görgetésfigyelőre
  setTimeout(() => $$(".hero .reveal").forEach((el, i) => setTimeout(() => el.classList.add("is-in"), i * 90)), 60);
  observe();
  // biztonsági háló: ami 2,5 mp múlva is látótérben van, az mindenképp megjelenik
  setTimeout(() => $$(".reveal:not(.is-in)").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in"); }), 2500);
  countUp();
  setActive();
  // a GitHub-adat csak akkor töltődik, amikor a lap közel ér hozzá (kíméli a lekérési limitet)
  const ghIO = new IntersectionObserver((ents) => {
    if (ents.some((e) => e.isIntersecting)) { ghIO.disconnect(); loadActivity(); }
  }, { rootMargin: "800px" });
  ghIO.observe($("#work"));
})();
