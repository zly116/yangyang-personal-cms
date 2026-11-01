import Link from "next/link";
import { AdminHeader } from "@/app/admin/_components/admin-header";
import { ArticleForm } from "./article-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewArticlePage() {
  const admin = await requireAdmin();

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />
      <section className="admin-page-heading form-page-heading">
        <div>
          <p className="section-label">NEW ARTICLE</p>
          <h1>创建文章</h1>
          <p>先保存草稿，确认内容后再公开发布。</p>
        </div>
        <Link className="back-link" href="/admin/articles">← 返回文章列表</Link>
      </section>
      <ArticleForm />
    </main>
  );
}
