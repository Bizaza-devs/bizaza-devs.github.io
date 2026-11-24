/* ============================================================
   PORTFOLIO DATA — all content lives here. The site (index.html)
   and the CV (cv.html) are both rendered from this file.
   Empty string / null = the field is not shown.
   ============================================================ */

window.PORTFOLIO = {
  github: "Bizaza-devs",
  timezone: "Europe/Budapest",
  updated: "2026-11-24",
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
    ],
    /* Hero: "I build …" — the words rotate */
    builds: ["brands.", "online stores.", "Shopify themes.", "systems.", "websites."],
    /* About section. {age} = computed age */
    about: "I'm a {age}-year-old student from Diósd, Hungary, specialising in Mathematics and Informatics. I learn by shipping: I run my own streetwear brand, ALAN BIRTH, and I design and build the store it runs on, the systems behind it — and this site."
  },

  /* About › timeline, oldest first. accent: mint | sky | indigo | rose | amber; now: true = in progress */
  timeline: [
    { when: "2024", title: "Bálint Márton School", detail: "Törökbálint · grades 9–10", accent: "sky" },
    { when: "2025", title: "Founded ALAN BIRTH", detail: "Streetwear brand, plus a custom Shopify theme I design and build myself", accent: "amber" },
    { when: "2026", title: "Built my Second Brain", detail: "Obsidian vault wired to Claude Code and Git — 226 notes", accent: "indigo" },
    { when: "2026", title: "Launched this portfolio", detail: "Plain HTML, CSS & JavaScript on GitHub Pages", accent: "mint" },
    { when: "2026", title: "Vivaldi Workspace", detail: "Gemini Panel browser extension, a privacy setup script and a macOS-style UI", accent: "sky" },
    { when: "Sep 2026", title: "Creascola, Budaörs", detail: "11th grade · Mathematics and Informatics specialisation", accent: "sky" },
    { when: "FW26", title: "Collection 01", detail: "The first ALAN BIRTH collection — in progress", accent: "amber", now: true }
  ],

  /* Real numbers from my second brain (2026-11-23). value "age" = computed from the birth date */
  stats: [
    { value: 26, unit: "", label: "Theme versions", note: "shipped on alanbirth.com", color: "amber" },
    { value: 226, unit: "", label: "Notes", note: "in my Obsidian second brain", color: "indigo" },
    { value: 4, unit: "", label: "Projects", note: "live or in progress", color: "sky" },
    { value: "age", unit: "yrs", label: "Age", note: "born October 2009", color: "mint" }
  ],

  /* status: live | building */
  projects: [
    {
      id: "alanbirth", accent: "amber",
      name: "ALAN BIRTH",
      year: "2025 —",
      status: "building",
      kind: "Brand · E-commerce · Web development",
      summary: "My own streetwear brand, run end to end. I designed and built the website myself: a custom Shopify OS 2.0 theme with a liquid-glass mobile layer — capsule header, product scroller, cart card — shipped in 26 documented versions. Alongside it: brand identity, label system, production and the launch of Collection 01 — FW26.",
      /* shorter text for the one-page CV (cvSummary); the site shows summary */
      cvSummary: "My own streetwear brand, run end to end. I designed and built the website: a custom Shopify OS 2.0 theme with a liquid-glass mobile layer, shipped in 26 documented versions — plus brand identity, production and Collection 01 — FW26.",
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
      id: "secondbrain", accent: "indigo",
      name: "Second Brain",
      year: "2026",
      status: "live",
      kind: "Knowledge system · Automation",
      summary: "A single Obsidian vault wired to Claude Code and versioned with Git: seven root folders, per-project context files, hooks that write a log after every session, vetted skills.",
      cvSummary: "An Obsidian vault wired to Claude Code and versioned with Git: per-project context files, session-log hooks, vetted skills.",
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
      id: "portfolio", accent: "mint",
      name: "This portfolio",
      year: "2026",
      status: "live",
      kind: "Website",
      summary: "Zero images, zero frameworks. Plain HTML, CSS and JavaScript with generative backgrounds, live data from the GitHub API and a generated PDF résumé.",
      role: "Design & development",
      stack: ["HTML", "CSS", "JavaScript", "GitHub API", "GitHub Pages"],
      metrics: [
        { k: "images", v: "0" },
        { k: "dependencies", v: "0" }
      ],
      links: [],
      repo: "bizaza-devs.github.io"
    },
    {
      id: "vivaldi", accent: "sky",
      name: "Vivaldi Workspace",
      year: "2026",
      status: "building",
      kind: "Browser extension · Setup automation",
      summary: "My own clean browser environment on Vivaldi. Gemini Panel is a Manifest V3 extension with streamed chat, Markdown rendering, page context and automatic fast / strong model choice. Next to it: a Python script that applies Brave-style privacy settings to the profile, and a macOS-style UI written in CSS.",
      cvSummary: "Clean Vivaldi setup: Gemini Panel, a Manifest V3 extension with streamed chat and automatic model choice; a Python privacy-setup script; a macOS-style UI in CSS.",
      role: "Design & development",
      stack: ["JavaScript", "Manifest V3", "Gemini API", "CSS", "Python"],
      metrics: [
        { k: "browsers", v: "4" },
        { k: "model modes", v: "3" },
        { k: "storage", v: "local" }
      ],
      links: [],
      repo: "vivaldi-workspace"
    }
  ],

  /* level: using | learning */
  stack: [
    { group: "Front-end", items: [
      { name: "HTML", level: "using" },
      { name: "CSS", level: "using" },
      { name: "JavaScript", level: "using" },
      { name: "Responsive design", level: "using" },
      { name: "CSS animation", level: "using" },
      { name: "Accessibility", level: "learning" }
    ] },
    { group: "E-commerce", items: [
      { name: "Shopify", level: "using" },
      { name: "Liquid", level: "using" },
      { name: "Theme development", level: "using" },
      { name: "E-commerce ops", level: "using" }
    ] },
    { group: "Dev tools", items: [
      { name: "Git", level: "using" },
      { name: "GitHub", level: "using" },
      { name: "GitHub Pages", level: "using" },
      { name: "Markdown", level: "using" },
      { name: "REST APIs", level: "learning" },
      { name: "Python", level: "learning" }
    ] },
    { group: "AI & automation", items: [
      { name: "Claude Code", level: "using" },
      { name: "Prompt engineering", level: "using" },
      { name: "AI-assisted development", level: "using" },
      { name: "Workflow automation", level: "using" },
      { name: "Obsidian", level: "using" }
    ] },
    { group: "Brand & business", items: [
      { name: "Brand design", level: "using" },
      { name: "Brand identity", level: "using" },
      { name: "Production", level: "learning" },
      { name: "Content & social media", level: "learning" }
    ] },
    { group: "Languages", items: [
      { name: "Hungarian — native", level: "using" },
      { name: "English — B2", level: "using" },
      { name: "Spanish — A2", level: "learning" }
    ] }
  ],

  /* Schools — shown in the CV and the hero */
  education: [
    {
      from: "2026-09", to: null,
      school: "Creascola Bilingual Primary School and Grammar School",
      place: "Budaörs",
      detail: "11th grade · Mathematics and Informatics specialisation"
    },
    {
      from: "2024-09", to: "2026-06",
      school: "Bálint Márton Primary and Secondary School",
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
  nav: ["Index", "Work", "About", "Stack", "Activity", "Contact"],
  local: "Local time",
  iBuild: "I build",
  about: "About",
  aboutSub: "Who I am, what I'm doing now, and how I got here.",
  now: "Right now",
  interests: "Outside the screen",
  copied: "Email copied ✓",
  copyFail: "Couldn't copy — long-press the address instead",
  themeLight: "Light theme",
  themeDark: "Dark theme",
  toggleTheme: "Toggle theme",
  paletteHint: "for commands",
  work: "Selected work",
  workSub: "What I have built and what I am building now.",
  latest: "Latest public repositories",
  latestSub: "Pulled live from GitHub — newest first.",
  stack: "Knowledge",
  stackSub: "No percentages — what I use daily and what I am learning right now. I work in Hungarian and English, and I'm learning Spanish.",
  levels: { using: "Using", learning: "Learning" },
  gh: "Work activity",
  ghSub: "Shipping code on GitHub and building with Claude — every day, in numbers.",
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
  built: "Hand-built with HTML, CSS & JavaScript. No frameworks, no images.",
  updated: "Updated",
  less: "Less", more: "More"
};
