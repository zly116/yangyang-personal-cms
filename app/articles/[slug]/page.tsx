import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug } from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "文章未找到 | 盖洋阳" };
  }

  return {
    title: `${article.title} | 盖洋阳`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="site-shell">
      <nav className="topbar">
        <Link className="brand" href="/">
          盖洋阳<span>/ journal</span>
        </Link>
        <Link className="back-link" href="/#articles">← 返回文章列表</Link>
      </nav>

      <article className="article-page">
        <header className="article-header">
          <p className="article-tag">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="article-excerpt">{article.excerpt}</p>
          <div className="article-meta">
            <span>发布于 {article.publishedAt?.toLocaleDateString("zh-CN")}</span>
            <span>最后更新 {article.updatedAt.toLocaleDateString("zh-CN")}</span>
          </div>
        </header>

        <div className="article-body">
          <p>{article.content}</p>
        </div>
      </article>

      <footer>
        <span>© 2026 盖洋阳</span>
        <span>Built while learning, with AI.</span>
      </footer>
    </main>
  );
}
