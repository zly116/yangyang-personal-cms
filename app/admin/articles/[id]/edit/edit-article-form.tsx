"use client";

import { useActionState } from "react";
import { updateArticleAction, type UpdateArticleState } from "./actions";

type EditableArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
};

const initialState: UpdateArticleState = { error: null };

export function EditArticleForm({ article }: { article: EditableArticle }) {
  const action = updateArticleAction.bind(null, article.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form className="article-form" action={formAction}>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <div className="form-grid">
        <label className="field-wide">
          <span>标题</span>
          <input name="title" defaultValue={article.title} maxLength={255} required />
        </label>
        <label>
          <span>网址标识（slug）</span>
          <input name="slug" defaultValue={article.slug} maxLength={191} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
          <small>修改已发布文章的 slug 会改变网址，原链接将失效。</small>
        </label>
        <label>
          <span>分类</span>
          <input name="category" defaultValue={article.category} maxLength={100} required />
        </label>
        <label className="field-wide">
          <span>摘要</span>
          <textarea name="excerpt" rows={3} defaultValue={article.excerpt} maxLength={500} required />
        </label>
        <label className="field-wide">
          <span>正文</span>
          <textarea name="content" rows={14} defaultValue={article.content} required />
        </label>
      </div>

      <div className="form-actions form-actions-split">
        <span className={`status-badge status-${article.status.toLowerCase()}`}>
          当前：{article.status === "PUBLISHED" ? "已发布" : "草稿"}
        </span>
        <div>
          <button className="button-secondary" type="submit" name="intent" value="draft" disabled={isPending}>保存为草稿</button>
          <button className="button-primary" type="submit" name="intent" value="publish" disabled={isPending}>保存并发布</button>
        </div>
      </div>
    </form>
  );
}
