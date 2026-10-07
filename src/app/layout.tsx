import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "@/components/layout/layout.module.css";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s｜${SITE_NAME}`
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/assets/lilai-logo.png"),
        width: 512,
        height: 512,
        alt: SITE_NAME
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <a className={styles.skipLink} href="#site-content">跳至主要內容</a>
        <Header />
        <div id="site-content" tabIndex={-1} className={styles.content}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
