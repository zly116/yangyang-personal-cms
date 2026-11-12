"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess(false);

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/portal/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "提交失败，请稍后再试。");
      form.reset();
      setSuccess(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "提交失败，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="portal-contact-form" onSubmit={submit}>
      <div className="portal-form-row">
        <label>姓名<input name="name" maxLength={50} required /></label>
        <label>联系邮箱<input name="email" maxLength={120} required type="email" /></label>
      </div>
      <label>留言<textarea name="content" minLength={5} maxLength={1000} required rows={5} /></label>
      <label className="honeypot" aria-hidden="true">网站<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">留言已收到，我会通过邮箱回复你。</p>}
      <button className="button-primary" disabled={pending} type="submit">
        {pending ? "提交中" : "发送留言"}
      </button>
    </form>
  );
}
