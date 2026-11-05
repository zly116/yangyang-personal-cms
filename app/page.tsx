import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import { getPublicSiteProfile } from "@/lib/site-profile";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, profile] = await Promise.all([
    getPublishedArticles(),
    getPublicSiteProfile(),
  ]);

  if (!profile) {
    throw new Error("个人资料尚未初始化，请先执行数据库迁移。");
  }

  return (
    <main className="site-shell">
      <nav className="topbar">
        <a className="brand" href="#top">{profile.name}<span>/ lab</span></a>
        <div className="nav-links"><a href="#about">关于我</a><a href="#articles">文章</a><a href="#roadmap">路线图</a></div>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow">{profile.role}</p>
        <h1>{profile.heroTitle}<br /><em>{profile.heroHighlight}</em></h1>
        <p className="hero-copy">{profile.introduction}</p>
        <div className="hero-actions"><a className="button primary" href="#articles">阅读项目记录</a><a className="button ghost" href="#about">认识我 →</a></div>
        <div className="hero-note"><span className="status-dot" />当前状态：{profile.statusText}</div>
      </section>

      <section className="about-grid" id="about">
        <div><p className="section-label">01 / ABOUT</p><h2>{profile.aboutTitle}</h2></div>
        <div className="about-text"><p>{profile.aboutParagraphOne}</p><p>{profile.aboutParagraphTwo}</p></div>
      </section>

      <section className="articles" id="articles"><div className="section-heading"><div><p className="section-label">02 / JOURNAL</p><h2>项目日志</h2></div><span className="muted">{articles.length} 篇已发布文章</span></div><div className="article-list">{articles.map((article, index) => <Link className="article-row" href={`/articles/${article.slug}`} key={article.id}><span className="article-index">0{index + 1}</span><div><p className="article-tag">{article.category}</p><h3>{article.title}</h3></div><time>{article.publishedAt?.toLocaleDateString("zh-CN")}</time><span className="arrow">↗</span></Link>)}</div></section>

      <section className="roadmap" id="roadmap"><p className="section-label">03 / ROADMAP</p><h2>从调研到上线，<br />每一步都留下证据。</h2><div className="roadmap-line"><span className="done">01<br /><small>调研</small></span><span>02<br /><small>设计</small></span><span>03<br /><small>开发</small></span><span>04<br /><small>部署</small></span></div></section>

      <footer><span>© 2026 {profile.name}</span><span>Built while learning, with AI.</span></footer>
    </main>
  );
}
