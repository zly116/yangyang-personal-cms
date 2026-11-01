const articles = [
  { title: "为什么我要从零搭建一个个人 CMS", tag: "项目开始", date: "2026-11-01" },
  { title: "CMS、博客和 WordPress 到底有什么区别", tag: "调研", date: "待发布" },
  { title: "我的第一版系统架构：先完成闭环，再逐步升级", tag: "设计", date: "待发布" },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <nav className="topbar">
        <a className="brand" href="#top">盖洋阳<span>/ lab</span></a>
        <div className="nav-links"><a href="#about">关于我</a><a href="#articles">文章</a><a href="#roadmap">路线图</a></div>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow">INDEPENDENT DEVELOPER · LEARNING IN PUBLIC</p>
        <h1>把一个想法，<br /><em>做成真的。</em></h1>
        <p className="hero-copy">我是盖洋阳，一名正在把学习变成真实产品的独立开发者。这里记录我如何借助 AI，把一个个人 CMS 从想法、调研一路做到上线。</p>
        <div className="hero-actions"><a className="button primary" href="#articles">阅读项目记录</a><a className="button ghost" href="#about">认识我 →</a></div>
        <div className="hero-note"><span className="status-dot" />当前状态：正在搭建第一版</div>
      </section>

      <section className="about-grid" id="about">
        <div><p className="section-label">01 / ABOUT</p><h2>不假装已经<br />成为专家。</h2></div>
        <div className="about-text"><p>我还在学习，也还没有一个确定的职业标签。但我想把学习过程变成真实的产品，而不是停留在收藏教程。</p><p>这个网站既是我的个人主页，也是我的实验场：我会公开每一次选择、遇到的问题，以及最后真正学会了什么。</p></div>
      </section>

      <section className="articles" id="articles"><div className="section-heading"><div><p className="section-label">02 / JOURNAL</p><h2>项目日志</h2></div><span className="muted">{articles.length} 篇计划文章</span></div><div className="article-list">{articles.map((article, index) => <article className="article-row" key={article.title}><span className="article-index">0{index + 1}</span><div><p className="article-tag">{article.tag}</p><h3>{article.title}</h3></div><time>{article.date}</time><span className="arrow">↗</span></article>)}</div></section>

      <section className="roadmap" id="roadmap"><p className="section-label">03 / ROADMAP</p><h2>从调研到上线，<br />每一步都留下证据。</h2><div className="roadmap-line"><span className="done">01<br /><small>调研</small></span><span>02<br /><small>设计</small></span><span>03<br /><small>开发</small></span><span>04<br /><small>部署</small></span></div></section>

      <footer><span>© 2026 盖洋阳</span><span>Built while learning, with AI.</span></footer>
    </main>
  );
}
