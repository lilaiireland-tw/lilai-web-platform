import type { Metadata } from "next";
import LanguageSchoolSignupPage from "@/components/language-school-signup/LanguageSchoolSignupPage";
import { isProductionDeployment } from "@/lib/deployment";
import { PRODUCTION_LANDING_URL, appPath } from "@/lib/language-school-signup/site-paths";

const title = "愛爾蘭語言學校報名｜25+8打工遊學與選校協助｜哩來愛爾蘭";
const description = "比較愛爾蘭語言學校、25+8 打工遊學、短期語校課程與住宿方案。已選好學校可直接報名；仍在比較城市與語校，可預約一對一選校諮詢，由哩來愛爾蘭協助完成申請與行前準備。";
const image = `https://lilaiireland.com${appPath("/og.png")}`;

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PRODUCTION_LANDING_URL },
  robots: { index: isProductionDeployment(), follow: isProductionDeployment() },
  openGraph: {
    title, description, type: "website", locale: "zh_TW",
    url: PRODUCTION_LANDING_URL,
    images: [{ url: image, width: 1734, height: 907, alt: "哩來愛爾蘭語校直接報名" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [image] },
  icons: { icon: appPath("/favicon.svg"), shortcut: appPath("/favicon.svg") },
};

export default function SignupPage() {
  return <LanguageSchoolSignupPage />;
}
