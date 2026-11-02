import { FeedbackStatus } from "@prisma/client";
import { AdminHeader } from "@/app/admin/_components/admin-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approveFeedbackAction, rejectFeedbackAction } from "./actions";

const statusText = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
} satisfies Record<FeedbackStatus, string>;

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const admin = await requireAdmin();
  const [pendingFeedback, reviewedFeedback] = await Promise.all([
    prisma.articleFeedback.findMany({
      where: { status: FeedbackStatus.PENDING },
      include: { article: { select: { title: true, slug: true, deletedAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.articleFeedback.findMany({
      where: { status: { not: FeedbackStatus.PENDING } },
      include: { article: { select: { title: true, slug: true, deletedAt: true } } },
      orderBy: { reviewedAt: "desc" },
    }),
  ]);
  const feedback = [...pendingFeedback, ...reviewedFeedback];

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />

      <section className="admin-page-heading">
        <div>
          <p className="section-label">FEEDBACK</p>
          <h1>评论审核</h1>
          <p>只有审核通过的反馈才会在文章详情页公开展示。</p>
        </div>
        <span className="admin-count">待审核 {pendingFeedback.length} 条 / 共 {feedback.length} 条</span>
      </section>

      {feedback.length === 0 ? (
        <div className="admin-empty">还没有访客反馈。</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table feedback-admin-table">
            <thead>
              <tr>
                <th>评论</th>
                <th>文章</th>
                <th>评分</th>
                <th>状态</th>
                <th>提交时间</th>
                <th><span className="sr-only">操作</span></th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => {
                const approveAction = approveFeedbackAction.bind(null, item.id);
                const rejectAction = rejectFeedbackAction.bind(null, item.id);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.nickname}</strong>
                      <p className="feedback-content">{item.content}</p>
                    </td>
                    <td>
                      {item.article.title}
                      {item.article.deletedAt && <small>文章位于回收站</small>}
                    </td>
                    <td><span className="feedback-stars" aria-label={`${item.rating} 星`}>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span></td>
                    <td><span className={`status-badge status-${item.status.toLowerCase()}`}>{statusText[item.status]}</span></td>
                    <td>{item.createdAt.toLocaleString("zh-CN")}</td>
                    <td>
                      <div className="table-actions">
                        {item.status !== FeedbackStatus.APPROVED && (
                          <form action={approveAction}><button className="table-link table-button" type="submit">通过</button></form>
                        )}
                        {item.status !== FeedbackStatus.REJECTED && (
                          <form action={rejectAction}><button className="table-danger" type="submit">拒绝</button></form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
