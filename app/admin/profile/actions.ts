"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { parseProfileInput } from "@/lib/profile-input";
import { prisma } from "@/lib/prisma";

export type UpdateProfileState = {
  error: string | null;
  success: boolean;
};

export async function updateProfileAction(
  _previousState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  await requireAdmin();

  const input = parseProfileInput(formData);
  if (!input.success) return { error: input.error, success: false };

  try {
    await prisma.siteProfile.upsert({
      where: { id: 1 },
      update: input.data,
      create: { id: 1, ...input.data },
    });
  } catch {
    return { error: "个人资料保存失败，请稍后重试。", success: false };
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { error: null, success: true };
}
