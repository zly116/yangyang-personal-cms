"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function refreshArticleViews(slug: string) {
  revalidatePath("/");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/trash");
}

export async function moveArticleToTrashAction(articleId: number) {
  await requireAdmin();
  if (!Number.isInteger(articleId) || articleId <= 0) return;

  const article = await prisma.article.findFirst({
    where: { id: articleId, deletedAt: null },
  });
  if (!article) return;

  await prisma.article.update({
    where: { id: article.id },
    data: { deletedAt: new Date() },
  });
  refreshArticleViews(article.slug);
}

export async function restoreArticleAction(articleId: number) {
  await requireAdmin();
  if (!Number.isInteger(articleId) || articleId <= 0) return;

  const article = await prisma.article.findFirst({
    where: { id: articleId, deletedAt: { not: null } },
  });
  if (!article) return;

  await prisma.article.update({
    where: { id: article.id },
    data: { deletedAt: null },
  });
  refreshArticleViews(article.slug);
}
