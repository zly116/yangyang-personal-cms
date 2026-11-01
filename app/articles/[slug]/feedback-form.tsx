"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitFeedbackAction, type FeedbackState } from "./feedback-actions";

const initialState: FeedbackState = { error: null, success: false };

export function FeedbackForm({ articleId }: { articleId: number }) {
  const action = submitFeedbackAction.bind(null, articleId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <section className="feedback-section">
      <div className="feedback-heading">
        <p className="section-label">YOUR FEEDBACK</p>
        <h2>评分与评论</h2>
        <p>评论提交后需要审核，通过后才会公开显示。</p>
      </div>

      {state.success && <p className="form-success" role="status">已收到反馈，审核通过后会公开显示。</p>}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <form ref={formRef} className="feedback-form" action={formAction}>
        <fieldset className="rating-field">
          <legend>文章评分</legend>
          <div className="rating-options">
            <input className="zero-rating-input" type="radio" name="rating" value="0" defaultChecked aria-label="0 星" />
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating}>
                <input type="radio" name="rating" value={rating} />
                <span aria-hidden="true">★</span>
                <span className="sr-only">{rating} 星</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          <span>昵称（选填）</span>
          <input name="nickname" minLength={2} maxLength={30} />
        </label>
        <label>
          <span>评论</span>
          <textarea name="content" rows={5} minLength={5} maxLength={1000} required />
        </label>
        <label className="honeypot" aria-hidden="true">
          <span>网站</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <button className="button-primary" type="submit" disabled={isPending}>{isPending ? "提交中..." : "提交反馈"}</button>
      </form>
    </section>
  );
}
