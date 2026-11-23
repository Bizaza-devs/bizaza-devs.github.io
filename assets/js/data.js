/* ============================================================
   PORTFOLIO DATA — minden tartalom itt van, az oldal ebből épül.
   Szerkesztéshez csak ezt a fájlt kell átírni.
   Ahol `null` vagy üres string áll, az a rész nem jelenik meg.
   ============================================================ */

window.PORTFOLIO = {
  github: "Bizaza-devs",
  timezone: "Europe/Budapest",
  updated: "2026-11-23",

  person: {
    name: { en: "Zalan Birtalan", hu: "Birtalan Zalan" },
    handle: "bizaza",
    location: { en: "Diósd · Budapest area, HU", hu: "Diósd · Budapest mellett" },
    role: {
      en: "Student developer · founder of ALAN BIRTH",
      hu: "Diák fejlesztő · az ALAN BIRTH alapítója"
    },
    tagline: {
      en: "I build things on the web — a streetwear brand, the store it runs on, and the systems behind both. Next stop: KTH, Stockholm.",
      hu: "Weben építek: egy streetwear brandet, a webshopot, amin fut, és a rendszereket mögöttük. A következő cél: KTH, Stockholm."
    },
    status: [
      { en: "building ALAN BIRTH · Collection 01 — FW26", hu: "ALAN BIRTH építése · Collection 01 — FW26" },
      { en: "learning full-stack web development", hu: "full-stack webfejlesztést tanulok" },
      { en: "target: KTH Royal Institute of Technology, 2028", hu: "cél: KTH Royal Institute of Technology, 2028" }
    ]
  },

  /* Valós számok a second brainből (2026-11-23). */
  stats: [
    { value: 26, label: { en: "theme versions shipped", hu: "kiadott témaverzió" }, note: "alanbirth.com" },
    { value: 226, label: { en: "notes in my second brain", hu: "jegyzet a second brainemben" }, note: "Obsidian" },
    { value: 4, label: { en: "projects live or in progress", hu: "élő vagy készülő projekt" }, note: "2025–26" },
    { value: 4, label: { en: "age I started ice hockey", hu: "éves korom óta hokizom" }, note: "ice hockey" }
  ],

  /* status: live | building | planned */
  projects: [
    {
      id: "alanbirth",
      name: "ALAN BIRTH",
      year: "2025 —",
      status: "building",
      kind: { en: "Brand · E-commerce", hu: "Brand · E-commerce" },
      summary: {
        en: "My own streetwear brand, run end to end: identity, labels, production, the Shopify store and the launch of Collection 01 — FW26.",
        hu: "A saját streetwear brandem, elejétől a végéig: arculat, címkék, gyártás, Shopify-webshop és a Collection 01 — FW26 launch."
      },
      role: { en: "Founder — design, development, operations", hu: "Alapító — dizájn, fejlesztés, működtetés" },
      stack: ["Shopify", "Liquid", "CSS", "JavaScript", "Branding"],
      metrics: [
        { k: { en: "collection", hu: "kollekció" }, v: "01 · FW26" },
        { k: { en: "label system", hu: "címkerendszer" }, v: "v2" }
      ],
      links: [{ label: "alanbirth.com", url: "https://alanbirth.com" }],
      repo: null
    },
    {
      id: "theme",
      name: "alanbirth.com — Theme",
      year: "2025 —",
      status: "live",
      kind: { en: "Shopify OS 2.0 theme", hu: "Shopify OS 2.0 téma" },
      summary: {
        en: "Custom storefront theme with a liquid-glass mobile layer: capsule header, product scroller, cart card. Strict semantic versioning, every change documented.",
        hu: "Egyedi webshop-téma liquid glass telefonos réteggel: kapszula-fejléc, termékgörgető, kosárkártya. Szigorú verziózás, minden változás dokumentálva."
      },
      role: { en: "Front-end development", hu: "Front-end fejlesztés" },
      stack: ["Liquid", "CSS", "JavaScript", "Shopify CLI"],
      metrics: [
        { k: { en: "versions", hu: "verzió" }, v: "26" },
        { k: { en: "latest", hu: "legújabb" }, v: "v1.10.0" }
      ],
      links: [{ label: "alanbirth.com", url: "https://alanbirth.com" }],
      repo: null
    },
    {
      id: "secondbrain",
      name: "Second Brain",
      year: "2026",
      status: "live",
      kind: { en: "Knowledge system · Automation", hu: "Tudásrendszer · Automatizálás" },
      summary: {
        en: "A single Obsidian vault wired to Claude Code: seven root folders, per-project context files, hooks that write a log after every session, vetted skills.",
        hu: "Egyetlen Obsidian-széf Claude Code-dal összekötve: hét gyökérmappa, projektenkénti kontextusfájl, minden munkamenet után naplót író hookok, átnézett skillek."
      },
      role: { en: "System design", hu: "Rendszertervezés" },
      stack: ["Markdown", "Obsidian", "Claude Code", "Hooks", "Git"],
      metrics: [
        { k: { en: "notes", hu: "jegyzet" }, v: "226" },
        { k: { en: "root folders", hu: "gyökérmappa" }, v: "7" }
      ],
      links: [],
      repo: null
    },
    {
      id: "portfolio",
      name: "This portfolio",
      year: "2026",
      status: "live",
      kind: { en: "Website", hu: "Weboldal" },
      summary: {
        en: "Zero images, zero frameworks. Monochrome liquid glass in plain HTML, CSS and JavaScript, with live data from the GitHub API.",
        hu: "Nulla kép, nulla keretrendszer. Monokróm liquid glass sima HTML-ben, CSS-ben és JavaScriptben, élő adatokkal a GitHub API-ból."
      },
      role: { en: "Design & development", hu: "Dizájn és fejlesztés" },
      stack: ["HTML", "CSS", "JavaScript", "GitHub API", "GitHub Pages"],
      metrics: [
        { k: { en: "images", hu: "kép" }, v: "0" },
        { k: { en: "dependencies", hu: "függőség" }, v: "0" }
      ],
      links: [],
      repo: "bizaza-devs.github.io"
    },
    {
      id: "hockey",
      name: "Hockey Stats",
      year: "2027",
      status: "planned",
      kind: { en: "Full-stack app", hu: "Full-stack app" },
      summary: {
        en: "Games, goals, assists, practice load and progress charts for players and a whole team — built for the sport I have played since I was four.",
        hu: "Meccsek, gólok, gólpasszok, edzésterhelés és fejlődés-grafikonok játékosnak és csapatnak — a sporthoz, amit négyéves korom óta űzök."
      },
      role: { en: "Solo project", hu: "Saját projekt" },
      stack: ["React", "Node.js", "SQL"],
      metrics: [{ k: { en: "phase", hu: "fázis" }, v: "spec" }],
      links: [],
      repo: null
    }
  ],

  /* level: using | learning | next */
  stack: [
    {
      group: { en: "Front-end", hu: "Front-end" },
      items: [
        { name: "HTML", level: "using" },
        { name: "CSS", level: "using" },
        { name: "JavaScript", level: "learning" },
        { name: "Liquid", level: "using" },
        { name: "React", level: "next" }
      ]
    },
    {
      group: { en: "Platforms & tools", hu: "Platformok, eszközök" },
      items: [
        { name: "Shopify", level: "using" },
        { name: "Git", level: "learning" },
        { name: "GitHub", level: "learning" },
        { name: "Obsidian", level: "using" },
        { name: "Claude Code", level: "using" }
      ]
    },
    {
      group: { en: "Back-end & data", hu: "Back-end, adat" },
      items: [
        { name: "Node.js", level: "next" },
        { name: "SQL", level: "next" },
        { name: "Python", level: "next" }
      ]
    },
    {
      group: { en: "Beyond code", hu: "Kódon túl" },
      items: [
        { name: "Brand design", level: "using" },
        { name: "E-commerce ops", level: "using" },
        { name: "Production", level: "learning" },
        { name: "English", level: "learning" }
      ]
    }
  ],

  /* state: done | now | next */
  education: [
    {
      when: "2026",
      state: "now",
      title: { en: "Secondary school — Mathematics & Informatics specialisation", hu: "Gimnázium — matematika és informatika fakultáció" },
      detail: { en: "School name to be added.", hu: "Az iskola neve: kitöltendő." }
    },
    {
      when: "2026 —",
      state: "now",
      title: { en: "The Web Developer Bootcamp · The Complete JavaScript Course", hu: "The Web Developer Bootcamp · The Complete JavaScript Course" },
      detail: { en: "Udemy — HTML, CSS, JavaScript, React, Node.js. Alongside: freeCodeCamp certifications.", hu: "Udemy — HTML, CSS, JavaScript, React, Node.js. Mellette: freeCodeCamp-certek." }
    },
    {
      when: "2027 · 01",
      state: "next",
      title: { en: "Physics specialisation", hu: "Fizika fakultáció" },
      detail: { en: "Added for the KTH entry requirements.", hu: "A KTH felvételi feltételei miatt." }
    },
    {
      when: "2027 · 05",
      state: "next",
      title: { en: "Early matura — Informatics & English", hu: "Előrehozott érettségi — informatika és angol" },
      detail: { en: "Followed by advanced-level Informatics in autumn 2027.", hu: "Utána emelt informatika 2027 őszén." }
    },
    {
      when: "2028 · 02",
      state: "next",
      title: { en: "IELTS Academic — target 6.5", hu: "IELTS Academic — cél: 6.5" },
      detail: { en: "Plus advanced-level Mathematics matura in May 2028.", hu: "Plusz emelt matematika érettségi 2028 májusában." }
    },
    {
      when: "2028 · 08",
      state: "next",
      title: { en: "BSc — KTH ICT · Gothenburg SEM · ELTE CS", hu: "BSc — KTH ICT · Göteborg SEM · ELTE PTI" },
      detail: { en: "Three planned routes, one destination.", hu: "Három terv, egy cél." }
    },
    {
      when: "2031",
      state: "next",
      title: { en: "MSc — KTH Computer Science", hu: "MSc — KTH Computer Science" },
      detail: { en: "Ranked: Computer Science · Technology-based Entrepreneurship · Interactive Media Technology · Machine Learning.", hu: "Sorrend: Computer Science · Technology-based Entrepreneurship · Interactive Media Technology · Machine Learning." }
    }
  ],

  contact: {
    email: "",            // pl. "valami@gmail.com" — üresen nem jelenik meg
    links: [
      { label: "GitHub", url: "https://github.com/Bizaza-devs" },
      { label: "alanbirth.com", url: "https://alanbirth.com" }
    ]
  }
};

