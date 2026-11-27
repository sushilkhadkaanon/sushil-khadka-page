"use client";

import { useMemo, useState } from "react";
import { articleDate, isSampleArticle, type Article } from "./articles";
import { ArticleMarkdown, parseArticleMarkdown } from "./article-markdown";

export function ArticleReader({ article }: { article: Article }) {
  const [copyStatus, setCopyStatus] = useState("");
  const blocks = useMemo(() => parseArticleMarkdown(article.body), [article.body]);
  const headings = blocks.filter(block => block.kind === "heading").filter(heading => heading.level <= 3);
  const date = article.publishedAt;

  function jumpToSection(id: string) {
    const heading = document.getElementById(id);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView();
  }

  async function copyLink() {
    try {
      const link = new URL(window.location.href);
      link.hash = "article/" + article.slug;
      await navigator.clipboard.writeText(link.href);
      setCopyStatus("Link copied.");
    } catch {
      setCopyStatus("You can copy the article URL from your address bar.");
    }
  }

  return <article className="article-detail">
    <header className="article-header">
      <h1 className="article-title">{article.title}</h1>
      <p className="article-meta muted">
        {isSampleArticle(article) ? "Sample article" : date ? <time dateTime={date}>{articleDate(date)}</time> : "Technical note"}
      </p>
      {article.summary && <p className="article-summary">{article.summary}</p>}
    </header>
    <div className="article-reading">
      {headings.length > 1 && <details className="article-toc">
        <summary>Contents</summary>
        <ul>
          {headings.map(heading => <li key={heading.id}>
            <button type="button" onClick={() => jumpToSection(heading.id)}>
              {heading.text}
            </button>
          </li>)}
        </ul>
      </details>}
      <div className="prose"><ArticleMarkdown blocks={blocks} /></div>
    </div>
    <footer className="article-links">
      {article.tags.length > 0 && <p className="topic-list">{article.tags.join(" · ")}</p>}
      {<button className="button button-quiet" type="button" onClick={copyLink}>Copy link</button>}
      <output className="editor-status" role="status">{copyStatus}</output>
    </footer>
  </article>;
}

