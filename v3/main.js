/* ============================================================
   Portfolio v3 — renders everything from assets/js/data.js
   Work grid / list with filters, a project view (#work/<id>),
   live GitHub repos, info tables, contact. No dependencies.
   The Activity section is filled by v2/activity.js.
   ============================================================ */
(() => {
  "use strict";
  const D = window.PORTFOLIO;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const set = (sel, fn) => { const el = $(sel); if (el) fn(el); };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad2 = (n) => String(n).padStart(2, "0");
  const root = document.documentElement;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const P = D.projects;
  const tagsOf = (p) => p.tags || [];
  const STATUS = { live: "Live", building: "In progress" };

  /* ---------- hero ---------- */
  set("#heroLead", (el) => { el.textContent = D.person.tagline; });
  set("#heroPlace", (el) => { el.textContent = D.person.location; });
  set("#footPlace", (el) => { el.textContent = D.person.location; });
  set("#heroNow", (el) => { el.innerHTML = D.person.status.slice(0, 2).map(esc).join("<br>"); });
  $$(".cv-link").forEach((a) => { a.href = D.cvPdf; });

  // the box logo fills the row exactly, whatever the font and the width
  const logo = $(".box--xl"), logoIn = $(".box--xl .box__in");
  function fitLogo() {
    if (!logo || !logoIn) return;
    logo.style.fontSize = "100px";
    const w = logoIn.getBoundingClientRect().width;
    const cw = logo.parentElement.getBoundingClientRect().width;
    // box width = text + horizontal padding (.12em + .08em)
    logo.style.fontSize = Math.max(32, cw / (w / 100 + 0.2) - 0.5) + "px";
  }
  fitLogo();
  let rz;
  addEventListener("resize", () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(fitLogo); });
  const ready = () => { fitLogo(); root.classList.add("is-ready"); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve()).then(ready);

  /* ---------- work: filters ---------- */
  const tagCount = {};
  P.forEach((p) => tagsOf(p).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const TAGS = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a] || a.localeCompare(b));
  let filter = "All";
  set("#filters", (el) => {
    el.innerHTML = ["All", ...TAGS].map((t) =>
      `<button type="button" class="chk" data-filter="${esc(t)}" aria-pressed="${t === filter}"><i aria-hidden="true"></i>${esc(t)} <small>(${t === "All" ? P.length : tagCount[t]})</small></button>`
    ).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      filter = b.dataset.filter;
      $$("[data-filter]", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      applyFilter();
    });
  });
  function applyFilter() {
    let n = 0;
    $$(".card").forEach((c) => {
      const show = filter === "All" || c.dataset.tags.split("|").includes(filter);
      c.hidden = !show;
      if (show) c.style.setProperty("--i", n++);
    });
    set("#workCount", (el) => { el.textContent = `(${n})`; });
  }

  /* ---------- work: cards ---------- */
  set("#grid", (el) => {
    el.innerHTML = P.map((p, i) => `
      <li class="card" data-id="${esc(p.id)}" data-tags="${esc(tagsOf(p).join("|"))}" style="--i:${i}">
        <button type="button" class="card__btn" data-open="${esc(p.id)}" aria-label="Open project: ${esc(p.name)}">
          <span class="card__img">
            ${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="${i < 4 ? "eager" : "lazy"}" decoding="async" width="1200" height="1500">` : ""}
            <span class="card__status card__status--${esc(p.status)}"><i></i>${esc(STATUS[p.status] || p.status)}</span>
          </span>
          <span class="card__meta">
            <span class="card__no">${pad2(i + 1)}</span>
            <span class="card__name">${esc(p.name)}</span>
            <span class="card__kind">${esc(p.kind.split(" · ")[0])}</span>
            <span class="card__tags">${tagsOf(p).map((t) => `[${esc(t)}]`).join(" ")}</span>
            <span class="card__year">${esc(p.year)}</span>
          </span>
        </button>
      </li>`).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-open]");
      if (b) openProject(b.dataset.open, true);
    });
  });
  applyFilter();

  /* ---------- work: grid / list ---------- */
  const grid = $("#grid");
  function setView(v) {
    if (!grid) return;
    grid.dataset.view = v;
    $$("[data-view]").forEach((b) => { if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", String(b.dataset.view === v)); });
    try { localStorage.setItem("view", v); } catch (e) {}
    hideTag(); hidePeek();
  }
  $$("button[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  try { const v = localStorage.getItem("view"); if (v === "list" || v === "grid") setView(v); } catch (e) {}

  /* ---------- cursor tag (grid) + floating preview (list) ---------- */
  const tag = $("#tagCursor"), peek = $("#peek"), peekImg = $("#peek img");
  function hideTag() { if (tag) tag.classList.remove("is-on"); }
  function hidePeek() { if (peek) peek.classList.remove("is-on"); }
  if (finePointer && grid && tag && peek) {
    root.classList.add("has-tag");
    let x = 0, y = 0, raf = 0;
    const move = () => {
      raf = 0;
      tag.style.transform = `translate(${x}px, ${y}px) translate(-50%, -150%)`;
      peek.style.left = x + 24 + 110 + "px"; peek.style.top = y + "px";
    };
    grid.addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(move);
      const card = e.target.closest(".card");
      if (!card) { hideTag(); hidePeek(); return; }
      if (grid.dataset.view === "grid") {
        tag.classList.toggle("is-on", !!e.target.closest(".card__img"));
        hidePeek();
      } else {
        const p = P.find((q) => q.id === card.dataset.id);
        if (p && p.cover && peekImg.getAttribute("src") !== p.cover) peekImg.src = p.cover;
        peek.classList.toggle("is-on", !!(p && p.cover));
        hideTag();
      }
    });
    grid.addEventListener("pointerleave", () => { hideTag(); hidePeek(); });
  } else {
    root.classList.remove("has-tag");
  }

  /* ---------- project view ---------- */
  const pv = $("#pv");
  let current = -1, lastFocus = null, openedHere = false;

  function renderProject(i) {
    const p = P[i];
    const links = [...(p.links || [])];
    if (p.repo) links.push({ label: "Code on GitHub", url: `https://github.com/${D.github}/${p.repo}` });
    set("#pvPos", (el) => { el.textContent = `Project ${pad2(i + 1)} of ${pad2(P.length)}`; });
    set("#pvMeta", (el) => {
      el.innerHTML = `
        <dl><dt>Project</dt><dd><h2 id="pvTitle">${esc(p.name)}</h2></dd></dl>
        <dl><dt>Role</dt><dd>${esc(p.role)}</dd></dl>
        <dl><dt>Category</dt><dd>${tagsOf(p).map((t) => `[${esc(t)}]`).join(" ")}<br>${esc(p.kind)}</dd></dl>
        <dl><dt>Year</dt><dd>${esc(p.year)} · ${esc(STATUS[p.status] || p.status)}</dd>
          ${links[0] ? `<dd><a class="pv__visit u" href="${esc(links[0].url)}" target="_blank" rel="noopener">Visit ${esc(links[0].label)} ↗</a></dd>` : ""}</dl>`;
    });
    set("#pvMedia", (el) => {
      // wide shots span the row; portrait ones go two per row (the cover fills an odd gap)
      const coverFig = p.cover ? { src: p.cover, alt: "", w: 4, h: 5 } : null;
      let imgs = [...(p.images || [])];
      const narrow = imgs.filter((m) => m.h > m.w);
      if (coverFig && (narrow.length % 2 === 1 || !imgs.length)) imgs.splice(imgs.indexOf(narrow[0]) > -1 ? imgs.indexOf(narrow[0]) : imgs.length, 0, coverFig);
      el.innerHTML = imgs.map((m) => {
        const half = m.h > m.w, tall = m.h / m.w > 1.4;
        const img = `<img src="${esc(m.src)}" alt="${esc(m.alt || "")}" ${m.w > 10 ? `width="${m.w}" height="${m.h}"` : ""} decoding="async">`;
        return `<figure class="pv__fig${half ? " pv__fig--half" : ""}${tall ? " pv__fig--tall" : ""}">
          ${tall ? `<div class="pv__frame">${img}</div>` : img}
          ${m.alt ? `<figcaption>${esc(m.alt)}</figcaption>` : ""}
        </figure>`;
      }).join("");
    });
    set("#pvText", (el) => {
      el.innerHTML = `
        <p class="pv__sum">${esc(p.summary)}</p>
        <dl class="pv__dl">${p.metrics.map((m) => `<div><dt>${esc(m.k)}</dt><dd>${esc(m.v)}</dd></div>`).join("")}</dl>
        <dl class="pv__dl"><div><dt>Built with</dt></div>${p.stack.map((s) => `<div><dd>${esc(s)}</dd></div>`).join("")}</dl>
        ${links.length ? `<p>${links.map((l) => `<a class="u" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("<br>")}</p>` : ""}`;
    });
    const prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
    set("#pvPrev span", (el) => { el.textContent = `Previous: ${prev.name}`; });
    set("#pvNext span", (el) => { el.textContent = `Next: ${next.name}`; });
    set("#pvScroll", (el) => { el.scrollTop = 0; });
    document.title = `${p.name} — Zalan Birtalan`;
  }

  function openProject(id, fromClick) {
    const i = P.findIndex((p) => p.id === id);
    if (i < 0 || !pv) return;
    if (fromClick) {
      openedHere = true;
      history.pushState({ pv: id }, "", `#work/${id}`);
    }
    const wasOpen = !pv.hidden;
    current = i;
    renderProject(i);
    if (!wasOpen) {
      lastFocus = document.activeElement;
      pv.hidden = false;
      pv.classList.remove("is-opening"); void pv.offsetWidth; pv.classList.add("is-opening");
      document.body.classList.add("pv-open");
      hideTag(); hidePeek();
      set("#pvClose", (b) => b.focus({ preventScroll: true }));
    }
  }
  function closeProject(fromHistory) {
    if (!pv || pv.hidden) return;
    pv.hidden = true;
    document.body.classList.remove("pv-open");
    document.title = "Zalan Birtalan — Work";
    const id = P[current] && P[current].id;
    current = -1;
    if (!fromHistory) {
      if (openedHere) history.back();
      else history.replaceState(null, "", "#work");
    }
    openedHere = false;
    const card = id && $(`.card[data-id="${id}"] .card__btn`);
    (card || lastFocus || document.body).focus({ preventScroll: true });
  }
  function step(d) {
    if (current < 0) return;
    const i = (current + d + P.length) % P.length;
    history.replaceState({ pv: P[i].id }, "", `#work/${P[i].id}`);
    current = i;
    renderProject(i);
  }
  set("#pvClose", (b) => b.addEventListener("click", () => closeProject(false)));
  set("#pvPrev", (b) => b.addEventListener("click", () => step(-1)));
  set("#pvNext", (b) => b.addEventListener("click", () => step(1)));
  document.addEventListener("keydown", (e) => {
    if (!pv || pv.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closeProject(false); }
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Tab") { // keep focus inside the view
      const f = $$("a[href], button:not([disabled])", pv).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  function route(fromHistory) {
    const m = location.hash.match(/^#work\/([\w-]+)$/);
    if (m) openProject(m[1], false);
    else closeProject(fromHistory);
  }
  addEventListener("popstate", () => { openedHere = false; route(true); });
  route(true);

  /* ---------- GitHub repos ---------- */
  const rel = (date) => {
    const s = (Date.now() - new Date(date)) / 1000;
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
    for (const [u, n] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
      if (s >= n) return rtf.format(-Math.floor(s / n), u);
    }
    return "just now";
  };
  set("#ghProfile", (a) => { a.href = `https://github.com/${D.github}`; a.textContent = `github.com/${D.github} ↗`; });
  set("#repos", (el) => {
    el.innerHTML = [0, 1, 2].map(() => `<li class="repo repo--skel"><span><span>Loading…</span></span></li>`).join("");
    if (!window.GH) return;
    window.GH.repos(D.github).then((repos) => {
      const own = repos.filter((r) => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6);
      el.innerHTML = own.length ? own.map((r) => `
        <li class="repo"><a href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <span class="repo__name">${esc(r.name)}</span>
          <span class="repo__desc">${esc(r.description || r.language || "")}</span>
          <span class="repo__when">${esc(rel(r.pushed_at))} ↗</span>
        </a></li>`).join("") : `<li class="repo"><span>No public repositories yet.</span></li>`;
    }).catch(() => {
      el.innerHTML = `<li class="repo"><span><span>GitHub didn’t answer (rate limit). Reload in a few minutes, or <a class="u" href="https://github.com/${esc(D.github)}" target="_blank" rel="noopener">open the profile ↗</a></span></span></li>`;
    });
  });

  /* ---------- info ---------- */
  set("#about", (el) => { el.textContent = (D.person.about || D.person.tagline).replace("{age}", D.age); });
  set("#timeline", (el) => {
    el.innerHTML = [...D.timeline].reverse().map((t) =>
      `<li class="tbl__row${t.now ? " tbl__row--now" : ""}"><span>${esc(t.when)}</span><span>${esc(t.title)}</span><span>${esc(t.detail)}</span></li>`
    ).join("");
  });
  set("#stack", (el) => {
    el.innerHTML = D.stack.map((g) => `<div class="tbl__row"><dt>${esc(g.group)}</dt><dd>${g.items.map((it) =>
      `<span class="${it.level === "learning" ? "is-learning" : ""}">${esc(it.name)}</span>`).join("")}</dd></div>`).join("");
  });
  set("#interests", (el) => {
    el.innerHTML = D.interests.map((x, i) => `<li class="tbl__row"><span>${pad2(i + 1)}</span><span>${esc(x)}</span><span></span></li>`).join("");
  });

  /* ---------- contact ---------- */
  set("#mail", (a) => { a.href = `mailto:${D.contact.email}`; a.textContent = D.contact.email; });
  set("#links", (el) => {
    el.innerHTML = [
      ...D.contact.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`),
      `<li><a href="${esc(D.cvPdf)}" download>CV (PDF)</a></li>`
    ].join("");
  });
  set("#year", (el) => { el.textContent = new Date().getFullYear(); });
  set("#updated", (el) => { el.textContent = D.updated; });
  const toast = (msg) => set("#toast", (t) => {
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("is-on"), 1800);
  });
  set("#copyMail", (b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(D.contact.email); toast("Email copied"); }
    catch (e) { toast("Couldn’t copy. Select the address instead."); }
  }));

  /* ---------- clock ---------- */
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: D.timezone || "Europe/Budapest" });
  const tick = () => { const s = fmt.format(new Date()); $$(".js-clock").forEach((c) => { c.textContent = s; }); };
  tick(); setInterval(tick, 15000);

  /* ---------- theme ---------- */
  function paintTheme() {
    const t = root.getAttribute("data-theme");
    $$("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === t)));
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#ececE8" : "#151515";
  }
  $$("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
    root.setAttribute("data-theme", b.dataset.themeSet);
    try { localStorage.setItem("theme", b.dataset.themeSet); } catch (e) {}
    paintTheme();
    document.dispatchEvent(new CustomEvent("themechange"));
  }));
  paintTheme();

  /* ---------- active nav item ---------- */
  const navLinks = $$(".bar__nav a");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-on", a.dataset.nav === en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["work", "info", "activity", "contact"].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
