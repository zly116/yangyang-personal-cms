export type ProfileInput = {
  name: string;
  role: string;
  heroTitle: string;
  heroHighlight: string;
  introduction: string;
  statusText: string;
  aboutTitle: string;
  aboutParagraphOne: string;
  aboutParagraphTwo: string;
};

export type ProfileInputResult =
  | { success: true; data: ProfileInput }
  | { success: false; error: string };

const limits: Record<keyof ProfileInput, number> = {
  name: 50,
  role: 100,
  heroTitle: 100,
  heroHighlight: 100,
  introduction: 500,
  statusText: 100,
  aboutTitle: 100,
  aboutParagraphOne: 1000,
  aboutParagraphTwo: 1000,
};

export function parseProfileInput(formData: FormData): ProfileInputResult {
  const data = Object.fromEntries(
    Object.keys(limits).map((key) => [key, String(formData.get(key) ?? "").trim()]),
  ) as ProfileInput;

  for (const [key, limit] of Object.entries(limits) as [keyof ProfileInput, number][]) {
    if (!data[key]) return { success: false, error: "请填写所有个人资料字段。" };
    if (data[key].length > limit) return { success: false, error: `“${key}”超过 ${limit} 个字符。` };
  }

  return { success: true, data };
}
