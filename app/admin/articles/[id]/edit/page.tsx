import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/app/admin/_components/admin-header";
import { EditArticleForm } from "./edit-article-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const articleId = Number(id);

  if (!Number.isInteger(articleId) || articleId <= 0) notFound();
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) notFound();

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />
      <section className="admin-page-heading form-page-heading">
        <div>
          <p className="section-label">EDIT ARTICLE</p>
          <h1>编辑文章</h1>
          <p>修改内容、保存草稿或更新公开版本。</p>
        </div>
        <Link className="back-link" href="/admin/articles">← 返回文章列表</Link>
      </section>
      <EditArticleForm article={article} />
    </main>
  );
}
