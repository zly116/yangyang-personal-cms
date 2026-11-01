import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  await deleteCurrentSession();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
