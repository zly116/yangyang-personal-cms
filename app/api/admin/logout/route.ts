import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/auth";

export async function POST() {
  await deleteCurrentSession();
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/admin/login" },
  });
}
