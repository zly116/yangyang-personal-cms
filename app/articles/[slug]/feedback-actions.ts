"use server";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "cms_feedback_visitor";
const COOLDOWN_MS = 10 * 60 * 1000;

export type FeedbackState = {
  error: string | null;
  success: boolean;
};

function hashVisitorToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function submitFeedbackAction(
  articleId: number,
  _previousState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return { error: "文章不存在。", success: false };
  }

  if (String(formData.get("website") ?? "")) {
    return { error: null, success: true };
  }

  const nicknameInput = String(formData.get("nickname") ?? "").trim();
  const nickname = nicknameInput || "匿名访客";
  const content = String(formData.get("content") ?? "").trim();
  const rating = Number(formData.get("rating"));

  if (nicknameInput && (nicknameInput.length < 2 || nicknameInput.length > 30)) {
    return { error: "昵称不填写时会显示为匿名访客；填写时需要 2 至 30 个字符。", success: false };
  }
  if (content.length < 5 || content.length > 1000) {
    return { error: "评论需要填写 5 至 1000 个字符。", success: false };
  }
  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return { error: "请选择 0 至 5 星评分。", success: false };
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED", deletedAt: null },
    select: { id: true },
  });
  if (!article) return { error: "文章不存在或暂未发布。", success: false };

  const cookieStore = await cookies();
  let visitorToken = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!visitorToken) {
    visitorToken = randomBytes(32).toString("hex");
    cookieStore.set(VISITOR_COOKIE, visitorToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  const visitorHash = hashVisitorToken(visitorToken);
  const recentFeedback = await prisma.articleFeedback.findFirst({
    where: {
      articleId,
      visitorHash,
      createdAt: { gt: new Date(Date.now() - COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recentFeedback) {
    return { error: "你刚刚已经提交过反馈，请稍后再试。", success: false };
  }

  await prisma.articleFeedback.create({
    data: { articleId, nickname, content, rating, visitorHash },
  });
  return { error: null, success: true };
}
