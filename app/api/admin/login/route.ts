import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = email ? await prisma.adminUser.findUnique({ where: { email } }) : null;
  const isValid = user
    ? await verifyPassword(password, user.passwordHash)
    : (await hashPassword(password), false);

  if (!user || !isValid) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), 303);
  }

  await createAdminSession(user.id);
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
