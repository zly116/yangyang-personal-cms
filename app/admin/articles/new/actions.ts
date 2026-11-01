"use server";

import { ArticleStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { parseArticleInput } from "@/lib/article-input";
import { prisma } from "@/lib/prisma";

export type CreateArticleState = {
  error: string | null;
};

export async function createArticleAction(
  _previousState: CreateArticleState,
  formData: FormData,
): Promise<CreateArticleState> {
  await requireAdmin();

  const input = parseArticleInput(formData);
  if (!input.success) return { error: input.error };
  const { shouldPublish, ...articleData } = input.data;

  try {
    await prisma.article.create({
      data: {
        ...articleData,
        status: shouldPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
        publishedAt: shouldPublish ? new Date() : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "这个网址标识已被其他文章使用，请更换。" };
    }
    return { error: "文章保存失败，请稍后重试。" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}
