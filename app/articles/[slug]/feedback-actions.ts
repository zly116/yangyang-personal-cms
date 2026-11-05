"use server";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { nocobaseRequest, usesNocoBase } from "@/lib/nocobase";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "cms_feedback_visitor";
const FEEDBACK_COOLDOWN_COOKIE_PREFIX = "cms_feedback_cooldown_";
const COOLDOWN_MS = 10 * 60 * 1000;

export type FeedbackState = {
  error: string | null;
  success: boolean;
};

function hashVisitorToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

type FeedbackArticle = {
  id: number;
  status: string;
  deletedAt: string | Date | null;
};

async function findPublishedArticle(articleId: number): Promise<FeedbackArticle | null> {
  if (usesNocoBase()) {
    try {
      const article = await nocobaseRequest<FeedbackArticle>(
        `articles:get?filterByTk=${encodeURIComponent(articleId)}`,
      );
      return article.status === "PUBLISHED" && !article.deletedAt ? article : null;
    } catch {
      return null;
    }
  }

  return prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, status: true, deletedAt: true },
  });
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

  const article = await findPublishedArticle(articleId);
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
  if (usesNocoBase()) {
    const cooldownCookie = `${FEEDBACK_COOLDOWN_COOKIE_PREFIX}${articleId}`;
    if (cookieStore.has(cooldownCookie)) {
      return { error: "你刚刚已经提交过反馈，请稍后再试。", success: false };
    }

    await nocobaseRequest("articleFeedback:create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, nickname, content, rating, visitorHash }),
    });
    cookieStore.set(cooldownCookie, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOLDOWN_MS / 1000,
    });
    return { error: null, success: true };
  }

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
