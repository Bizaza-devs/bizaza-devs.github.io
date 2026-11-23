/* ============================================================
   Portfolio — renderelés a data.js-ből, interakciók, GitHub
   ============================================================ */
(() => {
  const D = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SECTIONS = ["index", "work", "stack", "github", "contact"];

  /* ---------- nyelv ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };
  let lang = store.get("lang") || ((navigator.language || "").toLowerCase().startsWith("hu") ? "hu" : "en");
  const t = (o) => (o && typeof o === "object" ? o[lang] ?? o.en : o);
  const ui = () => window.UI[lang];

  /* ---------- renderelés ---------- */
  function render() {
    const U = ui();
    document.documentElement.lang = lang;
    document.title = `${t(D.person.name)} — Portfolio`;
    $("#langBtn").textContent = lang === "en" ? "HU" : "EN";
    $$("[data-ui]").forEach((el) => { el.textContent = U[el.dataset.ui]; });

    $("#navLinks").innerHTML = SECTIONS.map((id, i) => `<li><a href="#${id}" data-nav="${id}">${U.nav[i]}</a></li>`).join("");

    $("#heroLocation").textContent = t(D.person.location);
    $("#heroName").innerHTML = t(D.person.name).split(" ").map(esc).join("<br>");
    $("#heroRole").textContent = t(D.person.role);
    $("#heroTagline").textContent = t(D.person.tagline);
    $("#heroStatus").innerHTML = D.person.status
      .map((s, i, a) => `<div>${esc(t(s))}${i === a.length - 1 ? '<span class="caret"></span>' : ""}</div>`).join("");

    $("#stats").innerHTML = D.stats.map((s) => {
      const v = s.value === "age" ? D.age : s.value;
      return `
      <div class="glass stat reveal">
        <span class="stat__v" data-count="${typeof v === "number" ? v : ""}">${typeof v === "number" ? 0 : esc(v)}</span>
        <span class="stat__k">${esc(t(s.label))}</span>
        <span class="stat__n mono">${esc(s.note)}</span>
      </div>`;
    }).join("");

    $("#projects").innerHTML = D.projects.map((p, i) => {
      const links = [...(p.links || [])];
      if (p.repo) links.push({ label: "GitHub", url: `https://github.com/${D.github}/${p.repo}` });
      return `
      <article class="glass project reveal" id="p-${esc(p.id)}">
        <div class="project__top mono">
          <span>${String(i + 1).padStart(2, "0")} · ${esc(p.year)}</span>
          <span class="pill pill--${p.status}"><span class="dot"></span>${esc(U.status[p.status])}</span>
        </div>
        <div>
          <h3 class="project__name">${esc(p.name)}</h3>
          <div class="project__kind mono">${esc(t(p.kind))}</div>
        </div>
        <p class="project__sum">${esc(t(p.summary))}</p>
        <p class="project__role"><span class="mono">${esc(U.role)}:</span> ${esc(t(p.role))}</p>
        <div class="tags">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        ${links.length ? `<div class="project__links">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>` : ""}
        <div class="project__metrics">${p.metrics.map((m) => `<div><div class="metric__v">${esc(m.v)}</div><div class="metric__k mono">${esc(t(m.k))}</div></div>`).join("")}</div>
      </article>`;
    }).join("");

    $("#legend").innerHTML = ["using", "learning"].map((l) => `<span><i class="lv lv--${l}"></i>${esc(U.levels[l])}</span>`).join("");
    $("#stackGrid").innerHTML = D.stack.map((g) => `
      <div class="glass stack__group reveal">
        <h3 class="mono small">${esc(t(g.group))}</h3>
        ${g.items.map((it) => `<div class="stack__item" data-level="${it.level}"><span>${esc(t(it.name))}</span><i class="lv lv--${it.level}" title="${esc(U.levels[it.level])}"></i></div>`).join("")}
      </div>`).join("");


    $$(".cv-link").forEach((a) => { a.href = t(D.cvPdf); });
    const c = D.contact;
    $("#contactLinks").innerHTML = [
      `<a class="btn btn--solid" href="${esc(t(D.cvPdf))}" download>${esc(U.cv)} · PDF ↓</a>`,
      c.email ? `<a class="btn btn--solid" href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : "",
      ...c.links.map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
    ].join("");

    $("#ghProfile").href = `https://github.com/${D.github}`;
    $("#ghProfile").textContent = `@${D.github}`;
    $("#updated").textContent = D.updated;

    observe();
    countUp();
    setActive();
    if (ghCache) renderGitHub(ghCache);
  }

  /* ---------- óra ---------- */
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const tick = () => { $("#clock").textContent = fmt.format(new Date()) + " CET"; };
  tick(); setInterval(tick, 1000);

  /* ---------- megjelenés görgetéskor ---------- */
  let io;
  function observe() {
    io?.disconnect();
    io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  }

  function countUp() {
    $$("[data-count]").forEach((el) => {
      const to = Number(el.dataset.count);
      if (!el.dataset.count || reduced) { if (el.dataset.count) el.textContent = to; return; }
      const start = performance.now(), dur = 1400;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- kurzort követő fény az üvegen ---------- */
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest?.(".glass");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });

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
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    setActive();
  }, { passive: true });

  /* ---------- nyelvváltás ---------- */
  function toggleLang() { lang = lang === "en" ? "hu" : "en"; store.set("lang", lang); render(); }
  $("#langBtn").addEventListener("click", toggleLang);

  /* ---------- parancspaletta ---------- */
  const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
  let sel = 0, items = [];
  const commands = () => {
    const U = ui();
    return [
      ...SECTIONS.map((id, i) => ({ label: U.nav[i], hint: "#" + id, run: () => document.getElementById(id).scrollIntoView() })),
      ...D.projects.map((p) => ({ label: p.name, hint: t(p.kind), run: () => document.getElementById("p-" + p.id).scrollIntoView({ block: "center" }) })),
      { label: lang === "en" ? "Magyar nyelv" : "English", hint: "lang", run: toggleLang },
      { label: ui().cv, hint: "PDF", run: () => { const a = document.createElement("a"); a.href = t(D.cvPdf); a.download = ""; a.click(); } },
      { label: "GitHub ↗", hint: "@" + D.github, run: () => open(`https://github.com/${D.github}`, "_blank", "noopener") },
      ...(D.contact.email ? [{ label: "Email ↗", hint: D.contact.email, run: () => (location.href = "mailto:" + D.contact.email) }] : [])
    ];
  };
  function drawPalette() {
    const q = pin.value.trim().toLowerCase();
    items = commands().filter((c) => !q || (c.label + " " + c.hint).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    plist.innerHTML = items.map((c, i) => `<li role="option" data-i="${i}" class="${i === sel ? "is-sel" : ""}"><span>${esc(c.label)}</span><span>${esc(c.hint)}</span></li>`).join("");
  }
  function openPalette() { pal.hidden = false; pin.value = ""; pin.placeholder = ui().palette; sel = 0; drawPalette(); pin.focus(); }
  function closePalette() { pal.hidden = true; }
  function runSel() { const c = items[sel]; closePalette(); c?.run(); }
  $("#cmdBtn").addEventListener("click", openPalette);
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
  if (matchMedia("(pointer: coarse)").matches) $("#cmdBtn").innerHTML = "<kbd>MENU</kbd>";
  else if (!/Mac|iPhone|iPad/.test(navigator.platform)) $("#cmdBtn").innerHTML = "<kbd>Ctrl K</kbd>";

  /* ============================================================
     GitHub
     ============================================================ */
  let ghCache = null;
  const shades = ["#ffffff", "#bdbdbd", "#8a8a8a", "#5c5c5c", "#3a3a3a", "#262626"];

  function rel(date) {
    const s = (Date.now() - new Date(date)) / 1000;
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" });
    for (const [u, n] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
      if (s >= n) return rtf.format(-Math.floor(s / n), u);
    }
    return rtf.format(0, "second");
  }

  function describe(ev) {
    const repo = `<b>${esc(ev.repo.name.split("/")[1])}</b>`;
    const hu = lang === "hu";
    switch (ev.type) {
      case "PushEvent": {
        const n = ev.payload.size ?? ev.payload.commits?.length ?? 1;
        return hu ? `${n} commit → ${repo}` : `pushed ${n} commit${n > 1 ? "s" : ""} to ${repo}`;
      }
      case "CreateEvent": return hu ? `létrehozva: ${repo} (${ev.payload.ref_type})` : `created ${ev.payload.ref_type} in ${repo}`;
      case "WatchEvent": return hu ? `csillagozva: ${repo}` : `starred ${repo}`;
      case "ForkEvent": return hu ? `forkolva: ${repo}` : `forked ${repo}`;
      case "PullRequestEvent": return hu ? `PR ${ev.payload.action}: ${repo}` : `${ev.payload.action} a PR in ${repo}`;
      case "IssuesEvent": return hu ? `issue ${ev.payload.action}: ${repo}` : `${ev.payload.action} an issue in ${repo}`;
      case "ReleaseEvent": return hu ? `kiadás: ${repo}` : `released ${repo}`;
      case "PublicEvent": return hu ? `publikussá téve: ${repo}` : `made ${repo} public`;
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

  function renderGitHub(g) {
    const U = ui();
    const { user, repos, events, cal } = g;

    if (user) {
      $("#ghFollowers").textContent = user.followers;
    }
    if (repos) {
      const own = repos.filter((r) => !r.fork);
      $("#ghRepos").textContent = own.length;
      $("#ghStars").textContent = own.reduce((a, r) => a + r.stargazers_count, 0);

      const langs = {};
      own.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + (r.size || 1); });
      const total = Object.values(langs).reduce((a, b) => a + b, 0);
      const top = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
      $("#ghLangBar").innerHTML = top.map(([, v], i) => `<span style="width:${(v / total) * 100}%;background:${shades[i]}"></span>`).join("");
      $("#ghLangList").innerHTML = top.length
        ? top.map(([k, v], i) => `<li><span><i style="background:${shades[i]}"></i>${esc(k)}</span><span>${((v / total) * 100).toFixed(1)}%</span></li>`).join("")
        : `<li class="empty">${esc(U.noRepos)}</li>`;

      // csak a legújabb nyilvános projektek: létrehozás szerint, a profil-README repó nélkül
      const list = own
        .filter((r) => r.name.toLowerCase() !== D.github.toLowerCase())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
      $("#ghRepoList").innerHTML = list.length ? list.map((r) => `
        <a class="glass repo reveal is-in" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <span class="repo__name">${esc(r.name)}</span>
          <span class="repo__desc">${esc(r.description || "—")}</span>
          <span class="repo__meta"><span>${esc(r.language || "")}</span><span>★ ${r.stargazers_count}</span><span>${rel(r.created_at)}</span></span>
        </a>`).join("") : `<div class="glass repo"><span class="empty">${esc(U.noRepos)}</span></div>`;
    }
    if (events) {
      const ev = events.slice(0, 7);
      $("#ghFeed").innerHTML = ev.length
        ? ev.map((e) => `<li><span>${describe(e)}</span><time datetime="${esc(e.created_at)}">${rel(e.created_at)}</time></li>`).join("")
        : `<li class="empty">${esc(U.noActivity)}</li>`;
    }
    if (cal && cal.contributions) {
      const days = cal.contributions;
      $("#ghTotal").textContent = cal.total?.lastYear ?? days.reduce((a, d) => a + d.count, 0);
      const s = streaks(days);
      $("#ghStreak").textContent = `${s.cur}/${s.best}`;
      $("#ghStreakLabel").textContent = lang === "hu" ? "sorozat / rekord (nap)" : "streak / best (days)";

      const pad = new Date(days[0].date + "T00:00:00").getDay(); // vasárnap = 0, mint a GitHubon
      const cells = Array(pad).fill('<i style="visibility:hidden"></i>');
      days.forEach((d, i) => {
        const delay = reduced ? 0 : Math.min(900, (Math.floor((i + pad) / 7)) * 14);
        cells.push(`<i data-l="${d.level}" style="animation-delay:${delay}ms" title="${esc(d.date)} · ${d.count}"></i>`);
      });
      $("#ghCal").innerHTML = cells.join("");

      const months = [];
      const mf = new Intl.DateTimeFormat(lang, { month: "short" });
      for (let i = 0; i < days.length; i += 61) months.push(mf.format(new Date(days[i].date + "T00:00:00")));
      $("#ghMonths").innerHTML = months.map((m) => `<span>${esc(m)}</span>`).join("");
    }
  }

  function ghError() {
    const U = ui();
    $("#ghFeed").innerHTML = `<li class="empty">${esc(U.ghError)}</li>`;
  }

  async function loadGitHub() {
    const u = D.github;
    const [user, repos, events, cal] = await Promise.allSettled([GH.user(u), GH.repos(u), GH.events(u), GH.calendar(u)]);
    ghCache = {
      user: user.value, repos: repos.value, events: events.value, cal: cal.value
    };
    if (user.status === "rejected" && repos.status === "rejected") ghError();
    renderGitHub(ghCache);
    if (events.status === "rejected" && user.status !== "rejected") ghError();
  }

  /* ---------- indulás ---------- */
  render();
  // a GitHub csak akkor töltődik, amikor a szekció közel ér (kíméli a lekérési limitet)
  const ghIO = new IntersectionObserver((ents) => {
    if (ents.some((e) => e.isIntersecting)) { ghIO.disconnect(); loadGitHub(); }
  }, { rootMargin: "600px" });
  ghIO.observe($("#github"));
})();
