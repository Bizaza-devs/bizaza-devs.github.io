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
  const SECTIONS = ["index", "work", "stack", "github", "contact"];
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
     GitHub
     ============================================================ */
  const palette = ["#c8ff3d", "#a35bff", "#4d6bfe", "#ff5b3a", "#ffd23f", "#3ddcff"];

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

  function streaks(days) {
    let cur = 0, best = 0, run = 0;
    days.forEach((d) => { run = d.count > 0 ? run + 1 : 0; best = Math.max(best, run); });
    const today = new Date().toISOString().slice(0, 10);
    const past = days.filter((d) => d.date <= today);
    let i = past.length - 1;
    if (i >= 0 && past[i].count === 0) i--; // a mai nap még lehet üres
    while (i >= 0 && past[i].count > 0) { cur++; i--; }
    return { cur, best };
  }

  function renderGitHub({ user, repos, events, cal }) {
    if (user) set("#ghFollowers", (el) => { el.textContent = user.followers; });
    if (repos) {
      const own = repos.filter((r) => !r.fork);
      set("#ghRepos", (el) => { el.textContent = own.length; });
      set("#ghStars", (el) => { el.textContent = own.reduce((a, r) => a + r.stargazers_count, 0); });

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
    if (events) {
      const ev = events.slice(0, 7);
      set("#ghFeed", (el) => {
        el.innerHTML = ev.length
          ? ev.map((e) => `<li><span>${describe(e)}</span><time datetime="${esc(e.created_at)}">${rel(e.created_at)}</time></li>`).join("")
          : `<li class="empty">${esc(U.noActivity)}</li>`;
      });
    }
    if (cal && cal.contributions) {
      const days = cal.contributions;
      set("#ghTotal", (el) => { el.textContent = cal.total?.lastYear ?? days.reduce((a, d) => a + d.count, 0); });
      const s = streaks(days);
      set("#ghStreak", (el) => { el.textContent = `${s.cur}/${s.best}`; });
      set("#ghStreakLabel", (el) => { el.textContent = "streak / best"; });

      const pad = new Date(days[0].date + "T00:00:00").getDay(); // vasárnap = 0, mint a GitHubon
      const cells = Array(pad).fill('<i style="visibility:hidden"></i>');
      days.forEach((d, i) => {
        const delay = reduced ? 0 : Math.min(900, Math.floor((i + pad) / 7) * 14);
        cells.push(`<i data-l="${d.level}" style="animation-delay:${delay}ms" title="${esc(d.date)} · ${d.count}"></i>`);
      });
      set("#ghCal", (el) => { el.innerHTML = cells.join(""); });
      const mf = new Intl.DateTimeFormat("en", { month: "short" });
      const months = [];
      for (let i = 0; i < days.length; i += 61) months.push(mf.format(new Date(days[i].date + "T00:00:00")));
      set("#ghMonths", (el) => { el.innerHTML = months.map((m) => `<span>${esc(m)}</span>`).join(""); });
    }
  }

  async function loadGitHub() {
    const u = D.github;
    const [user, repos, events, cal] = await Promise.allSettled([GH.user(u), GH.repos(u), GH.events(u), GH.calendar(u)]);
    renderGitHub({ user: user.value, repos: repos.value, events: events.value, cal: cal.value });
    if (events.status === "rejected") set("#ghFeed", (el) => { el.innerHTML = `<li class="empty">${esc(U.ghError)}</li>`; });
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
    if (ents.some((e) => e.isIntersecting)) { ghIO.disconnect(); loadGitHub(); }
  }, { rootMargin: "800px" });
  ghIO.observe($("#work"));
})();
