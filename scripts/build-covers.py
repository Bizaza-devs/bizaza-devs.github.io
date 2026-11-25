"""
Build the project images for the v3 site (v3/img/*.webp).

  python scripts/build-covers.py            # everything
  python scripts/build-covers.py graph      # only the Second Brain graph
  python scripts/build-covers.py shots      # only the browser screenshots

- Screenshots: headless Chrome (alanbirth.com, the Vivaldi panel, this site
  served on http://localhost:5173 — start `python -m http.server 5173` first).
- Second Brain: the real link graph of the Obsidian vault, drawn as dots and
  lines only (no note names or text leave the vault).
Needs Pillow + numpy.
"""
import os, re, sys, shutil, subprocess, tempfile, random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "v3" / "img"
OUT.mkdir(parents=True, exist_ok=True)
CHROME = next((p for p in [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    shutil.which("chrome") or "", shutil.which("google-chrome") or "",
] if p and Path(p).exists()), None)
VAULT = Path(os.environ.get("VAULT", r"C:\Artificial Intelligence\SECONDBRAIN"))
VIVALDI_PANEL = Path(r"C:\Users\user\dev\vivaldi-workspace\extension\panel.html")

# name, url, css viewport (w, h), device scale factor
# (headless Chrome will not lay out narrower than ~500 px, so "phone" shots are 500 wide)
SHOTS = [
    ("alanbirth-cover", "https://alanbirth.com", (720, 900), 5 / 3),
    ("alanbirth-desktop", "https://alanbirth.com", (1440, 900), 1.25),
    ("alanbirth-mobile", "https://alanbirth.com", (500, 1000), 2),
    ("vivaldi-cover", VIVALDI_PANEL.as_uri(), (480, 600), 2.5),
    ("vivaldi-panel", VIVALDI_PANEL.as_uri(), (500, 940), 2),
    ("portfolio-cover", "http://localhost:5173/?shot=1", (720, 900), 5 / 3),
    ("portfolio-desktop", "http://localhost:5173/?shot=1", (1440, 900), 1.25),
    ("portfolio-mobile", "http://localhost:5173/?shot=1", (500, 1000), 2),
]


def save(im, name, q=82):
    p = OUT / f"{name}.webp"
    im.convert("RGB").save(p, "WEBP", quality=q, method=6)
    print(f"  {p.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  {p.stat().st_size // 1024} KB")


