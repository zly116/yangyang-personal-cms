import { ArticleStatus, PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const articles = [
  {
    slug: "why-build-a-personal-cms",
    title: "为什么我要从零搭建一个个人 CMS",
    excerpt: "记录我的起点、项目目标，以及为什么研究 WordPress 后仍决定自己实现核心功能。",
    content: "我希望把学习过程变成一个真实、可持续维护的产品。",
    category: "项目开始",
    status: ArticleStatus.PUBLISHED,
    publishedAt: new Date("2026-11-01T00:00:00+08:00"),
  },
  {
    slug: "cms-blog-wordpress-differences",
    title: "CMS、博客和 WordPress 到底有什么区别",
    excerpt: "从内容管理的角度理解三个容易混淆的概念。",
    content: "这篇文章仍在整理中。",
    category: "调研",
    status: ArticleStatus.PUBLISHED,
    publishedAt: new Date("2026-11-01T00:00:00+08:00"),
  },
  {
    slug: "first-system-architecture",
    title: "我的第一版系统架构：先完成闭环，再逐步升级",
    excerpt: "解释第一版为什么选择一个全栈项目，而不是一开始拆分多个服务。",
    content: "这篇文章仍在整理中。",
    category: "设计",
    status: ArticleStatus.DRAFT,
    publishedAt: null,
  },
];

async function main() {
  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  const existingProfile = await prisma.siteProfile.findUnique({ where: { id: 1 } });
  if (!existingProfile) {
    await prisma.siteProfile.create({
      data: {
        id: 1,
        name: "盖洋阳",
        role: "独立开发者 · 公开学习",
        heroTitle: "把一个想法，",
        heroHighlight: "做成真的。",
        introduction: "我是盖洋阳，一名正在把学习变成真实产品的独立开发者。这里记录我如何借助 AI，把一个个人 CMS 从想法、调研一路做到上线。",
        statusText: "正在搭建第一版",
        aboutTitle: "不假装已经成为专家。",
        aboutParagraphOne: "我还在学习，也还没有一个确定的职业标签。但我想把学习过程变成真实的产品，而不是停留在收藏教程。",
        aboutParagraphTwo: "这个网站既是我的个人主页，也是我的实验场：我会公开每一次选择、遇到的问题，以及最后真正学会了什么。",
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
    }

    const passwordHash = await hashPassword(adminPassword);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: { email: adminEmail, passwordHash },
    });
  } else {
    console.warn("Admin user skipped: set ADMIN_EMAIL and ADMIN_PASSWORD in .env.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