/* Felületi szövegek */
window.UI = {
  en: {
    nav: ["Index", "Work", "Stack", "Path", "GitHub", "Contact"],
    now: "Now",
    local: "Local time",
    work: "Selected work",
    workSub: "Things I have built, am building, or will build next.",
    stack: "Knowledge",
    stackSub: "No percentages — just what I use daily, what I am learning, and what comes next.",
    levels: { using: "Using", learning: "Learning", next: "Next" },
    path: "Path",
    pathSub: "Where I am, and the plan to Stockholm.",
    gh: "GitHub activity",
    ghSub: "Live from the GitHub API.",
    contributions: "contributions in the last year",
    repos: "Repositories",
    stars: "Stars",
    followers: "Followers",
    languages: "Languages",
    recent: "Recent activity",
    noActivity: "No public activity yet — first commits incoming.",
    noRepos: "No public repositories yet.",
    ghError: "GitHub API unreachable right now (rate limit?). Try again in a few minutes.",
    contact: "Contact",
    contactSub: "Internships, collaborations, or just a hello.",
    status: { live: "Live", building: "Building", planned: "Planned" },
    role: "Role",
    source: "Source",
    palette: "Type a command…",
    built: "Built with HTML, CSS & JavaScript. 0 images.",
    updated: "Updated",
    less: "Less", more: "More"
  },
  hu: {
    nav: ["Kezdő", "Munkák", "Tudás", "Út", "GitHub", "Kapcsolat"],
    now: "Most",
    local: "Helyi idő",
    work: "Munkák",
    workSub: "Amit megépítettem, amin dolgozom, és ami következik.",
    stack: "Tudás",
    stackSub: "Nincsenek százalékok — csak az, amit napi szinten használok, amit tanulok, és ami jön.",
    levels: { using: "Használom", learning: "Tanulom", next: "Következik" },
    path: "Út",
    pathSub: "Hol tartok, és a terv Stockholmig.",
    gh: "GitHub-aktivitás",
    ghSub: "Élőben a GitHub API-ból.",
    contributions: "hozzájárulás az elmúlt évben",
    repos: "Repók",
    stars: "Csillag",
    followers: "Követő",
    languages: "Nyelvek",
    recent: "Legutóbbi aktivitás",
    noActivity: "Még nincs publikus aktivitás — jönnek az első commitok.",
    noRepos: "Még nincs publikus repó.",
    ghError: "A GitHub API most nem érhető el (lekérési limit?). Próbáld újra pár perc múlva.",
    contact: "Kapcsolat",
    contactSub: "Gyakornokság, közös munka, vagy csak egy szia.",
    status: { live: "Élő", building: "Készül", planned: "Tervezett" },
    role: "Szerep",
    source: "Forrás",
    palette: "Írj be egy parancsot…",
    built: "HTML, CSS és JavaScript. 0 kép.",
    updated: "Frissítve",
    less: "Kevesebb", more: "Több"
  }
};
