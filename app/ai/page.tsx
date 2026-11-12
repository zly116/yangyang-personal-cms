import type { Metadata } from "next";
import Link from "next/link";
import { AiChat } from "./ai-chat";
import { ContactForm } from "./contact-form";
import { PortalMap } from "./portal-map";

export const metadata: Metadata = {
  title: "AI Portal | 盖洋阳",
  description: "使用 DeepSeek 驱动的公开 AI 对话入口。",
};

export default function AiPortalPage() {
  return (
    <main className="site-shell ai-page">
      <nav className="topbar">
        <Link className="brand" href="/">盖洋阳<span>/ ai portal</span></Link>
        <Link className="back-link" href="/">返回博客</Link>
      </nav>
      <header className="ai-header">
        <p className="eyebrow">PUBLIC AI PORTAL</p>
        <h1>把问题交给<br /><em>AI 助手。</em></h1>
        <p>这是博客的公开 AI 对话入口，由服务器安全调用 DeepSeek。</p>
      </header>
      <AiChat />
      <section className="portal-feature-grid">
        <div className="portal-feature-heading">
          <p className="section-label">CONTACT / EMAIL</p>
          <h2>给我留言。</h2>
          <p>消息进入无代码后台，并通过邮件工作流通知我。</p>
        </div>
        <ContactForm />
      </section>
      <section className="portal-feature-grid portal-map-section">
        <div className="portal-feature-heading">
          <p className="section-label">LOCATION / MAP</p>
          <h2>公开地点。</h2>
          <p>地图地点由 NocoBase 管理，只展示适合公开的位置。</p>
        </div>
        <PortalMap />
      </section>
      <footer><span>© 2026 盖洋阳</span><span>Powered by DeepSeek.</span></footer>
    </main>
  );
}
