import "server-only";

const DEFAULT_TIMEOUT_MS = 8_000;

type NocoBaseResponse<T> = {
  data: T;
};

function getConfig() {
  const baseUrl = process.env.NOCOBASE_INTERNAL_URL?.replace(/\/$/, "");
  const token = process.env.NOCOBASE_API_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      "CONTENT_SOURCE=nocobase 时必须配置 NOCOBASE_INTERNAL_URL 和 NOCOBASE_API_TOKEN。",
    );
  }

  return { baseUrl, token };
}

export function usesNocoBase() {
  return process.env.CONTENT_SOURCE === "nocobase";
}

export async function nocobaseRequest<T>(
  resource: string,
  options: RequestInit = {},
): Promise<T> {
  const { baseUrl, token } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/api/${resource}`, {
      ...options,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `NocoBase 请求失败：${response.status} ${response.statusText}${detail ? ` - ${detail.slice(0, 300)}` : ""}`,
      );
    }

    const body = (await response.json()) as NocoBaseResponse<T>;
    return body.data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`NocoBase 请求超过 ${DEFAULT_TIMEOUT_MS / 1000} 秒。`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function nocobaseListResource(
  collection: string,
  params: Record<string, string>,
) {
  const search = new URLSearchParams(params);
  return `${collection}:list?${search.toString()}`;
}
