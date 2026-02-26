import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "永住許可申請サポート | Japan Visa Enroll Helper",
  description:
    "日本の永住権（永住許可）申請をサポートするWebアプリケーション。適格性チェック、必要書類の確認、理由書の添削が行えます。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
