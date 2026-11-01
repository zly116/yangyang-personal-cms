import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getCurrentAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand" href="/">盖洋阳<span>/ admin</span></Link>
        <div className="auth-heading">
          <p className="section-label">CONTENT MANAGEMENT</p>
          <h1>后台登录</h1>
          <p>管理个人介绍、文章和访客互动。</p>
        </div>

        {error === "invalid" && (
          <p className="form-error" role="alert">邮箱或密码错误。</p>
        )}

        <form className="auth-form" action="/api/admin/login" method="post">
          <label>
            <span>管理员邮箱</span>
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            <span>密码</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit">登录后台</button>
        </form>
        <Link className="back-link" href="/">← 返回公开网站</Link>
      </section>
    </main>
  );
}
