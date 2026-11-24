/* ============================================================
   GitHub data — public API, no token (60 requests/hour/IP).
   Cached in the browser for 10 minutes.
   ============================================================ */
window.GH = (() => {
  const TTL = 10 * 60 * 1000;

  const cache = {
    get(key) {
      try {
        const raw = sessionStorage.getItem("gh:" + key);
        if (!raw) return null;
        const { t, d } = JSON.parse(raw);
        return Date.now() - t < TTL ? d : null;
      } catch { return null; }
    },
    set(key, d) {
      try { sessionStorage.setItem("gh:" + key, JSON.stringify({ t: Date.now(), d })); } catch {}
    }
  };

  async function getJSON(url, key) {
    const hit = cache.get(key);
    if (hit) return hit;
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(res.status + " " + url);
    const data = await res.json();
    cache.set(key, data);
    return data;
  }

  const api = "https://api.github.com";

  return {
    user: (u) => getJSON(`${api}/users/${u}`, "user"),
    repos: (u) => getJSON(`${api}/users/${u}/repos?per_page=100&sort=pushed`, "repos"),
    events: (u) => getJSON(`${api}/users/${u}/events/public?per_page=30`, "events"),
    /* contribution calendar: GitHub has no public REST endpoint for it,
       so an open, keyless proxy (github-contributions-api) provides it */
    calendar: (u) => getJSON(`https://github-contributions-api.jogruber.de/v4/${u}?y=last`, "cal")
  };
})();
