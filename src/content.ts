import { parse } from "yaml";
import type { Article } from "./articles";

type Metadata = {
  name?: string; email?: string; github?: string; linkedin?: string; medium?: string;
  title?: string; summary?: string; tags?: string[]; date?: string | null; sample?: boolean;
  company?: string; dates?: string; school?: string; degree?: string;
  link?: string; logo?: string; order?: number;
  links?: { label: string; href: string }[];
};

const files = import.meta.glob("../content/**/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
function read(path: string) {
  const match = files[path].match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Missing YAML front matter in " + path);
  return { id: path.split("/").at(-1)!.slice(0, -3), meta: parse(match[1]) as Metadata, body: match[2].trim() };
}
function group(name: string) {
  return Object.keys(files).filter(path => path.startsWith("../content/" + name + "/"))
    .sort().map(read).sort((a,b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
}
const bio = read("../content/bio.md");
export const profile = { ...bio.meta, name: bio.meta.name ?? "Sushil Khadka", body: bio.body };
export const projects = group("projects").map(({ id, meta, body }) => ({
  id, title: meta.title ?? id, summary: meta.summary ?? "", body, links: meta.links ?? [],
}));
export const experience = group("experience").map(({ meta, body }) => ({ ...meta, body }));
export const education = group("education").map(({ meta }) => meta);
export const affiliations = group("affiliations").map(({ id, meta, body }) => ({ ...meta, id, body }));
export const published: Article[] = group("articles").map(({ id, meta, body }) => ({
  id, slug: id, title: meta.title ?? id, summary: meta.summary ?? "", tags: meta.tags ?? [],
  publishedAt: meta.date || null, sample: meta.sample === true, body,
})).sort((a,b) => Number(a.sample) - Number(b.sample) || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
