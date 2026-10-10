import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "嘉偉 108 課綱複習平台",
  description: "國中三年 B1-B6 題庫練習、會考複習與年度命題趨勢更新平台。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
