import { ArticleStatus } from "@prisma/client";
import { nocobaseListResource, nocobaseRequest, usesNocoBase } from "@/lib/nocobase";
import { prisma } from "@/lib/prisma";

export type PublicFeedback = {
  id: number;
  nickname: string;
  content: string;
  rating: number;
  createdAt: Date;
};

export type PublicArticle = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: "PUBLISHED";
  publishedAt: Date | null;
  updatedAt: Date;
  feedback: PublicFeedback[];
};

type NocoBaseArticle = Omit<PublicArticle, "publishedAt" | "updatedAt" | "feedback"> & {
  publishedAt: string | null;
  updatedAt: string;
};

type NocoBaseFeedback = Omit<PublicFeedback, "createdAt"> & {
  createdAt: string;
};

function mapNocoBaseArticle(article: NocoBaseArticle): PublicArticle {
  return {
    ...article,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    updatedAt: new Date(article.updatedAt),
    feedback: [],
  };
}

export async function getPublishedArticles(): Promise<PublicArticle[]> {
  if (usesNocoBase()) {
    const articles = await nocobaseRequest<NocoBaseArticle[]>(
      nocobaseListResource("articles", {
        filter: JSON.stringify({ status: "PUBLISHED", deletedAt: null }),
        sort: "-publishedAt",
        pageSize: "100",
      }),
    );
    return articles.map(mapNocoBaseArticle);
  }

  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });

  return articles.map((article) => ({
    ...article,
    status: "PUBLISHED" as const,
    feedback: [],
  }));
}

export async function getPublishedArticleBySlug(slug: string): Promise<PublicArticle | null> {
  if (usesNocoBase()) {
    const articles = await nocobaseRequest<NocoBaseArticle[]>(
      nocobaseListResource("articles", {
        filter: JSON.stringify({ slug, status: "PUBLISHED", deletedAt: null }),
        pageSize: "1",
      }),
    );
    const record = articles[0];
    if (!record) return null;

    const feedback = await nocobaseRequest<NocoBaseFeedback[]>(
      nocobaseListResource("articleFeedback", {
        filter: JSON.stringify({ articleId: record.id, status: "APPROVED" }),
        sort: "-createdAt",
        pageSize: "100",
      }),
    );

    return {
      ...mapNocoBaseArticle(record),
      feedback: feedback.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      })),
    };
  }

  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      deletedAt: null,
    },
    include: {
      feedback: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nickname: true,
          content: true,
          rating: true,
          createdAt: true,
        },
      },
    },
  });

  return article ? { ...article, status: "PUBLISHED" as const } : null;
}
