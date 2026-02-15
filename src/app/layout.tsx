import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "Geography App - 地理教育ウェブアプリ",
  description:
    "地軸の傾きと昼夜の長さの可視化、地図投影法の比較など、地理を視覚的に学べるウェブアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
