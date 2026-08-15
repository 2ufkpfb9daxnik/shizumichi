import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import PwaRegister from "@/components/PwaRegister";
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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "しずみち — 音との距離を選べるルート案内",
  description:
    "聴覚過敏のある人が、最短・バランス・静音の3経路から目的地までの歩き方を選べる試作アプリ",
  applicationName: "しずみち",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "しずみち",
  },
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: `${basePath}/icons/apple-touch-icon.png`,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f4c43",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
