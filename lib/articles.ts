export type ArticleStatus = "draft" | "published";

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const articles: Article[] = [
  {
    id: 1,
    slug: "why-build-a-personal-cms",
    title: "为什么我要从零搭建一个个人 CMS",
    excerpt: "记录我的起点、项目目标，以及为什么研究 WordPress 后仍决定自己实现核心功能。",
    content: "我希望把学习过程变成一个真实、可持续维护的产品。",
    category: "项目开始",
    status: "published",
    publishedAt: "2026-11-01",
    createdAt: "2026-11-01",
    updatedAt: "2026-11-01",
  },
  {
    id: 2,
    slug: "cms-blog-wordpress-differences",
    title: "CMS、博客和 WordPress 到底有什么区别",
    excerpt: "从内容管理的角度理解三个容易混淆的概念。",
    content: "这篇文章仍在整理中。",
    category: "调研",
    status: "published",
    publishedAt: "2026-11-01",
    createdAt: "2026-11-01",
    updatedAt: "2026-11-01",
  },
  {
    id: 3,
    slug: "first-system-architecture",
    title: "我的第一版系统架构：先完成闭环，再逐步升级",
    excerpt: "解释第一版为什么选择一个全栈项目，而不是一开始拆分多个服务。",
    content: "这篇文章仍在整理中。",
    category: "设计",
    status: "draft",
    publishedAt: null,
    createdAt: "2026-11-01",
    updatedAt: "2026-11-01",
  },
];

export function getPublishedArticles(): Article[] {
  return articles.filter((article) => article.status === "published");
}

export function getPublishedArticleBySlug(slug: string): Article | undefined {
  return articles.find(
    (article) => article.slug === slug && article.status === "published",
  );
}
