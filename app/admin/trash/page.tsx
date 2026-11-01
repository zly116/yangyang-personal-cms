import { AdminHeader } from "@/app/admin/_components/admin-header";
import { RestoreArticleButton } from "./restore-article-button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminTrashPage() {
  const admin = await requireAdmin();
  const articles = await prisma.article.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />
      <section className="admin-page-heading">
        <div>
          <p className="section-label">TRASH</p>
          <h1>回收站</h1>
          <p>文章仍保存在数据库中，可以恢复；第一版暂不提供永久删除。</p>
        </div>
        <span className="admin-count">共 {articles.length} 篇</span>
      </section>

      {articles.length === 0 ? (
        <div className="admin-empty">回收站是空的。</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>文章</th>
                <th>原状态</th>
                <th>移入时间</th>
                <th><span className="sr-only">操作</span></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td><strong>{article.title}</strong><small>/{article.slug}</small></td>
                  <td><span className={`status-badge status-${article.status.toLowerCase()}`}>{article.status === "PUBLISHED" ? "已发布" : "草稿"}</span></td>
                  <td>{article.deletedAt?.toLocaleString("zh-CN")}</td>
                  <td><RestoreArticleButton articleId={article.id} title={article.title} wasPublished={article.status === "PUBLISHED"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
