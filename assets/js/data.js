/* ============================================================
   PORTFOLIO DATA — minden tartalom itt van, az oldal és az
   önéletrajz (cv.html) is ebből épül.
   Ahol `null` vagy üres string áll, az a rész nem jelenik meg.
   ============================================================ */

window.PORTFOLIO = {
  github: "Bizaza-devs",
  timezone: "Europe/Budapest",
  updated: "2026-11-23",
  cvPdf: { en: "cv/Zalan-Birtalan-CV.pdf", hu: "cv/Birtalan-Zalan-oneletrajz.pdf" },

  person: {
    name: { en: "Zalan Birtalan", hu: "Birtalan Zalan" },
    born: "2009-10-07",
    location: { en: "Diósd, Hungary", hu: "Diósd" },
    role: {
      en: "Student developer · founder of ALAN BIRTH",
      hu: "Diák fejlesztő · az ALAN BIRTH alapítója"
    },
    tagline: {
      en: "I build things on the web — a streetwear brand, the store it runs on, and the systems behind both.",
      hu: "Weben építek: egy streetwear brandet, a webshopot, amin fut, és a rendszereket mögöttük."
    },
    status: [
      { en: "11th grade · Creascola, Budaörs", hu: "11. évfolyam · Creascola, Budaörs" },
      { en: "building ALAN BIRTH · Collection 01 — FW26", hu: "ALAN BIRTH építése · Collection 01 — FW26" },
      { en: "learning full-stack web development", hu: "full-stack webfejlesztést tanulok" }
    ]
  },

  /* Valós számok a second brainből (2026-11-23). value: "age" = a születési dátumból számolva */
  stats: [
    { value: 26, label: { en: "theme versions shipped", hu: "kiadott témaverzió" }, note: "alanbirth.com" },
    { value: 226, label: { en: "notes in my second brain", hu: "jegyzet a second brainemben" }, note: "Obsidian" },
    { value: 4, label: { en: "projects live or in progress", hu: "élő vagy készülő projekt" }, note: "2025–26" },
    { value: "age", label: { en: "years old", hu: "éves vagyok" }, note: "born 2009" }
  ],

  /* status: live | building */
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
        en: "A single Obsidian vault wired to Claude Code and versioned with Git: seven root folders, per-project context files, hooks that write a log after every session, vetted skills.",
        hu: "Egyetlen Obsidian-széf Claude Code-dal összekötve, Gittel verziózva: hét gyökérmappa, projektenkénti kontextusfájl, minden munkamenet után naplót író hookok, átnézett skillek."
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
        en: "Zero images, zero frameworks. Monochrome liquid glass in plain HTML, CSS and JavaScript, with live data from the GitHub API and a generated PDF résumé.",
        hu: "Nulla kép, nulla keretrendszer. Monokróm liquid glass sima HTML-ben, CSS-ben és JavaScriptben, élő GitHub-adatokkal és generált PDF-önéletrajzzal."
      },
      role: { en: "Design & development", hu: "Dizájn és fejlesztés" },
      stack: ["HTML", "CSS", "JavaScript", "GitHub API", "GitHub Pages"],
      metrics: [
        { k: { en: "images", hu: "kép" }, v: "0" },
        { k: { en: "dependencies", hu: "függőség" }, v: "0" }
      ],
      links: [],
      repo: "bizaza-devs.github.io"
    }
  ],

  /* level: using | learning */
  stack: [
    {
      group: { en: "Front-end", hu: "Front-end" },
      items: [
        { name: "HTML", level: "using" },
        { name: "CSS", level: "using" },
        { name: "Liquid", level: "using" },
        { name: "JavaScript", level: "learning" }
      ]
    },
    {
      group: { en: "Platforms & tools", hu: "Platformok, eszközök" },
      items: [
        { name: "Shopify", level: "using" },
        { name: "Obsidian", level: "using" },
        { name: "Claude Code", level: "using" },
        { name: "Git", level: "learning" },
        { name: "GitHub", level: "learning" }
      ]
    },
    {
      group: { en: "Beyond code", hu: "Kódon túl" },
      items: [
        { name: "Brand design", level: "using" },
        { name: "E-commerce ops", level: "using" },
        { name: "Production", level: "learning" }
      ]
    },
    {
      group: { en: "Languages", hu: "Nyelvek" },
      items: [
        { name: { en: "Hungarian — native", hu: "Magyar — anyanyelv" }, level: "using" },
        { name: { en: "English", hu: "Angol" }, level: "learning" }
      ]
    }
  ],

  /* Iskolák — az önéletrajzban és a főoldal fejlécében */
  education: [
    {
      from: "2026-09", to: null,
      school: "Creascola Két Tanítási Nyelvű Általános Iskola és Nyolcosztályos Gimnázium",
      short: "Creascola",
      place: "Budaörs",
      detail: { en: "11th grade · Mathematics and Informatics specialisation", hu: "11. évfolyam · matematika és informatika fakultáció" }
    },
    {
      from: "2024-09", to: "2026-06",
      school: "Bálint Márton Általános Iskola és Középiskola",
      short: "Bálint Márton",
      place: "Törökbálint",
      detail: { en: "Grades 9–10", hu: "9–10. évfolyam" }
    }
  ],

  interests: { en: ["Ice hockey (since age 4)", "Streetwear & fashion", "Web design"], hu: ["Jégkorong (4 éves korom óta)", "Streetwear és divat", "Webdizájn"] },

  contact: {
    email: "",            // pl. "valami@gmail.com" — üresen nem jelenik meg
    links: [
      { label: "GitHub", url: "https://github.com/Bizaza-devs" },
      { label: "alanbirth.com", url: "https://alanbirth.com" }
    ]
  }
};

