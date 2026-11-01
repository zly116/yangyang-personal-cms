export type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  shouldPublish: boolean;
};

export type ArticleInputResult =
  | { success: true; data: ArticleInput }
  | { success: false; error: string };

export function parseArticleInput(formData: FormData): ArticleInputResult {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!title || !slug || !excerpt || !content || !category) {
    return { success: false, error: "请填写所有必填内容。" };
  }

  if (title.length > 255 || excerpt.length > 500 || category.length > 100) {
    return { success: false, error: "标题、摘要或分类超过允许长度。" };
  }

  if (slug.length > 191 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { success: false, error: "网址标识只能使用小写字母、数字和单个连字符。" };
  }

  return {
    success: true,
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      shouldPublish: formData.get("intent") === "publish",
    },
  };
}
