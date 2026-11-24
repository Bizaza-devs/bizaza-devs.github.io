/* ============================================================
   Portfolio v2 — renderelés a ../assets/js/data.js-ből + mozgás
   A tartalom GSAP nélkül is teljes; a GSAP csak ráadás.
   A Work activity szekciót a v2/activity.js tölti (#activityV2).
   ============================================================ */
(() => {
  const D = window.PORTFOLIO;
  const U = window.UI;
  if (!D || !U) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const set = (sel, fn) => { const el = $(sel); if (el) fn(el); }; // hiányzó elem ne állítsa le az oldalt
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const SECTIONS = ["index", "work", "about", "stack", "activity", "contact"];
  const ACCENTS = ["mint", "sky", "indigo", "rose", "amber"];
  const acc = (name, fallback = "amber") => `var(--${ACCENTS.includes(name) ? name : fallback})`;
  const school = D.education.find((e) => !e.to) || D.education[0];
  const CV = "../" + D.cvPdf; // a v2 egy mappával lejjebb van
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- renderelés ---------- */
  function render() {
    $$("[data-ui]").forEach((el) => { if (U[el.dataset.ui] != null) el.textContent = U[el.dataset.ui]; });
    $$(".cv-link").forEach((a) => { a.href = CV; });

    set("#navLinks", (el) => { el.innerHTML = SECTIONS.map((id, i) => `<li><a href="#${id}" data-nav="${id}">${esc(U.nav[i])}</a></li>`).join(""); });
    set("#sheetLinks", (el) => {
      el.innerHTML = SECTIONS.map((id, i) => `<li><a href="#${id}" data-nav="${id}" style="--i:${i}"><small>${pad2(i)}</small>${esc(U.nav[i])}</a></li>`).join("");
    });
    set("#sheetSocial", (el) => {
      el.innerHTML = [
        ...D.contact.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`),
        ...(D.contact.email ? [`<a href="mailto:${esc(D.contact.email)}">Email ↗</a>`] : [])
      ].join("");
    });

    // hero — betűnként, hogy mozoghasson
    const [first, ...rest] = D.person.name.split(" ");
    let n = 0;
    const letters = (w) => [...w].map((c) => `<span class="ch" style="--i:${n++}">${esc(c)}</span>`).join("");
    set("#heroName", (el) => {
      el.setAttribute("aria-label", D.person.name);
      el.innerHTML = `<span class="ln ln--1" aria-hidden="true">${letters(first)}</span><span class="ln ln--2" aria-hidden="true">${letters(rest.join(" "))}</span>`;
    });
    set("#heroChip", (el) => { el.textContent = `${school.detail.split(" · ")[0]} · ${school.place}`; });
    set("#heroRole", (el) => { el.textContent = D.person.role; });
    set("#heroTagline", (el) => { el.textContent = D.person.tagline; });
    set("#heroRot", (el) => { el.textContent = (D.person.builds || [""])[0]; });
    set("#idName", (el) => { el.textContent = D.person.name; });

    set("#idcard", (el) => {
      const rows = [
        ["Age", `${D.age}`],
        ["Base", D.person.location],
        ["School", `${school.short || school.school.split(" ")[0]} · ${school.place}`],
        ["Building", "ALAN BIRTH", "hl"],
        ["Local", `<span id="clock" class="js-clock-s">--:--:--</span>`]
      ];
      el.innerHTML = rows.map(([k, v, c]) => `<div><dt>${k}</dt><dd${c ? ` class="${c}"` : ""}>${k === "Local" ? v : esc(v)}</dd></div>`).join("");
    });
    set("#heroStatus", (el) => {
      el.innerHTML = D.person.status.map((s, i, a) => `<div>${esc(s)}${i === a.length - 1 ? '<span class="caret"></span>' : ""}</div>`).join("");
    });

    // futó szalag
    set("#marquee", (el) => {
      const words = ["ALAN BIRTH", ...D.stack.flatMap((g) => g.items.map((i) => i.name)).filter((x) => !/—/.test(x)), "Collection 01 — FW26", "Budapest"];
      const run = words.map((w) => `<span>${esc(w)}</span><span class="star">✲</span>`).join("");
      el.innerHTML = run + run; // kétszer, hogy végtelenül fusson
    });

    // számok — kilométeróra
    set("#stats", (el) => {
      el.innerHTML = D.stats.map((s, i) => {
        const v = s.value === "age" ? D.age : s.value;
        return `<div class="stat reveal" style="--stat-c:${acc(s.color)}">
          <div class="stat__k mono"><span>${pad2(i + 1)}</span><span>${esc(s.label)}</span></div>
          <div class="stat__v">${odometer(v)}${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</div>
          <div class="stat__n">${esc(s.note)}</div>
        </div>`;
      }).join("");
    });

    // projektek
    set("#projects", (el) => {
      el.innerHTML = D.projects.map((p, i) => {
        const links = [...(p.links || [])];
        if (p.repo) links.push({ label: "GitHub", url: `https://github.com/${D.github}/${p.repo}` });
        return `<article class="project${i === 0 ? " project--feature" : ""} reveal" id="p-${esc(p.id)}" style="--accent-p:${acc(p.accent)};--i:${i}">
          <span class="project__ghost" aria-hidden="true">${pad2(i + 1)}</span>
          ${i === 0 ? `<div class="note note--feature" aria-hidden="true"><span class="hand">the big one</span><svg class="draw" viewBox="0 0 60 40" width="60" height="40"><path pathLength="1" d="M4 6c18 2 36 10 48 26"/><path pathLength="1" d="M42 30l10 4 1-11"/></svg></div>` : ""}
          <div class="project__main">
            <div class="project__top mono">
              <span class="project__num">${pad2(i + 1)}</span>
              <span class="pill pill--${esc(p.status)}"><i></i>${esc(U.status[p.status])} · ${esc(p.year)}</span>
            </div>
            <h3 class="project__name">${esc(p.name)}</h3>
            <div class="project__kind mono">${esc(p.kind)}</div>
            <p class="project__sum">${esc(p.summary)}</p>
            <p class="project__role"><b>${esc(U.role)}:</b> ${esc(p.role)}</p>
          </div>
          <div class="project__side">
            <div class="project__metrics">${p.metrics.map((m) => `<div><div class="metric__v">${esc(m.v)}</div><div class="metric__k mono">${esc(m.k)}</div></div>`).join("")}</div>
            <div class="tags">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
            ${links.length ? `<div class="project__links">${links.map((l) => `<a class="magnetic" href="${esc(l.url)}" target="_blank" rel="noopener" data-cursor="open">${esc(l.label)} ↗</a>`).join("")}</div>` : ""}
          </div>
        </article>`;
      }).join("");
    });
    set("#ghRepoList", (el) => {
      el.innerHTML = [0, 1, 2].map(() => `<li class="repo repo--skel" aria-hidden="true"><span class="repo__name"></span></li>`).join("");
    });

    // rólam + idővonal — a bevezető szavanként (görgetésre "kigyullad")
    set("#aboutLead", (el) => {
      const text = (D.person.about || D.person.tagline).replace("{age}", D.age);
      el.setAttribute("aria-label", text);
      el.innerHTML = text.split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? w : `<span class="w" aria-hidden="true">${/ALAN|BIRTH/.test(w) ? `<em>${esc(w)}</em>` : esc(w)}</span>`)).join("");
    });
    set("#aboutNow", (el) => { el.innerHTML = D.person.status.map((s) => `<li>${esc(s)}</li>`).join(""); });
    const stickerC = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--rose)", "var(--sky)"];
    set("#aboutInterests", (el) => {
      el.innerHTML = (D.interests || []).map((s, i) => `<span style="--s-c:${stickerC[i % stickerC.length]};--r:${[-4, 3, -2, 5, -3][i % 5]}deg">${esc(s)}</span>`).join("");
    });
    set("#timeline", (el) => {
      el.insertAdjacentHTML("beforeend", (D.timeline || []).map((t) => `
        <li class="tl reveal${t.now ? " is-now" : ""}" style="--tl-c:${acc(t.accent, "sky")}">
          <div class="tl__when">${esc(t.when)}</div>
          <div class="tl__title">${esc(t.title)}${t.now ? `<span class="tl__now">${esc(U.status.building)}</span>` : ""}</div>
          <div class="tl__detail">${esc(t.detail)}</div>
        </li>`).join(""));
    });

    // tudás
    set("#legend", (el) => { el.innerHTML = ["using", "learning"].map((l) => `<span><i class="lv lv--${l}"></i>${esc(U.levels[l])}</span>`).join(""); });
    set("#stackGrid", (el) => {
      el.innerHTML = D.stack.map((g, gi) => `
        <div class="skill-row reveal">
          <h3>${esc(g.group)}<small>${pad2(gi + 1)} · ${g.items.length}</small></h3>
          <div class="skill-row__items">${g.items.map((it) => `<span class="skill" data-level="${esc(it.level)}" title="${esc(U.levels[it.level])}"><i class="lv lv--${esc(it.level)}"></i>${esc(it.name)}</span>`).join("")}</div>
        </div>`).join("");
    });

    // kapcsolat
    const c = D.contact;
    set("#contactMail", (el) => {
      if (c.email) { el.href = `mailto:${c.email}`; el.textContent = c.email; }
      else { el.closest(".contact__mailrow")?.remove(); }
    });
    set("#contactLinks", (el) => {
      el.innerHTML = [
        `<a class="btn btn--solid magnetic" href="${esc(CV)}" download data-cursor="pdf">${esc(U.cv)} <span class="mono">PDF ↓</span></a>`,
        ...c.links.map((l) => `<a class="btn btn--ghost magnetic" href="${esc(l.url)}" target="_blank" rel="noopener" data-cursor="open">${esc(l.label)} ↗</a>`)
      ].join("");
    });

    set("#ghProfile", (el) => { el.href = `https://github.com/${D.github}`; el.textContent = `@${D.github}`; });
    set("#updated", (el) => { el.textContent = D.updated; });
  }

  // kilométeróra: minden számjegy egy 0–9 0–9 szalag, ami a helyére gördül
  function odometer(v) {
    const s = String(v);
    const strip = Array.from({ length: 20 }, (_, i) => `<span>${i % 10}</span>`).join("");
    return `<span class="odo" data-odo aria-label="${esc(s)}" role="img">${[...s].map((ch, k) => /\d/.test(ch)
      ? `<span class="odo__d" aria-hidden="true"><span class="odo__s" style="--d:${10 + Number(ch)};--k:${k}">${strip}</span></span>`
      : `<span aria-hidden="true">${esc(ch)}</span>`).join("")}</span>`;
  }

  // gördülés után sima szövegre cseréli (a számjegyek ne álljanak szét)
  function settleOdo(el) {
    const plain = () => { el.textContent = el.getAttribute("aria-label"); el.role = null; el.classList.add("is-done"); };
    if (reduced) { plain(); return; }
    el.classList.add("is-run");
    setTimeout(plain, 1900 + $$(".odo__s", el).length * 110 + 80);
  }

  /* ---------- óra ---------- */
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const fmtShort = new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, hour: "2-digit", minute: "2-digit", hour12: false });
  function tick() {
    const now = new Date();
    set("#clock", (el) => { el.textContent = fmt.format(now) + " CET"; });
    $$(".js-clock").forEach((el) => { el.textContent = `${D.person.location.split(",")[0]} ${fmtShort.format(now)}`; });
  }

  /* ---------- "I build …" forgó szó ---------- */
  function rotator() {
    const el = $("#heroRot"), words = D.person.builds || [];
    if (!el || words.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % words.length;
      if (reduced) { el.textContent = words[i]; return; }
      el.classList.remove("is-in"); el.classList.add("is-out");
      setTimeout(() => { el.textContent = words[i]; el.classList.remove("is-out"); void el.offsetWidth; el.classList.add("is-in"); }, 340);
    }, 2600);
  }

  /* ---------- téma (localStorage "theme", különben a rendszert követi) ---------- */
  const metaTheme = $('meta[name="theme-color"]');
  const sysLight = matchMedia("(prefers-color-scheme: light)");
  function applyTheme(t, save, announce) {
    root.setAttribute("data-theme", t);
    if (metaTheme) metaTheme.content = t === "light" ? "#f2ede5" : "#0b0c10";
    $$(".theme-btn").forEach((b) => b.setAttribute("aria-pressed", String(t === "light")));
    if (save) { try { localStorage.setItem("theme", t); } catch (e) { /* privát mód */ } }
    if (announce) document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }));
  }
  const toggleTheme = () => applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true, true);
  applyTheme(root.getAttribute("data-theme") || "dark", false, false);
  sysLight.addEventListener?.("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) { /* */ }
    if (saved !== "light" && saved !== "dark") applyTheme(e.matches ? "light" : "dark", false, true);
  });
  $$(".theme-btn").forEach((b) => b.addEventListener("click", () => {
    toggleTheme();
    $$("svg", b).forEach((s) => { s.style.animation = "none"; void s.getBoundingClientRect(); s.style.animation = ""; });
  }));

  /* ---------- telefonos menü ---------- */
  const sheet = $("#sheet"), menuBtn = $("#menuBtn");
  function setMenu(open) {
    if (!sheet || !menuBtn) return;
    sheet.classList.toggle("is-open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    root.classList.toggle("no-scroll", open);
    if ("inert" in sheet) sheet.inert = !open;
  }
  if (sheet && menuBtn) {
    if ("inert" in sheet) sheet.inert = true;
    menuBtn.addEventListener("click", () => setMenu(!sheet.classList.contains("is-open")));
    sheet.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    addEventListener("resize", () => { if (innerWidth > 820 && sheet.classList.contains("is-open")) setMenu(false); });
  }

  /* ---------- toast + e-mail másolás ---------- */
  const toastEl = $("#toast");
  let toastT = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add("is-show");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
  }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(D.contact.email); toast(U.copied); }
    catch (e) { toast(U.copyFail); }
  }
  set("#copyMail", (b) => b.addEventListener("click", copyEmail));

  /* ---------- megjelenés görgetéskor (GSAP nélkül is) ---------- */
  function observe() {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target;
      if (t.classList.contains("reveal")) { t.classList.add("is-in"); setTimeout(() => t.classList.add("is-settled"), 1100); }
      if (t.matches(".note, .draw")) t.classList.add("is-drawn");
      if (t.matches("[data-odo]")) settleOdo(t);
      io.unobserve(t);
    }), { threshold: 0.12 });
    $$(".reveal:not(.is-in), .note, .contact__swash, [data-odo]").forEach((el) => io.observe(el));
  }

  /* ---------- kurzor + mágneses gombok + "lélegző" név (csak egérrel) ---------- */
  function pointerFx() {
    if (reduced || !finePointer) return;
    root.classList.add("has-cursor");
    const cur = $(".cursor"), label = $(".cursor__label");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const LABELS = { open: "open ↗", pdf: "PDF ↓", copy: "copy", write: "write", theme: "flip" };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      const t = e.target.closest?.("a, button, [data-cursor], .skill, .repo, input");
      const lab = t?.closest("[data-cursor]")?.dataset.cursor;
      cur.classList.toggle("is-label", !!lab);
      cur.classList.toggle("is-hover", !!t && !lab);
      cur.classList.toggle("is-hidden", !!e.target.closest?.("input"));
      if (lab) label.textContent = LABELS[lab] || lab;
    }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("pointerenter", () => cur.classList.remove("is-hidden"));

    // mágneses elemek: finoman a kurzor felé húzódnak
    document.addEventListener("pointermove", (e) => {
      const m = e.target.closest?.(".magnetic");
      $$(".magnetic.is-pull").forEach((el) => { if (el !== m) { el.classList.remove("is-pull"); el.style.transform = ""; } });
      if (!m) return;
      const r = m.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      m.classList.add("is-pull");
      m.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    }, { passive: true });

    // név: a kurzorhoz közeli betűk elvékonyodnak és összeszűkülnek
    const hero = $(".hero"), chars = $$(".hero__name .ch");
    let hraf = 0, hx = 0, hy = 0;
    const breathe = () => {
      hraf = 0;
      chars.forEach((ch) => {
        const r = ch.getBoundingClientRect();
        const d = Math.hypot(hx - (r.left + r.width / 2), hy - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 260);
        ch.style.setProperty("--w", Math.round(800 - k * 560));
        ch.style.setProperty("--wd", Math.round(100 - k * 25));
        ch.classList.toggle("is-hot", k > 0.55);
      });
    };
    hero?.addEventListener("pointermove", (e) => { hx = e.clientX; hy = e.clientY; if (!hraf) hraf = requestAnimationFrame(breathe); }, { passive: true });
    hero?.addEventListener("pointerleave", () => chars.forEach((ch) => { ch.style.setProperty("--w", 800); ch.style.setProperty("--wd", 100); ch.classList.remove("is-hot"); }));

    // címke: enyhe 3D-billenés
    set("#label", (lb) => {
      lb.addEventListener("pointermove", (e) => {
        const r = lb.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        lb.style.transform = `perspective(700px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) rotate(0deg)`;
      });
      lb.addEventListener("pointerleave", () => { lb.style.transform = ""; });
    });
  }

  /* ---------- görgetés: gyűrű, aktív menüpont, fejléc, szalag-sebesség ---------- */
  const toTop = $(".to-top"), ring = $(".to-top__ring"), top = $(".top");
  const RING = 2 * Math.PI * 21;
  function setActive() {
    const y = scrollY + innerHeight * 0.35;
    let cur = SECTIONS[0];
    SECTIONS.forEach((id) => { const s = document.getElementById(id); if (s && s.offsetTop <= y) cur = id; });
    $$("[data-nav]").forEach((a) => {
      const on = a.dataset.nav === cur;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  let lastY = scrollY, vel = 0, mAnim = null, mraf = 0;
  function marqueeSpeed() {
    // a szalag a görgetés irányába és sebességével fut, aztán visszaáll
    if (reduced) return;
    if (!mAnim) mAnim = $("#marquee")?.getAnimations?.()[0];
    if (!mAnim) return;
    vel *= 0.9;
    const dir = vel < -0.5 ? -1 : 1;
    mAnim.playbackRate = dir * (1 + Math.min(8, Math.abs(vel) * 0.12));
    mraf = Math.abs(vel) > 0.05 ? requestAnimationFrame(marqueeSpeed) : 0;
    if (!mraf) mAnim.playbackRate = dir;
  }
  function onScroll() {
    const max = root.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    if (ring) ring.style.strokeDashoffset = String(RING * (1 - p));
    toTop?.classList.toggle("is-show", scrollY > 600);
    top?.classList.toggle("is-scrolled", scrollY > 10);
    vel += scrollY - lastY; lastY = scrollY;
    if (!mraf) mraf = requestAnimationFrame(marqueeSpeed);
    setActive();
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- parancspaletta: Ctrl K / ⌘K / "/" ---------- */
  const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
  let sel = 0, items = [], lastFocus = null;
  const commands = () => [
    ...SECTIONS.map((id, i) => ({ label: U.nav[i], hint: "#" + id, run: () => document.getElementById(id).scrollIntoView() })),
    ...D.projects.map((p) => ({ label: p.name, hint: p.kind, run: () => document.getElementById("p-" + p.id).scrollIntoView({ block: "start" }) })),
    { label: U.toggleTheme, hint: root.getAttribute("data-theme") === "light" ? U.themeDark : U.themeLight, run: toggleTheme },
    { label: U.cv, hint: "PDF", run: () => { const a = document.createElement("a"); a.href = CV; a.download = ""; a.click(); } },
    { label: "GitHub ↗", hint: "@" + D.github, run: () => open(`https://github.com/${D.github}`, "_blank", "noopener") },
    ...(D.contact.email ? [
      { label: "Email ↗", hint: D.contact.email, run: () => (location.href = "mailto:" + D.contact.email) },
      { label: "Copy email", hint: "clipboard", run: copyEmail }
    ] : [])
  ];
  function drawPalette() {
    const q = pin.value.trim().toLowerCase();
    items = commands().filter((c) => !q || (c.label + " " + c.hint).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    plist.innerHTML = items.map((c, i) => `<li role="option" data-i="${i}" aria-selected="${i === sel}" class="${i === sel ? "is-sel" : ""}"><span>${esc(c.label)}</span><span>${esc(c.hint)}</span></li>`).join("");
    plist.querySelector(".is-sel")?.scrollIntoView({ block: "nearest" });
  }
  function openPalette() { lastFocus = document.activeElement; pal.hidden = false; pin.value = ""; pin.placeholder = U.palette; sel = 0; drawPalette(); pin.focus(); }
  function closePalette() { pal.hidden = true; lastFocus?.focus?.(); }
  function runSel() { const c = items[sel]; closePalette(); c?.run(); }
  if (pal && pin && plist) {
    pin.addEventListener("input", () => { sel = 0; drawPalette(); });
    plist.addEventListener("click", (e) => { const li = e.target.closest("li"); if (li) { sel = +li.dataset.i; runSel(); } });
    pal.addEventListener("click", (e) => { if (e.target === pal) closePalette(); });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet?.classList.contains("is-open")) { setMenu(false); menuBtn?.focus(); return; }
    if (!pal || !pin || !plist) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPalette() : closePalette(); return; }
    if (pal.hidden) { if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); openPalette(); } return; }
    if (e.key === "Escape") closePalette();
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, items.length); drawPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(1, items.length); drawPalette(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(); }
  });

  /* ---------- legújabb nyilvános repók (GitHub) ---------- */
  function rel(date) {
    const s = (Date.now() - new Date(date)) / 1000;
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
    for (const [u, n] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
      if (s >= n) return rtf.format(-Math.floor(s / n), u);
    }
    return rtf.format(0, "second");
  }
  function renderRepos(repos) {
    // csak a legújabb nyilvános projektek: létrehozás szerint, a profil-README repó nélkül
    const list = (repos || [])
      .filter((r) => !r.fork && r.name.toLowerCase() !== D.github.toLowerCase())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
    set("#ghRepoList", (el) => {
      el.innerHTML = list.length ? list.map((r) => `
        <li><a class="repo" href="${esc(r.html_url)}" target="_blank" rel="noopener" data-cursor="open">
          <span class="repo__name">${esc(r.name)}</span>
          <span class="repo__desc">${esc(r.description || "—")}</span>
          <span class="repo__meta"><span class="repo__lang">${esc(r.language || "")}</span><span>★ ${r.stargazers_count}</span><span>${rel(r.created_at)}</span><span class="repo__arrow" aria-hidden="true">↗</span></span>
        </a></li>`).join("") : `<li class="repo repo--empty">${esc(U.noRepos)}</li>`;
    });
  }
  async function loadRepos() {
    try { renderRepos(await window.GH.repos(D.github)); }
    catch (e) { set("#ghRepoList", (el) => { el.innerHTML = `<li class="repo repo--empty">${esc(U.ghError)}</li>`; }); }
  }

  /* ---------- GSAP-ráadás (ha betöltött és szabad mozogni) ---------- */
  function gsapFx() {
    const g = window.gsap, ST = window.ScrollTrigger;
    if (reduced || !g || !ST) return;
    g.registerPlugin(ST);
    root.classList.add("gsap");
    const mm = g.matchMedia();

    // a bevezető szövege szavanként gyullad ki görgetésre
    const words = $$("#aboutLead .w");
    if (words.length) {
      g.fromTo(words, { opacity: 0.16 }, {
        opacity: 1, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: "#aboutLead", start: "top 80%", end: "bottom 45%", scrub: 0.6 }
      });
    }

    // név: a két sor szétcsúszik görgetéskor
    g.to(".hero__name .ln--1", { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    g.to(".hero__name .ln--2", { xPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // idővonal: a sín kirajzolódik
    g.fromTo(".timeline__rail span", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 75%", end: "bottom 60%", scrub: 0.5 } });

    // nagy címek: enyhe „rugós” beúszás
    $$(".shead__title").forEach((h) => {
      g.fromTo(h, { yPercent: 30, skewY: 4 }, { yPercent: 0, skewY: 0, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 92%", end: "top 55%", scrub: 0.8 } });
    });

    // kapcsolat-cím: felnagyul ahogy beér
    g.fromTo("#contactTitle", { scale: 0.86, transformOrigin: "0% 100%" }, { scale: 1, ease: "none", scrollTrigger: { trigger: "#contactTitle", start: "top 100%", end: "top 45%", scrub: 0.6 } });

    // egymásra csúszó projektkártyák: a hátsó kicsit hátrébb lép
    mm.add("(min-width: 900px) and (min-height: 720px)", () => {
      const cards = $$(".project");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        g.to(card, {
          scale: 0.95, filter: "brightness(.8)", ease: "none",
          scrollTrigger: { trigger: next, start: "top 80%", end: "top 25%", scrub: true }
        });
      });
    });
    // a webbetűk / GitHub-adat után újramérés
    document.fonts?.ready.then(() => ST.refresh());
  }

  /* ---------- indulás ---------- */
  render();
  tick(); setInterval(tick, 1000);
  rotator();
  // a hero azonnal beúszik
  setTimeout(() => $$(".hero .reveal").forEach((el, i) => setTimeout(() => el.classList.add("is-in"), 250 + i * 110)), 60);
  observe();
  // biztonsági háló: ami 2,5 mp múlva is látótérben van, az mindenképp megjelenik
  setTimeout(() => $$(".reveal:not(.is-in)").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in"); }), 2500);
  pointerFx();
  onScroll();
  gsapFx();
  // a GitHub-adat csak akkor töltődik, amikor a lap közel ér hozzá (kíméli a lekérési limitet)
  const ghIO = new IntersectionObserver((ents) => {
    if (ents.some((e) => e.isIntersecting)) { ghIO.disconnect(); loadRepos().then(() => window.ScrollTrigger?.refresh()); }
  }, { rootMargin: "800px" });
  ghIO.observe($("#work"));
})();
