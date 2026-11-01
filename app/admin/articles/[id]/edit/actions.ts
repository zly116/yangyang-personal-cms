"use server";

import { ArticleStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseArticleInput } from "@/lib/article-input";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UpdateArticleState = {
  error: string | null;
};

export async function updateArticleAction(
  articleId: number,
  _previousState: UpdateArticleState,
  formData: FormData,
): Promise<UpdateArticleState> {
  await requireAdmin();

  if (!Number.isInteger(articleId) || articleId <= 0) {
    return { error: "文章编号无效。" };
  }

  const input = parseArticleInput(formData);
  if (!input.success) return { error: input.error };

  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) return { error: "文章不存在或已被删除。" };

  const { shouldPublish, ...articleData } = input.data;

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        ...articleData,
        status: shouldPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
        publishedAt: shouldPublish ? existingArticle.publishedAt ?? new Date() : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "这个网址标识已被其他文章使用，请更换。" };
    }
    return { error: "文章更新失败，请稍后重试。" };
  }

  revalidatePath("/");
  revalidatePath(`/articles/${existingArticle.slug}`);
  revalidatePath(`/articles/${articleData.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}
