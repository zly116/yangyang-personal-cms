import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const REQUEST_TIMEOUT_MS = 30_000;

type RateLimitEntry = { count: number; resetAt: number };
type DeepSeekResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const rateLimits = new Map<string, RateLimitEntry>();

function getClientAddress(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  if (rateLimits.size > 1000) {
    for (const [address, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(address);
    }
  }
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI 服务尚未配置，请稍后再试。" },
      { status: 503 },
    );
  }

  const limit = consumeRateLimit(getClientAddress(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `请求过于频繁，请在 ${limit.retryAfter} 秒后重试。` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const message =
    typeof body === "object" && body !== null && "message" in body
      ? String(body.message).trim()
      : "";

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `请输入 1 到 ${MAX_MESSAGE_LENGTH} 个字符的问题。` },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      process.env.DEEPSEEK_BASE_URL?.trim() ||
        "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
          temperature: 0.6,
          max_tokens: 800,
          messages: [
            {
              role: "system",
              content:
                "你是盖洋阳个人博客的 AI 助手。使用简洁、友好的中文回答。不要声称掌握网站未提供的个人信息；遇到密码、Token、隐私或违法请求时拒绝提供帮助。",
            },
            { role: "user", content: message },
          ],
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const data = (await response.json().catch(() => ({}))) as DeepSeekResponse;
    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!response.ok || !answer) {
      console.error("DeepSeek request failed", response.status, data.error?.message);
      return NextResponse.json(
        { error: "AI 服务暂时不可用，请稍后再试。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "AI 响应超时，请稍后重试。" : "无法连接 AI 服务。" },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
