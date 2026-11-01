import Link from "next/link";
import { AdminHeader } from "@/app/admin/_components/admin-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrashArticleButton } from "./trash-article-button";

const statusText = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
} as const;

export default async function AdminArticlesPage() {
  const admin = await requireAdmin();
  const articles = await prisma.article.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />

      <section className="admin-page-heading">
        <div>
          <p className="section-label">CONTENT</p>
          <h1>文章管理</h1>
          <p>后台显示全部文章；公开网站仍然只显示已发布内容。</p>
        </div>
        <div className="admin-heading-actions">
          <span className="admin-count">共 {articles.length} 篇</span>
          <Link className="admin-primary-link" href="/admin/articles/new">新建文章</Link>
        </div>
      </section>

      {articles.length === 0 ? (
        <div className="admin-empty">还没有文章。</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>文章</th>
                <th>状态</th>
                <th>分类</th>
                <th>更新时间</th>
                <th><span className="sr-only">操作</span></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <strong>{article.title}</strong>
                    <small>/{article.slug}</small>
                  </td>
                  <td><span className={`status-badge status-${article.status.toLowerCase()}`}>{statusText[article.status]}</span></td>
                  <td>{article.category}</td>
                  <td>{article.updatedAt.toLocaleDateString("zh-CN")}</td>
                  <td>
                    <div className="table-actions">
                      <Link className="table-link" href={`/admin/articles/${article.id}/edit`}>编辑</Link>
                      {article.status === "PUBLISHED" ? (
                        <Link className="table-link" href={`/articles/${article.slug}`}>查看 ↗</Link>
                      ) : (
                        <span className="table-muted">未公开</span>
                      )}
                      <TrashArticleButton articleId={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
