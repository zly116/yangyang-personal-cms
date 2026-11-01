"use client";

import { restoreArticleAction } from "@/app/admin/articles/trash-actions";

type RestoreArticleButtonProps = {
  articleId: number;
  title: string;
  wasPublished: boolean;
};

export function RestoreArticleButton({ articleId, title, wasPublished }: RestoreArticleButtonProps) {
  const action = restoreArticleAction.bind(null, articleId);
  const label = wasPublished ? "恢复并重新公开" : "恢复草稿";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const effect = wasPublished ? "恢复后文章会立即重新公开。" : "恢复后文章仍是草稿。";
        if (!window.confirm(`确定恢复《${title}》吗？${effect}`)) {
          event.preventDefault();
        }
      }}
    >
      <button className="table-link table-button" type="submit">{label}</button>
    </form>
  );
}
