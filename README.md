# Sushil Khadka's portfolio

This is the static GitHub Pages edition. The theme switch, project demo, searchable writing archive, and résumé PDF work without a server.

## Publish on GitHub Pages

1. Create or open the GitHub repository named `sushilkhadkaanon.github.io`.
2. Put the **contents** of this folder at the root of the repository. Include the hidden `.github` folder. Commit on `main`.
3. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
4. Open **Actions → Publish portfolio** and run the workflow on `main` if it has not already run. Future pushes to `main` build and deploy automatically.

Expected address for that repository: https://sushilkhadkaanon.github.io/

Review the public email and the contact details inside the résumé PDF before committing or uploading.

## Edit with Markdown

| To update | Edit |
| --- | --- |
| Name, intro, or contact links | `content/bio.md` |
| Project pages | `content/projects/*.md` |
| Affiliation timeline | `content/affiliations/*.md` |
| Work history | `content/experience/*.md` |
| Education | `content/education/*.md` |
| Articles | `content/articles/*.md` |
| Résumé PDF | `public/assets/Sushil-Khadka-Resume.pdf` |

Each Markdown file starts with YAML metadata between two `---` lines. The text below the second line is the page content. An article's filename is its link slug, so keep published filenames stable.

To write a new article, create a file such as `content/articles/what-i-learned.md`:

```markdown
---
title: "What I learned from retrieval failures"
summary: "A short description for the writing index."
date: "2026-11-27"
tags: ["Search", "Evaluation"]
---

Your introduction goes here.

## What I tried

Add your technical notes, code blocks, lists, and links.
```

Commit the file to `main` to publish it. Delete the two `sample-*.md` files when you have your own articles. The standalone static build has no server-side editor or live visitor count.

## Preview locally

Use Node.js 22.12 or later. Run `npm ci` once, then `npm run dev`. Run `npm run build` to generate the uploadable static files in `dist/`.
