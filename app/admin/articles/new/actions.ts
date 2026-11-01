"use server";

import { ArticleStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CreateArticleState = {
  error: string | null;
};

export async function createArticleAction(
  _previousState: CreateArticleState,
  formData: FormData,
): Promise<CreateArticleState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";

  if (!title || !slug || !excerpt || !content || !category) {
    return { error: "请填写所有必填内容。" };
  }

  if (title.length > 255 || excerpt.length > 500 || category.length > 100) {
    return { error: "标题、摘要或分类超过允许长度。" };
  }

  if (slug.length > 191 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "网址标识只能使用小写字母、数字和单个连字符。" };
  }

  const shouldPublish = intent === "publish";

  try {
    await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
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
