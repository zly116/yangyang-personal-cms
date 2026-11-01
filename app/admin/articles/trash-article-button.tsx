"use client";

import { moveArticleToTrashAction } from "./trash-actions";

type TrashArticleButtonProps = {
  articleId: number;
  title: string;
};

export function TrashArticleButton({ articleId, title }: TrashArticleButtonProps) {
  const action = moveArticleToTrashAction.bind(null, articleId);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`确定将《${title}》移入回收站吗？`)) {
          event.preventDefault();
        }
      }}
    >
      <button className="table-danger" type="submit">移入回收站</button>
    </form>
  );
}
