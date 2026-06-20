// Renders public/resume.html to a print-quality PDF with clickable hyperlinks.
// Run: npm run resume:pdf  ->  writes public/Trinath-Resume.pdf
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");
const OUT = join(PUBLIC, "Trinath-Resume.pdf");
const PORT = 4179;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".css": "text/css",
};

const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = join(PUBLIC, p === "/" ? "resume.html" : p);
    if (!existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch { res.writeHead(500); res.end(); }
});

await new Promise((r) => server.listen(PORT, r));
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/resume.html`, { waitUntil: "networkidle0" });
await page.pdf({
  path: OUT,
  printBackground: true,
  preferCSSPageSize: true, // honor the @page A4 + margins in resume.html
});
await browser.close();
server.close();
console.log(`✓ wrote ${OUT}`);
