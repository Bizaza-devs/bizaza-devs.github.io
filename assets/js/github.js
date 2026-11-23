/* ============================================================
   GitHub adatok — publikus API, token nélkül (60 kérés/óra/IP).
   10 percre gyorsítótárazva a böngészőben.
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
    /* hozzájárulási naptár: a GitHub nem ad hozzá publikus REST végpontot,
       ezért egy nyílt, kulcs nélküli proxy (github-contributions-api) adja */
    calendar: (u) => getJSON(`https://github-contributions-api.jogruber.de/v4/${u}?y=last`, "cal")
  };
})();
