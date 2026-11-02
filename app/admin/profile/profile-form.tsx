"use client";

import { useActionState } from "react";
import { updateProfileAction, type UpdateProfileState } from "./actions";

type EditableProfile = {
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

const initialState: UpdateProfileState = { error: null, success: false };

export function ProfileForm({ profile }: { profile: EditableProfile }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form className="article-form" action={formAction}>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.success && <p className="form-success" role="status">个人资料已保存，公开主页已经更新。</p>}

      <div className="form-grid">
        <label>
          <span>姓名</span>
          <input name="name" defaultValue={profile.name} maxLength={50} required />
        </label>
        <label>
          <span>身份标签</span>
          <input name="role" defaultValue={profile.role} maxLength={100} required />
        </label>
        <label>
          <span>首页主标题</span>
          <input name="heroTitle" defaultValue={profile.heroTitle} maxLength={100} required />
        </label>
        <label>
          <span>首页强调标题</span>
          <input name="heroHighlight" defaultValue={profile.heroHighlight} maxLength={100} required />
          <small>这部分会使用不同字体和颜色显示。</small>
        </label>
        <label className="field-wide">
          <span>首页简介</span>
          <textarea name="introduction" defaultValue={profile.introduction} rows={4} maxLength={500} required />
        </label>
        <label className="field-wide">
          <span>当前状态</span>
          <input name="statusText" defaultValue={profile.statusText} maxLength={100} required />
        </label>
        <label className="field-wide">
          <span>“关于我”标题</span>
          <input name="aboutTitle" defaultValue={profile.aboutTitle} maxLength={100} required />
        </label>
        <label className="field-wide">
          <span>第一段自我介绍</span>
          <textarea name="aboutParagraphOne" defaultValue={profile.aboutParagraphOne} rows={4} maxLength={1000} required />
        </label>
        <label className="field-wide">
          <span>第二段自我介绍</span>
          <textarea name="aboutParagraphTwo" defaultValue={profile.aboutParagraphTwo} rows={4} maxLength={1000} required />
        </label>
      </div>

      <div className="form-actions">
        <button className="button-primary" type="submit" disabled={isPending}>{isPending ? "保存中…" : "保存个人资料"}</button>
      </div>
    </form>
  );
}
