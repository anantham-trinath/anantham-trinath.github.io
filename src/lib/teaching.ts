import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Shape of public/teaching/index.json, written by scripts/teaching-index.mjs.
export interface Lecture {
  slug: string;
  file: string;
  number: number;
  title: string;
  description: string;
  tags: string[];
  date: string | null;
  minutes: number;
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  code: string;
  updated: string | null;
  minutes: number;
  lectures: Lecture[];
}

export interface TeachingIndex {
  generatedAt: string;
  courses: Course[];
}

export const TEACHING_BASE = "/teaching";
const INDEX_URL = `${TEACHING_BASE}/index.json`;
const PROGRESS_KEY = "teaching-progress";

// One hue per course, cycled by position. Tailwind-friendly HSL triplets that
// read on both the light and dark backgrounds.
const COURSE_HUES = ["158 64% 42%", "200 90% 48%", "24 62% 48%", "258 60% 60%", "340 70% 55%", "45 90% 45%"];

export const courseColor = (index: number) => `hsl(${COURSE_HUES[index % COURSE_HUES.length]})`;

export const lectureCount = (n: number) => `${n} ${n === 1 ? "lecture" : "lectures"}`;

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const formatMinutes = (mins: number) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;

export const formatMonth = (date: string | null) =>
  date ? new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;

export const lectureKey = (courseSlug: string, lectureSlug: string) => `${courseSlug}/${lectureSlug}`;

export const coursePath = (courseSlug: string) => `${TEACHING_BASE}/${courseSlug}`;

export const lecturePath = (courseSlug: string, lectureSlug: string) =>
  `${TEACHING_BASE}/${courseSlug}/${lectureSlug}`;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request for ${url} failed with ${res.status}`);
  return res.text();
}

export function useTeachingIndex() {
  return useQuery({
    queryKey: ["teaching-index"],
    queryFn: async (): Promise<TeachingIndex> => {
      const data = JSON.parse(await fetchText(INDEX_URL)) as TeachingIndex;
      if (!data || !Array.isArray(data.courses)) throw new Error("Teaching index is malformed");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLectureMarkdown(courseSlug?: string, file?: string) {
  return useQuery({
    queryKey: ["teaching-lecture", courseSlug, file],
    queryFn: () => fetchText(`${TEACHING_BASE}/${courseSlug}/${file}`),
    enabled: Boolean(courseSlug && file),
    staleTime: 5 * 60 * 1000,
  });
}

// The page header already shows the title and description, so drop them (and
// any front matter / Tags / Published lines) from the body before rendering.
export function stripLectureHeader(md: string): string {
  return md
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
    .replace(/^\s*#\s+.*\r?\n/, "")
    .replace(/^\s*\*\*(Description|Tags|Published):\*\*.*(\r?\n(?!\s*\r?\n).*)*\r?\n?/gim, "")
    .trimStart();
}

export function findCourse(index: TeachingIndex | undefined, slug?: string) {
  if (!index || !slug) return { course: undefined, position: -1 };
  const position = index.courses.findIndex((c) => c.slug === slug);
  return { course: position >= 0 ? index.courses[position] : undefined, position };
}

// Per-reader "done" ticks, kept in this browser only.
function readProgress(): string[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function useProgress() {
  const [done, setDone] = useState<string[]>(readProgress);

  useEffect(() => {
    const sync = (e: StorageEvent) => e.key === PROGRESS_KEY && setDone(readProgress());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const toggle = useCallback((key: string) => {
    setDone((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked (private mode): progress lasts for this visit only.
      }
      return next;
    });
  }, []);

  const isDone = useCallback((key: string) => done.includes(key), [done]);
  const countDone = useCallback(
    (course: Course) => course.lectures.filter((l) => done.includes(lectureKey(course.slug, l.slug))).length,
    [done]
  );

  return { isDone, toggle, countDone };
}
