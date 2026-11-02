import Link from "next/link";

type AdminHeaderProps = {
  email: string;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <header className="admin-topbar">
      <div className="admin-brand">
        <p className="section-label">YANGYANG CMS</p>
        <strong>管理后台</strong>
      </div>
      <nav className="admin-nav" aria-label="后台导航">
        <Link href="/admin">概览</Link>
        <Link href="/admin/profile">个人资料</Link>
        <Link href="/admin/articles">文章</Link>
        <Link href="/admin/feedback">评论</Link>
        <Link href="/admin/trash">回收站</Link>
      </nav>
      <div className="admin-account">
        <span>{email}</span>
        <form action="/api/admin/logout" method="post">
          <button type="submit">退出</button>
        </form>
      </div>
    </header>
  );
}
