"use client";

import { useActionState } from "react";
import { createArticleAction, type CreateArticleState } from "./actions";

const initialState: CreateArticleState = { error: null };

export function ArticleForm() {
  const [state, formAction, isPending] = useActionState(createArticleAction, initialState);

  return (
    <form className="article-form" action={formAction}>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <div className="form-grid">
        <label className="field-wide">
          <span>标题</span>
          <input name="title" maxLength={255} required />
        </label>
        <label>
          <span>网址标识（slug）</span>
          <input name="slug" maxLength={191} placeholder="my-first-article" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
          <small>只使用小写字母、数字和连字符，发布后尽量不要修改。</small>
        </label>
        <label>
          <span>分类</span>
          <input name="category" maxLength={100} placeholder="项目记录" required />
        </label>
        <label className="field-wide">
          <span>摘要</span>
          <textarea name="excerpt" rows={3} maxLength={500} required />
          <small>显示在文章列表和搜索结果中，最多 500 个字符。</small>
        </label>
        <label className="field-wide">
          <span>正文</span>
          <textarea name="content" rows={14} required />
        </label>
      </div>

      <div className="form-actions">
        <button className="button-secondary" type="submit" name="intent" value="draft" disabled={isPending}>保存草稿</button>
        <button className="button-primary" type="submit" name="intent" value="publish" disabled={isPending}>发布文章</button>
      </div>
    </form>
  );
}
