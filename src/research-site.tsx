"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { articleDate, isSampleArticle, type Article } from "./articles";
import { ArticleReader } from "./article-studio";
import { affiliations, education, experience, profile, projects, published } from "./content";
import { themeKey } from "./color-theme";
import SceneLab from "./scene-lab";
import { ArticleMarkdown, parseArticleMarkdown } from "./article-markdown";

const navigation = [
  { id: "overview", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "articles", label: "Writing" },
  { id: "experience", label: "Experience" },
] as const;

type Section = typeof navigation[number]["id"];
type Project = (typeof projects)[number];
type IndexHeading = "h2" | "h3";

function watchHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getRoute() {
  return window.location.hash.slice(1) || "overview";
}

function initialRoute() {
  return "overview";
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const nextTheme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setDark(!dark);
    try {
      localStorage.setItem(themeKey, nextTheme);
    } catch {
      // The toggle also works when storage is unavailable.
    }
  }

  return <button type="button" className="theme-toggle" onClick={toggle}>
    <span className="theme-label">{dark ? "Switch to light mode" : "Switch to dark mode"}</span>
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> :
        <path d="M20.5 15A8.5 8.5 0 0 1 9 3.5 8.5 8.5 0 1 0 20.5 15Z" />}
    </svg>
  </button>;
}

function ProjectIndex({ heading: Heading }: { heading: IndexHeading }) {
  return <div className="index-list">
    {projects.map(project => (
      <article className="index-row" key={project.id}>
        <Heading className="index-title"><a href={"#project/" + project.id}>{project.title}</a></Heading>
        <p className="index-description">{project.summary}</p>
      </article>
    ))}
  </div>;
}

function ArticleIndex({ rows, heading: Heading }: {
  rows: readonly Article[];
  heading: IndexHeading;
}) {
  return <div className="index-list">
    {rows.map(article => {
      const date = article.publishedAt;
      return <article className="index-row" key={article.id}>
        <div className="index-line">
          <Heading className="index-title">
            <a href={"#article/" + article.slug}>{article.title}</a>
          </Heading>
          {date && <time className="index-meta" dateTime={date}>{articleDate(date)}</time>}
          {isSampleArticle(article) && <span className="index-meta">Sample</span>}
        </div>
        {article.summary && <p className="index-description">{article.summary}</p>}
      </article>;
    })}
  </div>;
}

function Affiliations() {
  return <section className="home-section" aria-labelledby="affiliations-heading">
    <h2 id="affiliations-heading">Affiliations</h2>
    <ol className="affiliation-timeline">
      {affiliations.map(item => <li key={item.id}>
        {item.logo && <img className="affiliation-logo" src={item.logo} alt="" />}
        <strong>{item.link ? <a href={item.link}>{item.title}</a> : item.title}</strong>
        <span className="index-meta">{item.dates}</span>
        <div className="affiliation-description"><ArticleMarkdown blocks={parseArticleMarkdown(item.body)} /></div>
      </li>)}
    </ol>
  </section>;
}

function Resume() {
  return <section className="page-heading" aria-labelledby="resume-heading">
    <h1 id="resume-heading">Résumé</h1>
    <p className="contact-links page-intro">
      <a href="./assets/Sushil-Khadka-Resume.pdf" target="_blank" rel="noopener">View PDF</a>
      <a href="./assets/Sushil-Khadka-Resume.pdf" download>Download PDF</a>
    </p>
    <iframe className="resume-preview" title="Sushil Khadka’s résumé PDF" src="./assets/Sushil-Khadka-Resume.pdf" loading="lazy" />
  </section>;
}

function Overview({ articles }: { articles: readonly Article[] }) {
  return <>
    <section className="intro" aria-labelledby="profile-title">
      <div className="intro-heading">
        <img className="profile-avatar" src="./assets/avatar.jpg" width={68} height={68} alt="Sushil Khadka’s GitHub avatar" />
        <h1 id="profile-title">{profile.name}</h1>
      </div>
      <div className="prose"><ArticleMarkdown blocks={parseArticleMarkdown(profile.body)} /></div>
      <p className="contact-links">
        <a href={"mailto:" + profile.email}>Email</a>
        <a href={profile.github}>GitHub</a>
        <a href={profile.linkedin}>LinkedIn</a>
        <a href={profile.medium}>Medium</a>
        <a href="#resume">Résumé</a>
      </p>
    </section>
    <Affiliations />
    <section className="home-section" aria-labelledby="overview-projects">
      <h2 id="overview-projects">Projects</h2>
      <ProjectIndex heading="h3" />
    </section>
    <section className="home-section" aria-labelledby="overview-writing">
      <h2 id="overview-writing">Writing</h2>
      <ArticleIndex rows={articles.slice(0, 3)} heading="h3" />
    </section>
  </>;
}

function Projects() {
  return <>
    <header className="page-heading"><h1>Projects</h1></header>
    <ProjectIndex heading="h2" />
  </>;
}

