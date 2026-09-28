// Scans public/teaching/<course>/*.md and writes public/teaching/index.json.
//
// GitHub Pages can't list directories at runtime, so the app reads this index
// instead. It runs automatically from the Vite plugin in vite.config.ts (dev +
// build) and can also be run by hand: `node scripts/teaching-index.mjs`.
//
// Conventions (all optional except the .md files themselves):
//   public/teaching/<course-slug>/_course.md   -> course title (# heading) + description
//   public/teaching/<course-slug>/NN-name.md   -> one lecture; NN sets the order
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..");
export const TEACHING_DIR = join(ROOT, "public", "teaching");
const INDEX_FILE = join(TEACHING_DIR, "index.json");

const WORDS_PER_MINUTE = 220;
const SUMMARY_MAX = 180;
const COURSE_META_FILE = "_course.md";
const IGNORED_FILES = new Set([COURSE_META_FILE, "readme.md"]);

// ---------- markdown metadata ----------

// Minimal front-matter reader: `key: value` and `key: [a, b]` lines only.
export function parseFrontMatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: md };
  const data = Object.fromEntries(
    m[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, raw]) => {
        const value = raw.trim();
        if (value.startsWith("[") && value.endsWith("]")) {
          return [key, splitList(value.slice(1, -1))];
        }
        return [key, stripQuotes(value)];
      })
  );
  return { data, body: md.slice(m[0].length) };
}

const stripQuotes = (s) => s.replace(/^['"]|['"]$/g, "").trim();
const splitList = (s) => s.split(",").map(stripQuotes).filter(Boolean);

const stripInlineMd = (s) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const withoutCode = (md) => md.replace(/```[\s\S]*?```/g, "");

const firstHeading = (body) => {
  const m = withoutCode(body).match(/^#\s+(.+)$/m);
  return m ? stripInlineMd(m[1]) : null;
};

const boldField = (body, name) => {
  const m = body.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n---|\\n#|$)`, "i"));
  return m ? stripInlineMd(m[1]) : null;
};

const firstParagraph = (body) => {
  const blocks = withoutCode(body)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b && !/^(#|>|\||-{3,}|\*\*\w+:\*\*|[-*+]\s|\d+\.\s|<)/.test(b));
  if (!blocks.length) return null;
  const text = stripInlineMd(blocks[0]);
  return text.length > SUMMARY_MAX ? `${text.slice(0, SUMMARY_MAX).replace(/\s+\S*$/, "")}…` : text;
};

const titleFromSlug = (slug) =>
  slug
    .replace(/^\d+[-_.\s]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
};

const boldLine = (body, name) => {
  const m = body.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*([^\\n]+)`, "i"));
  return m ? m[1].trim() : null;
};

const toTags = (fmTags, body) => {
  if (Array.isArray(fmTags)) return fmTags;
  if (typeof fmTags === "string" && fmTags) return splitList(fmTags);
  const bold = boldLine(body, "Tags");
  return bold ? splitList(bold) : [];
};

const readMinutes = (body) => {
  const words = withoutCode(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export function lectureMeta(md, slug) {
  const { data, body } = parseFrontMatter(md);
  return {
    title: data.title || firstHeading(body) || titleFromSlug(slug),
    description: data.description || boldField(body, "Description") || firstParagraph(body.replace(/^#\s+.*$/m, "")) || "",
    tags: toTags(data.tags, body),
    date: toDate(data.date || boldLine(body, "Published")),
    minutes: readMinutes(body),
  };
}

function courseMeta(md, slug) {
  const { data, body } = parseFrontMatter(md || "");
  return {
    title: data.title || firstHeading(body) || titleFromSlug(slug),
    description: data.description || boldField(body, "Description") || firstParagraph(body.replace(/^#\s+.*$/m, "")) || "",
    code: data.code || null,
    order: data.order !== undefined && !isNaN(Number(data.order)) ? Number(data.order) : null,
  };
}

// "Operating Systems" -> "OS", "Databases" -> "DA"
const initials = (title) => {
  const words = title.split(/\s+/).filter((w) => /^[A-Za-z0-9]/.test(w));
  const code = words.length > 1 ? words.slice(0, 2).map((w) => w[0]).join("") : (words[0] || "??").slice(0, 2);
  return code.toUpperCase();
};

const leadingNumber = (name) => {
  const m = name.match(/^(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
};

const byOrderThenName = (a, b) => a.order - b.order || a.slug.localeCompare(b.slug);

// ---------- scan ----------

async function readCourse(slug) {
  const dir = join(TEACHING_DIR, slug);
  const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".md"));
  const metaPath = join(dir, COURSE_META_FILE);
  const meta = courseMeta(existsSync(metaPath) ? await readFile(metaPath, "utf-8") : "", slug);

  const lectures = (
    await Promise.all(
      files
        .filter((f) => !IGNORED_FILES.has(f.toLowerCase()))
        .map(async (file) => {
          const lectureSlug = file.replace(/\.md$/i, "");
          try {
            const md = await readFile(join(dir, file), "utf-8");
            return { slug: lectureSlug, file, order: leadingNumber(file), ...lectureMeta(md, lectureSlug) };
          } catch (err) {
            console.warn(`[teaching] skipped ${slug}/${file}: ${err.message}`);
            return null;
          }
        })
    )
  )
    .filter(Boolean)
    .sort(byOrderThenName)
    .map(({ order, ...rest }, i) => ({ ...rest, number: i + 1 }));

  const dates = lectures.map((l) => l.date).filter(Boolean).sort();
  return {
    slug,
    title: meta.title,
    description: meta.description,
    code: meta.code || initials(meta.title),
    order: meta.order ?? Number.POSITIVE_INFINITY,
    updated: dates.length ? dates[dates.length - 1] : null,
    minutes: lectures.reduce((sum, l) => sum + l.minutes, 0),
    lectures,
  };
}

export async function buildTeachingIndex({ quiet = false } = {}) {
  if (!existsSync(TEACHING_DIR)) {
    if (!quiet) console.log("[teaching] no public/teaching folder, skipping");
    return null;
  }
  const entries = await readdir(TEACHING_DIR);
  const dirs = [];
  for (const name of entries) {
    if (name.startsWith(".") || name.startsWith("_")) continue;
    if ((await stat(join(TEACHING_DIR, name))).isDirectory()) dirs.push(name);
  }

  const courses = (await Promise.all(dirs.map(readCourse)))
    .filter((c) => c.lectures.length > 0)
    .sort(byOrderThenName)
    .map(({ order, ...rest }) => (order === Number.POSITIVE_INFINITY ? rest : { ...rest, order }));

  const index = { generatedAt: new Date().toISOString(), courses };
  const json = JSON.stringify(index, null, 2) + "\n";
  const previous = existsSync(INDEX_FILE) ? await readFile(INDEX_FILE, "utf-8") : "";
  // Ignore the timestamp when comparing so unchanged content doesn't rewrite the file.
  const strip = (s) => s.replace(/"generatedAt":\s*"[^"]*",?/, "");
  if (strip(previous) !== strip(json)) await writeFile(INDEX_FILE, json, "utf-8");

  if (!quiet) {
    const total = courses.reduce((n, c) => n + c.lectures.length, 0);
    console.log(`[teaching] indexed ${courses.length} course(s), ${total} lecture(s)`);
  }
  return index;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildTeachingIndex().catch((err) => {
    console.error("[teaching] failed to build index:", err);
    process.exit(1);
  });
}
