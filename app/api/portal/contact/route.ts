import { NextRequest, NextResponse } from "next/server";
import { nocobaseRequest } from "@/lib/nocobase";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS = 3;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getAddress(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function canSubmit(address: string) {
  const now = Date.now();
  if (attempts.size > 1000) {
    for (const [key, value] of attempts) {
      if (value.resetAt <= now) attempts.delete(key);
    }
  }

  const current = attempts.get(address);
  if (!current || current.resetAt <= now) {
    attempts.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function readText(body: Record<string, unknown>, field: string) {
  return typeof body[field] === "string" ? body[field].trim() : "";
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  if (readText(body, "website")) {
    return NextResponse.json({ ok: true });
  }

  const name = readText(body, "name");
  const email = readText(body, "email");
  const content = readText(body, "content");

  if (name.length < 1 || name.length > 50) {
    return NextResponse.json({ error: "姓名需要在 1 到 50 个字符之间。" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return NextResponse.json({ error: "请输入有效的联系邮箱。" }, { status: 400 });
  }
  if (content.length < 5 || content.length > 1000) {
    return NextResponse.json({ error: "留言需要在 5 到 1000 个字符之间。" }, { status: 400 });
  }
  if (!canSubmit(getAddress(request))) {
    return NextResponse.json(
      { error: "提交过于频繁，请十分钟后再试。" },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  try {
    const collection = process.env.NOCOBASE_CONTACT_COLLECTION?.trim() || "contactMessages";
    await nocobaseRequest(`${collection}:create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        content,
        status: "NEW",
        source: "AI_PORTAL",
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact message creation failed", error);
    return NextResponse.json(
      { error: "留言暂时无法提交，请稍后再试。" },
      { status: 502 },
    );
  }
}
