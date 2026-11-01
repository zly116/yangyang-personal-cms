import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [articleCount, draftCount] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "DRAFT" } }),
  ]);

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><p className="section-label">YANGYANG CMS</p><strong>管理后台</strong></div>
        <div className="admin-account"><span>{admin.email}</span><form action="/api/admin/logout" method="post"><button type="submit">退出</button></form></div>
      </header>

      <section className="admin-welcome">
        <p className="section-label">OVERVIEW</p>
        <h1>内容概览</h1>
        <p>登录保护已经生效。下一批将在这里加入文章管理。</p>
      </section>

      <section className="admin-stats">
        <div><span>全部文章</span><strong>{articleCount}</strong></div>
        <div><span>草稿</span><strong>{draftCount}</strong></div>
        <div><span>待审核评论</span><strong>0</strong></div>
      </section>
    </main>
  );
}