def shots():
    if not CHROME:
        sys.exit("Chrome / Edge not found")
    tmp = Path(tempfile.mkdtemp())
    for name, url, (w, h), dsf in SHOTS:
        png = tmp / f"{name}.png"
        subprocess.run([
            CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio",
            f"--user-data-dir={tmp / ('p-' + name)}", "--virtual-time-budget=9000",
            f"--force-device-scale-factor={dsf}", f"--window-size={w},{h}",
            f"--screenshot={png}", url,
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
        if not png.exists():
            print(f"  ! {name}: no screenshot ({url})")
            continue
        save(Image.open(png), name)
    shutil.rmtree(tmp, ignore_errors=True)


# ---------- Second Brain: real link graph ----------
def vault_graph():
    skip = {".git", ".claude", ".obsidian", "worktrees", "node_modules"}
    notes = [p for p in VAULT.rglob("*.md") if not (skip & set(p.parts))]
    idx = {p.stem.lower(): i for i, p in enumerate(notes)}
    group = []
    for p in notes:
        rel = p.relative_to(VAULT).parts
        group.append(rel[1] if len(rel) > 2 else rel[0])  # second level = the vault's root folders
    edges = set()
    link = re.compile(r"\[\[([^\]|#^]+)")
    for i, p in enumerate(notes):
        try:
            txt = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for m in link.findall(txt):
            j = idx.get(Path(m.strip()).stem.lower())
            if j is not None and j != i:
                edges.add((min(i, j), max(i, j)))
    return len(notes), sorted(edges), group


def layout(n, edges, seed=7, iters=600):
    rng = np.random.default_rng(seed)
    pos = rng.normal(0, 1, (n, 2))
    E = np.array(edges) if edges else np.zeros((0, 2), int)
    k = 1.0 / np.sqrt(n)
    t = 0.12
    for it in range(iters):
        d = pos[:, None, :] - pos[None, :, :]
        dist = np.linalg.norm(d, axis=2) + 1e-6
        rep = (d / dist[..., None] ** 2 * k * k).sum(1)            # repulsion
        att = np.zeros_like(pos)
        if len(E):
            dv = pos[E[:, 0]] - pos[E[:, 1]]
            dl = np.linalg.norm(dv, axis=1)[:, None] + 1e-6
            f = dv * dl / k
            np.add.at(att, E[:, 0], -f)
            np.add.at(att, E[:, 1], f)
        grav = -pos * 0.9 * k                                       # keep orphans close
        disp = rep + att * 0.05 + grav
        ln = np.linalg.norm(disp, axis=1)[:, None] + 1e-9
        pos += disp / ln * np.minimum(ln, t)
        t *= 0.993
    pos -= pos.mean(0)
    return pos


def draw_graph(n, edges, group, size, name, scale=2):
    W, H = size[0] * scale, size[1] * scale
    pos = layout(n, edges)
    deg = np.zeros(n)
    for a, b in edges:
        deg[a] += 1; deg[b] += 1
    linked = deg > 0
    pos -= pos[linked].mean(0)
    span = np.percentile(np.abs(pos[linked]), 98, axis=0)
    # orphan notes: a loose ring just outside the linked core
    orph = np.where(~linked)[0]
    rng = random.Random(3)
    R = span.max() * 1.18
    for k, i in enumerate(orph):
        a = k / max(1, len(orph)) * 2 * np.pi + rng.uniform(-.04, .04)
        rr = R * rng.uniform(0.97, 1.12)
        pos[i] = [np.cos(a) * rr, np.sin(a) * rr]
    span = np.abs(pos).max(0)
    fit = min(W * 0.44 / span[0], H * 0.44 / span[1])
    P = pos * fit + np.array([W / 2, H / 2])
    groups = sorted(set(group), key=lambda g: -group.count(g))
    pal = [(240, 240, 236), (225, 37, 27), (150, 150, 146), (200, 200, 196), (110, 110, 106), (240, 240, 236), (90, 90, 88)]
    col = {g: pal[i % len(pal)] for i, g in enumerate(groups)}

    bg = (21, 21, 21)
    im = Image.new("RGB", (W, H), bg)
    lines = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dl = ImageDraw.Draw(lines)
    for a, b in edges:
        dl.line([tuple(P[a]), tuple(P[b])], fill=(235, 235, 230, 46), width=max(1, scale))
    im.paste(lines, (0, 0), lines)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dg = ImageDraw.Draw(glow)
    d = ImageDraw.Draw(im)
    for i in np.argsort(deg):
        r = (2.2 + np.sqrt(deg[i]) * 1.6) * scale
        x, y = P[i]
        c = col[group[i]]
        if c[0] > 200 and c[1] < 80:
            dg.ellipse([x - r * 3, y - r * 3, x + r * 3, y + r * 3], fill=c + (40,))
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    glow = glow.filter(ImageFilter.GaussianBlur(10 * scale))
    im = Image.alpha_composite(im.convert("RGBA"), glow).convert("RGB")
    im = im.resize(size, Image.LANCZOS)
    save(im, name)


def graph():
    n, edges, group = vault_graph()
    print(f"  vault: {n} notes, {len(edges)} links, {len(set(group))} folders")
    draw_graph(n, edges, group, (1200, 1500), "secondbrain-cover")
    draw_graph(n, edges, group, (1600, 1000), "secondbrain-wide")


if __name__ == "__main__":
    what = sys.argv[1:] or ["graph", "shots"]
    if "graph" in what: graph()
    if "shots" in what: shots()
