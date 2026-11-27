import { createElement, type ReactNode } from "react";

type Heading = { kind: "heading"; id: string; level: number; text: string };
type Block =
  | Heading
  | { kind: "paragraph" | "quote" | "code"; text: string }
  | { kind: "list"; ordered: boolean; items: string[]; start: number };

const headingPattern = /^\s{0,3}(#{1,6})[ \t]+(.+?)\s*$/;
const fencePattern = /^\s{0,3}(\x60{3,}|~{3,})/;
const listPattern = /^\s{0,3}(?:([-+*])|(\d+)[.)])[ \t]+(.+)$/;
const quotePattern = /^\s{0,3}>[ \t]?/;

export function parseArticleMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let line = 0;
  let headingCount = 0;

  while (line < lines.length) {
    const text = lines[line];
    if (!text.trim()) {
      line++;
      continue;
    }

    const fence = text.match(fencePattern)?.[1];
    if (fence) {
      const code = [];
      const closingFence = new RegExp("^\\s{0,3}" + fence[0] + "{" + fence.length + ",}\\s*$");
      line++;
      while (line < lines.length && !closingFence.test(lines[line])) {
        code.push(lines[line++]);
      }
      blocks.push({ kind: "code", text: code.join("\n") });
      if (line < lines.length) line++;
      continue;
    }

    const heading = text.match(headingPattern);
    if (heading) {
      blocks.push({
        kind: "heading",
        id: "article-section-" + (++headingCount),
        level: Math.max(2, heading[1].length),
        text: heading[2].replace(/\s+#+$/, ""),
      });
      line++;
      continue;
    }

    const list = text.match(listPattern);
    if (list) {
      const ordered = Boolean(list[2]);
      const items = [list[3]];
      line++;
      while (line < lines.length) {
        const next = lines[line].match(listPattern);
        if (!next || Boolean(next[2]) !== ordered) break;
        items.push(next[3]);
        line++;
      }
      blocks.push({ kind: "list", ordered, items, start: Number(list[2] ?? 1) });
      continue;
    }

    if (quotePattern.test(text)) {
      const quote = [];
      while (line < lines.length && quotePattern.test(lines[line])) {
        quote.push(lines[line++].replace(quotePattern, ""));
      }
      blocks.push({ kind: "quote", text: quote.join(" ") });
      continue;
    }

    const paragraph = [text];
    line++;
    while (line < lines.length && lines[line].trim() &&
      ![headingPattern, fencePattern, listPattern, quotePattern].some(pattern => pattern.test(lines[line]))) {
      paragraph.push(lines[line++]);
    }
    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

function safeLink(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function inline(text: string): ReactNode[] {
  const tokens = /\x60([^\x60]+)\x60|\[([^\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)\)|\*\*([^*]+)\*\*|(?<!\w)__([^_]+)__(?!\w)|\*([^*]+)\*|(?<!\w)_([^_]+)_(?!\w)/g;
  const nodes: ReactNode[] = [];
  let end = 0;

  for (const match of text.matchAll(tokens)) {
    const [token, code, label, url, strong, alternateStrong, emphasis, alternateEmphasis] = match;
    nodes.push(text.slice(end, match.index));
    const key = match.index;
    if (code) {
      nodes.push(<code key={key}>{code}</code>);
    } else if (label) {
      const href = safeLink(url);
      nodes.push(href ? <a key={key} href={href} target="_blank" rel="noreferrer">{label}</a> : label);
    } else if (strong || alternateStrong) {
      nodes.push(<strong key={key}>{strong ?? alternateStrong}</strong>);
    } else {
      nodes.push(<em key={key}>{emphasis ?? alternateEmphasis}</em>);
    }
    end = match.index + token.length;
  }

  nodes.push(text.slice(end));
  return nodes;
}

export function ArticleMarkdown({ blocks, preview = false }: { blocks: Block[]; preview?: boolean }) {
  return blocks.map((block, index) => {
    switch (block.kind) {
      case "heading":
        return createElement("h" + block.level, {
          id: preview ? undefined : block.id,
          tabIndex: preview ? undefined : -1,
          key: index,
        }, inline(block.text));
      case "code":
        return <pre key={index}><code>{block.text}</code></pre>;
      case "quote":
        return <blockquote key={index}>{inline(block.text)}</blockquote>;
      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        return <Tag key={index} start={block.ordered ? block.start : undefined}>
          {block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
        </Tag>;
      }
      case "paragraph":
        return <p key={index}>{inline(block.text)}</p>;
    }
  });
}
