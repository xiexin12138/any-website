import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;
const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL;

export const metadata: Metadata = {
  title: "网站任意门",
  description: "下一个页面永远是模型生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {analyticsUrl && (
          <Script defer data-domain={hostUrl} src={analyticsUrl} />
        )}
      </body>
    </html>
  );
}
