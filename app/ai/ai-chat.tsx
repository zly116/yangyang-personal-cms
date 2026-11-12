"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = message.trim();
    if (!question || pending) return;

    setMessages((current) => [...current, { role: "user", content: question }]);
    setMessage("");
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok || !data.answer) {
        throw new Error(data.error || "AI 服务暂时不可用。");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer as string },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "请求失败，请稍后重试。",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="ai-console" aria-label="AI 对话">
      <div className="ai-messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="ai-empty">
            <p className="section-label">READY / DEEPSEEK</p>
            <h2>从一个问题开始。</h2>
            <p>可以询问开发学习、CMS 概念或文章整理建议。</p>
          </div>
        ) : (
          messages.map((item, index) => (
            <article className={`ai-message ${item.role}`} key={`${item.role}-${index}`}>
              <span>{item.role === "user" ? "YOU" : "AI"}</span>
              <p>{item.content}</p>
            </article>
          ))
        )}
        {pending && <p className="ai-thinking">AI 正在思考...</p>}
      </div>

      {error && <p className="form-error ai-error">{error}</p>}

      <form className="ai-form" onSubmit={submit}>
        <label htmlFor="ai-message" className="sr-only">输入问题</label>
        <textarea
          id="ai-message"
          maxLength={1000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="输入你的问题..."
          rows={3}
          value={message}
        />
        <div className="ai-form-footer">
          <span>{message.length} / 1000</span>
          <div>
            {messages.length > 0 && (
              <button className="button-secondary" onClick={() => { setMessages([]); setError(""); }} type="button">
                清空
              </button>
            )}
            <button className="button-primary" disabled={pending || !message.trim()} type="submit">
              {pending ? "发送中" : "发送"}
            </button>
          </div>
        </div>
      </form>
      <p className="ai-disclaimer">AI 生成内容可能有误，请核对重要信息。请勿输入密码、Token 或个人隐私。</p>
    </section>
  );
}
