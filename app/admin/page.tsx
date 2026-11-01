import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/app/admin/_components/admin-header";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [articleCount, draftCount, pendingFeedbackCount] = await Promise.all([
    prisma.article.count({ where: { deletedAt: null } }),
    prisma.article.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.articleFeedback.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />

      <section className="admin-welcome">
        <p className="section-label">OVERVIEW</p>
        <h1>内容概览</h1>
        <p>查看内容状态，并从文章列表进入后续管理流程。</p>
      </section>

      <section className="admin-stats">
        <div><span>全部文章</span><strong>{articleCount}</strong></div>
        <div><span>草稿</span><strong>{draftCount}</strong></div>
        <div><span>待审核评论</span><strong>{pendingFeedbackCount}</strong></div>
      </section>
    </main>
  );
}
