import { AdminHeader } from "@/app/admin/_components/admin-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const admin = await requireAdmin();
  const profile = await prisma.siteProfile.findUnique({ where: { id: 1 } });

  if (!profile) {
    throw new Error("个人资料尚未初始化，请先执行数据库迁移。");
  }

  return (
    <main className="admin-shell">
      <AdminHeader email={admin.email} />
      <section className="admin-page-heading form-page-heading">
        <div>
          <p className="section-label">SITE PROFILE</p>
          <h1>个人资料</h1>
          <p>这里保存的内容会直接显示在公开主页。</p>
        </div>
      </section>
      <ProfileForm profile={profile} />
    </main>
  );
}
