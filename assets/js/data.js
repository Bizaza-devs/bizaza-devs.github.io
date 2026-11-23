/* ============================================================
   PORTFOLIO DATA — all content lives here. The site (index.html)
   and the CV (cv.html) are both rendered from this file.
   Empty string / null = the field is not shown.
   ============================================================ */

window.PORTFOLIO = {
  github: "Bizaza-devs",
  timezone: "Europe/Budapest",
  updated: "2026-11-23",
  cvPdf: "cv/Zalan-Birtalan-CV.pdf",

  person: {
    name: "Zalan Birtalan",
    born: "2009-10-07",
    location: "Diósd, Hungary",
    role: "Student developer · founder of ALAN BIRTH",
    tagline: "I build things on the web — a streetwear brand, the store it runs on, and the systems behind both.",
    status: [
      "11th grade · Creascola, Budaörs",
      "building ALAN BIRTH · Collection 01 — FW26",
      "learning full-stack web development"
    ]
  },

  /* Real numbers from my second brain (2026-11-23). value "age" = computed from the birth date */
  stats: [
    { value: 26, unit: "", label: "Theme versions", note: "shipped on alanbirth.com" },
    { value: 226, unit: "", label: "Notes", note: "in my Obsidian second brain" },
    { value: 3, unit: "", label: "Projects", note: "live or in progress" },
    { value: "age", unit: "y", label: "Age", note: "born October 2009" }
  ],

  /* status: live | building */
  projects: [
    {
      id: "alanbirth",
      name: "ALAN BIRTH",
      year: "2025 —",
      status: "building",
      kind: "Brand · E-commerce · Web development",
      summary: "My own streetwear brand, run end to end. I designed and built the website myself: a custom Shopify OS 2.0 theme with a liquid-glass mobile layer — capsule header, product scroller, cart card — shipped in 26 documented versions. Alongside it: brand identity, label system, production and the launch of Collection 01 — FW26.",
      role: "Founder — brand, web design & development, operations",
      stack: ["Shopify", "Liquid", "CSS", "JavaScript", "Branding"],
      metrics: [
        { k: "theme versions", v: "26" },
        { k: "latest", v: "v1.10.0" },
        { k: "collection", v: "01 · FW26" }
      ],
      links: [{ label: "alanbirth.com", url: "https://alanbirth.com" }],
      repo: null
    },
    {
      id: "secondbrain",
      name: "Second Brain",
      year: "2026",
      status: "live",
      kind: "Knowledge system · Automation",
      summary: "A single Obsidian vault wired to Claude Code and versioned with Git: seven root folders, per-project context files, hooks that write a log after every session, vetted skills.",
      role: "System design",
      stack: ["Markdown", "Obsidian", "Claude Code", "Hooks", "Git"],
      metrics: [
        { k: "notes", v: "226" },
        { k: "root folders", v: "7" }
      ],
      links: [],
      repo: null
    },
    {
      id: "portfolio",
      name: "This portfolio",
      year: "2026",
      status: "live",
      kind: "Website",
      summary: "Zero images, zero frameworks. Monochrome liquid glass in plain HTML, CSS and JavaScript, with live data from the GitHub API and a generated PDF résumé.",
      role: "Design & development",
      stack: ["HTML", "CSS", "JavaScript", "GitHub API", "GitHub Pages"],
      metrics: [
        { k: "images", v: "0" },
        { k: "dependencies", v: "0" }
      ],
      links: [],
      repo: "bizaza-devs.github.io"
    }
  ],

  /* level: using | learning */
  stack: [
    { group: "Front-end", items: [
      { name: "HTML", level: "using" },
      { name: "CSS", level: "using" },
      { name: "Liquid", level: "using" },
      { name: "JavaScript", level: "learning" }
    ] },
    { group: "Platforms & tools", items: [
      { name: "Shopify", level: "using" },
      { name: "Obsidian", level: "using" },
      { name: "Claude Code", level: "using" },
      { name: "Git", level: "learning" },
      { name: "GitHub", level: "learning" }
    ] },
    { group: "Beyond code", items: [
      { name: "Brand design", level: "using" },
      { name: "E-commerce ops", level: "using" },
      { name: "Production", level: "learning" }
    ] },
    { group: "Languages", items: [
      { name: "Hungarian — native", level: "using" },
      { name: "English", level: "learning" }
    ] }
  ],

  /* Schools — shown in the CV and the hero */
  education: [
    {
      from: "2026-09", to: null,
      school: "Creascola Két Tanítási Nyelvű Általános Iskola és Nyolcosztályos Gimnázium",
      place: "Budaörs",
      detail: "11th grade · Mathematics and Informatics specialisation"
    },
    {
      from: "2024-09", to: "2026-06",
      school: "Bálint Márton Általános Iskola és Középiskola",
      place: "Törökbálint",
      detail: "Grades 9–10"
    }
  ],

  interests: ["Ice hockey (since age 4)", "Streetwear & fashion", "Web design"],

  contact: {
    email: "zalan.birtalan@gmail.com",
    links: [
      { label: "GitHub", url: "https://github.com/Bizaza-devs" },
      { label: "alanbirth.com", url: "https://alanbirth.com" }
    ]
  }
};

/* Age from the birth date */
window.PORTFOLIO.age = (() => {
  const b = new Date(window.PORTFOLIO.person.born + "T00:00:00"), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
})();

/* Interface strings */
window.UI = {
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
};
