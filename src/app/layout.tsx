import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "しずみち — 音との距離を選べるルート案内",
  description:
    "聴覚過敏のある人が、最短・バランス・静音の3経路から目的地までの歩き方を選べる試作アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
