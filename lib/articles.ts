import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      deletedAt: null,
    },
  });
}
