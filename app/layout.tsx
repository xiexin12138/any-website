import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
      <body className="antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8FP8487D9V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8FP8487D9V');
          `}
        </Script>
        {children}
        {analyticsUrl && (
          <Script defer data-domain={hostUrl} src={analyticsUrl} />
        )}
      </body>
    </html>
  );
}
