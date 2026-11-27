export type Article = {
  id: string; slug: string; title: string; summary: string;
  tags: string[]; publishedAt: string | null; sample: boolean; body: string;
};
export const isSampleArticle = (article: Article) => article.sample;
export function articleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