function ProjectDetail({ project }: { project: Project }) {
  const sceneProject = project.id === "scene-boundary-detection";
  return <>
    <header className="page-heading">
      <h1>{project.title}</h1>
      <p className="page-intro">{project.summary}</p>
      {(project.links.length > 0 || sceneProject) && <p className="project-links">
        {project.links.map(link => (
          <a className="subtle-link" href={link.href} key={link.href}>{link.label}</a>
        ))}
        {sceneProject && published.some(article => article.slug === "scene-boundaries-with-pca") && <a className="subtle-link" href="#article/scene-boundaries-with-pca">Read the technical note</a>}
      </p>}
    </header>
    <section className="prose project-notes" aria-label="Project notes">
      <ArticleMarkdown blocks={parseArticleMarkdown(project.body)} />
    </section>
    {sceneProject && <SceneLab />}
  </>;
}

function Articles({ articles }: { articles: readonly Article[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const topics = [...new Set(articles.flatMap(article => article.tags))].sort();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = articles.filter(article => {
    const text = [article.title, article.summary, ...article.tags].join(" ").toLowerCase();
    return (!topic || article.tags.includes(topic)) && words.every(word => text.includes(word));
  });

  return <>
    <header className="page-heading"><h1>Writing</h1></header>
    <div className="article-toolbar">
      <label className="search-field">
        <span>Search articles</span>
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <label className="filter-list">
        <span>Topic</span>
        <select className="filter" value={topic} onChange={event => setTopic(event.target.value)}>
          <option value="">All topics</option>
          {topics.map(item => <option value={item} key={item}>{item}</option>)}
        </select>
      </label>
    </div>
    {results.length ? <ArticleIndex rows={results} heading="h2" /> :
      <p className="empty-state" role="status">No articles match your search.</p>}
    <p className="archive-links">
      <a className="subtle-link" href={profile.medium}>Writing on Medium / Towards AI</a>
    </p>
  </>;
}

function Experience() {
  return <>
    <header className="page-heading"><h1>Experience</h1></header>
    <section className="home-section" aria-labelledby="work-history">
      <h2 id="work-history">Work</h2>
      <div className="index-list">
        {experience.map(position => (
          <article className="index-row" key={position.title}>
            <div className="index-line">
              <h3 className="index-title">{position.title}, {position.company}</h3>
              <p className="index-meta">{position.dates}</p>
            </div>
            <div className="index-description"><ArticleMarkdown blocks={parseArticleMarkdown(position.body)} /></div>
          </article>
        ))}
      </div>
    </section>
    <section className="home-section" aria-labelledby="education-heading">
      <h2 id="education-heading">Education</h2>
      <div className="index-list">
        {education.map(item => (
          <article className="index-row" key={item.school}>
            <div className="index-line">
              <h3 className="index-title">{item.school}</h3>
              <p className="index-meta">{item.dates}</p>
            </div>
            <p className="index-description">{item.degree}</p>
          </article>
        ))}
      </div>
    </section>
  </>;
}

function Missing({ message, destination }: { message: string; destination: Section }) {
  const label = navigation.find(item => item.id === destination)?.label ?? "Home";
  return <header className="page-heading">
    <h1>{message}</h1>
    <a className="subtle-link" href={"#" + destination}>{label}</a>
  </header>;
}

export default function ResearchSite() {
  const route = useSyncExternalStore(watchHash, getRoute, initialRoute);
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef(route);
  const [view, item] = route.split("/");
  const project = view === "project" ? projects.find(entry => entry.id === item) : undefined;
  const article = view === "article" ? published.find(entry => entry.slug === item) : undefined;
  const sectionId = view === "project" ? "projects" : view === "article" ? "articles" : view;
  const section = navigation.find(entry => entry.id === sectionId) ?? navigation[0];
  const title = view === "resume" ? "Résumé" : project?.title ?? article?.title ?? section.label;

  useEffect(() => {
    document.title = view === "overview" ? profile.name : title + " | " + profile.name;
  }, [title, view]);

  useEffect(() => {
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  function activeView() {
    switch (view) {
      case "overview":
        return <Overview articles={published} />;
      case "resume":
        return <Resume />;
      case "projects":
        return <Projects />;
      case "project":
        return project ? <ProjectDetail project={project} /> :
          <Missing message="Project not found" destination="projects" />;
      case "articles":
        return <Articles articles={published} />;
      case "article":
        return article ? <ArticleReader key={article.id} article={article} /> :
          <Missing message="Article not found" destination="articles" />;
      case "experience":
        return <Experience />;
      default:
        return <Missing message="Page not found" destination="overview" />;
    }
  }

  return <div className="portfolio-shell">
    <a className="skip-link" href="#main-content" onClick={event => {
      event.preventDefault();
      mainRef.current?.focus();
    }}>Skip to content</a>
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary">
        {navigation.map(({ id, label }) => (
          <a href={"#" + id} key={id} aria-current={section.id === id ? "page" : undefined}>{label}</a>
        ))}
      </nav>
      <ThemeToggle />
    </header>
    <main className="content" id="main-content" ref={mainRef} tabIndex={-1}>
      {activeView()}
    </main>
  </div>;
}
