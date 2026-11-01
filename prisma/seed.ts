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
