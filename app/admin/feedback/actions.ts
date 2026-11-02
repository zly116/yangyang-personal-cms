"use server";

import { FeedbackStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function reviewFeedback(feedbackId: number, status: FeedbackStatus) {
  await requireAdmin();
  if (!Number.isInteger(feedbackId) || feedbackId <= 0) return;

  const feedback = await prisma.articleFeedback.findUnique({
    where: { id: feedbackId },
    select: { id: true, article: { select: { slug: true } } },
  });
  if (!feedback) return;

  await prisma.articleFeedback.update({
    where: { id: feedback.id },
    data: { status, reviewedAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/feedback");
  revalidatePath(`/articles/${feedback.article.slug}`);
}

export async function approveFeedbackAction(feedbackId: number) {
  await reviewFeedback(feedbackId, FeedbackStatus.APPROVED);
}

export async function rejectFeedbackAction(feedbackId: number) {
  await reviewFeedback(feedbackId, FeedbackStatus.REJECTED);
}
