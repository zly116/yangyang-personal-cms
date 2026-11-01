import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "盖洋阳 | 独立开发者",
  description: "记录一个零基础独立开发者借助 AI 完成真实产品的过程。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