/* Életkor a születési dátumból */
window.PORTFOLIO.age = (() => {
  const b = new Date(window.PORTFOLIO.person.born + "T00:00:00"), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
})();

/* Felületi szövegek */
window.UI = {
  en: {
    nav: ["Index", "Work", "Stack", "GitHub", "Contact"],
    local: "Local time",
    work: "Selected work",
    workSub: "What I have built and what I am building now.",
    latest: "Latest public repositories",
    latestSub: "Pulled live from GitHub — newest first.",
    stack: "Knowledge",
    stackSub: "No percentages — what I use daily and what I am learning right now.",
    levels: { using: "Using", learning: "Learning" },
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
    status: { live: "Live", building: "Building" },
    role: "Role",
    cv: "Download CV",
    palette: "Type a command…",
    built: "Built with HTML, CSS & JavaScript. 0 images.",
    updated: "Updated",
    less: "Less", more: "More"
  },
  hu: {
    nav: ["Kezdő", "Munkák", "Tudás", "GitHub", "Kapcsolat"],
    local: "Helyi idő",
    work: "Munkák",
    workSub: "Amit megépítettem, és amin most dolgozom.",
    latest: "Legújabb nyilvános repók",
    latestSub: "Élőben a GitHubról — a legújabb elöl.",
    stack: "Tudás",
    stackSub: "Nincsenek százalékok — amit napi szinten használok, és amit most tanulok.",
    levels: { using: "Használom", learning: "Tanulom" },
    gh: "GitHub-aktivitás",
    ghSub: "Élőben a GitHub API-ból.",
    contributions: "hozzájárulás az elmúlt évben",
    repos: "Repók",
    stars: "Csillag",
    followers: "Követő",
    languages: "Nyelvek",
    recent: "Legutóbbi aktivitás",
    noActivity: "Még nincs publikus aktivitás — jönnek az első commitok.",
    noRepos: "Még nincs nyilvános repó.",
    ghError: "A GitHub API most nem érhető el (lekérési limit?). Próbáld újra pár perc múlva.",
    contact: "Kapcsolat",
    contactSub: "Gyakornokság, közös munka, vagy csak egy szia.",
    status: { live: "Élő", building: "Készül" },
    role: "Szerep",
    cv: "Önéletrajz letöltése",
    palette: "Írj be egy parancsot…",
    built: "HTML, CSS és JavaScript. 0 kép.",
    updated: "Frissítve",
    less: "Kevesebb", more: "Több"
  }
};
