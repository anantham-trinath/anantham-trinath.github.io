// Pre-renders the built SPA into static HTML so crawlers (and social-preview
// bots) see real content instead of an empty <div id="root">.
//
// Flow: serve dist/ with a tiny static server (SPA fallback) -> drive a headless
// browser to each route -> snapshot the rendered HTML -> for posts, rewrite the
// <head> with per-page title/description/canonical + BlogPosting JSON-LD.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const SITE = "https://anantham-trinath.github.io";
const PORT = 4178;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// ---- markdown metadata extraction (mirrors PostView.tsx logic) ----
const extractTitle = (md, slug) => {
  const m = md.match(/^#\s+(.+)$/m) || md.match(/title:\s*['"]?([^'"\n]+)['"]?/);
  return (m ? m[1] : slug.replace(/-/g, " ")).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
};
const extractSummary = (md) => {
  const d = md.match(/\*\*Description:\*\*\s*([\s\S]*?)(?=\n\n|\n---|\n##|\n#)/i);
  if (d) return d[1].replace(/\s+/g, " ").trim();
  const lines = md.split("\n").filter((l) => l.trim());
  const first = lines.find((l) => !l.startsWith("#") && !l.includes(":") && l.length > 50);
  return first ? first.slice(0, 160).trim() : "Article by Trinath Anantham.";
};
const extractTags = (md) => {
  const m = md.match(/\*\*Tags:\*\*\s*([^\n]+)/i);
  return m ? m[1].split(",").map((t) => t.trim().replace(/['"[\]]/g, "")) : ["Technical", "Blog"];
};
const extractDate = (md) => {
  const m = md.match(/\*\*Published:\*\*\s*([^\n]+)/i);
  if (m) {
    const d = new Date(m[1].trim());
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }
  return "2026-01-01";
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Rewrite the snapshot <head> with post-specific SEO.
function injectPostSeo(html, { title, summary, date, tags, url }) {
  const fullTitle = `${title} — Trinath Anantham`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: summary,
    datePublished: date,
    dateModified: date,
    keywords: tags.join(", "),
    url,
    mainEntityOfPage: url,
    image: `${SITE}/og-image.png`,
    author: { "@type": "Person", name: "Trinath Anantham", url: SITE + "/" },
    publisher: { "@type": "Person", name: "Trinath Anantham", url: SITE + "/" },
  };
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(fullTitle)}</title>`);
  out = out.replace(/(<meta name="description" content=")[\s\S]*?("\s*\/?>)/i, `$1${esc(summary)}$2`);
  out = out.replace(/(<meta property="og:title" content=")[\s\S]*?(")/i, `$1${esc(fullTitle)}$2`);
  out = out.replace(/(<meta property="og:description" content=")[\s\S]*?(")/i, `$1${esc(summary)}$2`);
  out = out.replace(/(<meta property="og:url" content=")[\s\S]*?(")/i, `$1${url}$2`);
  out = out.replace(/(<meta property="og:type" content=")[\s\S]*?(")/i, `$1article$2`);
  out = out.replace(/(<meta name="twitter:title" content=")[\s\S]*?(")/i, `$1${esc(fullTitle)}$2`);
  out = out.replace(/(<meta name="twitter:description" content=")[\s\S]*?(")/i, `$1${esc(summary)}$2`);
  out = out.replace(/(<link rel="canonical" href=")[\s\S]*?(")/i, `$1${url}$2`);
  out = out.replace(/<\/head>/i, `  <script type="application/ld+json">${JSON.stringify(ld)}</script>\n  </head>`);
  return out;
}

// ---- minimal static server with SPA fallback ----
function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let filePath = join(DIST, urlPath);
      if (urlPath.endsWith("/")) filePath = join(filePath, "index.html");
      if (existsSync(filePath) && extname(filePath)) {
        const body = await readFile(filePath);
        res.writeHead(200, { "content-type": MIME[extname(filePath)] || "application/octet-stream" });
        return res.end(body);
      }
      // SPA fallback: serve the app shell so client routing renders the route
      const body = await readFile(join(DIST, "index.html"));
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end("err");
    }
  });
  return new Promise((r) => server.listen(PORT, () => r(server)));
}

async function snapshot(page, route, waitSelector) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
  try {
    await page.waitForSelector(waitSelector, { timeout: 15000 });
  } catch {
    console.warn(`  ! selector "${waitSelector}" not found for ${route} (continuing)`);
  }
  const html = await page.content();
  return "<!DOCTYPE html>\n" + html.replace(/^<!DOCTYPE html>/i, "").trim();
}

async function writePage(relPath, html) {
  const full = join(DIST, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html, "utf-8");
  console.log(`  ✓ ${relPath}  (${(html.length / 1024).toFixed(1)} kB)`);
}

async function main() {
  if (!existsSync(DIST)) {
    console.error("dist/ not found — run `vite build` first.");
    process.exit(1);
  }
  const profile = JSON.parse(await readFile(join(ROOT, "src/data/profile.json"), "utf-8"));
  const posts = profile.posts ?? [];

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("Pre-rendering routes:");

  // Home
  const home = await snapshot(page, "/", "#contact, footer");
  await writePage("index.html", home);
  // 404 fallback (boots SPA so unknown routes still resolve client-side)
  await writePage("404.html", home);

  // Posts
  for (const post of posts) {
    const slug = post.name;
    const mdPath = join(DIST, "posts", `${slug}.md`);
    let meta = { title: slug, summary: "", date: "2026-01-01", tags: ["Blog"] };
    if (existsSync(mdPath)) {
      const md = await readFile(mdPath, "utf-8");
      meta = { title: extractTitle(md, slug), summary: extractSummary(md), date: extractDate(md), tags: extractTags(md) };
    }
    const url = `${SITE}/post/${slug}/`;
    let html = await snapshot(page, `/post/${slug}`, "article h1");
    html = injectPostSeo(html, { ...meta, url });
    await writePage(join("post", slug, "index.html"), html);
  }

  await browser.close();
  server.close();
  console.log("Pre-render complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
